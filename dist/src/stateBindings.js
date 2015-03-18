"use strict";

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var Immutable = _interopRequire(require("immutable"));

var _appState = require("./appState");

var getState = _appState.getState;
var _dependencyTracker = _appState._dependencyTracker;

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

	var listener = undefined,
	    bindings = undefined,
	    keyPathsToBindingNames = undefined,
	    dependencies = Immutable.Map();

	var onSwap = function onSwap(newState, oldState, keyPath) {
		// The keypath comes in as an array so convert it to a List
		keyPath = Immutable.List(keyPath);

		// A binding is considered to have changed if its keyPath contains the swapped keyPath.
		// So ['a', 'b', 'c'] would be changed by a change to ['a'], ['a', 'b'] or ['a', 'b', 'c'].
		// Note that it would also be changed by any deeper change, for example ['a', 'b', 'c', 'd'].
		// Convert it to a set after the computation since we don't care about duplicates.
		var bindingNames = keyPathsToBindingNames.filter(function (names, path) {
			var compareLength = Math.min(path.size, keyPath.size);
			return Immutable.is(keyPath.slice(0, compareLength), path.slice(0, compareLength));
		}).toSet().flatten();

		// If there are any bindings that need to change then update the state appropriately
		if (bindingNames && bindingNames.size > 0) {
			var newStates = bindingNames.reduce(function (acc, bindingName) {
				return acc.set(bindingName, dereference(bindings.get(bindingName)));
			}, Immutable.Map());

			// React needs to the top level to be an object
			this.setState(newStates.toObject());
		}
	};

	var executeAllBindings = function (bindings) {
		// Run the bindings
		var newState = bindings.map(executeBinding).toObject();

		// Now that the bindings have run we will have a new dependencies map, so turn it into something that onSwap can use.
		// Specifically turn binding name -> dependency keyPaths into dependency keyPaths -> binding names
		keyPathsToBindingNames = bindings.map(function (binding, bindingName) {
			return dependencies.get(bindingName);
		}).reduce(function (acc, dependencies, stateProperty) {
			if (dependencies) {
				dependencies.forEach(function (dependency) {
					var set = (acc.get(dependency) || Immutable.Set()).add(stateProperty);
					acc = acc.set(dependency, set);
				});
			}
			return acc;
		}, Immutable.Map());

		return newState;
	};

	var executeBinding = function (binding, bindingName) {
		_dependencyTracker.start();
		var result = dereference(binding);
		dependencies = dependencies.set(bindingName, _dependencyTracker.end());
		return result;
	};

	return {
		getInitialState: function getInitialState() {
			// Call the binding function to get the bindings (getInitialState should only be called once but put an explicit
			// test just in case).  Call the function in the context of the component.
			if (!bindings) bindings = Immutable.Map(bindingsFn.call(this));

			// Calculate and return the bindings
			return executeAllBindings(bindings);
		},

		componentDidMount: function componentDidMount() {
			listener = onSwap.bind(this);
			getState().on("swap", listener);
		},

		componentWillUnmount: function componentWillUnmount() {
			// Stop observing keypaths
			getState().removeListener("swap", listener);

			// Clear the bindings
			bindings = null;
		}
	};
};

module.exports = stateBindings;
//# sourceMappingURL=stateBindings.js.map