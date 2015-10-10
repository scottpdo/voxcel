var THREE = require('three.js');

module.exports = function(world, target) {

    var scene = world.scene;

    var light = world.light(),
        light2 = world.light('#fff', 1, false),
        lightTarget = target;

    light.position.set(-500, 2500, 2000);
    light2.position.set(2000, 2500, -500);
    light.target = light2.target = lightTarget;

    var hemiLight = new THREE.HemisphereLight( '#57f', '#000', 0.15 );

    hemiLight.position.set(400, 500, -200);
    scene.add( hemiLight );

    // SKYDOME
    var vertexShader = require('./shaders/vertexShader.js'),
        fragmentShader = require('./shaders/fragmentShader.js');

    var uniforms = {
        topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
        bottomColor: { type: "c", value: new THREE.Color( '#ccc' ) },
        offset:		 { type: "f", value: 400 },
        exponent:	 { type: "f", value: 0.6 }
    }
    uniforms.topColor.value.copy( hemiLight.color );

    scene.fog = new THREE.Fog( '#000', 1000, 20000 );
    scene.fog.color.copy( uniforms.bottomColor.value );

    var skyGeo = new THREE.SphereGeometry( 20000, 32, 15 ),
        skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });

    var sky = new THREE.Mesh( skyGeo, skyMat );
    scene.add( sky );

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

            world.render();
        }
    }

    return {
        timeGoesBy: timeGoesBy
    };
};
