import Immutable from 'immutable'
import Reflux from 'reflux'
import { dereference } from './reference'

const propertyBind = function(context, ...args) {
	let boundFn = this.bind(context, ...args); // TODO: is this right?
	boundFn = Object.assign(boundFn, this);
	return boundFn;
};

const getDependencies = (dep) => typeOf(dep) === "string" ? [ dep ] : dep.dependencies;

const provide = function(caller, deps) {
	const depsIterator = Immutable.fromJS(deps);

	// Get the results
	const results = depsIterator.map(dereference);

	// Set the dependencies on the calling function as a flat combination of dependencies + our keypaths
	caller.dependencies = depsIterator
			.filter(x => typeof(x) === "function")
			.reduce((acc, dep) => acc.add(dep.dependencies)
	, depsIterator.filter(x => typeof(x) === "string").toSet()).flatten();

	// Return the result
	return results;
};

export default provide;