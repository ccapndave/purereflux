"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var Immutable = _babelHelpers.interopRequire(require("immutable"));

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
//# sourceMappingURL=stateBindings.js.map