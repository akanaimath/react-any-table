'use strict';
import React, { PropTypes } from 'react';
import { render } from 'react-dom';
import { cloneProps } from 'react-utility';
import AnyTable from '../build/AnyTable.js';

class Demo extends React.Component {
	constructor(props) {
		super(props);
		this.state = cloneProps(props);
	}
	render() {
		return (
			<div className="demo-consume">
				<div>This is demo</div>
				<div className="demo-comp-container">
					<div className="demo-comp-box"><AnyTable /></div>
					{/* <div className="demo-comp-box"><AnyTable /></div>
					<div className="demo-comp-box"><AnyTable /></div> */}
				</div>
			</div>)
	}
	static defaultProps = {
		data: []
	}
}

render(<Demo />, document.getElementById('app'));