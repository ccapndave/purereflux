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

const PureStoreMixin = function(storeKey) {
	// Don't allow dots in the storeKey or it will confuse our path system
	if (storeKey.indexOf(".") >= 0)
		throw new Error("Store keys cannot contain dots");

	return {
		init() {
			// If no initial state is defined set it to an empty object
			if (!this.getInitialState) this.getInitialState = () => {};

			// Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
			reference().cursor().update(() => Immutable.fromJS({ [storeKey]: this.getInitialState() }));

			// Create a reference cursor to the state (this will be shared between handlers)
			const referenceCursor = reference(storeKey);
		}
	}
}

export default PureStoreMixin;