import THREE from 'three.js';
import React from 'react';
import ReactDOM from 'react-dom';
import _Camera from './Scene/Camera';
import Stage from './Scene/Stage';
import Model from './Scene/Model';
import Voxelizer from './Scene/Voxelizer';
import { $ } from 'zepto-browserify';

class SceneComponent extends React.Component {

	constructor() {
		super();

		this.state = {
			active: false
		};
	}

	init() {

		let canvas = this.refs.canvas;
		let Scene = new THREE.Scene();
		Scene.objects = [];

		// prepare background elements, lighting, etc.
		Stage(Scene);

		let timeRange = $(this.refs.timeRange);
		timeRange.val(Scene.getTime());
		timeRange.on('change input', () => {
			Scene.setTime(+this.refs.timeRange.value);
			Scene.setTime(+this.refs.timeRange.value);
		});
		
		let data = Model('104314934710208349695', '-K0wJw6iCVYxR-DirNeP');
		let voxelizer = Voxelizer(Scene);

		data.on('child_added', function(s) {
			voxelizer.renderVoxel(s.key(), s.val());
		});

		this.setState({
			active: true
		});
		
		let Renderer = new THREE.WebGLRenderer({
			antialias: true,
		    preserveDrawingBuffer: true,
			canvas,
			shadowMapEnabled: true
		});
		Renderer.shadowMap.enabled = true;
		Renderer.setSize((window.devicePixelRatio || 1) * canvas.parentNode.clientWidth, (window.devicePixelRatio || 1) * canvas.parentNode.clientHeight);

		let Camera = _Camera(Scene, Renderer),
			Raycaster = new THREE.Raycaster(),
			Mouse = new THREE.Vector2(-2, -2), // mouse off canvas by default
			mouseDownCoords = new THREE.Vector2(-2, -2);

		let _render = () => {
			
			Renderer.render(Scene, Camera);
			Raycaster.setFromCamera( Mouse, Camera );
			
			if ( this.state.active ) window.requestAnimationFrame(_render.bind(this));
		};

		_render.call(this);

		this._onMouseMove = (e) => {

			Mouse.x = ( e.layerX / canvas.width ) * 2 - 1;
		    Mouse.y = -( e.layerY / canvas.height ) * 2 + 1;
		};

		this._onMouseDown = () => {

			mouseDownCoords.x = Mouse.x;
			mouseDownCoords.y = Mouse.y;
		};

		this._onMouseUp = () => {

			if ( mouseDownCoords.x === Mouse.x && mouseDownCoords.y === Mouse.y ) {
				
				let intersects = [],
		        	closest = Infinity,
		        	closestObj;

		        // calculate objects intersecting the picking ray
		        Raycaster.intersectObjects( Scene.objects ).forEach(intersect => {
		            intersects.push(intersect);
		        });

		        intersects.forEach(intersect => {
		            if ( intersect.distance < closest ) {
		                closest = intersect.distance;
		                closestObj = intersect;
		            }
		        });

		        if ( closestObj ) {
		        	voxelizer.removeVoxel(closestObj.object, (id) => {
			        	console.log(id);
			        	data.child(id).set(null);
			        });
		        }
			}
		};

		this._onResize = () => {

			Camera.aspect = canvas.parentNode.clientWidth / canvas.parentNode.clientHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize((window.devicePixelRatio || 1) * canvas.parentNode.clientWidth, (window.devicePixelRatio || 1) * canvas.parentNode.clientHeight);
		};

		$(canvas)
			.on('mousemove', this._onMouseMove)
			.on('mousedown', this._onMouseDown)
			.on('mouseup', this._onMouseUp);
		window.addEventListener('resize', this._onResize);

	}

	destroy() {

		let canvas = this.refs.canvas;

		this.setState({
			active: false
		});

		$(canvas)
			.off('mousemove', this._onMouseMove)
			.off('mousedown', this._onMouseDown)
			.off('mouseup', this._onMouseUp);
		window.removeEventListener('resize', this._onResize);
	}

	componentDidMount() {

		this.props.auth.on('login', this.init.bind(this));
		this.props.auth.on('logout', this.destroy.bind(this));

	}

	componentWillUnmount() {

	}

	render() {
		let style = {
			display: this.state.active ? 'block' : 'none',
			height: '100%',
			width: '100%'
		};
		return (
			<div style={style}>
				<canvas ref="canvas" style={style}></canvas>
				<div className="time-range-container">
					<label htmlFor="time-range">Time:</label>
					<input type="range" id="time-range" ref="timeRange" min="0" max="1" step="0.001" />
				</div>
			</div>
		);
	}

}

export default SceneComponent;