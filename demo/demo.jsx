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
					<div className="demo-comp-box">
						<AnyTable
							loading={false}
							pending={false}
							data={this.state.data["data1"]}
							defaultPageSize={5}
							footer={{x:{alias:"Total", operation:"Sum"},y:{alias:"Maximum", operation:"Max"}}}
							columns={[{accessor:"x",Header:"X-values"},{accessor:"Y",Header:"Y-values"},{accessor:"z",Header:"Z-values"}]}
						/>
					</div>
					{/* <div className="demo-comp-box"><AnyTable /></div>
					<div className="demo-comp-box"><AnyTable /></div> */}
				</div>
			</div>)
	}
	static defaultProps = {
		data: {
			data1: [{ x: 1, y: 2, z: 3 }, { x: 2, y: 3, z: 4 }]
		}
	}
}

render(<Demo />, document.getElementById('app'));