import Immutable from 'immutable'
import { getState, _dependencyTracker } from './appState'
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

	let listener, bindings, keyPathsToBindingNames, dependencies = Immutable.Map();

	const onSwap = function(newState, oldState, keyPath) {
		// The keypath comes in as an array so convert it to a List
		keyPath = Immutable.List(keyPath);

		// A binding is considered to have changed if its keyPath contains the swapped keyPath.
		// So ['a', 'b', 'c'] would be changed by a change to ['a'], ['a', 'b'] or ['a', 'b', 'c'].
		// Convert it to a set after the computation as we don't care about duplicates.
		const bindingNames = keyPathsToBindingNames.filter((names, path) =>
			Immutable.is(keyPath, path.slice(0, keyPath.size))
		).toSet().flatten();

		// If there are any bindings that need to change then update the state appropriately
		if (bindingNames) {
			//console.log(newState);
			const newStates = bindingNames.reduce((acc, bindingName) => {
				return acc.set(bindingName, dereference(bindings.get(bindingName)))
			}, Immutable.Map());

			// React needs to the top level to be an object
			this.setState(newStates.toObject());
		}
	};

	const executeAllBindings = (bindings) => {
		// Run the bindings
		const newState = bindings.map(executeBinding).toObject();

		// Now that the bindings have run we will have a new dependencies map, so turn it into something that onSwap can use.
		// Specifically turn binding name -> dependency keyPaths into dependency keyPaths -> binding names
		keyPathsToBindingNames = bindings
			.map((binding, bindingName) => dependencies.get(bindingName))
			.reduce((acc, dependencies, stateProperty) => {
				if (dependencies) {
					dependencies.forEach(dependency => {
						let set = (acc.get(dependency) || Immutable.Set()).add(stateProperty);
						acc = acc.set(dependency, set);
					});
				}
				return acc;
			}, Immutable.Map());

		return newState;
	};

	const executeBinding = (binding, bindingName) => {
		_dependencyTracker.start();
		const result = dereference(binding);
		dependencies = dependencies.set(bindingName, _dependencyTracker.end());
		return result;
	};

	return {
		getInitialState() {
			// Call the binding function to get the bindings (getInitialState should only be called once but put an explicit
			// test just in case).  Call the function in the context of the component.
			if (!bindings) bindings = Immutable.Map(bindingsFn.call(this));

			// Calculate and return the bindings
			return executeAllBindings(bindings);
		},

		componentDidMount() {
			listener = onSwap.bind(this);
			getState().on("swap", listener);
		},

		componentWillUnmount() {
			// Stop observing keypaths
			getState().removeListener("swap", listener);

			// Clear the bindings
			bindings = null;
		}
	};

};

export default stateBindings