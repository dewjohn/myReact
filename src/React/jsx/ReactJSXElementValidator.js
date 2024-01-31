import { jsxDEV } from "./ReactJSXElement";

export function jsxWithValidation(
  type,
  props,
  key,
  isStaticChildren,
  source,
  self
) {
  const element = jsxDEV(type, props, key, source, self);
  return element;
}
