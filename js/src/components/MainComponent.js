import React from 'react';
import ReactDOM from 'react-dom';
import THREE from 'three.js';

class Main extends React.Component {
	
	constructor() {
		super();

		this.state = {
			fill: '#000'
		};

		this._paint = (canvas) => {
			let context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = this.state.fill;
			context.fillRect(0, 0, canvas.width, canvas.height);
		};
	}

	componentDidMount() {

		let canvas = ReactDOM.findDOMNode(this);

		let Scene = new THREE.Scene();
		let Renderer = new THREE.WebGLRenderer({
			antialias: true,
	        preserveDrawingBuffer: true,
			canvas
		});
		Renderer.setClearColor('#555');
		Renderer.setSize((window.devicePixelRatio || 1) * canvas.parentNode.clientWidth, (window.devicePixelRatio || 1) * canvas.parentNode.clientHeight);

		let BoxGeometry = new THREE.BoxGeometry(20, 20, 20);
		let BoxMaterial = new THREE.MeshLambertMaterial({
			color: '#fff'
		});
		let BoxMesh = new THREE.Mesh(BoxGeometry, BoxMaterial);
		Scene.add(BoxMesh);

		let Camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 10000);
		Scene.add(Camera);

		let Light = new THREE.AmbientLight('#fff');
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
			
			window.requestAnimationFrame(_render);
		};

		_render();

		window.addEventListener('resize', function() {

			Camera.aspect = canvas.parentNode.clientWidth / canvas.parentNode.clientHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize((window.devicePixelRatio || 1) * canvas.parentNode.clientWidth, (window.devicePixelRatio || 1) * canvas.parentNode.clientHeight);

			canvas.style.width = '100%';
			canvas.style.height = '100%';
		});
	}

	render() {
		return <canvas></canvas>;
	}
}

export default Main;