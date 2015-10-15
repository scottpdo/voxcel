var Router = function() {

	var paths = {},
		events = {};

	function setPaths() {
		var hash = window.location.hash,
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
	}

	function setAll(obj) {
		var hash = '/';
		for ( var key in obj ) {
			hash += key + '/' + obj[key];
		}
		window.location.hash = hash;
	}

	function get(key) {
		return paths[key];
	}

	function change(key, cb) {
		events[key] = cb;
	}

	function runEvents() {
		var key;
		for ( var ev in events ) {
			key = paths[ev];
			events[ev](key);
		}
	}

	setPaths();
	window.addEventListener('hashchange', function() {
		setPaths();
		runEvents();
	});

	return {
		change: change,
		set: set,
		setAll: setAll,
		get: get
	};
};

module.exports = Router;