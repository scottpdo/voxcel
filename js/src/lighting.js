var THREE = require('three.js'),
    TWEEN = require('tween.js');

module.exports = function(world, target, timeRange) {

    var scene = world.scene;

    var light = world.light(),
        light2 = world.light('#fff', 1, false),
        lightTarget = target;

    light.position.set(-500, 2500, 3400);

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

    function setTime(time, force) {

        // time between 0 and 1
        if ( time < 0 ) time = 0;
        if ( time > 1 ) time = 1;

        if ( force ) timeRange.value = time;

        var r, g, b;

        function range(min, max) {
            return max - 2 * (max - min) * Math.abs(time - 0.5);
        }

        // light color
        r = range(0.8, 0.95);
        g = range(0.5, 0.95);
        b = range(0.25, 0.95);

        light.color = new THREE.Color(r, g, b);
        light.position.z = 6800 * ( 0.5 - time );

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
    }

    var time = 0;
    setTime(0.333, true);

    timeRange.addEventListener('change', function() {
        setTime(+this.value);
    });

    timeRange.addEventListener('input', function() {
        setTime(+this.value);
    });

    function incrementTime() {
        time += 0.005;
        setTime(time, true);
    }

    function animateTime(to, duration) {

        var t = new TWEEN.Tween({
            time: time
        });

        var animate = function() {
            TWEEN.update();
            window.requestAnimationFrame(animate);
        }

        animate();

        t.to({ time: to }, duration * 1000 || 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function() {
                time = this.time;
                setTime(time);
            }).onComplete(function() {
                // effectively clear the requestAnimationFrame
                animate = function() {};
            });

        t.start();
    }

    var lighting = {
        setTime: setTime,
        incrementTime: incrementTime,
        animateTime: animateTime
    };

    window.lighting = lighting;
    
    return lighting;
};
