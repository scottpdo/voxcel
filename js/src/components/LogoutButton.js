import CONFIG from '../config';
import React from 'react';

class LoginButton extends React.Component {

    constructor() {

        super();
        
        this.state = {
            loggedIn: false
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
            display: this.state.loggedIn ? 'block' : 'none'
        };

        return <button onClick={this.props.onLogout} style={styles}>Log Out</button>;
    }
}

export default LoginButton;