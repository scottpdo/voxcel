import THREE from 'three.js';
import React from 'react';
import ReactDOM from 'react-dom';

class SceneComponent extends React.Component {

	constructor() {
		super();

		this.state = {
			active: false
		};
	}

	init() {

		let canvas = ReactDOM.findDOMNode(this);

		this.setState({
			active: true
		});

		let Scene = new THREE.Scene();
		let Renderer = new THREE.WebGLRenderer({
			antialias: true,
		    preserveDrawingBuffer: true,
			canvas,
			shadowMapEnabled: true
		});
		Renderer.shadowMap.enabled = true;
		Renderer.setClearColor('#555');
		Renderer.setSize((window.devicePixelRatio || 1) * canvas.parentNode.clientWidth, (window.devicePixelRatio || 1) * canvas.parentNode.clientHeight);

		let BoxGeometry = new THREE.BoxGeometry(5, 5, 5);
		let BoxMaterial = new THREE.MeshLambertMaterial({
			color: '#00f'
		});
		let BoxMesh = new THREE.Mesh(BoxGeometry, BoxMaterial);
		BoxMesh.castShadow = true;
		Scene.add(BoxMesh);

		let PlaneGeometry = new THREE.PlaneGeometry(100, 100);
		let PlaneMaterial = new THREE.MeshLambertMaterial({
			color: '#fe0',
			side: THREE.DoubleSide
		});
		let PlaneMesh = new THREE.Mesh(PlaneGeometry, PlaneMaterial);
		PlaneMesh.rotation.x -= Math.PI / 2;
		PlaneMesh.receiveShadow = true;
		Scene.add(PlaneMesh);

		let Camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 10000);
		Scene.add(Camera);

		let Light = new THREE.DirectionalLight('#fff', 2.0);

		/* Light.castShadow = true;
		Light.shadowMapWidth = Light.shadowMapHeight = 2048;
		Light.shadowCameraLeft = -1000;
		Light.shadowCameraRight = 1000;
		Light.shadowCameraBottom = -1000;
		Light.shadowCameraTop = 1000; */

		Light.position.set(0, 100, 100);
		Light.target = PlaneMesh;
		Scene.add(Light);

		Camera.position.set(120, 120, 120);
		Camera.lookAt(BoxMesh.position);

		canvas.style.width = '100%';
		canvas.style.height = '100%';

		let t = 0;

		let _render = () => {
			
			Renderer.render(Scene, Camera);

			BoxMesh.position.setX( 100 * Math.sin(t / 100) );

			t++;
			
			if ( this.state.active ) window.requestAnimationFrame(_render.bind(this));
		};

		_render.call(this);

		this._onResize = () => {

			Camera.aspect = canvas.parentNode.clientWidth / canvas.parentNode.clientHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize((window.devicePixelRatio || 1) * canvas.parentNode.clientWidth, (window.devicePixelRatio || 1) * canvas.parentNode.clientHeight);

			canvas.style.width = '100%';
			canvas.style.height = '100%';
		}

		window.addEventListener('resize', this._onResize);

	}

	destroy() {
		this.setState({
			active: false
		});
		window.removeEventListener('resize', this._onResize);
	}

	componentWillMount() {

		this.props.auth.on('login', this.init.bind(this));
		this.props.auth.on('logout', this.destroy.bind(this));

	}

	componentWillUnmount() {

	}

	render() {
		return <canvas></canvas>
	}

}

export default SceneComponent;