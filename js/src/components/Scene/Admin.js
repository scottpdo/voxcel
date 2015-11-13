import THREE from 'three.js';

let Admin = () => {

	let listeners = {
		change: []
	};

	return {

		on(key, cb) {
			listeners[key].push(cb);
		},

		change(user, zone) {
			listeners.change.forEach(cb => {
				cb(user.id, zone);
			});
		}
	};
};

export default Admin;