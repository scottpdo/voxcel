import CONFIG from '../config';
import React from 'react';
import Firebase from 'firebase';
import swal from 'sweetalert';
import { Route, Link } from 'react-router';

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

	createZone() {

		swal({
            title: 'Name your zone!',
            type: 'input',
            animation: 'slide-from-top'
        }, (inputValue) => {

        	if ( inputValue ) {
        	
	        	let zoneRef = new Firebase(CONFIG.dataRef + '/users/' + this.state.userId);
	            
	            let path = zoneRef.push({
	                name: inputValue,
	                created_at: new Date().getTime()
	            }).toString().split('/');

	            let zoneId = path[path.length - 1];

	            this.props.onChooseZone.call(null, this.state.userId, zoneId);
	        }
        });
	}

	deleteZone(zone, name, e) {

		e.stopPropagation();

		swal({
            title: 'Are you sure you want to delete ' + name + '?',
            type: 'warning',
            animation: 'slide-from-top',
            showCancelButton: true
        }, () => {
        	let zoneRef = new Firebase(CONFIG.dataRef + '/users/' + this.state.userId);
            zoneRef.child(zone).set(null);
        });
	}

	render() {

		let styles = {
			display: this.state.loggedIn ? 'block' : 'none'
		};

		let zones = this.state.zones.map(v => {
			return (
				<li key={v.key} onClick={this.props.onChooseZone.bind(null, this.state.userId, v.key)}>
					<a href={'/#/user/' + this.state.userId + '/zone/' + v.key + '/'}>
						{v.name}
					</a>
					<span className="delete" onClick={this.deleteZone.bind(this, v.key, v.name)}></span>
				</li>
			);
		});

		return (
			<div style={styles}>
				<ul className="zones tight no-list">
					<li className="underline">Zones:</li>
					{zones}
				</ul>
				<button onClick={this.createZone.bind(this)}>New Zone</button>
			</div>
		);
	}
}

export default UserZones;