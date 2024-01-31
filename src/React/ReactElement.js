import { REACT_ELEMENT_TYPE } from "../shared/ReactSymbols";
import hasOwnProperty from "shared/hasOwnProperty";

const ReactCurrentOwner = { current: null };
const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE, // react元素 一般都是这个类型的
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  };
  // Object.defineProperty(element, '_self', {})
  // Object.defineProperty(element, '_source', {})
  return element;
};

// jsx的函数调用
export function jsx(type, config) {}
export function jsxDEV() {}

// https://github.com/facebook/react/blob/main/packages/react/src/ReactElement.js

// 一些保留属性
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

/**
 *
 * @param {*} type 类型
 * @param {*} config 属性
 * @param {*} children 孩子
 */
export function createElement(type, config, children) {
  let propName;
  const props = {};
  let key = null; // 唯一标识key
  let ref = null; // ref
  let self = null;
  let source = null;

  // 1. 处理属性
  if (config !== null) {
    key = "" + config.key;
    ref = config.ref;
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
  }
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      // 保留属性是不加到上面的
      props[propName] = config[propName];
    }
  }
  // 2. 处理children 可能有多个
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    // 多个children
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }
  // 3.返回一个React元素 就是一个普通js对象
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    // _owner 用来记录创建此元素的组件 {current: null}
    ReactCurrentOwner.current,
    props
  );
}
