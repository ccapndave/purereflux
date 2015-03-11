import { getState, state } from './appState'

/**
 * Turn a path or function into a real value
 *
 * @param dependency
 * @returns {*}
 */
const dereference = (dependency) => {
	if (Array.isArray(dependency)) {
		return state(dependency);
	} else if (typeof(dependency) === "function") {
		return dependency();
	} else {
		throw new Error(`Illegal argument type for dependency (${typeof(dependency)}): ${dependency}`);
	}
};

/**
 * Get a reference cursor for the given keyPath
 */
const reference = (keyPath) => getState().reference(keyPath);

export { dereference, reference }