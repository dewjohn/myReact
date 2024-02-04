import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from "./SchedulerPriorities";

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

let getCurrentTime = () => performance.now();

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
  switch (priorityLevel){
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
  }
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
