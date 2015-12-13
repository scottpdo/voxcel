// import THREE from 'three.js';
import THREE from '../../three-74-dev';
import clamp from '../../utils/clamp';

let Lighting = (Scene) => {

	// SKYDOME
    let hemiLight = new THREE.HemisphereLight( '#57f', '#000', 0.15 );

    hemiLight.position.set(400, 500, -200);
    Scene.add( hemiLight );

    let vertexShader = require('../../shaders/vertexShader.js'),
        fragmentShader = require('../../shaders/fragmentShader.js');

    let uniforms = {
        topColor: 	 { type: "c", value: new THREE.Color( '#07f' ) },
        bottomColor: { type: "c", value: new THREE.Color( '#ccc' ) },
        offset:		 { type: "f", value: 400 },
        exponent:	 { type: "f", value: 0.6 }
    }
    uniforms.topColor.value.copy( hemiLight.color );

    Scene.fog = new THREE.Fog( '#000', 1000, 20000 );
    Scene.fog.color.copy( uniforms.bottomColor.value );

    let skyGeo = new THREE.SphereGeometry( 20000, 32, 15 ),
        skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });

    let sky = new THREE.Mesh( skyGeo, skyMat );
    Scene.add( sky );

    let Light = new THREE.DirectionalLight('#fff');
	Light.castShadow = true;
	Light.shadowMapWidth = Light.shadowMapHeight = 2048;
    Light.shadowCameraLeft = -1000;
    Light.shadowCameraRight = 1000;
    Light.shadowCameraBottom = -1000;
    Light.shadowCameraTop = 1000;
    Light.shadowCameraFar = 10000;
	Light.position.set(-500, 2500, 3400);
	Scene.add(Light);

	let Light2 = new THREE.AmbientLight('#aaf');
	Light2.position.set(0, 500, 0);
	Scene.add(Light2);

	let theTime;

	let setTime = (time, force) => {

        // time between 0 and 1
        time = clamp(time, 0, 1);

        theTime = time;

        var r, g, b;

        let range = (min, max) => {
            return max - 2 * (max - min) * Math.abs(time - 0.5);
        };

        // light color
        r = range(0.8, 0.95);
        g = range(0.5, 0.95);
        b = range(0.25, 0.95);

        Light.color = new THREE.Color(r, g, b);
        Light.position.z = 6800 * ( 0.5 - time );

        // sky top color
        r = range(0, 0.333);
        g = range(0, 0.5);
        b = range(0.25, 1);

        uniforms.topColor.value = new THREE.Color(r, g, b);

        // sky bottom color
        r = range(0.6, 0.95);
        g = range(0.6, 0.95);
        b = range(0.6, 0.95);

        uniforms.bottomColor.value = new THREE.Color(r, g, b);

        sky.material.uniforms = uniforms;
    };

    let getTime = () => {
    	return theTime;
    };

	return {
		setTime,
		getTime
	};

};

export default Lighting;