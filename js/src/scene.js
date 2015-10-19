var CONFIG = require('./config.js'),
	Firebase = require('firebase'),
	THREE = require('three.js'),
	T = require('./T.js'),
	random = require('./utils/random.js');

var world, 
    camera, 
    lighting;

function init(container, router) {

    world = new T(container.attr('id'));
    camera = require('./camera.js')(world);

    world.renderer.setClearColor('#f2e8e8');

    // GROUND PLANE
    var plane = world.mesh(T.Box(100000, 1, 100000), T.Material('lambert', '#888')).y(-2);

    var gridPlane = world.mesh(T.Box(100, 1, 100));
    world.objects.push(gridPlane);

    // LIGHTING
    lighting = require('./lighting.js')(world, plane);

    function onWindowResize() {

        camera.aspect = world.container.width() / world.container.height();
        camera.updateProjectionMatrix();

        world.renderer.setSize( world.container.width(), world.container.height() );
    }

    // ----- resize
    window.addEventListener( 'resize', onWindowResize, false );
}

function vectorFromId(id) {
    var x = +id.split(',')[0],
        y = +id.split(',')[1],
        z = +id.split(',')[2];

    var output = new THREE.Vector3(x, y, z);
    return output;
}

// pass in the world (from T.js), user ID and zone
function scene(container, router) {

	init(container, router);

	var data = {
			user: router.get('user'),
			zone: router.get('zone')
		},
		voxels,
		renderQueue = [];

	function update(user, zone) {

		if ( user && zone ) {
			
			data.user = user;
			data.zone = zone;

			var dataRef = new Firebase(CONFIG.dataRef + '/users/' + data.user + '/' + data.zone);
			voxels = dataRef.child('voxels');

			clearAll();

			voxels.on('child_added', function(snapshot) {
				renderVoxel(snapshot.key(), snapshot.val());
			});

			voxels.on('child_removed', function(snapshot) {
				removeVoxel(snapshot.key());
			});
		}
	}

	function render() {
		world.renderer.render(world.scene, camera);
	}

	function renderAll() {
		renderQueue.forEach(function(func) {
			func();
		});
		window.requestAnimationFrame(renderAll);
	}

	renderQueue.unshift(render);
	renderAll();

	function cube(color) {
	    var box = world.mesh(T.Box(50, 50, 50), T.Material(color || '#ccc'));
	    return box;
	}

	function makeVoxel(intersect) {
	    
	    var hex = '56789abcdef',
	        hexVal = random(hex),
	        color = '#' + hexVal + hexVal + hexVal;

	    // set position (and thus id) from intersect (rollOverMesh)
	    var position = new THREE.Vector3();
	    position.copy( intersect.point ).add( intersect.face.normal );
	    position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

	    var id = [position.x, position.y, position.z].join(',');

	    voxels.child(id).set('#' + hexVal + hexVal + hexVal);

	    renderVoxel(id, color);
	}

	function renderVoxel(id, color) {

	    var voxel = cube(color),
	        position = vectorFromId(id);

	    voxel._id = id;
	    voxel.position.set(position.x, position.y, position.z);

	    world.scene.add( voxel );
	    world.objects.push( voxel );
	}

	function removeVoxel(id) {

	    var object;

	    for ( var i = 0; i < world.objects.length; i++ ) {
	    	if ( world.objects[i]._id === id ) {
	    		object = world.objects[i];
		    	break;
	    	}
	    }

    	var before = world.objects.slice(0, i),
	    	after = world.objects.slice(i + 1);

	    voxels.child(id).set(null);
	    world.scene.remove( object );
	    world.objects = before.concat(after);
	}

	function clearAll() {
	    // don't remove the ground plane
	    for ( var i = 1; i < world.objects.length; i++ ) {
	        world.scene.remove(world.objects[i]);
	    }
	    world.objects = world.objects.slice(0, 1);
	}

	return {
		update: update,
		renderQueue: renderQueue,
		removeVoxel: removeVoxel,
		makeVoxel: makeVoxel,
		zone: function() { return data.zone; },
		user: function() { return data.user; },
		world: world
	};
}

module.exports = scene;