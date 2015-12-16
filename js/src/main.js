import React from 'react';
import DOMWrapper from './domwrapper';
import AdminComponent from './components/AdminComponent';
import MainComponent from './components/MainComponent';

import CONFIG from './config';
import Firebase from 'firebase';
import AuthManager from './auth';
import SceneAdmin from './components/Scene/Admin';

let auth = AuthManager(new Firebase(CONFIG.dataRef));
let SceneManager = SceneAdmin();

// online/offline
let online = new Firebase(CONFIG.dataRef + '/.info/connected');
let viewerId = Math.round(1000000000 * Math.random()).toString();
while ( viewerId.length < 10 ) {
	viewerId = '0' + viewerId;
}
let viewerRef = new Firebase(CONFIG.dataRef + '/viewers/' + viewerId);
online.on('value', (s) => {
	if ( s.val() ) {
		viewerRef.onDisconnect().remove();
		viewerRef.update({
			online: true
		});
	}
});

DOMWrapper.render(
    <AdminComponent auth={auth} onChooseZone={SceneManager.chooseZone} onDeleteZone={SceneManager.deleteZone} />,
    'toolbar'
);

DOMWrapper.render(
	<MainComponent auth={auth} sceneManager={SceneManager} viewer={viewerRef} />,
	'main'
);