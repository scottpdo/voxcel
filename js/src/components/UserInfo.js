import React from 'react';

class UserInfo extends React.Component {
	
	constructor() {

		super();

		this.state = {
			loggedIn: false,
			photo: null,
			name: null
		};

	}

	componentDidMount() {
       
        this.props.auth.on('login', (user) => {
            this.setState({
                loggedIn: true,
                photo: user.photo,
                name: user.name
            });
        });

        this.props.auth.on('logout', () => {
        	this.setState({
        		loggedIn: false,
        		photo: null,
        		name: null
        	});
        });
    }

	render() {

		let styles = {
			display: this.state.loggedIn ? 'block' : 'none'
		};
		
		return (
			<div style={styles}>
				<img src={this.state.photo}></img>
				<p>{this.state.name}</p>
			</div>
		);
	}
}

export default UserInfo;