import React from 'react';
import ReactDOM from 'react-dom';
import AdminComponent from './components/AdminComponent';
import MainComponent from './components/MainComponent';

import CONFIG from './config';
import Firebase from 'firebase';
import AuthManager from './auth';
import SceneAdmin from './components/Scene/Admin';

let auth = AuthManager(new Firebase(CONFIG.dataRef));
let SceneManager = SceneAdmin();

ReactDOM.render(
    <AdminComponent auth={auth} onChooseZone={SceneManager.chooseZone} onDeleteZone={SceneManager.deleteZone} />,
    document.getElementById('admin')
);

ReactDOM.render(
	<MainComponent auth={auth} sceneManager={SceneManager} />,
	document.getElementById('main')
);