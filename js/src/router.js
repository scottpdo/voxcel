var Router = function() {

	var paths = setPaths(),
		changeEvents = {},
		events = {};

	function setPaths() {
		var paths = {},
			hash = window.location.hash,
			segments;
		if ( hash.length > 2 ) {
			segments = hash.slice(2).split('/');
			hash.slice(2).split('/').forEach(function(segment, i) {
				// set key and value only on keys
				if ( i % 2 === 0 ) {
					paths[segment] = segments[i + 1];
				}
			});
		}
		return paths;
	}

	function set(key, val) {
		var hash = window.location.hash;
		if ( hash.split('/').indexOf(key) > -1 ) {
			hash = hash.split('/');
			hash.forEach(function(el, i) {
				// find key and
				// set value
				if ( hash[i - 1] === key ) {
					hash[i] = val;
				}
			});
			hash = hash.join('/');
		} else {
			hash += '/' + key + '/' + val;
		}
		window.location.hash = hash;
		return router;
	}

	function setAll(obj) {
		var hash = '/';
		for ( var key in obj ) {
			hash += key + '/' + obj[key] + '/';
		}
		window.location.hash = hash;
		return router;
	}

	function get(key) {
		return paths[key];
	}

	function change(key, cb) {
		changeEvents[key] = cb;
		return router;
	}

	function when(key, cb) {
		var hash = window.location.hash.slice(1);

		// add callback
		events[key] = cb;

		// check if it needs to run immediately
		if ( hash === key ) cb();
	
		return router;
	}

	function runEvents() {
		// only trigger events for specific item that has changed
		var newPaths = setPaths(),
			path,
			key,
			hash = window.location.hash.slice(1);

		for ( path in newPaths ) {
			if ( paths[path] !== newPaths[path] && changeEvents[path] ) {
				key = newPaths[path];
				changeEvents[path](key);
			}
		}

		for ( path in events ) {
			if ( hash === path ) {
				events[path]();
			}
		}
	}

	window.addEventListener('hashchange', function() {

		if ( !window.location.hash ) window.location.hash = '#/';

		runEvents();
		// finally update with new paths
		paths = setPaths();
	});

	var router = {
		change: change,
		when: when,
		set: set,
		setAll: setAll,
		get: get
	};

	return router;
};

module.exports = Router;