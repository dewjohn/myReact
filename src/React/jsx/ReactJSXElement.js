import hasOwnProperty from "shared/hasOwnProperty";
import { REACT_ELEMENT_TYPE } from "../../shared/ReactSymbols";
export const ReactCurrentOwner = { current: null };

// 保留属性
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    _owner: owner,
  };
  // Object.defineProperty(element, '_self', {})
  // Object.defineProperty(element, '_source', {})
  return element;
};

export function jsxDEV(type, config, maybeKey, source, self) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;
  // if (maybeKey !== undefined) {
  //   key = "" + maybeKey;
  // }
  if (config.key !== undefined) {
    key = "" + config.key;
  }
  if (config.ref !== undefined) {
    ref = config.ref;
  }

  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }
  // 返回react元素
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}
