import THREE from 'three.js';

let Voxelizer = (Scene) => {

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

	let removeVoxel = (voxel, cb) => {

		let before = Scene.objects.slice(0, Scene.objects.indexOf(voxel)),
			after = Scene.objects.slice(Scene.objects.indexOf(voxel) + 1);

		Scene.objects = before.concat(after);
		Scene.remove(voxel);

		cb(voxel._id);
	};

	return {
		renderVoxel,
		removeVoxel
	};

};

export default Voxelizer;