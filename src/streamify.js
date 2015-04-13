import Immutable from 'immutable'
import { getState, _dependencyTracker } from './appState'
import { dereference } from './reference'
import Rx from 'rx'

const streamify = function(fn) {
	let dependencies = null;

	/* Run the function, tracking the dependencies and returning the result */
	const runFunction = () => {
		_dependencyTracker.start();
		let result = null;
		try {
			result = fn();
		} catch (e) {
			console.info(`Ignoring exception in promisify: ${e}`);
		}
		dependencies = _dependencyTracker.end();
		return result;
	};

	/**
	 * A binding is considered to have changed if its keyPath contains the swapped keyPath.
	 * So ['a', 'b', 'c'] would be changed by a change to ['a'], ['a', 'b'] or ['a', 'b', 'c'].
	 * Note that it would also be changed by any deeper change, for example ['a', 'b', 'c', 'd'].
	 * Convert it to a set after the computation since we don't care about duplicates.
	 */
	const getChangedDependencies = (keyPath, dependencies) => {
		return dependencies.filter(path => {
			const compareLength = Math.min(path.size, keyPath.size);
			return Immutable.is(keyPath.slice(0, compareLength), path.slice(0, compareLength));
		}).toSet().flatten();
	};

	return Rx.Observable
		// Turn swap events on the global state into a stream, and put the arguments into a single object
		.fromEvent(getState(), "swap", ([ newState, oldState, keyPath ]) => ({ newState, oldState, keyPath }))

		// We only care about swaps where the keyPaths are in the dependency list, or the first call (when dependencies is still null)
		.filter(({ keyPath }) => dependencies === null || getChangedDependencies(Immutable.List(keyPath), dependencies).size > 0)

		// Run the function and pass the result on
		.map(runFunction);
};

export default streamify
