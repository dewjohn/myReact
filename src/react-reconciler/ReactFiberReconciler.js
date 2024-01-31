import { createHostRootFiber } from "./ReactFiber";
import {
  initializeUpdateQueue,
  enqueueUpdate,
  createUpdate,
} from "./ReactFiberClassUpdateQueue";

import {
  NoLane,
  NoLanes,
  NoTimestamp,
  SyncLane,
  createLaneMap,
} from "./ReactFiberLane";

import {
  flushSync,
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from "./ReactFiberWorkLoop";

export function createContainer(containerInfo, tag) {
  const initialChildren = null;
  return createFiberRoot(containerInfo, tag, initialChildren);
}

/**
 *
 * @param {*} containerInfo
 * @param {*} tag
 */
function createFiberRoot(containerInfo, tag) {
  // fiberRoot
  const root = new FiberRootNode(containerInfo, tag);
  // rootFiber
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);
  return root;
}

function FiberRootNode(containerInfo, tag) {
  this.tag = tag; // LegacyRoot
  this.containerInfo = containerInfo;
  // 一系列的属性
  this.current = null;
  this.context = null;
  this.callbackPriority = NoLane;
  this.eventTimes = createLaneMap(NoLanes);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
}

/**
 *
 * @param {*} element
 * @param {*} container
 * @param {*} parentComponent
 * @param {*} callback
 */
export function updateContainer(element, container, parentComponent, callback) {
  const current = container.current; // rootFiber
  // performance.now()
  const eventTime = requestEventTime();
  // 1. 计算当前的lane赛道
  // const lane = SyncLane;
  const lane = requestUpdateLane(current);
  // const context = getContextForSubtree(parentComponent);
  // container.context = context // {}
  // 2. 创建更新 return {payload: null, next: null}
  const update = createUpdate(eventTime, lane);
  update.payload = { element };
  // update.callback = callback;
  // 3. 将更新入队 按照批次加入到 concurrentQueues 数组中 更新lanes
  // old 构建循环链表 加入到 concurrentQueues 数组中
  // return node.stateNode
  const root = enqueueUpdate(current, update, lane);
  // 4. 开始调度 从根节点开始
  if (root !== null) {
    scheduleUpdateOnFiber(root, current, lane, eventTime);
  }
  return lane;
}

export { flushSync };
