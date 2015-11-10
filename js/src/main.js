import React from 'react';
import ReactDOM from 'react-dom';
import AdminComponent from './components/AdminComponent';
import MainComponent from './components/MainComponent';

import CONFIG from './config';
import Firebase from 'firebase';
import AuthManager from './auth';

let auth = AuthManager(new Firebase(CONFIG.dataRef));

ReactDOM.render(
    <AdminComponent auth={auth} />,
    document.getElementById('admin')
);

ReactDOM.render(
	<MainComponent auth={auth} />,
	document.getElementById('main')
);