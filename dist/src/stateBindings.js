'use strict';

var _core = require('babel-runtime/core-js')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_core.Object.defineProperty(exports, '__esModule', {
	value: true
});

var _Immutable = require('immutable');

var _Immutable2 = _interopRequireWildcard(_Immutable);

var _getState$_dependencyTracker = require('./appState');

var _dereference$reference = require('./reference');

/**
 * A React mixin to link state paths or Getters to a React state.
 *
 * @param bindingsFn
 * @returns {{getInitialState: Function, componentDidMount: Function, componentWillUnmount: Function}}
 */
var stateBindings = function stateBindings(bindingsFn) {
	if (typeof bindingsFn != 'function') throw new Error('stateBindings needs to take a single function which returns the bindings');

	var listener = undefined,
	    bindings = undefined,
	    keyPathsToBindingNames = undefined,
	    dependencies = _Immutable2['default'].Map();

	var onSwap = function onSwap(newState, oldState, keyPath) {
		// The keypath comes in as an array so convert it to a List
		keyPath = _Immutable2['default'].List(keyPath);

		// A binding is considered to have changed if its keyPath contains the swapped keyPath.
		// So ['a', 'b', 'c'] would be changed by a change to ['a'], ['a', 'b'] or ['a', 'b', 'c'].
		// Note that it would also be changed by any deeper change, for example ['a', 'b', 'c', 'd'].
		// Convert it to a set after the computation since we don't care about duplicates.
		var bindingNames = keyPathsToBindingNames.filter(function (names, path) {
			var compareLength = Math.min(path.size, keyPath.size);
			return _Immutable2['default'].is(keyPath.slice(0, compareLength), path.slice(0, compareLength));
		}).toSet().flatten();

		// If there are any bindings that need to change then update the state appropriately
		if (bindingNames && bindingNames.size > 0) {
			var newStates = bindingNames.reduce(function (acc, bindingName) {
				return acc.set(bindingName, _dereference$reference.dereference(bindings.get(bindingName)));
			}, _Immutable2['default'].Map());

			// React needs to the top level to be an object
			this.setState(newStates.toObject());
		}
	};

	var executeAllBindings = function executeAllBindings(bindings) {
		// Run the bindings
		var newState = bindings.map(executeBinding).toObject();

		// Now that the bindings have run we will have a new dependencies map, so turn it into something that onSwap can use.
		// Specifically turn binding name -> dependency keyPaths into dependency keyPaths -> binding names
		keyPathsToBindingNames = bindings.map(function (binding, bindingName) {
			return dependencies.get(bindingName);
		}).reduce(function (acc, dependencies, stateProperty) {
			if (dependencies) {
				dependencies.forEach(function (dependency) {
					var set = (acc.get(dependency) || _Immutable2['default'].Set()).add(stateProperty);
					acc = acc.set(dependency, set);
				});
			}
			return acc;
		}, _Immutable2['default'].Map());

		return newState;
	};

	var executeBinding = function executeBinding(binding, bindingName) {
		_getState$_dependencyTracker._dependencyTracker.start();
		var result = _dereference$reference.dereference(binding);
		dependencies = dependencies.set(bindingName, _getState$_dependencyTracker._dependencyTracker.end());
		return result;
	};

	return {
		getInitialState: function getInitialState() {
			// Call the binding function to get the bindings (getInitialState should only be called once but put an explicit
			// test just in case).  Call the function in the context of the component.
			if (!bindings) bindings = _Immutable2['default'].Map(bindingsFn.call(this));

			// Calculate and return the bindings
			return executeAllBindings(bindings);
		},

		componentDidMount: function componentDidMount() {
			listener = onSwap.bind(this);
			_getState$_dependencyTracker.getState().on('swap', listener);
		},

		componentWillUnmount: function componentWillUnmount() {
			// Stop observing keypaths
			_getState$_dependencyTracker.getState().removeListener('swap', listener);

			// Clear the bindings
			bindings = null;
		},

		executeAllStateBindings: function executeAllStateBindings() {
			bindings = _Immutable2['default'].Map(bindingsFn.call(this));
			this.setState(executeAllBindings(bindings));
		}
	};
};

exports['default'] = stateBindings;
module.exports = exports['default'];
//# sourceMappingURL=stateBindings.js.map