import { createHostRootFiber } from './ReactFiber';
import { initializeUpdateQueue } from './ReactFiberClassUpdateQueue';
import { NoLane, NoLanes, NoTimestamp, createLaneMap } from './ReactFiberLane';
/**
 * fiber的根节点 rootFiber fiberRoot
 * @param {*} containerInfo
 * @param {*} tag 模式 并发模式和LegacyRoot传统的模式
 */
export function createFiberRoot(
	containerInfo,
	tag,
	initialChildren,
	isStrictMode,
	concurrentUpdatesByDefaultOverride
) {
	// fiberRoot
	const root = new FiberRootNode(containerInfo, tag);
	// rootFiber
	const uninitializedFiber = createHostRootFiber(tag);
	// 相互指向
	root.current = uninitializedFiber;
	uninitializedFiber.stateNode = root;
	const initialState = {
		// element: null
		element: initialChildren,
	};
	uninitializedFiber.memoizedState = initialState;
	// 初始化更新队列 将element放在updateQueue中
	// 更新队列是一个循环链表
	// fiber.updateQueue = {shared: {pending: null}}
	initializeUpdateQueue(uninitializedFiber);
	return root;
}

function FiberRootNode(containerInfo, tag) {
	this.tag = tag; // 渲染的模式 LegacyRoot ConcurrentMode
	// 容器信息
	this.containerInfo = containerInfo;
	// 一系列的属性
	this.current = null;
	this.context = null;
	this.callbackNode = null;
	this.callbackPriority = NoLane;
	this.eventTimes = createLaneMap(NoLanes);
	// 每个赛道的过期时间
	this.expirationTimes = createLaneMap(NoTimestamp);
	// 过期的赛道
	this.expiredLanes = NoLanes;

	// 计算 nextLanes 得到 newCallbackPriority
	// 同步和并发的不一样
	this.pendingLanes = NoLanes;
}
