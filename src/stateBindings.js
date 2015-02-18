import Immutable from 'immutable'
import { dereference, reference } from './reference'

/**
 * A React mixin to link state paths or Getters to a React state.
 *
 * @param bindingsFn
 * @returns {{getInitialState: Function, componentDidMount: Function, componentWillUnmount: Function}}
 */
const stateBindings = function(bindingsFn) {
	if (typeof(bindingsFn) != "function")
		throw new Error("stateBindings needs to take a single function which returns the bindings");

	let bindings, unobservers = Immutable.List();

	return {
		getInitialState() {
			// Call the binding function to get the bindings (getInitialState should only be called once but put an explicit
			// test just in case).  Call the function in the context of the component.
			if (!bindings) bindings = Immutable.Map(bindingsFn.call(this));

			// Calculate and return the bindings
			return bindings.map(dereference).toObject();
		},

		componentDidMount() {
			// This is a slightly confusing algorithm that gathers up the state properties that need to be updated per
			// path (so that we only need one observer per path).
			let pathsMap = bindings
					.map(binding => typeof(binding) === "string" ? [ binding ] : binding.dependencies)
					.reduce((acc, dependencies, stateProperty) => {
						dependencies.forEach(dependency => {
							let set = (acc.get(dependency) || Immutable.Set()).add(stateProperty);
							acc = acc.set(dependency, set);
						});
						return acc;
					}, Immutable.Map());

			// Observe each of the keyPaths
			// TODO: Check references are getting garbage collected (might need to use Reference#destroy() in componentWillUnmount)
			unobservers = pathsMap.map((stateProperties, keyPath) => {
				return reference(keyPath).observe(() => {
					// I want to get a map of stateProperties to values to pass to setState
					const newStates = stateProperties.reduce((acc, stateProperty) => {
						return acc.set(stateProperty, dereference(bindings.get(stateProperty)))
					}, Immutable.Map());

					// React needs to the top level to be an object
					this.setState(newStates.toObject());
				});
			}).toList();
		},

		componentWillUnmount() {
			// Stop observing keypaths
			unobservers.forEach(unobserver => unobserver());

			// Clear the bindings
			bindings = null;
		}
	};

};

export default stateBindings