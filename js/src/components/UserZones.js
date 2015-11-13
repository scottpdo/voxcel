import CONFIG from '../config';
import React from 'react';
import Firebase from 'firebase';

class UserZones extends React.Component {

	constructor() {
		super();

		this.state = {
			loggedIn: false,
			userId: null,
			zones: []
		};
	}

	componentDidMount() {
		
		this.props.auth.on('login', (user) => {

			this.setState({
				loggedIn: true,
				userId: user.id
			});
			
			let zoneRef = new Firebase(CONFIG.dataRef + '/users/' + user.id);
			
			zoneRef.on('child_added', (s) => {

				this.setState({
					zones: this.state.zones.concat({
						key: s.key(),
						name: s.val().name
					})
				});
			});

			zoneRef.on('child_removed', (s) => {
				let zones = this.state.zones;
				
				zones = zones.filter(zone => {
					return zone.key !== s.key();
				});

				this.setState({
					zones
				});
			});
		});

		this.props.auth.on('logout', () => {
			this.setState({
				loggedIn: false
			});
		});
	}

	createZone(userId) {

		// TODO: show swal to get name, add to Firebase

		// let zoneRef = new Firebase(CONFIG.dataRef + '/users/' + userId);
		// zoneRef.child(zone).set(null);
	}

	deleteZone(userId, zone) {

		// TODO: show confirm before delete zone

		let zoneRef = new Firebase(CONFIG.dataRef + '/users/' + userId);
		zoneRef.child(zone).set(null);
	}

	render() {

		let styles = {
			display: this.state.loggedIn ? 'block' : 'none'
		};

		let zones = this.state.zones.map(v => {
			return (
				<li key={v.key} onClick={this.props.onChooseZone.bind(null, this.props.auth.getUser(), v.key)}>
					{v.name}
					<span className="delete" onClick={this.deleteZone.bind(null, this.props.auth.getUser('id'), v.key)}></span>
				</li>
			);
		});

		return (
			<div style={styles}>
				<ul className="zones tight no-list">
					<li className="underline">Zones:</li>
					{zones}
				</ul>
				<button onClick={this.createZone}>New Zone</button>
			</div>
		);
	}
}

export default UserZones;