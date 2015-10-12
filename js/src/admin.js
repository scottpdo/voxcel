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

function admin(container, data) {

    var photo = node('img', '', '', container);
    photo.src = data.google.profileImageURL;

    var name = node('small', data.google.displayName, 'block', container);

    var zoneRef = new Firebase(CONFIG.dataRef + data.uid);

    var zones = node('select', '<option>No zones</option>', '', container),
        newZone = node('button', 'New Zone', '', container);

    newZone.addEventListener('click', function() {
        swal({
            title: 'Name your zone!',
            text: 'Make it a good name...',
            type: 'input',
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top"
        }, function(inputValue){
            data.child(inputValue).set({
                created_at: new Date()
            });
        });
    });

    zoneRef.on('child_added', function(snapshot) {
        if ( newZone ) {
            newZone.parentNode.removeChild(newZone);
            newZone = false;
        }
        zones.innerHTML += '<option>' + snapshot.val() + '</option>'
    });
}

module.exports = admin;
