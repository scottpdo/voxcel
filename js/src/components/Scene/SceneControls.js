import React from 'react';

class SceneControls extends React.Component {

	constructor() {
		super();
	}

	render() {
		return this.props.isAdmin ? (
			<div>
				<input type="color" id="color-picker" ref="colorPicker" onChange={this.props.controls.changeColor.bind(this)} />
			</div>
		) : null;
	}

}

export default SceneControls;