var THREE = require('three.js');
THREE.OrbitControls = require('three-orbit-controls')(THREE);

module.exports = function(world) {

    var camera = world.camera;
    camera.position.x = -1200;
    camera.position.y = 350;
    camera.position.z = 500;

    return camera;
};
