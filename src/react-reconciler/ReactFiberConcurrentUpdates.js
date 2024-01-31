import { NoLanes, mergeLanes } from "./ReactFiberLane";
import { HostRoot } from "./ReactWorkTags";

function enqueueConcurrentClassUpdate_old(fiber, queue, update, lane) {
  const interleaved = queue.interleaved;
  // 构建环形链表
  if (interleaved === null) {
    update.next = update;
    pushConcurrentUpdateQueue(queue);
  } else {
    update.next = interleaved.next;
    interleaved.next = update;
  }
  queue.interleaved = update;
  // 更新lanes 返回root
  return markUpdateLaneFromFiberToRoot(fiber, lane);
}

let concurrentQueues_old = null;
function pushConcurrentUpdateQueue(queue) {
  if (concurrentQueues_old === null) {
    concurrentQueues_old = [queue];
  } else {
    concurrentQueues_old.push(queue);
  }
}

function markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
  // 更新fiber的lanes
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  let alternate = sourceFiber.alternate;
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
  // 更新 childLanes
  if (node.tag === HostRoot) {
    const root = node.stateNode;
    return root;
  } else {
    return null;
  }
}

export function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
  const concurrentQueue = queue;
  const concurrentUpdate = update;
  // 将更新一组组的放在 concurrentQueues 数组中
  enqueueUpdate(fiber, concurrentQueue, concurrentUpdate, lane);
  return getRootForUpdatedFiber(fiber);
}

const concurrentQueues = [];
let concurrentQueuesIndex = 0;
let concurrentlyUpdatedLanes = NoLanes;

function enqueueUpdate(fiber, queue, update, lane) {
  // 一批一批的
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
  // a | b
  concurrentlyUpdatedLanes = mergeLanes(concurrentlyUpdatedLanes, lane);
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate;
  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
}

function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  return node.tag === HostRoot ? node.stateNode : null;
}

// export function unsafe_markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
//   const root = getRootForUpdatedFiber(sourceFiber);
//   markUpdateLaneFromFiberToRoot(sourceFiber, null, lane);
//   return root;
// }
