import CONFIG from '../config';
import React from 'react';

class LoginButton extends React.Component {

    constructor() {

        super();
        
        this.state = {
            alert: '',
            loggedIn: false
        };

        let success = () => {
            this.setState({
                loggedIn: true
            });
        };

        this._login = () => {
            this.props.auth.login({
                success
            });
        };
    }

    componentDidMount() {
        
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

        return <button className="login" id="login" onClick={this.props.onLogin} style={styles}>Log In</button>;
    }
}

export default LoginButton;