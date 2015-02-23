"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var Immutable = _babelHelpers.interopRequire(require("immutable"));

var Reflux = _babelHelpers.interopRequire(require("reflux"));

var reference = require("./reference").reference;

var PureStoreMixin = function PureStoreMixin(storeKey) {
	// Don't allow dots in the storeKey or it will confuse our path system
	if (storeKey.indexOf(".") >= 0) throw new Error("Store keys cannot contain dots");

	return {
		init: function init() {
			// If no initial state is defined set it to an empty object
			if (!this.getInitialState) this.getInitialState = function () {};

			// Construct the object we are going to put in the global state.  We are going to convert the object
			// to an Immutable.js structure.  Note that even if there are already Immutable.js structures in the
			// initial state is doesn't matter.  Store it in the global state with a reference cursor under the
			// storeKey.
			reference().cursor().set(storeKey, Immutable.fromJS(this.getInitialState()));

			// Create a reference cursor to the state
			this.cursor = reference(storeKey).cursor;
		},

		/**
   * Reset the store data to its initial state
   */
		resetToInitialState: function resetToInitialState() {
			this.update(Immutable.fromJS(this.getInitialState()));
		},

		/**
   * A helper method for setting a value on the default cursor.  Equivalent to this.cursor().set(...)
   *
   * @param key
   * @param value
   * @returns {*}
   */
		set: function set(key, value) {
			return this.cursor().set(key, value);
		},

		/**
   * A helper method for getting a value from the default cursor.  Equivalent to this.cursor().get(...)
   *
   * @param key
   * @returns {*}
   */
		get: function get(key) {
			// In the event of this returning another cursor we want to dereference it, otherwise it is a real value
			var result = this.cursor().get(key);
			return result.deref ? result.deref() : result;
		},

		/**
   * A helper method for updating the default cursor.  Equivalent to this.cursor().update(...)
   *
   * @param fn
   * @returns {*}
   */
		update: function update(fn) {
			return this.cursor().update(fn);
		}
	};
};

module.exports = PureStoreMixin;
//# sourceMappingURL=pureStoreMixin.js.map