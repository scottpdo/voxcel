var CONFIG = require('./config.js'),
    Firebase = require('firebase'),
    swal = require('sweetalert'),
    $ = require('zepto-browserify').$;

function node(tag, html, classes, container) {
    var node = $('<' + tag + '>');
    if ( html ) node.html(html);

    if ( classes ) {
        classes.split(' ').forEach(function(c) {
            node.addClass(c);
        });
    }

    if ( container ) container.append(node);

    return node;
};

function admin(container, data, router) {

    var photo = node('img', '', '', container);
    photo.attr('src', data.google.profileImageURL);

    var name = node('small', data.google.displayName, 'block', container);

    // UID is in format MEDIUM:123456789, so split by : and get just the numeric value
    router.set('user', data.uid.split(':')[1]);

    var zonesRef = new Firebase(CONFIG.dataRef + '/users/' + data.uid),
        zoneRef;

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
                zonesRef.push({
                    name: inputValue,
                    created_at: new Date().getTime()
                });
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
            router.set('zone', target.attr('data-id'));
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

module.exports = admin;
