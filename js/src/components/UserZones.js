import CONFIG from '../config';
import React from 'react';
import Firebase from 'firebase';

class UserZones extends React.Component {

	constructor() {
		super();
		this.zones = [];

		this.state = {
			loggedIn: false,
			dummy: false
		};
	}

	componentDidMount() {
		
		this.props.auth.on('login', (user) => {

			this.setState({
				loggedIn: true
			});
			
			let zoneRef = new Firebase(CONFIG.dataRef + '/users/' + user.id);
			
			zoneRef.on('child_added', (s) => {
				
				this.setState({
					dummy: !this.state.dummy
				}); // update render

				this.zones.push({
					key: s.key(),
					name: s.val().name
				});
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
			display: this.state.loggedIn ? 'block' : 'none'
		};

		let zones = this.zones.map(v => {
			return <li key={v.key} onClick={this.props.onChooseZone.bind(null, this.props.auth.getUser(), v.key)}>{v.name}</li>;
		});

		return (
			<ul className="zones tight no-list" style={styles}>
				<li className="underline">Zones:</li>
				{zones}
			</ul>
		);
	}
}

export default UserZones;