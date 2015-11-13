import React from 'react';

import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import UserInfo from './UserInfo';
import UserZones from './UserZones';
import HelperText from './HelperText';

class AdminComponent extends React.Component {
	
	constructor() {
		super();
	}

    render() {
        return (
            <div className="h100">
                <LoginButton auth={this.props.auth} onLogin={this.props.auth.login} />
                <LogoutButton auth={this.props.auth} onLogout={this.props.auth.logout} />
                <UserInfo auth={this.props.auth} />
                <UserZones auth={this.props.auth} onChooseZone={this.props.onChooseZone} />
                <HelperText auth={this.props.auth} />
            </div>
        );
    }
}

export default AdminComponent;