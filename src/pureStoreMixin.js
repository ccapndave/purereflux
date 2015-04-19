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

			// Construct the object we are going to put in the global state.  We are going to convert the object
			// to an Immutable.js structure.  Note that even if there are already Immutable.js structures in the
			// initial state is doesn't matter.  Store it in the global state with a reference cursor under the
			// storeKey.  Note that if the key already exists then do nothing.
			if (!reference().cursor().has(storeKey)) {
				reference().cursor().set(storeKey, Immutable.fromJS(this.getInitialState()));
			}

			// Create a reference cursor to the state
			this.cursor = reference(storeKey).cursor;
		},

		/**
		 * A helper method for setting a value on the default cursor.  For the key it accepts a
		 * keypath array or a single value.
		 *
		 * @param key
		 * @param value
		 * @returns {*}
		 */
		set(key, value) {
			// Turn single element arrays into a string
			if (Array.isArray(key) && key.length == 1) key = key[0];

			if (Array.isArray(key)) {
				this.cursor(key.slice(0, key.length - 1)).set(key.slice(-1)[0], value);
			} else {
				this.cursor().set(key, value);
			}

			// Allow set chaining (TODO: this might work anyway by returning the values above... test it)
			return this;
		},

		/**
		 * A helper method for getting a value from the default cursor.  It accepts a keypath array
		 * or a single string.
		 *
		 * @param key
		 * @returns {*}
		 */
		get(key = []) {
			const keyPath = Array.isArray(key) ? key : [ key ],
				  result = this.cursor(keyPath);
			return result.deref ? result.deref() : result;
		},

		/**
		 * A helper method for updating the default cursor.  Equivalent to this.cursor().update(...)
		 *
		 * @param fn
		 * @returns {*}
		 */
		update(key, fn) {
			// Accept a single function argument
			if (typeof key === "function" && fn === undefined) {
				fn = key; key = [];
			}

			// Accept a string key
			if (typeof key === "string") key = [key];

			return this.cursor(key).update(fn);
		},

		/**
		 * A helper method for merging an object with the default cursor.
		 *
		 * @param obj
		 * @returns {*}
		 */
		merge(obj) {
			return this.cursor().merge(obj);
		}
	}
};

export default PureStoreMixin;