import ReactDOM from 'react-dom';

let DOMWrapper = {
	render(component, id) {
		if ( document.getElementById(id) ) {
			ReactDOM.render(component, document.getElementById(id));
		}
	}
}

export default DOMWrapper;