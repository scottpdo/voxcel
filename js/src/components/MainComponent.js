import React from 'react';
import ReactDOM from 'react-dom';
import THREE from 'three.js';
import ViewComponent from './ViewComponent';
import SceneComponent from './SceneComponent';

class Main extends React.Component {
	
	constructor() {
		super();
	}

	componentDidMount() {
		
	}

	render() {

		let styles = {
			width: '100%',
			height: '100%'
		}
		
		return (
			<div style={styles}>
				<ViewComponent auth={this.props.auth} />
				<SceneComponent auth={this.props.auth} />
			</div>
		);
	}
}

export default Main;