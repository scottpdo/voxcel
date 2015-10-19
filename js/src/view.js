var CONFIG = require('./config.js'),
	Firebase = require('firebase'),
	THREE = require('three.js'),
	T = require('./T.js'),
	$ = require('zepto-browserify').$,
	node = require('./utils/node.js');

var views = {
	"default": function(container) {

		container.css({
			padding: '10px 20px'
		});

		var title = node('h1', '3d', '', container);
		title.css('margin-top', 0);

		var img = node('img', '', '', container);
		img.attr('src', 'http://i.imgur.com/czmQqcy.gif');

		var welcome = node('div', '<p><b>3d</b> is an in-browser experiment by <a href="https://twitter.com/scottpdonaldson">Scottland</a> using three.js and Firebase.</p><p>Check out some zones:</p>', '', container);

		var zones = new Firebase(CONFIG.dataRef),
			zonesList = node('ul', '', '', container);
		zones.on('value', function(snapshot) {
			var users = snapshot.val().users,
				user,
				zone;
			for ( user in users ) {
				for ( zone in users[user] ) {
					zonesList.append('<li><a href="/#/user/' + user + '/zone/' + zone + '">' + users[user][zone].name + '</a></li>');
				}
			}
		});
	},
	"scene": function(container, router) {
		var scene = require('./scene.js')(container, router);
		scene.update(router.get('user'), router.get('zone'));
		return scene;
	}
};

module.exports = function(container) {
	return {
		show: function() {
			var which = arguments[0];
			
			if ( !which in views ) {
				throw new Error('Could not find the view ' + which);
			}

			// clear container
			container.html('')
			container.css('padding', 0);

			// render view
			return views[which].apply(null, [container].concat([].slice.apply(arguments).slice(1)));
		}
	};
};