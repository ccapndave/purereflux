'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _core = require('babel-runtime/core-js')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_core.Object.defineProperty(exports, '__esModule', {
	value: true
});

var _Immutable = require('immutable');

var _Immutable2 = _interopRequireWildcard(_Immutable);

var _getState$_dependencyTracker = require('./appState');

var _dereference = require('./reference');

var _Rx = require('rx');

var _Rx2 = _interopRequireWildcard(_Rx);

var streamify = function streamify(fn) {
	var dependencies = null;

	/* Run the function, tracking the dependencies and returning the result */
	var runFunction = function runFunction() {
		_getState$_dependencyTracker._dependencyTracker.start();
		var result = null;
		try {
			result = fn();
		} catch (e) {
			console.info('Ignoring exception in promisify: ' + e);
		}
		dependencies = _getState$_dependencyTracker._dependencyTracker.end();
		return result;
	};

	/**
  * A binding is considered to have changed if its keyPath contains the swapped keyPath.
  * So ['a', 'b', 'c'] would be changed by a change to ['a'], ['a', 'b'] or ['a', 'b', 'c'].
  * Note that it would also be changed by any deeper change, for example ['a', 'b', 'c', 'd'].
  * Convert it to a set after the computation since we don't care about duplicates.
  */
	var getChangedDependencies = function getChangedDependencies(keyPath, dependencies) {
		return dependencies.filter(function (path) {
			var compareLength = Math.min(path.size, keyPath.size);
			return _Immutable2['default'].is(keyPath.slice(0, compareLength), path.slice(0, compareLength));
		}).toSet().flatten();
	};

	return _Rx2['default'].Observable
	// Turn swap events on the global state into a stream, and put the arguments into a single object
	.fromEvent(_getState$_dependencyTracker.getState(), 'swap', function (_ref) {
		var _ref2 = _slicedToArray(_ref, 3);

		var newState = _ref2[0];
		var oldState = _ref2[1];
		var keyPath = _ref2[2];
		return { newState: newState, oldState: oldState, keyPath: keyPath };
	})

	// We only care about swaps where the keyPaths are in the dependency list, or the first call (when dependencies is still null)
	.filter(function (_ref3) {
		var keyPath = _ref3.keyPath;
		return dependencies === null || getChangedDependencies(_Immutable2['default'].List(keyPath), dependencies).size > 0;
	})

	// Run the function and pass the result on
	.map(runFunction);
};

exports['default'] = streamify;
module.exports = exports['default'];
//# sourceMappingURL=streamify.js.map