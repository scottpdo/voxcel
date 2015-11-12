import CONFIG from '../../config';
import Firebase from 'firebase';

let Model = (user, zone) => {
	
	let dataRef = new Firebase(CONFIG.dataRef + '/users/' + user + '/' + zone);
	let voxels = dataRef.child('voxels');
	let listeners = {
		value: [],
		child_added: [],
		child_changed: [],
		child_removed: [],
		child_moved: []
	};

	let addVoxel = (x, y, z, hex) => {
		let id = [x, y, z].join(',');
		voxels.child(id).set(hex);
	};

	let removeVoxel = (x, y, z) => {
		let id = [x, y, z].join(',');
		voxels.child(id).set(null);
	};

	let on = (which, cb) => {
		voxels.on(which, cb);
	};

	return {
		addVoxel,
		removeVoxel,
		on,
		child: (which) => {
			return voxels.child(which);
		}
	};

};

export default Model;