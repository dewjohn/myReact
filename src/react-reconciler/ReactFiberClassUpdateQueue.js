import { NoLanes } from "./ReactFiberLane";
import { enqueueConcurrentClassUpdate } from "./ReactFiberConcurrentUpdates";
import { isUnsafeClassRenderPhaseUpdate } from "./ReactFiberWorkLoop";

export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

export function initializeUpdateQueue(fiber) {
  const queue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    // 循环更新链表
    shared: {
      pending: null,
      lanes: NoLanes,
    },
    callbacks: null,
  };
  fiber.updateQueue = queue;
}

export function createUpdate(eventTime, lane) {
  const update = {
    eventTime,
    lane,
    tag: UpdateState,
    payload: null,
    next: null,
    callback: null,
  };

  return update;
}

// 更新入队
export function enqueueUpdate(fiber, update, lane) {
  const updateQueue = fiber.updateQueue;
  // 在 initializeUpdateQueue 的时候会给fiber的updateQueue赋值
  if (updateQueue === null) return null;
  const sharedQueue = updateQueue.shared;
  // updateQueue = {shared: {pending: null}}
  if (isUnsafeClassRenderPhaseUpdate(fiber)) {
  } else {
    // render()
    return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
  }
}
