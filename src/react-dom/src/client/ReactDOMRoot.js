import { allowConcurrentByDefault } from 'shared/ReactFeatureFlags';
import { createContainer } from 'react-reconciler/ReactFiberReconciler';
import { ConcurrentRoot } from 'react-reconciler/ReactRootTags';
import { updateContainer } from 'react-reconciler/ReactFiberReconciler';
/**
 * createRoot 的入口
 * @param {} container 挂载点
 * @param {*} options
 */
export function createRoot(container, options) {
	let concurrentUpdatesByDefaultOverride = false;
	if (options !== null && options !== undefined) {
		if (
			allowConcurrentByDefault &&
			options.unstable_concurrentUpdatesByDefault === true
		) {
			concurrentUpdatesByDefaultOverride = true;
		}
	}

	const root = createContainer(
		container,
		ConcurrentRoot // tag mode ReactDOM.render()
	);
	console.log(root);
	// node[internalContainerInstanceKey] = hostRoot;
	// markContainerAsRoot(root.current, container);
	// 事件
	// listenToAllSupportedEvents(container);

	return new ReactDOMRoot(root);
}

function ReactDOMRoot(internalRoot) {
	this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
	console.log(children);
	updateContainer(children, root, null, null);
};
