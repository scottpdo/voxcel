var React = require('react'),
	ReactDOMServer = require('react-dom/server'),
	express = require('express'),
    path = require('path'),
    PORT = process.env.PORT || 8000;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use( '/js', express.static('js') );
app.use( '/css', express.static('css') );

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/test', function(req, res) {
	var TestComponent = React.createClass({
		render: function() {
			return React.createElement('div', '', 'test');
		}
	});

	var output = React.createFactory(TestComponent);
	output = ReactDOMServer.renderToString(output({}));
	res.render('test', { testContent: output });
});

app.use(function(req, res) {
    res.status(404).render('404');
});

module.exports = {
    start: function() {
        app.listen(PORT);
        console.log('Started server on port', PORT);
    }
};