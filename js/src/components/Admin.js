import CONFIG from '../config';
import React from 'react';
import Firebase from 'firebase';
import AuthManager from '../auth';

import LoginButton from './LoginButton';
import UserInfo from './UserInfo';
import HelperText from './HelperText';

let auth = AuthManager(new Firebase(CONFIG.dataRef));

class AdminComponent extends React.Component {
	
	constructor() {
		
		super()

		this._login = (which) => {
			auth.login({
				error: () => {
					console.warn('There was an error logging in.');
				}
			});
		};
	}

    render() {
        return (
            <div className="h100">
                <LoginButton auth={auth} onLogin={this._login} />
                <UserInfo auth={auth} onLogin={this._login} />
                <HelperText />
            </div>
        );
    }
}

export default AdminComponent;