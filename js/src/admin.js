var CONFIG = require('./config.js'),
    Firebase = require('firebase'),
    swal = require('sweetalert'),
    $ = require('zepto-browserify').$,
    node = require('./utils/node.js'),
    THREE = require('three.js'),
    T = require('./T.js');

var userId,
    router,
    scene,
    world,
    camera,
    rollOverMesh, 
    isShiftDown = false, 
    gridPlane;
var raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2();
var intersects = [];
var mouseDownCoords;

// make available to other functions
function setVars(_router, data, _scene) {
    router = _router;
    userId = data.id;
    scene = _scene;
    world = scene.world;
    camera = world.camera;
}

function setupUI(container, router, data) {

    var home = node('a', 'Home', '', container);
    home.attr('href', '#/');

    var photo = node('div', '', 'photo', container);
    photo.css('background-image', 'url(' + data.photo + ')');

    var name = node('small', data.name, 'block', container);

    var zonesRef = new Firebase(CONFIG.dataRef + '/users/' + userId),
        zoneRef;

    router.set('user', userId);

    var zones = node('ul', '<li class="underline">Zones:</li>', 'zones tight no-list', container),
        newZone = node('button', 'New', 'new-zone-button', container);

    newZone.on('click', function() {
        swal({
            title: 'Name your zone!',
            text: 'Make it a good name...',
            type: 'input',
            animation: 'slide-from-top',
            showCancelButton: true
        }, function(inputValue){
            if ( inputValue ) {
                
                var id = zonesRef.push({
                    name: inputValue,
                    created_at: new Date().getTime()
                });

                router.set('zone', id.key());
            }
        });
    });

    zones.on('click', function(e) {
        var target = $(e.target);
        if ( target.attr('data-id') ) {
            zones.children().each(function() {
                $(this).removeClass('active');
            });
            target.addClass('active');
            router.setAll({
                user: userId,
                zone: target.attr('data-id')
            });
        }
    });

    zonesRef.on('child_added', function(snapshot) {
        
        var li = node('li', snapshot.val().name);
        li.attr('data-id', snapshot.key());

        if ( snapshot.key() === router.get('zone') ) {
            li.addClass('active');
        }

        zones.append(li);
    });
}

function admin(container, router, data, scene) {

    setVars(router, data, scene);

    setupUI(container, router, data);

    makeAdmin();
}

function makeAdmin() {

    var rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
    rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0x5555ff, opacity: 0.5, transparent: true } );
    rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
    rollOverMesh.visible = false;
    rollOverMesh.position.set(25, 25, 25);
    world.scene.add( rollOverMesh );

    // ----- MOUSES
    world.container.el.addEventListener( 'mousemove', onMouseMove, false );
    world.container.el.addEventListener( 'mousedown', onMouseDown, false );
    world.container.el.addEventListener( 'mouseup', onMouseUp, false );
}

function updateRender() {
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

function onMouseMove( e ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = ( e.offsetX / world.container.width() ) * 2 - 1;
    mouse.y = - ( e.offsetY / world.container.height() ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( world.objects ),
        intersect;

    if ( userId === router.get('user') ) {
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
        if ( userId === router.get('user') ) {

            var intersects = raycaster.intersectObjects( world.objects ),
                intersect;

            if ( intersects.length > 0 ) {

                intersect = intersects[ 0 ];

                // delete cube
                if ( isShiftDown ) {
                    scene.removeVoxel( intersect.object._id );
                // create cube
                } else {
                    scene.makeVoxel(intersect);
                }
            }
        }
    }
}

document.addEventListener('keydown', function(e) {
    if ( e.keyCode === 16 ) onShiftDown();
});

document.addEventListener('keyup', function(e) {
    // shift up
    if ( e.keyCode === 16 ) isShiftDown = false;
});

function onShiftDown() {
    isShiftDown = true;
    rollOverMesh.visible = false;
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

module.exports = admin;
