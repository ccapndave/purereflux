import { getState } from '../index'

/**
 * Split a path up into an array that can be used with an immstruct cursor
 *
 * @param keyPath
 */
const keyPathToKeyArray = (keyPath) => keyPath ? keyPath.split(".") : null;

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

const dereference = (dependency) => {
	if (typeof(dependency) === "string") {
		// TODO: This needs to throw an exception if the path doesn't exist
		return getState().cursor(keyPathToKeyArray(dependency)).deref();
	} else if (typeof(dependency) === "function") {
		return dependency();
	} else {
		throw new Error("Illegal argument type for dependency: " + dependency);
	}
};

/**
 * Get a reference cursor for the given keyPath
 */
const reference = (keyPath) => getState().reference(keyPathToKeyArray(keyPath));

/**
 * Get a cursor for the given keyPath
 */
const cursor = (keyPath) => getState().cursor(keyPathToKeyArray(keyPath));

export { dereference, reference, cursor }