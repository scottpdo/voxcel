import THREE from 'three.js';
import React from 'react';
import Stage from './Scene/Stage';
import _Camera from './Scene/Camera';
import Voxelizer from './Scene/Voxelizer';
import random from '../utils/random';
import shuffle from '../utils/shuffle';

class DefaultViewComponent extends React.Component {

	constructor() {

		super();

		this.state = {
			scene: new THREE.Scene(),
			sceneIsStaged: false
		};
	}

	init(userId, zone) {

		let canvas = this.refs.canvas;
		canvas.width = canvas.parentNode.clientWidth;
		canvas.height = canvas.parentNode.clientHeight;

		let Scene = this.state.scene;

		// prepare background elements, lighting, etc.
		Stage(Scene);
		Scene.remove(Scene.namedObjects.gridPlane);

		let voxelizer = Voxelizer(Scene);
		let voxels = [];
		
		let Renderer = new THREE.WebGLRenderer({
			antialias: true,
		    preserveDrawingBuffer: true,
			canvas,
			shadowMapEnabled: true
		});
		Renderer.shadowMap.enabled = true;
		Renderer.setSize(canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);

		let Camera = new THREE.PerspectiveCamera( 
			45, 
			Renderer.domElement.width / Renderer.domElement.height, 
			0.1, 
			100000
		);

	    Scene.add(Camera);

		let t = 0;

		let randStep = (min, max, step) => {
		    return min + (step * Math.floor(Math.random() * ( max - min ) / step) );
		};

		let randId = () => {
			let id = randStep(-375, 375, 50) + ',' + randStep(25, 375, 50) + ',' + randStep(-375, 375, 50);
			if ( voxels.indexOf(id) === -1 ) {
				return id;
			} else {
				return randId();
			}
		};

		let randHex = () => {
			return Math.floor(Math.random() * 16).toString(16)
		};

		let _render = () => {

			Camera.position.set(1000 * Math.sin(t / 360), 300, 1000 * Math.cos(t / 360));
			Camera.lookAt(new THREE.Vector3(0, 0, 0));
			Scene.setTime(Math.sin(t / 360));

			// adding
			if ( t % 400 < 100 ) {
				
				if ( t % 5 === 0 ) {
					let id = randId(),
						c = randHex();
					let hex = '#' + c + c + c;
					voxelizer.renderVoxel(id, hex);
					voxels.push(id);
				}

			// removing
			} else if ( t % 400 >= 200 && t % 400 < 300 ) {
				
				if ( t % 5 === 0 ) {
					voxels = shuffle(voxels);
					let vox = voxelizer.get(voxels.pop());
					voxelizer.removeVoxel(vox);
				}
			}
			
			Renderer.render(Scene, Camera);
			
			if ( this.state.active ) window.requestAnimationFrame(_render);
			t++;
		};

		this._onResize = () => {

			Camera.aspect = canvas.parentNode.clientWidth / canvas.parentNode.clientHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize(canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);
		};

		// Go go go!
		this.setState({
			active: true,
			sceneIsStaged: true
		}, () => {
			this._onResize();
			_render.call(this);
		});

		window.addEventListener('resize', this._onResize.bind(this));
	}

	componentDidMount() {

		if ( !this.state.sceneIsStaged ) {
			this.init.call(this);
		}
	}

	render() {

		let style = {
			height: '100%',
			width: '100%'
		};

		return (
			<div style={style}>
				<canvas ref="canvas"></canvas>
			</div>
		);
	}
}

export default DefaultViewComponent;