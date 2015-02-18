import Immutable from 'immutable'
import { dereference, reference } from './reference'

/**
 * A React mixin to link state paths or Getters to a React state.
 *
 * @param bindingsObj
 * @returns {{getInitialState: Function, componentDidMount: Function, componentWillUnmount: Function}}
 */
const stateBindings = function(bindingsObj) {
	let unobservers = Immutable.List();

	const bindings = Immutable.Map(bindingsObj);

	return {
		getInitialState() {
			return bindings.map(dereference);
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

					this.setState(newStates);
				});
			}).toList();
		},

		componentWillUnmount() {
			unobservers.forEach(unobserver => unobserver());
		}
	};

};

export default stateBindings