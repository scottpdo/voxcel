import React from 'react';
import ReactDOM from 'react-dom';
import TWEEN from 'tween.js';

class Main extends React.Component {
	
	constructor() {
		super();

		this.state = {
			fill: '#000'
		};

		this._paint = (canvas) => {
			let context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = this.state.fill;
			context.fillRect(0, 0, canvas.width, canvas.height);
		};
	}

	componentDidMount() {

		let canvas = ReactDOM.findDOMNode(this);

		canvas.width = canvas.parentNode.clientWidth;
		canvas.height = canvas.parentNode.clientHeight;

		window.addEventListener('resize', () => {
			// TODO: update canvas on resize
		});

		this._paint(canvas);

		this.props.auth.on('login', () => {
			this.setState({
				fill: '#fe0'
			});
			this._paint(canvas);
		});
	}

	render() {
		return <canvas></canvas>;
	}
}

export default Main;