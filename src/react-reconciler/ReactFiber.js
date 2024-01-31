import { ConcurrentRoot } from "./ReactRootTags";
import { ConcurrentMode, NoMode } from "./ReactTypeOfMode";
import { NoFlags } from "./ReactFiberFlags";
import { NoLanes } from "./ReactFiberLane";
import { HostRoot } from "./ReactWorkTags";

export function createHostRootFiber(tag) {
  let mode;
  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode;
  } else {
    mode = NoMode;
  }
  return createFiber(HostRoot, null, null, mode);
}

const createFiber = function (tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
};

function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // fiber 的数据结构
  this.return = null;
  this.sibling = null;
  this.child = null;
  this.index = 0;

  this.ref = null; // 引用

  this.pendingProps = pendingProps;
  // 待生效的属性
  this.memoizedProps = null;
  this.updateQueue = null;

  // 每个fiber的都不同
  this.memoizedState = null;

  // 模型 并发模型 传统模型
  this.mode = mode;

  // 副作用
  this.flags = NoFlags;
  // react18 去掉了 effectList
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  // lane模型
  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  // 双缓存模型
  this.alternate = null;
}
