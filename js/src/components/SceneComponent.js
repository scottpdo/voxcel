import CONFIG from '../config';
import Firebase from 'firebase';
import THREE from 'three.js';
import React from 'react';
import ReactDOM from 'react-dom';
import _Camera from './Scene/Camera';
import Stage from './Scene/Stage';
import Model from './Scene/Model';
import Voxelizer from './Scene/Voxelizer';
import SceneControls from './Scene/SceneControls';
import { $ } from 'zepto-browserify';
import random from '../utils/random';

class SceneComponent extends React.Component {

	constructor() {
		super();

		let Scene = new THREE.Scene();
		let _this = this;

		this.state = {
			active: false,
			isAdmin: false,
			scene: new THREE.Scene(),
			sceneIsStaged: false,
			data: null,
			color: null,
			keysDown: [],
			zone: null,
			userId: null,
			viewers: []
		};

		this.controls = {
			
			changeColor() {
				_this.setState({
					color: this.refs.colorPicker.value
				});
			}
		};
	}

	init(userId, zone) {

		let canvas = this.refs.canvas;
		canvas.width = canvas.parentNode.clientWidth;
		canvas.height = canvas.parentNode.clientHeight;

		let Scene = this.state.scene;

		// prepare background elements, lighting, etc.
		Stage(Scene);

		let timeRange = $(this.refs.timeRange);
		timeRange.val(Scene.getTime());
		timeRange.on('change input', () => {
			Scene.setTime(+this.refs.timeRange.value);
			Scene.setTime(+this.refs.timeRange.value);
		});
		
		let data = this.update.call(this, userId, zone);

		let voxelizer = Voxelizer(Scene);
		
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

		let t = 0;

		let _render = () => {
			
			Renderer.render(Scene, Camera);
			Raycaster.setFromCamera( Mouse, Camera );
			
			if ( this.state.active ) window.requestAnimationFrame(_render);
			t++;
		};

		this._onKeyDown = (e) => {
			this.state.keysDown.push(e.keyCode);
			if ( isShiftDown() ) rolloverMesh.visible = false;
		};

		this._onKeyUp = (e) => {
			if ( this.state.keysDown.indexOf(e.keyCode) > -1 ) {
				this.state.keysDown.splice(this.state.keysDown.indexOf(e.keyCode), 1);
			}
		};

		let isKeyDown = (code) => {
			return () => {
				return this.state.keysDown.indexOf(code) > -1;
			}
		};

		let isShiftDown = isKeyDown.call(this, 16);

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

	        if ( this.state.isAdmin && closestObj && !isShiftDown() ) {
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

		        if ( this.state.isAdmin && closestObj ) {

		        	// if shift is not down, add a voxel
					if ( !isShiftDown() ) {

						let position = new THREE.Vector3();
					    position.copy( closestObj.point ).add( closestObj.face.normal );
					    position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
					    if ( position.y < 0 ) position.y += 50;
					    
					    let id = [position.x, position.y, position.z].join(',');

					    let hex = '56789abcdef',
					    	hexVal = random(hex),
					    	color = '#' + hexVal + hexVal + hexVal;

						this.state.data.child(id).set(this.state.color || color);

					// if shift is down, remove a voxel
					} else {

						voxelizer.removeVoxel(closestObj.object, (id) => {
				        	this.state.data.child(id).set(null);
				        });
					}
		        }
			}
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

		$(canvas)
			.on('mousemove', this._onMouseMove.bind(this))
			.on('mousedown', this._onMouseDown.bind(this))
			.on('mouseup', this._onMouseUp.bind(this));
		document.addEventListener('keydown', this._onKeyDown.bind(this));
		document.addEventListener('keyup', this._onKeyUp.bind(this));
		window.addEventListener('resize', this._onResize.bind(this));

	}

	destroy() {

		if ( this.state.data ) this.state.data.off('child_added');

		this.setState({
			active: false,
			sceneIsStaged: false,
			scene: null,
			color: null,
			data: null
		});

		this.props.viewer.child('viewing').set(null);

		$(canvas)
			.off('mousemove', this._onMouseMove.bind(this))
			.off('mousedown', this._onMouseDown.bind(this))
			.off('mouseup', this._onMouseUp.bind(this));
		document.removeEventListener('keydown', this._onKeyDown.bind(this));
		document.removeEventListener('keyup', this._onKeyUp.bind(this));
		window.removeEventListener('resize', this._onResize.bind(this));
	}

	clearAll() {

		let Scene = this.state.scene;
		// don't remove ground plane
		for ( let i = 1; i < Scene.objects.length; i++ ) {
	        Scene.remove(Scene.objects[i]);
	    }

	    Scene.objects = Scene.objects.slice(0, 1);
	}

	update(userId, zone) {
		
		let data = Model(userId, zone);
		let voxelizer = Voxelizer(this.state.scene);

		if ( this.state.data ) {
			this.state.data.off('child_added');
			this.state.data.off('child_removed');
		}

		this.props.viewer.update({
			viewing: zone
		});

		this.setState({ 
			data,
			zone,
			userId
		});

		this.clearAll.call(this);

		let numVoxels = 0;

		data.on('child_added', function(s) {
			voxelizer.renderVoxel(s.key(), s.val());
		});

		data.on('child_removed', function(s) {
			let voxel = voxelizer.get(s.key());
			voxel && voxelizer.removeVoxel(voxel);
		});
		
		return data;
	}

	login(userId) {
		
		let isAdmin = () => {
			return this.props.auth.getUser() && this.props.auth.getUser('id') === userId;
		};
		
		this.props.viewer.update({
			isAdmin: isAdmin.call(this)
		});
		
		this.setState({
			isAdmin: isAdmin.call(this)
		});
	}

	componentDidMount() {

		let matchHash = () => {
			let hash = window.location.hash;
			let match = hash.match(/\/user\/(\d*)\/zone\/(.*)\//);
			
			if ( match ) {
				let userId = match[1];
				let zone = match[2];
				if ( !this.state.sceneIsStaged ) {
					this.init.call(this, userId, zone);
				} else {
					this.update.call(this, userId, zone);
				}
			}
		}

		matchHash();
		window.addEventListener('hashchange', matchHash.bind(this));

		let viewersRef = new Firebase(CONFIG.dataRef + '/viewers');
		let checkAndAddViewer = (viewer) => {
			if ( this.state.viewers.indexOf(viewer) === -1 && viewer.viewing === this.state.zone && !viewer.isAdmin ) {
				this.setState({
					viewers: this.state.viewers.concat(viewer)
				});
			}
		}

		viewersRef.on('child_added', s => {
			let viewer = s.key();
			checkAndAddViewer.call(this, viewer);
		});

		viewersRef.on('value', s => {
			this.state.viewers = [];
			for ( let viewerObj in s.val() ) {
				let viewer = s.val()[viewerObj];
				checkAndAddViewer.call(this, viewer);
			}
		});

		this.props.auth.on('login', (user) => {
			if ( this.state.active ) {
				this.login.call(this, user.id);
				viewersRef.child
			}
		});

		this.props.auth.on('logout', this.destroy.bind(this));
	}

	render() {

		let style = {
			display: this.state.active ? 'block' : 'none',
			height: '100%',
			width: '100%'
		};

		let controlStyle = {
			display: this.state.isAdmin ? 'block' : 'none'
		};
		
		return (
			<div style={style}>
				<canvas ref="canvas" style={style}></canvas>
				<div className="time-range-container">
					<label htmlFor="time-range">Time:</label>
					<input type="range" id="time-range" ref="timeRange" min="0" max="1" step="0.001" />
				</div>
				<div className="viewers">{this.state.viewers.length + ' viewer' + (this.state.viewers.length === 1 ? '' : 's')}</div>
				<SceneControls style={controlStyle} isAdmin={this.state.isAdmin} controls={this.controls} />
			</div>
		);
	}

}

export default SceneComponent;