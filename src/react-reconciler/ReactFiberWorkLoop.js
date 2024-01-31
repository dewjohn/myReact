import {
  NoLanes,
  NoTimestamp,
  SyncLane,
  markRootUpdated,
  includesSyncLane,
} from "./ReactFiberLane";
import { ConcurrentMode, NoMode } from "./ReactTypeOfMode";
import { now } from "./Scheduler";
import { deferRenderPhaseUpdateToNextBatch } from "../shared/ReactFeatureFlags";
import { LegacyRoot } from "./ReactRootTags";
import {
  scheduleLegacySyncCallback,
  scheduleSyncCallback,
  flushSyncCallbacks,
} from "./ReactFiberSyncTaskQueue";
import { supportsMicrotasks, scheduleMicrotask } from "./ReactFiberHostConfig";
import {
  scheduleCallback as Scheduler_scheduleCallback,
  ImmediatePriority as ImmediateSchedulerPriority,
} from "./Scheduler";
import {
  getCurrentUpdatePriority,
  setCurrentUpdatePriority,
  DiscreteEventPriority,
} from "./ReactEventPriorities";

export const NoContext = 0b000;
export const BatchedContext = 0b001;
export const RenderContext = 0b010;
export const CommitContext = 0b100;

let executionContext = NoContext;
let workInProgressRootRenderLanes = NoLanes;

export function flushSync(fn) {
  const prevExecutionContext = executionContext;
  // 执行的上下文 批量模型
  executionContext |= BatchedContext;
  // 1. 获取优先级
  // const previousPriority = 0; // NoLane 先写死
  const previousPriority = getCurrentUpdatePriority();
  // 2. 执行fn
  try {
    // 设置优先级
    setCurrentUpdatePriority(DiscreteEventPriority);
    if (fn) return fn();
    else return undefined;
  } finally {
    // 还原上次的优先级
    setCurrentUpdatePriority(previousPriority);
    executionContext = prevExecutionContext;
    // 刷新 immediate 的回调
    // if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
    //   flushSyncCallbacks();
    // }
  }
}

let currentEventTime = NoTimestamp; // -1

export function requestEventTime() {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    // We're inside React, so it's fine to read the actual time.
    return now();
  }
  if (currentEventTime !== NoTimestamp) return currentEventTime;
  // performance.now() || Date.now()
  currentEventTime = now();
  return currentEventTime;
}

// 获取赛道lane
export function requestUpdateLane(fiber) {
  const mode = fiber.mode;
  if ((mode & ConcurrentMode) === NoMode) {
    // 同步赛道
    return SyncLane;
  } else if (
    (executionContext & RenderContext) !== NoContext &&
    workInProgressRootRenderLanes !== NoLanes
  ) {
    // return pickArbitraryLane(workInProgressRootRenderLanes);
  }
}

export function isUnsafeClassRenderPhaseUpdate(fiber) {
  return (
    (!deferRenderPhaseUpdateToNextBatch ||
      (fiber.mode & ConcurrentMode) === NoMode) &&
    (executionContext & RenderContext) !== NoContext
  );
}

// 从根节点开始调度
export function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
  // 1. 将root标记为更新 root.pendingLanes |= updateLane; 1
  markRootUpdated(root, lane, eventTime);
  // 2. 调度root
  // 2.1 lane优先级 newCallbackPriority
  // 2.2 将callback添加到 syncQueue中 scheduleSyncCallback(performSyncWorkOnRoot添加到queue中)
  // 2.3 在microtask中清空任务 queueMicrotask(flushSyncCallbacks)
  // 2.3.1 设置优先级
  // 2.3.2 依次执行 syncQueue中的回调 callback = callback(isSync);
  // 2.3.3 执行 performSyncWorkOnRoot
  ensureRootIsScheduled(root, eventTime);
}

function ensureRootIsScheduled(root, currentTime) {
  // 饥饿问题
  // markStarvedLanesAsExpired(root, currentTime);
  // const nextLanes = getNextLanes(
  //   root,
  //   root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  // );
  // TODO: 优先级相同的任务 直接 return
  // const newCallbackPriority = getHighestPriorityLane(nextLanes);
  const newCallbackPriority = SyncLane;
  // const existingCallbackPriority = root.callbackPriority;
  // if (newCallbackPriority === existingCallbackPriority) return;
  if (includesSyncLane(newCallbackPriority)) {
    if (root.tag === LegacyRoot) {
      // 将 callback 添加到 syncQueue 中
      scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root));
    } else {
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    }
    if (supportsMicrotasks) {
      scheduleMicrotask(() => {
        if (
          (executionContext & (RenderContext | CommitContext)) ===
          NoContext
        ) {
          flushSyncCallbacks();
        }
      });
    } else {
      // Scheduler 调度模块
      // 调度的优先级 对应不同的 timeout 和react的调度是分开的
      // 事件任务优先级 => lane模型的优先级 => scheduler调度的优先级
      Scheduler_scheduleCallback(
        ImmediateSchedulerPriority,
        flushSyncCallbacks
      );
    }
  } else {
  }
  // root.callbackPriority = newCallbackPriority;
}

// 在微任务中清空 syncQueue callback()
function performSyncWorkOnRoot(root) {
  console.log("performSyncWorkOnRoot", root);
  return null;
}
