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
import ChatComponent from './Scene/ChatComponent';
import { $ } from 'zepto-browserify';
import random from '../utils/random';
import swal from 'sweetalert';

class SceneComponent extends React.Component {

	constructor() {
		super();

		let Scene = new THREE.Scene();
		let _this = this;

		this.state = {
			active: false,
			isAdmin: false,
			isSandbox: false,
			isChatting: false,
			scene: new THREE.Scene(),
			sceneIsStaged: false,
			data: null,
			color: null,
			keysDown: [],
			zone: null,
			userId: null, // the zone creator, NOT the current user
			viewers: []
		};

		let chatManager = () => {

			let events = [];

			return {
				on(which, cb) {
					if ( events[which] ) {
						events[which].push(cb);
					} else {
						events[which] = [cb];
					}
				},

				trigger(which) {
					if ( events[which] ) {
						events[which].forEach(cb => {
							cb();
						});
					}
				}
			}
		};

		this.chatManager = chatManager();
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
			
			if ( isEnterDown() && isShiftDown() ) {
				this.controls.takeSnapshot.call(this);
			}

			if ( this.state.keysDown.indexOf(e.keyCode) > -1 ) {
				this.state.keysDown.splice(this.state.keysDown.indexOf(e.keyCode), 1);
			}
		};

		let isKeyDown = (code) => {
			return () => {
				return this.state.keysDown.indexOf(code) > -1;
			}
		};

		let isEnterDown = isKeyDown.call(this, 13);
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

	        if ( (this.state.isAdmin || this.state.isSandbox) && closestObj && !isShiftDown() ) {
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

		        if ( (this.state.isAdmin || this.state.isSandbox) && closestObj ) {

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

					    if ( !this.state.isSandbox ) {
							this.state.data.child(id).set(this.state.color || color);
						} else {
							voxelizer.renderVoxel(id, this.state.color || color);
						}

					// if shift is down, remove a voxel
					} else {

						voxelizer.removeVoxel(closestObj.object, (id) => {
				        	if ( !this.state.isSandbox ) {
				        		this.state.data.child(id).set(null);
				        	}
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

		if ( userId === 'sandbox' ) {
			
			let hex = '789abcdef';
			let i = 0;
			let onGrid = (j) => {
				return 25 + 50 * j;
			};

			for ( let y = 0; y <= 2; y++ ) {
				for ( let x = y; x <= 5 - y; x++ ) {
					for ( let z = y; z <= 5 - y; z++ ) {
						setTimeout(() => {
							let c = random(hex);
							voxelizer.renderVoxel(
								onGrid(x - 2) + ',' + onGrid(y) + ',' + onGrid(z - 2),
								'#' + c + c + c
							);
						}, i * 75);
						i++;
					}
				}
			}

			setTimeout(() => {
				
				let html = '<p>Welcome to Voxcel! <b>Click</b> to draw a voxel. <b>Shift + click</b> to remove one. <b>Drag</b> or <b>scroll</b> to move the camera around.</p><p>When you\'re ready, you can log in (with Google) to create and save zones of your own.</p>';

				swal({
					title: 'Voxcel Sandbox',
					text: html,
					animation: 'slide-from-top',
					html: true,
					allowOutsideClick: true
				});
			}, i * 75 + 500);
		}

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

		if ( userId !== 'sandbox' ) {
			this.props.viewer.update({
				viewing: zone
			});
		}

		this.setState({ 
			data,
			zone,
			userId
		}, this.checkAdmin.bind(this));

		this.clearAll.call(this);

		let numVoxels = 0;

		if ( userId !== 'sandbox' ) {
			data.on('child_added', function(s) {
				voxelizer.renderVoxel(s.key(), s.val());
			});

			data.on('child_removed', function(s) {
				let voxel = voxelizer.get(s.key());
				voxel && voxelizer.removeVoxel(voxel);
			});
		}
		
		return data;
	}

	checkAdmin() {
		
		let isAdmin = () => {
			return this.props.auth.getUser() && this.state.userId === this.props.auth.getUser('id');
		};
		
		this.props.viewer.update({
			isAdmin: isAdmin.call(this)
		});
		
		this.setState({
			isAdmin: isAdmin.call(this)
		});
	}

	isChatting(chatting) {
		this.setState({
			isChatting: chatting
		});
	}

	componentDidMount() {

		let _this = this;

		let matchHash = () => {

			let hash = window.location.hash;
			let match = hash.match(/\/user\/(\d*)\/zone\/(.*)\//);
			let sandbox = hash.match(/\/sandbox$/);

			this.setState({ isSandbox: false });
			
			if ( match ) {
				let userId = match[1];
				let zone = match[2];
				if ( !this.state.sceneIsStaged ) {
					this.init.call(this, userId, zone);
				} else {
					this.update.call(this, userId, zone);
				}
			} else if ( sandbox ) {

				this.setState({ isSandbox: true });

				if ( !this.state.sceneIsStaged ) {
					this.init.call(this, 'sandbox');
				} else {
					this.update.call(this, 'sandbox');
				}
			}
		}

		matchHash();
		window.addEventListener('hashchange', matchHash.bind(this));

		this.controlManager = {

			canvas: this.refs.canvas,
			
			changeColor(color) {
				_this.setState({
					color
				});
			}
		};

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
				this.checkAdmin.call(this, user.id);
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

		let showAdmin = {
			display: this.state.isAdmin ? 'block' : 'none'
		};

		let hideAdmin = {
			display: this.state.isAdmin ? 'none' : 'block'
		};
		
		return (
			<div style={style}>
				<canvas ref="canvas" style={style} onClick={this.chatManager.trigger.bind(null, 'clickScene')}></canvas>
				<div className="time-range-container" onClick={this.chatManager.trigger.bind(null, 'clickScene')}>
					<label htmlFor="time-range">Time:</label>
					<input type="range" id="time-range" ref="timeRange" min="0" max="1" step="0.001" />
				</div>
				<div className="viewers">{this.state.viewers.length + ' viewer' + (this.state.viewers.length === 1 ? '' : 's')}
					<br style={hideAdmin} />
					<small style={hideAdmin}>Log in to chat</small>
				</div>
				<SceneControls style={showAdmin} isAdmin={this.state.isAdmin} controlManager={this.controlManager} />
				<ChatComponent ref="chatComponent" chatManager={this.chatManager} onChatChange={this.isChatting} auth={this.props.auth} userId={this.state.userId} zone={this.state.zone} />
			</div>
		);
	}

}

export default SceneComponent;