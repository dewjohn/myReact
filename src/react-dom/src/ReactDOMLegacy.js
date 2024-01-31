import { LegacyRoot } from '../../react-reconciler/ReactRootTags';
import {
	createContainer,
	flushSync,
	updateContainer,
} from '../../react-reconciler/ReactFiberReconciler';

/**
 * 将虚拟dom转成为真实dom插入到容器中
 * @param {*} element 虚拟dom
 * @param {*} container 挂载的容器
 * @param {*} callback
 */
export function render(element, container, callback) {
	return legacyRenderSubtreeIntoContainer(null, element, container, callback);
}

/**
 *
 * @param {*} parentComponent
 * @param {*} children
 * @param {*} container
 * @param {*} callback
 */
function legacyRenderSubtreeIntoContainer(
	parentComponent,
	children,
	container,
	callback
) {
	const maybeRoot = container._reactRootContainer;
	let root;
	if (!maybeRoot) {
		// 初次挂载
		root = legacyCreateRootFromDOMContainer(
			container,
			children,
			parentComponent,
			callback
		);
	} else {
		// 更新
		root = maybeRoot;
		// updateContainer(children, root, parentComponent, callback);
	}
	// return getPublicRootInstance(root);
}

/**
 *
 * @param {*} container 容器
 * @param {*} initialChildren ReactNodeList element
 * @param {*} parentComponent
 * @param {*} callback
 */
function legacyCreateRootFromDOMContainer(
	container,
	initialChildren,
	parentComponent,
	callback
) {
	// react-reconciler
	// LegacyRoot 传统的模式
	// createRoot是ConcurrentRoot并发模式

	// 1. 其实就是 createFiberRoot()
	// rootFiber和fiberRoot的相互指向 current stateNode
	const root = createContainer(container, LegacyRoot); // FiberRootNode
	// 增加属性下次就是更新了 const maybeRoot = container._reactRootContainer
	container._reactRootContainer = root;
	// markContainerAsRoot();

	// 2. 事件系统
	// const rootContainerElement =
	//   container.nodeType === COMMENT_NODE ? container.parentNode : container;
	// listenToAllSupportedEvents(rootContainerElement);

	// 3. 初始化渲染
	flushSync(() => {
		updateContainer(initialChildren, root, parentComponent, callback);
	});

	return root;
}
