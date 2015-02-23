"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _babelHelpers = require("babel-runtime/helpers")["default"];

var Immutable = _babelHelpers.interopRequire(require("immutable"));

var Reflux = _babelHelpers.interopRequire(require("reflux"));

var dereference = require("./reference").dereference;

var propertyBind = function propertyBind(context) {
	var _ref;

	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	var boundFn = (_ref = this).bind.apply(_ref, [context].concat(args));
	boundFn = _core.Object.assign(boundFn, this);
	return boundFn;
};

var getDependencies = function (dep) {
	return typeOf(dep) === "string" ? [dep] : dep.dependencies;
};

var provide = function provide(caller, deps) {
	var isArrayArg = Array.isArray(deps);

	// If we have passed a value instead of an array then wrap it in an array
	if (!isArrayArg) deps = [deps];

	// Resolve the dependencies
	var results = deps.map(dereference);

	// Set the dependencies on the calling function as a flat combination of dependencies + our keypaths
	var depsIterator = Immutable.fromJS(deps);
	caller.dependencies = depsIterator.filter(function (x) {
		return typeof x === "function";
	}).reduce(function (acc, dep) {
		return acc.add(dep.dependencies);
	}, depsIterator.filter(function (x) {
		return typeof x === "string";
	}).toSet()).flatten();

	// Return the result, unwrapping it if the original argument was not an array
	return isArrayArg ? results : results[0];
};

module.exports = provide;
//# sourceMappingURL=provide.js.map