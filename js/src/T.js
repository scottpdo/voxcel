var THREE = require('three.js');

var T = function(id) {

    var container = document.getElementById(id),
        scene, camera, renderer;

    var WIDTH = container.clientWidth,
        HEIGHT = container.clientHeight,
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 100000;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.shadowMap.enabled = true;

    camera = new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

    scene = new THREE.Scene;
    scene.add(camera);

    renderer.setSize(WIDTH, HEIGHT);
    if ( id ) {
        document.getElementById(id).appendChild(renderer.domElement);
    } else {
        document.body.appendChild(renderer.domElement);
    }

    this.container = {
        el: container,
        width: function() { return container.clientWidth; },
        height: function() { return container.clientHeight; }
    };

    this.scene = scene;
    this.camera = T.normalize(camera);
    this.renderer = renderer;

    this.objects = [];

    return this;
};

T.shadows = function(thing) {
    thing.castShadow = true;
    thing.receiveShadow = true;
    return thing;
};

T.normalize = function(thing) {
    ['x', 'y', 'z'].forEach(function(d) {
        thing[d] = function(n) {
            var pos;
            if (n) {
                this.position[d] = n;
                return this;
            } else {
                return this.position[d];
            }
        };
    });
    return thing;
};

T.Shape = function() {
    var shape = new THREE.Shape();
    return shape;
};

T.Box = function(x, y, z) {
    var box = new THREE.BoxGeometry(x, y, z);
    box.height = y;
    return box;
};

T.Cylinder = function(rTop, rBottom, h, seg) {
    var cylinder = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
    return cylinder;
};

T.Material = function(type, attrs) {

    var types = {
        basic: 'MeshBasicMaterial',
        lambert: 'MeshLambertMaterial',
        depth: 'MeshDepthMaterial',
        phong: 'MeshPhongMaterial'
    },
    theType = 'lambert'; // default to Lambert

    if ( type in types ) {
        // include attributes
        if ( typeof attrs === 'object' && !attrs.color ) {
            attrs.color = '#fff';
        // or, if a string, then it's the color
        } else if (typeof attrs === 'string') {
            attrs = { color: attrs };
        }
        theType = type;
    // if type is not one of the allowed materials, assume it's a color
    } else if ( typeof type === 'string' ) {
        attrs = { color: type };
    // default to white
    } else {
        attrs = { color: '#fff' };
    }

    return new THREE[types[theType]](attrs);
};

T.prototype.mesh = function(geo, material) {
    if (!material) material = T.Material();
    var mesh = new T.Mesh(geo, material, this),
        height,
        yVertices,
        y,
        highest, lowest;

    yVertices = geo.vertices.map(function(vertex) {
        return vertex.y;
    });
    highest = Math.max.apply(null, yVertices);
    lowest = Math.min.apply(null, yVertices);
    height = highest - lowest;


    // set base of mesh at xz plane
    mesh.translateY(height / 2);
    return mesh;
};

T.prototype.light = function(color, intensity, shadows, debug) {
    var light = new THREE.DirectionalLight(color || '#fff', intensity || 1);
    if ( shadows !== false ) {
        light.castShadow = true;
        light.shadowMapWidth = light.shadowMapHeight = 2048;
        light.shadowCameraLeft = -1000;
        light.shadowCameraRight = 1000;
        light.shadowCameraBottom = -1000;
        light.shadowCameraTop = 1000;
        if ( debug ) light.shadowCameraVisible = true;
    }
    this.scene.add(light);
    return T.normalize(light);
};

T.Mesh = function(geo, material, world) {
    var mesh = new THREE.Mesh(geo, material);
    mesh = T.shadows(mesh);
    world.scene.add(mesh);
    return T.normalize(mesh);
};

T.prototype.render = function(cb) {
    var t = 0,
        _this = this;
    function render() {
        _this.renderer.render(_this.scene, _this.camera);
        if ( cb ) cb.bind(_this)(t);
        t++;
        requestAnimationFrame(render);
    }
    render();
}

module.exports = T;
