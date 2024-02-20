import {
    ImmediatePriority,
    UserBlockingPriority,
    NormalPriority,
    LowPriority,
    IdlePriority,
} from "../SchedulerPriorities.js";
import {frameYieldMs} from "../SchedulerFeatureFlags";
import {peek, pop, push} from "scheduler/SchedulerMinHeap.js";

// 不同的任务优先级对应不同的超时时间
let maxSigned31BitInt = 1073741823;
// 立即
let IMMEDIATE_PRIORITY_TIMEOUT = -1;
// 用户阻塞的
let USER_BLOCKING_PRIORITY_TIMEOUT = 250;
let NORMAL_PRIORITY_TIMEOUT = 5000;
let LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
let IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

let taskTimeoutID = -1

let isMessageLoopRunning = false;

// 任务的最小堆数组
let taskQueue = [];
let timerQueue = [];
// 自增的id
let taskIdCounter = 1;
let isPerformingWork = false;
let isHostCallbackScheduled = false;
let isHostTimeoutScheduled = false;
// 当前调度的任务
let currentTask = null;
// 当前任务的优先级
let currentPriorityLevel = NormalPriority;
// 回调函数
let scheduledHostCallback = null;
let startTime = -1;

let frameInterval = frameYieldMs;

let getCurrentTime = () => performance.now();

const localSetTimeout = typeof setTimeout === 'function' ? setTimeout : null;
const localClearTimeout = typeof clearTimeout === 'function' ? clearTimeout : null;
const localSetImmediate = typeof setImmediate !== 'undefined' ? setImmediate : null; // IE and Node.js + jsdom

const performWorkUntilDeadline = () => {
    if (scheduledHostCallback !== null) {
        // 先获取任务执行的时间 相对时间
        const currentTime = getCurrentTime()
        startTime = currentTime
        const hasTimeRemaining = true
        let hasMoreWork = true
        try {
            // 执行缓存的callback
            hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime)
        } finally {
            if (hasMoreWork) {
                // 如果还有工作
                schedulePerformWorkUntilDeadline()
            } else {
                isMessageLoopRunning = false
                scheduledHostCallback = null
            }
        }
    }
}

let schedulePerformWorkUntilDeadline;
if (typeof localSetImmediate === 'function') {
    schedulePerformWorkUntilDeadline = () => {
        localSetImmediate(performWorkUntilDeadline)
    }
} else if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = performWorkUntilDeadline

    schedulePerformWorkUntilDeadline = () => {
        port.postMessage(null)
    }
} else {
    schedulePerformWorkUntilDeadline = () => {
        localSetTimeout(performWorkUntilDeadline, 0)
    }
}

// 调度任务
function unstable_scheduleCallback(priorityLevel, callback, options) {
    // requestIdleCallback(callback)
    // 有时间有工作接着执行
    let currentTime = getCurrentTime()
    // 1. 任务的开始时间
    let startTime;
    // 会存在一些延时的任务
    if (typeof options === 'object' && options !== null) {
        let delay = options.delay
        if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
        } else {
            startTime = currentTime
        }
    } else {
        startTime = currentTime
    }
    // 2. 超时时间 不同的优先级时间是不一样的
    let timeout;
    switch (priorityLevel) {
        case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT;
            break;
        case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
            break;
        case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT;
            break;
        case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT;
            break;
        case NormalPriority:
        default:
            timeout = NORMAL_PRIORITY_TIMEOUT;
            break;
    }
    // 3. 过期时间 作为最小堆的排序字段 sortIndex
    let expirationTime = startTime + timeout;
    // 任务
    const newTask = {
        id: taskIdCounter++, // 自增的id
        callback, // 回调函数 任务函数
        priorityLevel, // 优先级
        startTime, // 开始时间
        expirationTime, // 过期时间
        sortIndex: -1, // 排序依据
    }
    if (startTime > currentTime) {
        // 延时的任务
    } else {
        // 过期时间作为排序的依据
        newTask.sortIndex = expirationTime
        // 入队
        push(taskQueue, newTask)
        if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true
            requestHostCallback(flushWork)
        }
    }
    return newTask
}

function requestHostCallback(callback) {
    scheduledHostCallback = callback

    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true
        // 执行工作到截至时间
        schedulePerformWorkUntilDeadline()
    }
}

function flushWork(hasTimeRemaining, initialTime) {
    isHostCallbackScheduled = false

    if (isHostTimeoutScheduled) {
        cancelHostTimeout()
    }

    isPerformingWork = true
    const previousPriorityLevel = currentPriorityLevel

    try {
        return workLoop(hasTimeRemaining, initialTime)
    } finally {
        currentTask = null
        currentPriorityLevel = previousPriorityLevel
        isPerformingWork = false

    }
}

function workLoop(hasTimeRemaining, initialTime) {
    let currentTime = initialTime
    advanceTimers(currentTime)
    // 取出堆顶元素进行执行
    currentTask = peek(taskQueue)
    while (currentTask !== null) {
        // 没有过期 但是时间不够了
        if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
            break
        }
        // 过期的任务是不会暂停的 会立即执行完
        // 取走函数执行 performConcurrentWorkOnRoot
        const callback = currentTask.callback
        if (typeof callback === 'function') {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            // 可能返回一个继续执行的函数 fiber树的构建是比较耗时的
            const continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrentTime();
            // 返回了一个新的函数 表示还有任务要执行
            if (typeof continuationCallback === 'function') {
                // 返回了一个新任务 表示还有任务要执行
                currentTask.callback = continuationCallback;
            } else {
                // 任务完成了就弹出这个任务
                if (currentTask === peek(taskQueue)) {
                    pop(taskQueue);
                }
            }
            advanceTimers(currentTime);
        } else {
            pop(taskQueue);
        }
        currentTask = peek(taskQueue);
    }
    // 如果当时任务队列为空
    if (currentTask !== null) {
        return true;
    } else {
        // 取出异步队列的最紧急任务
        const firstTimer = peek(timerQueue);

        if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }

        return false;
    }
}

function shouldYieldToHost() {
    const timeElapsed = getCurrentTime() - startTime;

    if (timeElapsed < frameInterval) {
        return false;
    }

    return true;
}

function advanceTimers(currentTime) {
    let timer = peek(timerQueue)
    while (timer !== null) {
        if (timer.callback === null) {
            pop(timerQueue)
        } else if (timer.startTime <= currentTime) {
            pop(timerQueue)
            timer.sortIndex = timer.expirationTime
            push(taskQueue, timer)
        } else {
            return
        }

        timer = peek(timerQueue)
    }
}

function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);

    if (!isHostCallbackScheduled) {
        if (peek(taskQueue) !== null) {
            isHostCallbackScheduled = true;
            requestHostCallback(flushWork);
        } else {
            const firstTimer = peek(timerQueue);

            if (firstTimer !== null) {
                requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
            }
        }
    }
}

function requestHostTimeout(callback, ms) {
    taskTimeoutID = localSetTimeout(() => {
        callback(getCurrentTime());
    }, ms);
}

function cancelHostTimeout() {
    localClearTimeout(taskTimeoutID)
    taskTimeoutID = -1
}

export {
    getCurrentTime as unstable_now,
    ImmediatePriority as unstable_ImmediatePriority,
    UserBlockingPriority as unstable_UserBlockingPriority,
    NormalPriority as unstable_NormalPriority,
    IdlePriority as unstable_IdlePriority,
    LowPriority as unstable_LowPriority,
    unstable_scheduleCallback,
};
