import React from 'react';

import LoginButton from './LoginButton';
import UserInfo from './UserInfo';
import HelperText from './HelperText';

class AdminComponent extends React.Component {
	
	constructor() {
		
		super()

		this._login = (which) => {
			this.props.auth.login({
				error: () => {
					console.warn('There was an error logging in.');
				}
			});
		};
	}

    render() {
        return (
            <div className="h100">
                <LoginButton auth={this.props.auth} onLogin={this._login} />
                <UserInfo auth={this.props.auth} />
                <HelperText auth={this.props.auth} />
            </div>
        );
    }
}

export default AdminComponent;