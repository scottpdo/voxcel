import CONFIG from '../config';
import React from 'react';
import route from 'http-hash';

class ViewComponent extends React.Component {
	
	constructor() {

		super();

		this.state = {
			visible: this.isVisible(),
			zones: []
		};
	}

	isVisible() {
		let hash = window.location.hash;
		return hash.search(/\/user\/(\d*)\/zone\/(.*)\//) === -1;
	}

	componentDidMount() {
		
		let zones = new Firebase(CONFIG.dataRef + '/users');
		zones.on('child_added', (s) => {
			let user = s.key();
			let zones = s.val();
			for ( let zone in zones ) {
				this.setState({
					zones: this.state.zones.concat({
						user,
						id: zone,
						name: zones[zone].name
					})
				});
			}
		});

		window.addEventListener('hashchange', () => {
			this.setState({
				visible: this.isVisible()
			});
		});
	}

	render() {

		let styles = {
			display: this.state.visible ? 'block' : 'none',
			padding: '10px 20px'
		};

		let zones = this.state.zones.map(v => {
			return <li key={v.id}><a href={'/#/user/' + v.user + '/zone/' + v.id + '/'}>{v.name}</a></li>;
		});

		return (
			<div style={styles}>
				<h1>3d</h1>
				<img src="http://i.imgur.com/czmQqcy.gif" />
				<p><b>3d</b> is an in-browser experiment by <a href="https://twitter.com/scottpdonaldson">Scott Donaldson</a> using three.js, React, and Firebase.</p>
				<p>Check out some zones:</p>
				<ul>{zones}</ul>
			</div>
		);
	}

}

export default ViewComponent;