const bindParams = function(fn, ...args) {
	const boundFn = function() {
		// Call the function
		const result = fn.call(fn, ...args);

		// At this point the dependencies are available so copy them (in fact copy every property)
		Object.assign(boundFn, fn);

		return result;
	};

	return boundFn;
};

export default bindParams;