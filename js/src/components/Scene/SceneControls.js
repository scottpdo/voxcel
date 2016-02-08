import React from 'react';
import CONFIG from '../../config';
import swal from 'sweetalert';

class SceneControls extends React.Component {

	constructor() {
		super();
	}

	takeSnapshot() {
		let canvas = $(this.props.controlManager.canvas);
		canvas.addClass('faded');

		$.ajax({
			url: CONFIG.imgurEndpoint,
			type: 'POST',
			headers: {
				Authorization: 'Client-ID ' + CONFIG.imgurId,
				Accept: 'application/json'
			},
			data: {
				image: canvas[0].toDataURL().split(',')[1],
				type: 'base64'
			},
			success(result) {
				let id = result.data.id;
				console.log('success', CONFIG.imgurPrefix + '/' + id);
			},
			error(err) {
				console.log('error uploading', err);
			}
		});

		setTimeout(() => {
			canvas.removeClass('faded');
		}, 350);
	}

	changeColor() {
		this.props.controlManager.changeColor(this.refs.colorPicker.value);
	}

	render() {
		return this.props.isAdmin ? (
			<div id="scene-controls">
				<input type="color" id="color-picker" ref="colorPicker" onChange={this.changeColor.bind(this)} />
				<img src="/img/icons/camera.svg" onClick={this.takeSnapshot.bind(this)} />
			</div>
		) : null;
	}

}

export default SceneControls;