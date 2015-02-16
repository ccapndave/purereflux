import Immutable from 'immutable'
import { getState } from '../index'

const getMatchingHandler = function(store, action) {
	return null;
};

const bindHandlers = function(store, definition) {
	for (var name in definition) {
		// Don't copy getInitialState or init (everything else is a handler)
		if (name == "getInitialState" || name == "init") continue;

		if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
			var propertyDescriptor = Object.getOwnPropertyDescriptor(definition, name);
			if (!propertyDescriptor.value || typeof propertyDescriptor.value !== 'function' || !definition.hasOwnProperty(name)) continue;
			store[name] = definition[name].bind(store);
		} else {
			var property = definition[name];
			if (typeof property !== 'function' || !definition.hasOwnProperty(name)) continue;
			store[name] = property.bind(store);
		}
	}

	return store;
}

const createStore = function(storeKey, definition) {
	// If no initial state is defined set it to an empty object
	if (!definition.getInitialState) definition.getInitialState = () => {};

	// Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
	getState().reference().cursor().update(() => Immutable.fromJS({ [storeKey]: definition.getInitialState() }));

	// Add the Reflux-style listener methods to the store API

	// First put all the handlers into the store
	let store = bindHandlers({}, definition);

	// Then add the listener methods
	store = Object.assign(store, {
		listenTo(action, handler) {
			if (arguments.length !== 2)
				throw new Error("listenTo must be called with exactly two arguments");

			if (!action._isAction)
				throw new Error("The first argument of listenTo must be an action");

			action.listen(handler);
		},

		listenToMany(actions) {
			// Go through the actions
			// For each action see if there is a matching listener method
			// If there is then add a listener to it
			actions.map(getMatchingHandler).filter(x => x !== null).forEach((action) => {
				console.log(action);
			});
		}
	});

	// Implement the listenables property
	/*if (this.listenables){
	 arr = [].concat(this.listenables);
	 for(;i < arr.length;i++){
	 this.listenToMany(arr[i]);
	 }
	 }*/

	// Call init if it exists.  Give it the store as a context.
	if (definition.init && typeof(definition.init) === "function")
		definition.init.call(store);

	return store;
};

module.exports = createStore;