var CONFIG = require('./config.js'),
    Firebase = require('firebase'),
    swal = require('sweetalert');

function node(tag, html, classes, container) {
    var node = document.createElement(tag);
    if ( html ) node.innerHTML = html;

    if ( classes ) {
        classes.split(' ').forEach(function(c) {
            node.classList.add(c);
        });
    }

    if ( container ) container.appendChild(node);

    return node;
};

function admin(container, data, scene) {

    var photo = node('img', '', '', container);
    photo.src = data.google.profileImageURL;

    var name = node('small', data.google.displayName, 'block', container);

    var userRef = new Firebase(CONFIG.dataRef + '/users/' + data.uid),
        zoneRef;

    var zones = node('ul', '', 'zones tight no-list', container),
        newZone = node('button', 'New', 'new-zone-button', container);

    newZone.addEventListener('click', function() {
        swal({
            title: 'Name your zone!',
            text: 'Make it a good name...',
            type: 'input',
            animation: "slide-from-top"
        }, function(inputValue){
            userRef.push({
                name: inputValue,
                created_at: new Date().getTime()
            });
        });
    });

    zones.addEventListener('click', function(e) {
        var target = e.target
        if ( target.hasAttribute('data-id') ) {
            console.log('updating scene for', target.getAttribute('data-id'))
            scene.update(data.uid, target.getAttribute('data-id'));
        }
    });

    userRef.on('child_added', function(snapshot) {
        var li = document.createElement('li');
        li.setAttribute('data-id', snapshot.key());
        li.innerHTML = snapshot.val().name;
        zones.appendChild(li);
    });
}

module.exports = admin;
