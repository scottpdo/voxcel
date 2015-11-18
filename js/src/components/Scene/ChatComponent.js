import CONFIG from '../../config';
import React from 'react';
import Firebase from 'firebase';

class ChatComponent extends React.Component {

	constructor() {
		super();

		this.state = {
			loggedIn: false,
			messages: []
		};
	}

	componentWillMount() {
		
		this.props.auth.on('login', () => {
			this.setState({
				loggedIn: true
			});
		});

		this.props.auth.on('logout', () => {
			this.setState({
				loggedIn: false
			});
		});

		if ( this.props.auth.getUser() ) {
			this.setState({
				loggedIn: true
			});
		}

		this.submitMessage = (e) => {
			e.preventDefault();
			if ( this.refs.message.value.length > 0 ) {
				this.state.messagesRef.push({
					name: this.props.auth.getUser('name'),
					message: this.refs.message.value
				});
				this.refs.message.value = '';
			}
		};
	}

	componentWillReceiveProps() {
		
		if ( this.state.messagesRef ) {
			this.state.messagesRef.off('child_added')
		}

		this.setState({
			messages: [],
			messagesRef: new Firebase(CONFIG.dataRef + '/users/' + this.props.userId + '/' + this.props.zone + '/messages/')
		}, () => {
			
			this.state.messagesRef.on('child_added', (s) => {
				
				this.state.messages.push({
					key: s.key(),
					name: s.val().name,
					message: s.val().message
				});

				this.setState({
					messages: this.state.messages
				});
			});
		});

		return true;
	}

	render() {
		
		let style = {
			display: this.state.loggedIn ? 'block' : 'none'
		};

		let messages = this.state.messages.map((message) => {
			return (
				<div className="message" key={message.key}>
					<span className="user">{message.name}:</span><br />
					<span>{message.message}</span>
				</div>
			);
		});

		return (
			<div style={style} id="chat">
				<div className="messages-container" ref="messages-container">
					<div className="messages">
						{messages}
					</div>
				</div>
				<form onSubmit={this.submitMessage.bind(this)}>
					<input type="text" ref="message" placeholder="Your message..." />
				</form>
			</div>
		);
	}

}

export default ChatComponent;