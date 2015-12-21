import THREE from 'three.js';

let Voxelizer = (Scene) => {

	// render a voxel from its ID (x,y,z in space) and color
	let renderVoxel = (id, color) => {

		let voxel = new THREE.Mesh(
			new THREE.BoxGeometry(50, 50, 50),
			new THREE.MeshLambertMaterial({
				color
			})
		);

		voxel.castShadow = true;
		voxel.receiveShadow = true;

		voxel._id = id;
		let [ x, y, z ] = id.split(',').map(v => +v);
		voxel.position.set(x, y, z);

		Scene.objects.push(voxel);
		Scene.add(voxel);
	};

	// remove a voxel
	// expects Three.js object
	let removeVoxel = (voxel, cb) => {

		let before = Scene.objects.slice(0, Scene.objects.indexOf(voxel)),
			after = Scene.objects.slice(Scene.objects.indexOf(voxel) + 1);

		Scene.objects = before.concat(after);
		Scene.remove(voxel);

		if (cb) cb(voxel._id);
	};

	// get a voxel by its ID in O(n) time...
	// TODO: implement a hash map to reduce time
	let get = (id) => {
		for ( let i = 0; i < Scene.objects.length; i++ ) {
			let obj = Scene.objects[i];
			if ( obj._id === id ) {
				return obj;
			}
		}
		return false;
	};

	return {
		renderVoxel,
		removeVoxel,
		get
	};

};

export default Voxelizer;