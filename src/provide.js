import Immutable from 'immutable'
import Reflux from 'reflux'
import { dereference } from './reference'

const propertyBind = function(context, ...args) {
	let boundFn = this.bind(context, ...args);
	boundFn = Object.assign(boundFn, this);
	return boundFn;
};

const getDependencies = (dep) => typeOf(dep) === "string" ? [ dep ] : dep.dependencies;

const provide = function(caller, deps) {
	const isArrayArg = Array.isArray(deps);

	// If we have passed a value instead of an array then wrap it in an array
	if (!isArrayArg) deps = [ deps ];

	// Resolve the dependencies
	const results = deps.map(dereference);

	// Set the dependencies on the calling function as a flat combination of dependencies + our keypaths
	const depsIterator = Immutable.fromJS(deps);
	caller.dependencies = depsIterator
			.filter(x => typeof(x) === "function")
			.reduce((acc, dep) => acc.add(dep.dependencies)
	, depsIterator.filter(x => typeof(x) === "string").toSet()).flatten();

	// Return the result, unwrapping it if the original argument was not an array
	return isArrayArg ? results : results[0];
};

export default provide;