// import React from "react";
// import ReactDOM from "react-dom";

import React from './react';
import { createRoot } from './react-dom/client';

// import ReactDOM from "react-dom/client";

let element = (
	<div className='title' style={{ color: 'red' }}>
		<span>hello</span>world
	</div>
);


// 实现 React.createElement()
// console.log(JSON.stringify(element1, null, 2));

// debugger;
const root = createRoot(document.getElementById('root'));
root.render(<element />)