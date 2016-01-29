import CONFIG from '../config';
import React from 'react';
import DefaultViewComponent from './DefaultViewComponent';

class ViewComponent extends React.Component {
	
	constructor() {

		super();

		this.state = {
			visible: this.isVisible()
		};
	}

	// should be some router
	isVisible() {
		let hash = window.location.hash;
		return hash.search(/\/user\/(\d*)\/zone\/(.*)\//) === -1 && hash.search(/\/sandbox$/) === -1;
	}

	componentDidMount() {

		window.addEventListener('hashchange', () => {
			this.setState({
				visible: this.isVisible()
			});
		});
	}

	render() {

		let style = {
			width: '100%',
			height: '100%'
		};

		let titleStyles = {
			position: 'absolute',
			top: '0',
			left: '20px',
			color: '#fff'
		};

		return this.state.visible ? (
			<div style={style}>
				<DefaultViewComponent />
				<h1 style={titleStyles}>Voxcel</h1>
			</div>
		) : <div></div>;
	}

}

export default ViewComponent;