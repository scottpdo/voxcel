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

		change(user, zone) {
			listeners.change.forEach(cb => {
				cb(user.id, zone);
			});
		},

		deleteZone(user, zone) {
			listeners.deleteZone.forEach(cb => {
				cb(user.id, zone);
			});
		}
	};
};

export default Admin;