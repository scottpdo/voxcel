var Firebase = require('firebase'),
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
			container.html('').css({});

			// render view
			return views[which].apply(null, [container].concat([].slice.apply(arguments).slice(1)));
		}
	};
};