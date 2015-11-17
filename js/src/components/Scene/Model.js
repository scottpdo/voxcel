import CONFIG from '../../config';
import Firebase from 'firebase';

let Model = (userId, zone) => {
	
	let dataRef = new Firebase(CONFIG.dataRef + '/users/' + userId + '/' + zone);
	let voxels = dataRef.child('voxels');
	let callbacks = {};

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
		if ( callbacks[which] ) {
			callbacks[which].push(cb);
		} else {
			callbacks[which] = [cb];
		}
	};

	// off will clear all attached listeners
	let off = (which) => {
		for ( let key in callbacks ) {
			if ( key === which ) {
				callbacks[which].forEach(cb => {
					voxels.off(which, cb);
				});
				callbacks[which] = [];
			}
		}
	};

	return {
		addVoxel,
		removeVoxel,
		on,
		off,
		child: (which) => {
			return voxels.child(which);
		},
		voxels
	};

};

export default Model;