"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _srcAppState = require("./src/appState");

var state = _srcAppState.state;
var clearState = _srcAppState.clearState;
var getCurrentState = _srcAppState.getCurrentState;
var getState = _srcAppState.getState;

var PureStoreMixin = _interopRequire(require("./src/pureStoreMixin"));

var stateBindings = _interopRequire(require("./src/stateBindings"));

var provide = _interopRequire(require("./src/provide"));

var bindParams = _interopRequire(require("./src/bindParams"));

exports.PureStoreMixin = PureStoreMixin;
exports.provide = provide;
exports.bindParams = bindParams;
exports.stateBindings = stateBindings;
exports.clearState = clearState;
exports.getCurrentState = getCurrentState;
exports.getState = getState;
Object.defineProperty(exports, "__esModule", {
  value: true
});
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.clearState = clearState;
exports.getState = getState;
exports.getCurrentState = getCurrentState;

var immstruct = _interopRequire(require("immstruct"));

// This is the global application state
var state = immstruct({});

function clearState() {
	state = immstruct({});
}

function getState() {
	return state;
}

function getCurrentState() {
	return state.current;
}
Object.defineProperty(exports, "__esModule", {
	value: true
});
"use strict";

var bindParams = function bindParams(fn) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	var boundFn = (function (_boundFn) {
		var _boundFnWrapper = function boundFn() {
			return _boundFn.apply(this, arguments);
		};

		_boundFnWrapper.toString = function () {
			return _boundFn.toString();
		};

		return _boundFnWrapper;
	})(function () {
		// Call the function
		var result = fn.call.apply(fn, [fn].concat(args));

		// At this point the dependencies are available so copy them (in fact copy every property)
		Object.assign(boundFn, fn);

		return result;
	});

	return boundFn;
};

module.exports = bindParams;
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Immutable = _interopRequire(require("immutable"));

var Reflux = _interopRequire(require("reflux"));

var dereference = require("./reference").dereference;

var propertyBind = function propertyBind(context) {
	var _ref;

	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	var boundFn = (_ref = this).bind.apply(_ref, [context].concat(args));
	boundFn = Object.assign(boundFn, this);
	return boundFn;
};

var getDependencies = function (dep) {
	return typeOf(dep) === "string" ? [dep] : dep.dependencies;
};

var provide = function provide(caller, deps) {
	var isArrayArg = Array.isArray(deps);

	// If we have passed a value instead of an array then wrap it in an array
	if (!isArrayArg) deps = [deps];

	// Resolve the dependencies
	var results = deps.map(dereference);

	// Set the dependencies on the calling function as a flat combination of dependencies + our keypaths
	var depsIterator = Immutable.fromJS(deps);
	caller.dependencies = depsIterator.filter(function (x) {
		return typeof x === "function";
	}).reduce(function (acc, dep) {
		return acc.add(dep.dependencies);
	}, depsIterator.filter(function (x) {
		return typeof x === "string";
	}).toSet()).flatten();

	// Return the result, unwrapping it if the original argument was not an array
	return isArrayArg ? results : results[0];
};

module.exports = provide;
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Immutable = _interopRequire(require("immutable"));

var Reflux = _interopRequire(require("reflux"));

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
"use strict";

var getState = require("../index").getState;

/**
 * Split a path up into an array that can be used with an immstruct cursor
 *
 * @param keyPath
 */
var keyPathToKeyArray = function (keyPath) {
	return keyPath ? keyPath.split(".") : null;
};

/**
 * Turn a path or Getter into a real value
 *
 * @param pathOrGetter
 * @returns {*}
 */
/*const dereference = (pathOrGetter) => {
	if (typeof(pathOrGetter) === "string") {
		// TODO: This needs to throw an exception if the path doesn't exist
		return getState().cursor(keyPathToKeyArray(pathOrGetter)).deref();
	} else if (typeof(pathOrGetter) === "function" && pathOrGetter.isPureFluxGetter) {
		return pathOrGetter();
	} else {
		throw new Error("Illegal argument type for this Getter");
	}
};*/

var dereference = function (dependency) {
	if (typeof dependency === "string") {
		// TODO: This needs to throw an exception if the path doesn't exist
		return getState().cursor(keyPathToKeyArray(dependency)).deref();
	} else if (typeof dependency === "function") {
		return dependency();
	} else {
		throw new Error("Illegal argument type for dependency: " + dependency);
	}
};

/**
 * Get a reference cursor for the given keyPath
 */
var reference = function (keyPath) {
	return getState().reference(keyPathToKeyArray(keyPath));
};

/**
 * Get a cursor for the given keyPath
 */
var cursor = function (keyPath) {
	return getState().cursor(keyPathToKeyArray(keyPath));
};

exports.dereference = dereference;
exports.reference = reference;
exports.cursor = cursor;
Object.defineProperty(exports, "__esModule", {
	value: true
});
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Immutable = _interopRequire(require("immutable"));

var _reference = require("./reference");

var dereference = _reference.dereference;
var reference = _reference.reference;

/**
 * A React mixin to link state paths or Getters to a React state.
 *
 * @param bindingsFn
 * @returns {{getInitialState: Function, componentDidMount: Function, componentWillUnmount: Function}}
 */
var stateBindings = function stateBindings(bindingsFn) {
	if (typeof bindingsFn != "function") throw new Error("stateBindings needs to take a single function which returns the bindings");

	var bindings = undefined,
	    unobservers = Immutable.List();

	return {
		getInitialState: function getInitialState() {
			// Call the binding function to get the bindings (getInitialState should only be called once but put an explicit
			// test just in case).  Call the function in the context of the component.
			if (!bindings) bindings = Immutable.Map(bindingsFn.call(this));

			// Calculate and return the bindings
			return bindings.map(dereference).toObject();
		},

		componentDidMount: function componentDidMount() {
			var _this = this;

			// This is a slightly confusing algorithm that gathers up the state properties that need to be updated per
			// path (so that we only need one observer per path).
			var pathsMap = bindings.map(function (binding) {
				return typeof binding === "string" ? [binding] : binding.dependencies;
			}).reduce(function (acc, dependencies, stateProperty) {
				dependencies.forEach(function (dependency) {
					var set = (acc.get(dependency) || Immutable.Set()).add(stateProperty);
					acc = acc.set(dependency, set);
				});
				return acc;
			}, Immutable.Map());

			// Observe each of the keyPaths
			// TODO: Check references are getting garbage collected (might need to use Reference#destroy() in componentWillUnmount)
			unobservers = pathsMap.map(function (stateProperties, keyPath) {
				return reference(keyPath).observe(function () {
					// I want to get a map of stateProperties to values to pass to setState
					var newStates = stateProperties.reduce(function (acc, stateProperty) {
						return acc.set(stateProperty, dereference(bindings.get(stateProperty)));
					}, Immutable.Map());

					// React needs to the top level to be an object
					_this.setState(newStates.toObject());
				});
			}).toList();
		},

		componentWillUnmount: function componentWillUnmount() {
			// Stop observing keypaths
			unobservers.forEach(function (unobserver) {
				return unobserver();
			});

			// Clear the bindings
			bindings = null;
		}
	};
};

module.exports = stateBindings;
//# sourceMappingURL=purereflux.js.map