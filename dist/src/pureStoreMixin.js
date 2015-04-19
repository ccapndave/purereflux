'use strict';

var _core = require('babel-runtime/core-js')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_core.Object.defineProperty(exports, '__esModule', {
	value: true
});

var _Immutable = require('immutable');

var _Immutable2 = _interopRequireWildcard(_Immutable);

var _Reflux = require('reflux');

var _Reflux2 = _interopRequireWildcard(_Reflux);

var _reference = require('./reference');

var PureStoreMixin = function PureStoreMixin(storeKey) {
	// Don't allow dots in the storeKey or it will confuse our path system
	if (storeKey.indexOf('.') >= 0) throw new Error('Store keys cannot contain dots');

	return {
		init: function init() {
			// If no initial state is defined set it to an empty object
			if (!this.getInitialState) this.getInitialState = function () {};

			// Construct the object we are going to put in the global state.  We are going to convert the object
			// to an Immutable.js structure.  Note that even if there are already Immutable.js structures in the
			// initial state is doesn't matter.  Store it in the global state with a reference cursor under the
			// storeKey.  Note that if the key already exists then do nothing.
			if (!_reference.reference().cursor().has(storeKey)) {
				_reference.reference().cursor().set(storeKey, _Immutable2['default'].fromJS(this.getInitialState()));
			}

			// Create a reference cursor to the state
			this.cursor = _reference.reference(storeKey).cursor;
		},

		/**
   * A helper method for setting a value on the default cursor.  For the key it accepts a
   * keypath array or a single value.
   *
   * @param key
   * @param value
   * @returns {*}
   */
		set: function set(key, value) {
			// Turn single element arrays into a string
			if (_core.Array.isArray(key) && key.length == 1) key = key[0];

			if (_core.Array.isArray(key)) {
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
		get: function get() {
			var key = arguments[0] === undefined ? [] : arguments[0];

			var keyPath = _core.Array.isArray(key) ? key : [key],
			    result = this.cursor(keyPath);
			return result.deref ? result.deref() : result;
		},

		/**
   * A helper method for updating the default cursor.  Equivalent to this.cursor().update(...)
   *
   * @param fn
   * @returns {*}
   */
		update: function update(key, fn) {
			// Accept a single function argument
			if (typeof key === 'function' && fn === undefined) {
				fn = key;key = [];
			}

			// Accept a string key
			if (typeof key === 'string') key = [key];

			return this.cursor(key).update(fn);
		},

		/**
   * A helper method for merging an object with the default cursor.
   *
   * @param obj
   * @returns {*}
   */
		merge: function merge(obj) {
			return this.cursor().merge(obj);
		}
	};
};

exports['default'] = PureStoreMixin;
module.exports = exports['default'];
//# sourceMappingURL=pureStoreMixin.js.map