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
			active: false,
			scene: null,
			data: null
		};
	}

	init(userId, zone) {

		let canvas = this.refs.canvas;
		canvas.width = canvas.parentNode.clientWidth;
		canvas.height = canvas.parentNode.clientHeight;

		let Scene = new THREE.Scene();
		Scene.objects = [];
		this.setState({ scene: Scene });

		// prepare background elements, lighting, etc.
		Stage(Scene);

		let timeRange = $(this.refs.timeRange);
		timeRange.val(Scene.getTime());
		timeRange.on('change input', () => {
			Scene.setTime(+this.refs.timeRange.value);
			Scene.setTime(+this.refs.timeRange.value);
		});
		
		let data = this.update.call(this, userId, zone);
		this.setState({ data });

		let voxelizer = Voxelizer(Scene);

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
		Renderer.setSize(canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);

		let Camera = _Camera(Scene, Renderer),
			Raycaster = new THREE.Raycaster(),
			Mouse = new THREE.Vector2(-2, -2), // mouse off canvas by default
			mouseDownCoords = new THREE.Vector2(-2, -2);

		let rolloverMesh = new THREE.Mesh(
			new THREE.BoxGeometry(50, 50, 50),
			new THREE.MeshBasicMaterial({
				color: '#55f', 
				opacity: 0.5,
				transparent: true
			})
		);

		rolloverMesh.visible = false;
		rolloverMesh.position.set(25, 25, 25);

		Scene.add(rolloverMesh);

		let _render = () => {
			
			Renderer.render(Scene, Camera);
			Raycaster.setFromCamera( Mouse, Camera );
			
			if ( this.state.active ) window.requestAnimationFrame(_render);
		};

		_render();
		setTimeout(() => {
			Renderer.setSize(canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);
		}, 1);

		this._onMouseMove = (e) => {

			Mouse.x = ( e.layerX / canvas.width ) * 2 - 1;
		    Mouse.y = -( e.layerY / canvas.height ) * 2 + 1;

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
	        	rolloverMesh.visible = true;
	        	rolloverMesh.position.copy( closestObj.point ).add( closestObj.face.normal );
	            rolloverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
	            if ( rolloverMesh.position.y < 0 ) {
	            	rolloverMesh.position.y += 50;
	            }
	        } else {
	        	rolloverMesh.visible = false;
	        }
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
		        	/* voxelizer.removeVoxel(closestObj.object, (id) => {
			        	data.child(id).set(null);
			        }); */
					let position = new THREE.Vector3();
				    position.copy( closestObj.point ).add( closestObj.face.normal );
				    position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
				    let id = [position.x, position.y, position.z].join(',');
					data.child(id).set('#999');
		        }
			}
		};

		this._onResize = () => {

			Camera.aspect = canvas.parentNode.clientWidth / canvas.parentNode.clientHeight;
			Camera.updateProjectionMatrix();

			Renderer.setSize(canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);
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

	clearAll(Scene) {
		if ( Scene && Scene.objects ) {
			// don't remove ground plane
			for ( let i = 1; i < Scene.objects.length; i++ ) {
		        Scene.remove(Scene.objects[i]);
		    }

		    Scene.objects = Scene.objects.slice(0, 1);
		}
	}

	update(userId, zone) {

		console.log('updating', this.state.scene);
		
		let data = Model(userId, zone);
		let voxelizer = Voxelizer(this.state.scene);

		if ( this.state.data ) {
			console.log('removing old data listener');
			// data.off('child_added');
			// this.setState({ data });
		}

		this.clearAll(this.state.scene);

		data.on('child_added', function(s) {
			voxelizer.renderVoxel(s.key(), s.val());
		});
		
		return data;
	}

	componentDidMount() {

		this.props.sceneManager.on('change', (userId, zone) => {
			if ( !this.state.scene ) {
				this.init.call(this, userId, zone);
			} else {
				this.update.call(this, userId, zone);
			}
		});
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