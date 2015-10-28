var CONFIG = require('./config.js'),
    Firebase = require('firebase'),
    swal = require('sweetalert'),
    $ = require('zepto-browserify').$;

var dataRef = new Firebase(CONFIG.dataRef),
    auth = require('./auth.js')(dataRef), // needs base dataRef to init authentication
    adminContainer = $('#admin'),
    loginButton = $('#login'),
    container = $('#container');

var router = require('./router.js')(),
    view = require('./view.js')(container),
    scene;

if ( router.get('user') && router.get('zone') ) {
    scene = view.show('scene', router);
} else {
    view.show('default');
}

router.when('/', function() {
    view.show('default');
});

router.change('zone', function(id) {
    console.log('changing zone', scene);
    if ( !scene ) {
        scene = view.show('scene', router);
    }
    scene.update(router.get('user'), id);
});

loginButton.on('click', function() {

    // on successful login, initialize admin
    function success(data) {
        loginButton.remove();
        // set up admin
        if ( !scene ) {
            scene = view.show('scene', router);
        }
        require('./admin.js')(adminContainer, router, data, scene);
    }

    function error() {

    }

    auth.login({
        success: success,
        error: error
    });
});

$('.help span').on('click', function() {
    var helperText = '<p><b>3d</b> is an in-browser experiment by <a href="https://twitter.com/scottpdonaldson">Scottland</a> using three.js and Firebase.</p><p><b>Right click and drag</b> to rotate the camera.</p><p><b>Left click and drag</b> to pan the camera.</p>';

    if ( !auth.getUser() ) {
        helperText += '<p>Once you log in, you can create zones of your own!</p>';
    } else {
        helperText += '<p><b>Click</b> to create a new block.';
        helperText += '<p><b>Shift + click</b> to remove a block.</p>';
        helperText += '<p>Have fun!</p>';
    }

    swal({
        title: '3d',
        allowOutsideClick: true,
        showConfirmButton: false,
        text: helperText,
        animation: "slide-from-top",
        html: true,
        customClass: 'alignleft'
    });
});