import CONFIG from '../config';
import React from 'react';

class LoginButton extends React.Component {

    constructor() {

        super();
        
        this.state = {
            alert: '',
            loggedIn: false
        };

        this._clearAlert = () => {
            this.setState({
                alert: ''
            });
        };

        this._success = () => {
            this.setState({
                alert: 'Success!',
                loggedIn: true
            });
            setTimeout(this._clearAlert, 2000);
        };

        this._error = () => {
            this.setState({
                alert: 'There was a problem logging in. Try again?'
            });
            setTimeout(this._clearAlert, 2000);
        };

        this._login = () => {
            let auth = this.props.auth;
            auth.login({
                success: this._success,
                error: this._error
            });
        };
    }

    componentDidMount() {
        this.props.auth.on('login', () => {
            this.setState({
                loggedIn: true
            });
        });
    }

    render() {

        let styles = {
            display: this.state.loggedIn ? 'none' : 'block'
        };

        return (
            <div>
                <button className="login" id="login" onClick={this.props.onLogin} style={styles}>Log In</button>
                <p>{this.state.alert}</p>
            </div>
        );
    }
}

export default LoginButton;