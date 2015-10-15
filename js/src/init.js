var CONFIG = require('./config.js'),
    THREE = require('three.js'),
    T = require('./T.js'),
    Firebase = require('firebase'),
    swal = require('sweetalert'),
    $ = require('zepto-browserify').$;

var router = require('./router.js')();

var dataRef = new Firebase(CONFIG.dataRef),
    auth = require('./auth.js')(dataRef), // needs base dataRef to init authentication
    adminContainer = $('#admin'),
    loginButton = $('#login');

loginButton.on('click', function() {

    // on successful login, initialize admin
    function success(data) {
        loginButton.remove();
        // set up admin
        require('./admin.js')(adminContainer, data, router);
    }

    function error() {

    }

    auth.login({
        success: success,
        error: error
    });
});

$('.help span').on('click', function() {
    swal({
        title: '3d',
        allowOutsideClick: true,
        showConfirmButton: false,
        text: '<p><b>3d</b> is an in-browser experiment by <a href="https://twitter.com/scottpdonaldson">Scottland</a> using three.js and Firebase.</p><p><b>Right click and drag</b> to rotate the camera.</p><p><b>Left click and drag</b> to pan the camera.</p><p>Once you log in, you can create zones of your own!</p>',
        animation: "slide-from-top",
        html: true,
        customClass: 'alignleft'
    });
});

var world, camera, lighting, scene, renderer;

var rollOverMesh, isShiftDown = false, gridPlane;

init();
render();

// TODO: move this into once the user has authenticated,
// replace default home screen with something else
function init() {

    world = new T('container');

    camera = require('./camera.js')(world);

    
    var sceneParams = [world, 'google:104314934710208349695', 'test'];
    if ( router.get('user') && router.get('zone') ) {
        sceneParams = [world, router.get('user'), router.get('zone')];
    }
    scene = require('./scene.js').apply(null, sceneParams);

    router.change('zone', function(id) {
        scene.update(router.get('user'), id);
    });

    renderer = world.renderer;
    renderer.setClearColor('#f2e8e8');

    var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x5555ff, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    rollOverMesh.visible = false;
    rollOverMesh.position.set(25, 25, 25);
    world.scene.add( rollOverMesh );

    // GROUND PLANE
    var plane = world.mesh(T.Box(100000, 1, 100000), T.Material('lambert', '#888')).y(-2);

    gridPlane = world.mesh(T.Box(100, 1, 100));
    world.objects.push(gridPlane);

    var timeRange = document.getElementById('time-range');

    // LIGHTING
    lighting = require('./lighting.js')(world, plane, timeRange);

    // ----- resize
    window.addEventListener( 'resize', onWindowResize, false );

    // ----- MOUSES
    world.container.el.addEventListener( 'mousemove', onMouseMove, false );
    world.container.el.addEventListener( 'mousedown', onMouseDown, false );
    world.container.el.addEventListener( 'mouseup', onMouseUp, false );
}

var raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2();

var intersects = [];

function render() {

    if ( raycaster ) {
        raycaster.setFromCamera( mouse, camera );

        intersects = [];

        // calculate objects intersecting the picking ray
        raycaster.intersectObjects( world.scene.children ).forEach(function(intersect) {
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

    renderer.render(world.scene, camera);

    window.requestAnimationFrame(render);
}

function onWindowResize() {

    camera.aspect = world.container.width() / world.container.height();
    camera.updateProjectionMatrix();

    renderer.setSize( world.container.width(), world.container.height() );
}

function uploadSnapshot() {
    var url = 'http://gentle-stream-4461.herokuapp.com/upload/',
        canvas = $('canvas'),
        dataURL = canvas.toDataURL().split(',')[1],
        xhr = new XMLHttpRequest(),
        data = JSON.stringify({ image: dataURL });

    xhr.open('POST', url, true);
    xhr.onload = function() {
        console.log(xhr.responseText);
    };
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(data);

    canvas.addClass('faded');
    setTimeout(function(){
        canvas.removeClass('faded');
    }, 350);
};

document.addEventListener('keydown', function(e) {
    var keys = {
        // enter
        // 13: uploadSnapshot,
        // shift
        16: onShiftDown,
        // space bar
        32: lighting.incrementTime
    };
    if ( e.keyCode in keys ) keys[e.keyCode](e);
});

document.addEventListener('keyup', function(e) {
    // shift up
    if ( e.keyCode === 16 ) isShiftDown = false;
});

function onShiftDown() {
    isShiftDown = true;
    rollOverMesh.visible = false;
}

// ----- RAYCASTER

function onMouseMove( e ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( e.offsetX / world.container.width() ) * 2 - 1
    mouse.y = - ( e.offsetY / world.container.height() ) * 2 + 1

    if ( auth.getUser() && auth.getUser('id').indexOf(router.get('user')) > -1 ) {

        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( world.objects ),
            intersect;

        if ( intersects.length > 0 ) {

            intersect = intersects[ 0 ];
            rollOverMesh.visible = !isShiftDown;
            rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
            rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );

        } else {
            rollOverMesh.visible = false;
        }
    }
}

var mouseDownCoords;

function onMouseDown( event ) {

    if ( isShiftDown ) {
        rollOverMesh.visible = false;
    }

    mouse.set( ( event.offsetX / world.container.width() ) * 2 - 1, - ( event.offsetY / world.container.height() ) * 2 + 1 );

    // need to create a new object mapping to mousedown coordinates
    mouseDownCoords = {
        x: mouse.x,
        y: mouse.y
    };
}

function onMouseUp( event ) {

    if ( mouse.x === mouseDownCoords.x && mouse.y === mouseDownCoords.y ) {
        raycaster.setFromCamera( mouse, camera );

        // must be logged in and the scene's user
        if ( auth.getUser() && auth.getUser('id').indexOf(router.get('user')) > -1 ) {

            var intersects = raycaster.intersectObjects( world.objects ),
                intersect;

            if ( intersects.length > 0 ) {

                intersect = intersects[ 0 ];

                // delete cube
                if ( isShiftDown ) {
                    scene.removeVoxel( intersect.object );
                // create cube
                } else {
                    scene.makeVoxel(intersect);
                }
            }
        }
    }
}