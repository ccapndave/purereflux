import Immutable from 'immutable'
import { getState, _dependencyTracker } from './appState'
import { dereference } from './reference'

const promisify = function(fn, timeout = 10) {
	return new Promise(function(resolve, reject) {
		const tryToResolve = () => {
			// Run the function, watching any dependencies TODO: it might not be necessary to continuously re-run fn
			_dependencyTracker.start();
			const result = fn();
			const dependencies = _dependencyTracker.end();

			// If any dependencies are null then watch for the next change
			if (dependencies.some(dependency => dereference(dependency.toArray()) == null)) {
				getState().once("swap", tryToResolve);
			} else {
				// Otherwise we can resolve the promise
				resolve(result);
			}
		};

		// If the timeout is exceeded without the promise resolving then remove the listener and reject the promise
		setTimeout(() => {
			getState().removeListener("swap", tryToResolve);
			reject();
		}, timeout * 1000);

		tryToResolve();
	});
};

export default promisify
