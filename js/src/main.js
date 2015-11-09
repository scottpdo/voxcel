import CONFIG from './config.js';
import Firebase from 'firebase';
import React from 'react';
import ReactDOM from 'react-dom';
import swal from 'sweetalert';
import { $ } from 'zepto-browserify';
import AuthManager from './auth.js';

let dataRef = new Firebase(CONFIG.dataRef),
    auth = AuthManager(dataRef), // needs base dataRef to init authentication
    
    adminContainer = $('#admin'),
    container = $('#container');

class LoginButton extends React.Component {

    constructor() {
        super();
        
        this.state = {
            alert: 'test'
        };

        this._success = () => {
            this.setState({
                alert: 'Success!'
            });
        };

        this._error = () => {
            this.setState({
                alert: 'There was a problem logging in. Try again?'
            });
        };

        this._login = () => {
            auth.login({
                success: this._success,
                error: this._error
            });
        };
    }

    render() {
        return (
            <div>
                <button className="login" id="login" onClick={this._login}>Log In</button>
                <p>{this.state.alert}</p>
            </div>
        );
    }
}

class HelperText extends React.Component {
    
    _showHelperText() {
        
        let text = '<p><b>3d</b> is an in-browser experiment by <a href="https://twitter.com/scottpdonaldson">Scottland</a> using three.js and Firebase.</p><p><b>Right click and drag</b> to rotate the camera.</p><p><b>Left click and drag</b> to pan the camera.</p>';
        
        if ( !auth.getUser() ) {
            text += '<p>Once you log in, you can create zones of your own!</p>';
        } else {
            text += '<p><b>Click</b> to create a new block.';
            text += '<p><b>Shift + click</b> to remove a block.</p>';
            text += '<p>Have fun!</p>';
        }

        swal({
            title: '3d',
            allowOutsideClick: true,
            showConfirmButton: false,
            text,
            animation: "slide-from-top",
            html: true,
            customClass: 'alignleft'
        });
    }

    render() {
        return (
            <div className="help">
                <span onClick={this._showHelperText}>?</span>
            </div>
        );
    }
}

class AdminComponent extends React.Component {
    render() {
        return (
            <div className="h100">
                <LoginButton />
                <HelperText />
            </div>
        );
    }
}

ReactDOM.render(
    <AdminComponent />,
    document.getElementById('admin')
);