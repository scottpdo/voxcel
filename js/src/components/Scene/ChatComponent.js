import CONFIG from '../../config';
import React from 'react';
import Firebase from 'firebase';
import { $ } from 'zepto-browserify';

class ChatComponent extends React.Component {

	constructor() {
		super();

		this.state = {
			loggedIn: false,
			messages: [],
			scrolledUp: false
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

	componentDidUpdate() {
		// if user has not scrolled up in chat,
		// keep it at bottom when updating
		if ( !this.state.scrolledUp ) {
			this.refs.messagesContainer.scrollTop =
				this.refs.messages.clientHeight > this.refs.messagesContainer.clientHeight ?
				this.refs.messages.clientHeight - this.refs.messagesContainer.clientHeight :
				0;
		}
	}

	chatFocus() {
		this.props.onChatChange.call(this, true);
	}

	chatBlur() {
		this.props.onChatChange.call(this, false);
	}

	render() {
		
		let style = {
			display: this.state.loggedIn ? 'block' : 'none'
		};

		let scrolledUpStyle = {
			display: this.state.scrolledUp ? 'block' : 'none'
		};

		let messages = this.state.messages.map((message) => {
			return (
				<div className="message" key={message.key}>
					<span className="user">{message.name}:</span><br />
					<span>{message.message}</span>
				</div>
			);
		});

		let scrollMessages = () => {
			
			let scrolledUp = false;
			
			if ( this.refs.messages.clientHeight > this.refs.messagesContainer.clientHeight ) {
				scrolledUp = 
					this.refs.messages.clientHeight - this.refs.messagesContainer.clientHeight - this.refs.messagesContainer.scrollTop < 5 ?
					false :
					true;
			}
			
			this.setState({
				scrolledUp
			});
		};

		return (
			<div style={style} id="chat">
				<div className="messages-container" ref="messagesContainer" onScroll={scrollMessages}>
					<div className="messages" ref="messages">
						{messages}
					</div>
				</div>
				<div className="messages-more" style={scrolledUpStyle}>
					More messages &darr;
				</div>
				<form onSubmit={this.submitMessage.bind(this)}>
					<input onFocus={this.chatFocus.bind(this)} onBlur={this.chatBlur.bind(this)} type="text" ref="message" placeholder="Your message..." />
				</form>
			</div>
		);
	}

}

export default ChatComponent;