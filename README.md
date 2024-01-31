# react usage

> <https://beta.reactjs.org/>

## react 概念

```js
// react是什么
// react是一个用户构建用户界面的js库 组件化开发
// react和vue区别 优缺点
// react发展 react15 react16 react18
```

## jsx

```js
// 什么是jsx 和template区别

// jsx会经过babel的转义 https://www.babeljs.cn/repl
// 老版的React.createElement() 返回一个 React元素
// react17新版的会变为 jsx()的函数调用 返回的也是 ReactElement元素
// 不再需要 import React from 'react'
// 两者对 children 的处理有差异 jsx_dev会将children放在props中

// 1. jsx react元素 虚拟dom fiber 区别

// 1.1 编辑阶段: jsx通过babel编译得到 React.createElement()
// 1.2 在浏览器执行代码  React.createElement函数会执行 返回React元素
// 1.3 React元素就是一个普通的js对象 虚拟dom
// 1.4 在react的render阶段我们会根据 vdom 创建对应的fiber对象

// 2. babel如果实现的转义 ast语法树
```

## createElement

```js
// https://github.com/facebook/react/blob/main/packages/react/src/ReactElement.js

// 返回一个 ReactElement react元素
```

## jsx_dev

```js
// react/jsx-dev-runtime
// 和createElement是一样的 返回React元素就是我们说的虚拟dom
// babel的编译结果是不一样的 children不是一个个的在参数后面了
// children没单独处理 是在 props 中的
```

## render

```js
// https://github.com/facebook/react/blob/main/packages/react-dom/src/client/ReactDOMLegacy.js
// ReactDOM.render()
// ReactDOM.createRoot()

function render() {
  const root = legacyCreateRootFromDOMContainer();
}
```

```js
function legacyCreateRootFromDOMContainer() {
  // 1. 创建 rootFiber和fiberRoot
  const root = createContainer();
  // 2. 事件系统
  listenToAllSupportedEvents();
  // 3. 初始化挂载 同步
  // ReactFiberWorkLoop flushSync设置优先级 执行fn
  flushSync(updateContainer());
  return root;
}
```

[FiberRootNode](img/1.FiberRootNode.jpeg)

```js
function createContainer(container) {
  // 1. 创建 fiberRoot
  const root = new FiberRootNode();
  // 2. 创建 rootFiber 很多属性
  const uninitializedFiber = createHostRootFiber();
  // 3. 相互指向
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  uninitializedFiber.memoizedState = initialState;
  // 4. 初始化更新队列 fiber.updateQueue = queue = {shared: {pending: null}}
  initializeUpdateQueue();
  return root;
}
```

```js
function updateContainer(element, container) {
  const current = element.current; // rootFiber
  // 1. 计算lane
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);
  // 2. 创建一个update更新 {payload: null, next: null}
  const update = createUpdate(eventTime, lane);
  update.payload = { element };
  // 3. 更新入对 按照批次加入到 concurrentQueues 数组中 return node.stateNode
  // 两种不同的模式在updateQueue的处理上是有区别的
  const root = enqueueUpdate(current, update, lane);
  // 4. 从根节点开始调度
  scheduleUpdateOnFiber(root, current, lane, eventTime);
  return lane;
}
```

```js
// ReactFiberWorkLoop
function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
  // 1. 将root标记为更新 root.pendingLanes |= updateLane; 1
  markRootUpdated(root, lane, eventTime);
  // 2. 调度root
  // 2.1 lane优先级 newCallbackPriority
  // 2.2 将callback添加到 syncQueue中 scheduleSyncCallback(performSyncWorkOnRoot添加到queue中)
  // 2.3 在 microtask 中清空任务 queueMicrotask(flushSyncCallbacks)
  // 2.3.1 设置优先级
  // 2.3.2 依次执行 syncQueue中的回调 callback = callback(isSync);
  // 2.3.3 执行 performSyncWorkOnRoot
  ensureRootIsScheduled(root, eventTime);
}

function ensureRootIsScheduled(root, eventTime) {
  // 1. 将cb加到如syncQueue中
  scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root));
  // 2. 清空队列 flushSyncCallbacks就是取出 cb执行
  // 就是执行 performSyncWorkOnRoot
  scheduleMicrotask(flushSyncCallbacks);
}
```

## createRoot

```js

```

## performSyncWorkOnRoot

```js

```
