import Immutable from 'immutable'
import { dereference } from './reference'

/**
 * A Getter returns a function that can be invoked to get a value.  There are two forms of the Getter function:
 *
 * Getter(path): this returns a function that gets the value at path
 * Getter(function() { return value; }): this returns a function that gets the value returned by the function.
 *
 * @returns {Function}
 * @constructor
 */
const Getter = function(fn) {
	let resultFn;

	if (arguments.length !== 1)
		throw new Error("A Getter takes exactly one argument.");

	if (typeof(fn) === "string") {
		// If we are passed a single path then return a function that simply dereferences it
		resultFn = (() => dereference(fn));

		// Set the path as a dependency
		resultFn.dependencies = [ fn ];
	} else if (typeof(fn) === "function") {
		// Otherwise we just want to call the function that was passed in, passing on any arguments and parent context (which can be changed by .inject).
		resultFn = (function() {
			const args = Array.from(arguments);
			if (args.length > 0) {
				// If arguments are passed in we need to return a new getter pre-bound to the given arguments
				return Getter(fn.bind(this, ...args));
			} else {
				return fn.apply(this);
			}
		});
	} else {
		throw new Error("A Getter must take a path string or a function as its only argument.");
	}

	// This lets us identify something as a Getter
	resultFn.isPureFluxGetter = true;

	// This is the chainable injection function
	resultFn.inject = inject;

	// This is the chainable memoize function
	resultFn.memoize = memoize;

	return resultFn;
};

/**
 * This can be chained onto a Getter in order to provide dependency injection into its context.
 *
 * @param deps An object containing a map of injection points to paths (string) and Getters
 * @returns {inject}
 */
const inject = function(deps) {
	// The context is the Getter this is chained to
	let getter = this;
	deps = Immutable.Map(deps);

	// I want to return a new function that when called first retrieves the dependencies, then calls the original function
	// with those dependencies as its context.
	let newGetter = function() {
		let context = deps.map(dereference).toObject();
		return getter.apply(context, arguments);
	};

	// Copy over the properties
	Object.assign(newGetter, getter);

	// Update the dependencies
	newGetter.dependencies = deps.map(dep => typeof(dep) === "string" ? dep : Immutable.List(dep.dependencies))
			.flatten()
			.toArray();

	return newGetter;
};

const memoize = function() {
	return this;
};

export default Getter