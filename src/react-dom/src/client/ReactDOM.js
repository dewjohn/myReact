import { createRoot as createRootImpl } from './ReactDOMRoot';

import { render } from '../ReactDOMLegacy';

function createRoot(container, options) {
	return createRootImpl(container, options);
}

export { createRoot, render };
