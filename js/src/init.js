var CONFIG = require('./config.js'),
    THREE = require('three.js'),
    T = require('./T.js'),
    Firebase = require('firebase');

var dataRef = new Firebase(CONFIG.dataRef);

var auth = require('./auth.js')(dataRef),
    loginButton = document.getElementById('login');

loginButton.addEventListener('click', function() {

    function success(data) {
        var photo = document.createElement('img');
        photo.src = auth.getUser('photo');
        loginButton.parentNode.appendChild(photo);
        loginButton.parentNode.removeChild(loginButton);
    }

    function error() {

    }

    auth.login({
        success: success,
        error: error
    });
});

var data = new Firebase(CONFIG.dataRef + 'scottland');

var world, camera, lighting, controls, scene, renderer;

var rollOverMesh, isShiftDown = false, objects = [], gridPlane;

var uniforms, skyGeo, skyMat, sky;

function cube(color) {
    var box = world.mesh(T.Box(50, 50, 50), T.Material(color || '#ccc'));
    return box;
}

init();
render();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
}

function init() {

    world = new T('container');

    camera = require('./camera.js')(world);

    scene = world.scene;

    renderer = world.renderer;
    renderer.setClearColor('#f2e8e8');

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.mouseButtons = {
        ORBIT: THREE.MOUSE.RIGHT,
        PAN: THREE.MOUSE.LEFT
    };
    controls.maxPolarAngle = Math.PI / 2;
    controls.damping = 0.5;
    controls.addEventListener( 'change', render );

    var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x5555ff, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    rollOverMesh.visible = false;
    rollOverMesh.position.set(25, 25, 25);
    scene.add( rollOverMesh );

    // GROUND PLANE
    var plane = world.mesh(T.Box(100000, 1, 100000), T.Material('lambert', '#888')).y(-2);

    gridPlane = world.mesh(T.Box(100, 1, 100));
    objects.push(gridPlane);

    // LIGHTING
    lighting = require('./lighting.js')(world, plane);

    // ----- resize
    window.addEventListener( 'resize', onWindowResize, false );

    // ----- animate
    animate();
}

var raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2();

var intersects = [];

function render() {

    if ( raycaster ) {
        raycaster.setFromCamera( mouse, camera );

        intersects.forEach(function(intersect) {
            if ( intersect.object && intersect.object.oldColor ) {
                intersect.object.material.color = intersect.object.oldColor;
            }
        });
        intersects = [];

        // calculate objects intersecting the picking ray
        raycaster.intersectObjects( scene.children ).forEach(function(intersect) {
            intersects.push(intersect);
        });

        var closest = Infinity,
            closestObj;
        intersects.forEach(function(intersect) {
            if ( intersect.distance < closest ) {
                closest = intersect.distance;
                closestObj = intersect;
            }
        });
    }

    renderer.render(scene, camera);
}

world.render = render;

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}

function uploadSnapshot() {
    var canvas = document.getElementsByTagName('canvas')[0];

    var url = 'http://gentle-stream-4461.herokuapp.com/upload/',
        canvas = document.getElementsByTagName('canvas')[0],
        dataURL = canvas.toDataURL().split(',')[1],
        xhr = new XMLHttpRequest(),
        data = JSON.stringify({ image: dataURL });

    xhr.open('POST', url, true);
    xhr.onload = function() {
        console.log(xhr.responseText);
    };
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(data);

    canvas.classList.add('faded');
    setTimeout(function(){
        canvas.classList.remove('faded');
    }, 350);
};

function clearAll() {
    // don't remove the ground plane
    for ( var i = 1; i < objects.length; i++ ) {
        scene.remove(objects[i]);
    }
    objects = objects.splice(1, Infinity)
}

window.addEventListener('keydown', function(e) {
    // enter
    if ( e.keyCode === 13 ) uploadSnapshot();
    // shift
    if ( e.keyCode === 16 ) isShiftDown = true;
    // space bar
    if ( e.keyCode === 32 ) lighting.timeGoesBy();
    // x
    if ( e.keyCode === 88 ) clearAll();
});

window.addEventListener('keyup', function(e) {
    // shift up
    if ( e.keyCode === 16 ) isShiftDown = false;
});

// ----- RAYCASTER

function onMouseMove( e ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( e.offsetX / world.container.width ) * 2 - 1
    mouse.y = - ( e.offsetY / world.container.height ) * 2 + 1

    if ( auth.getUser() ) {

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( objects );

        if ( intersects.length > 0 ) {

            var intersect = intersects[ 0 ];
            rollOverMesh.visible = true;
            rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

        } else {
            rollOverMesh.visible = false;
        }
    }

    render();
}

var mouseDownCoords;

function onMouseDown( event ) {

    event.preventDefault();

    if ( isShiftDown ) {
        rollOverMesh.visible = false;
    }

    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    // need to create a new object mapping to mousedown coordinates
    mouseDownCoords = {
        x: mouse.x,
        y: mouse.y
    };

}

function randCharFromString(str) {
    return str[Math.floor(Math.random() * str.length)];
}

function makeVoxel(intersect) {
    var hex = '56789abcdef',
        hexVal = randCharFromString(hex);
    // restrict to grayscale
    var voxel = cube('#' + hexVal + hexVal + hexVal);

    voxel.position.copy( intersect.point ).add( intersect.face.normal );
    voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
    scene.add( voxel );
    objects.push( voxel );

    var x = voxel.position.x,
        y = voxel.position.y,
        z = voxel.position.z,
        id = [x, y, z].join(',');

    data.child(id).set('#' + hexVal + hexVal + hexVal);
}

function vectorFromId(id) {
    var x = +id.split(',')[0],
        y = +id.split(',')[1],
        z = +id.split(',')[2];

    var output = new THREE.Vector3(x, y, z);
    return output;
}

function renderVoxel(id, color) {

    var voxel = cube(color),
        position = vectorFromId(id);

    voxel._id = id;
    voxel.position.set(position.x, position.y, position.z);

    scene.add( voxel );
    objects.push( voxel );

    render();
}

function removeVoxel(object) {

    var id = object._id;

    console.log('removing', id);

    data.child(id).set(null);

    scene.remove( object );

    objects = objects.slice( objects.indexOf( object ), 1 );

}

data.on('child_added', function(snapshot) {
    renderVoxel(snapshot.key(), snapshot.val());
});

function onMouseUp( event ) {
    mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

    if ( mouse.x === mouseDownCoords.x && mouse.y === mouseDownCoords.y ) {
        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( objects );

        if ( intersects.length > 0 ) {

            var intersect = intersects[ 0 ];

            // delete cube
            if ( isShiftDown ) {
                removeVoxel( intersect.object );
            // create cube
            } else {
                makeVoxel(intersect);
            }

            render();

        }
    }
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );

window.requestAnimationFrame(render);
