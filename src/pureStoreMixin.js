import Immutable from 'immutable'
import Reflux from 'reflux'
import { reference } from './reference'

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

			// Create a reference cursor to the state
			this.cursor = reference(storeKey).cursor;
		},

		/**
		 * A helper method for setting a value on the default cursor.  Equivalent to this.cursor().set(...)
		 *
		 * @param key
		 * @param value
		 * @returns {*}
		 */
		set(key, value) {
			return this.cursor().set(key, value);
		},

		/**
		 * A helper method for getting a value from the default cursor.  Equivalent to this.cursor().get(...)
		 * @param key
		 * @returns {*}
		 */
		get(key) {
			return this.cursor().get(key);
		},

		/**
		 * A helper method for updating the default cursor.  Equivalent to this.cursor().update(...)
		 *
		 * @param fn
		 * @returns {*}
		 */
		update(fn) {
			return this.cursor().update(fn);
		}
	}
};

export default PureStoreMixin;