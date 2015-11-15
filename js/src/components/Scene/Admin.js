import THREE from 'three.js';

let Admin = () => {

	let listeners = {
		change: [],
		deleteZone: []
	};

	return {

		on(key, cb) {
			listeners[key].push(cb);
		},

		chooseZone(userId, zone) {
			listeners.change.forEach(cb => {
				cb(userId, zone);
			});
		},

		deleteZone(userId, zone) {
			listeners.deleteZone.forEach(cb => {
				cb(userId, zone);
			});
		}
	};
};

export default Admin;