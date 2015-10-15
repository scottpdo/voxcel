var CONFIG = require('./config.js'),
	Firebase = require('firebase'),
	THREE = require('three.js'),
	T = require('./T.js');

function vectorFromId(id) {
    var x = +id.split(',')[0],
        y = +id.split(',')[1],
        z = +id.split(',')[2];

    var output = new THREE.Vector3(x, y, z);
    return output;
}

function randCharFromString(str) {
    return str[Math.floor(Math.random() * str.length)];
}

// pass in the world (from T.js), user ID and zone
function scene(world, user, zone) {

	var data = {
			user: user,
			zone: zone
		},
		voxels;

	function update(user, zone) {

		if ( user && zone ) {
			
			data.user = user;
			data.zone = zone;

			var dataRef = new Firebase(CONFIG.dataRef + '/users/google:' + data.user + '/' + data.zone);
			voxels = dataRef.child('voxels');

			clearAll();

			voxels.on('child_added', function(snapshot) {
				renderVoxel(snapshot.key(), snapshot.val());
			});
		}
	}

	update(user, zone);

	function cube(color) {
	    var box = world.mesh(T.Box(50, 50, 50), T.Material(color || '#ccc'));
	    return box;
	}

	function makeVoxel(intersect) {
	    
	    var hex = '56789abcdef',
	        hexVal = randCharFromString(hex),
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

	function removeVoxel(object) {

	    var id = object._id,
	    	before = world.objects.slice(0, world.objects.indexOf(object)),
	    	after = world.objects.slice(world.objects.indexOf(object) + 1);

	    if ( id ) {
		    voxels.child(id).set(null);
		    world.scene.remove( object );
		    world.objects = before.concat(after);
		}
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
		makeVoxel: makeVoxel,
		removeVoxel: removeVoxel,
		zone: function() { return data.zone; },
		user: function() { return data.user; }
	};
}

module.exports = scene;