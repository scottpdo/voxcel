import React from 'react';

class ViewComponent extends React.Component {
	
	constructor() {

		super();

		this.state ={
			loggedIn: false
		};

	}

	componentWillMount() {

		this.props.auth.on('login', () => {
			this.setState({
				loggedIn: true
			});
		});

		this.props.auth.on('logout', () => {
			this.setState({
				loggedIn: false
			});
		});

	}

	render() {

		let styles = {
			display: this.state.loggedIn ? 'none' : 'block'
		};

		return (
			<div style={styles}>VIEW_COMPONENT</div>
		);
	}

}

export default ViewComponent;