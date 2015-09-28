var THREE = require('three.js');
THREE.OrbitControls = require('three-orbit-controls')(THREE);
var T = require('./T.js');
var Firebase = require('firebase');

var universe = window.location.hash ? window.location.hash.slice(1) : prompt('Universe name?');

var data = new Firebase('https://3-d.firebaseio.com/' + universe);

var world, camera, controls, scene, renderer;

// going to increment this
var light, lightTarget = new THREE.Vector3(0, 0, 0);

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

    camera = world.camera;
    camera.position.x = -1200;
    camera.position.y = 350;
    camera.position.z = 500;

    scene = world.scene;

    renderer = world.renderer;
    renderer.setClearColor('#f2e8e8');

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.damping = 0.5;
    controls.addEventListener( 'change', render );

    var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x5555ff, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    rollOverMesh.position.x = 25;
    rollOverMesh.position.y = 28;
    rollOverMesh.position.z = 25;
    scene.add( rollOverMesh );

    var size = 500, step = 50;

    /* var geometry = new THREE.Geometry();

    for ( var i = - size; i <= size; i += step ) {

        geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
        geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

        geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
        geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

    }

    var lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, transparent: true, fog: true, opacity: 0.5 } );

    var grid = new THREE.Line( geometry, lineMaterial, THREE.LinePieces );
    //grid.visible = false;
    scene.add( grid );
    grid.position.y = 3; */

    gridPlane = world.mesh(T.Box(1000, 1, 1000), T.Material('#999'));
    //gridPlane.visible = false;
    gridPlane.y(0);
    objects.push(gridPlane);

    // GROUND PLANE
    var plane = world.mesh(T.Box(100000, 1, 100000), T.Material('lambert', '#888')).y(-2);
    lightTarget = plane;

    light = world.light();
    light.target = lightTarget;
    var lightX = -500,
        lightY = 2500,
        lightZ = 2000;
    light.position.set(lightX, lightY, lightZ);

    var light2 = world.light('#fff', 1, false);
    light2.target = lightTarget;
    light2.position.set(2000, 2500, -500);

    var hemiLight = new THREE.HemisphereLight( '#57f', '#000', 0.15 );

    hemiLight.position.x = 400;
    hemiLight.position.y = 500;
    hemiLight.position.z = -200;
    scene.add( hemiLight );

    // SKYDOME
    var vertexShader = document.getElementById( 'vertexShader' ).textContent,
        fragmentShader = document.getElementById( 'fragmentShader' ).textContent;

    uniforms = {
        topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
        bottomColor: { type: "c", value: new THREE.Color( '#ccc' ) },
        offset:		 { type: "f", value: 400 },
        exponent:	 { type: "f", value: 0.6 }
    }
    uniforms.topColor.value.copy( hemiLight.color );

    scene.fog = new THREE.Fog( '#000', 1000, 20000 );
    scene.fog.color.copy( uniforms.bottomColor.value );

    skyGeo = new THREE.SphereGeometry( 20000, 32, 15 );
    skyMat = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
    } );

    sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );

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

function timeGoesBy() {
    if ( light.position.z >= -3400 ) {

        light.position.z -= 25;
        light.position.set(light.position.x, light.position.y, light.position.z);
        if ( light.position.z <= 0 ) {
            light.color = new THREE.Color( 1, light.color.g - 0.004, light.color.b - 0.01 );
        }
        light.target = lightTarget;

        uniforms.topColor.value = new THREE.Color( uniforms.topColor.value.r - 0.01, uniforms.topColor.value.g - 0.01, uniforms.topColor.value.b - 0.01 );

        sky.material.uniforms = uniforms;

        render();
    }
}

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
    if ( e.keyCode === 32 ) timeGoesBy();
    // x
    if ( e.keyCode === 88 ) clearAll();
});

window.addEventListener('keyup', function(e) {
    // shift up
    if ( e.keyCode === 16 ) isShiftDown = false;
});

// ----- RAYCASTER

function onMouseMove( event ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

    if ( raycaster ) {
        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( objects );

        if ( intersects.length > 0 ) {

            var intersect = intersects[ 0 ];
            rollOverMesh.visible = true;
            rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            rollOverMesh.position.y += 3;

        } else {
            rollOverMesh.visible = false;
        }
    }

    render();
}

var mouseDownCoords;

function onMouseDown( event ) {

    event.preventDefault();

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
    voxel.position.y += 3;
    scene.add( voxel );
    objects.push( voxel );

    data.push({
        color: '#' + hexVal + hexVal + hexVal,
        x: voxel.position.x,
        y: voxel.position.y,
        z: voxel.position.z
    });
}

function renderVoxel(data) {
    var voxel = cube(data.color);
    voxel.position.x = data.x;
    voxel.position.y = data.y;
    voxel.position.z = data.z;

    scene.add( voxel );
    objects.push( voxel );

    render();
}

data.on('child_added', function(snapshot) {
    renderVoxel(snapshot.val());
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

                if ( intersect.object != gridPlane ) {

                    scene.remove( intersect.object );

                    objects.splice( objects.indexOf( intersect.object ), 1 );

                }

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
