import THREE from 'three.js';
import _Lighting from './Lighting';

let Stage = (Scene) => {

	Scene.objects = [];

	let groundPlane = new THREE.Mesh(
		new THREE.PlaneGeometry(100000, 100000),
		new THREE.MeshLambertMaterial({
			color: '#888'
		})
	);
	groundPlane.receiveShadow = true;
	groundPlane.position.y = -2;
	groundPlane.rotation.x -= Math.PI / 2;
	Scene.add(groundPlane);

	let gridPlane = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshLambertMaterial({
			color: '#ccc'
		})
	);
	gridPlane.receiveShadow = true;
	gridPlane.rotation.x -= Math.PI / 2;
	Scene.add(gridPlane);
    Scene.objects.push(gridPlane);

	let Lighting = _Lighting(Scene);
	Lighting.setTime(0.333);

	Scene.setTime = Lighting.setTime;
	Scene.getTime = Lighting.getTime;

	return Scene;

};

export default Stage;