var THREE = require('three.js');
THREE.OrbitControls = require('three-orbit-controls')(THREE);

module.exports = function(world) {

    var camera = world.camera;

    camera.position.x = -700;
    camera.position.y = 350;
    camera.position.z = 1100;

    var controls = new THREE.OrbitControls( camera, world.container.el );
    controls.mouseButtons = {
        ORBIT: THREE.MOUSE.RIGHT,
        PAN: THREE.MOUSE.LEFT
    };

    controls.maxPolarAngle = Math.PI / 2;
    controls.maxDistance = 8000;
    controls.damping = 0.5;

    return camera;
};
