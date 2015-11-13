// get a random item from an array or string,
// or a random value from an array
let random = (item) => {
	if ( item.length ) {
	    return item[Math.floor(Math.random() * item.length)];
	} else if ( typeof item === 'object' ) {
		let keys = Object.keys(item);
		return item[random(keys)];
	}
};

export default random;