import Immutable from 'immutable'
import Reflux from 'reflux'
import { reference } from './reference'

/**
 * We need to change the context of listenTo
 *
 * @param listenable
 * @param callback
 * @param defaultCallback
 * @returns {{stop: Function, listenable: *}}
 */
/*const listenTo = function(listenable, callback, defaultCallback) {
	var desub, unsubscriber, subscriptionobj, subs = this.subscriptions = this.subscriptions || [];
	if (this.validateListening(listenable)) throw new Error("listener validation error");
	desub = listenable.listen(this[callback]||callback, this);
	unsubscriber = function() {
		var index = subs.indexOf(subscriptionobj);
		if (index === -1) throw new Error('Tried to remove listen already gone from subscriptions list!');
		subs.splice(index, 1);
		desub();
	};
	subscriptionobj = {
		stop: unsubscriber,
		listenable: listenable
	};
	subs.push(subscriptionobj);
	return subscriptionobj;
};
Object.assign(Reflux.ListenerMethods, { listenTo });*/

/**
 * Create a reflux store
 *
 * @param storeKey
 * @param definition
 * @returns {*}
 */
const createStore = function(storeKey, definition) {
	// Don't allow dots in the storeKey or it will confuse our path system
	if (storeKey.indexOf(".") >= 0)
		throw new Error("Store keys cannot contain dots");

	// If no initial state is defined set it to an empty object
	if (!definition.getInitialState) definition.getInitialState = () => {};

	// Start with a Reflux store
	let store = Reflux.createStore(definition);

	// Replace Reflux's fetchInitialState method with an empty method as PureReflux uses a different system
	store.fetchInitialState = () => {};

	// Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
	reference().cursor().update(() => Immutable.fromJS({ [storeKey]: store.getInitialState() }));

	// Create a reference cursor to the state (this will be shared between handlers)
	const referenceCursor = reference(storeKey);

	// Go through the store getting all handlers (handlers are functions beginning with 'on') and rebind them
	// such that they have the reference cursor for this store's linked state as their context.
	// TODO: this doesn't support direct assignments with listenTo and listenToMany
	/*Object.keys(store)
		  	.filter(property => typeof(store[property]) === "function" && property.substr(0, 2) === "on")
		  	.forEach(handler => {
				console.log(store[handler]);
				store[handler] = store[handler].bind(referenceCursor)
			});*/

	// The problem is that the store is already bound by this point
	//console.log(Reflux);


	return store;
};

export function createStoreMixin(storeKey) {
	// Don't allow dots in the storeKey or it will confuse our path system
	if (storeKey.indexOf(".") >= 0)
		throw new Error("Store keys cannot contain dots");

	// Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
	reference().cursor().update(() => Immutable.fromJS({ [storeKey]: store.getInitialState() }));

	return {
		init() {
			// If no initial state is defined set it to an empty object
			if (!this.getInitialState) this.getInitialState = () => {};

			// Create a reference cursor to the state (this will be shared between handlers)
			const referenceCursor = reference(storeKey);

			// Go through the store getting all handlers (handlers are functions beginning with 'on') and rebind them
			// such that they have the reference cursor for this store's linked state as their context.
			// TODO: this doesn't support direct assignments with listenTo and listenToMany
			/*Object.keys(store)
			 .filter(property => typeof(store[property]) === "function" && property.substr(0, 2) === "on")
			 .forEach(handler => {
			 console.log(store[handler]);
			 store[handler] = store[handler].bind(referenceCursor)
			 });*/

			// The problem is that the store is already bound by this point
			//console.log(Reflux);
		}
	}
}

export default createStore;