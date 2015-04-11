'use strict';

var _core = require('babel-runtime/core-js')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_core.Object.defineProperty(exports, '__esModule', {
	value: true
});

var _Immutable = require('immutable');

var _Immutable2 = _interopRequireWildcard(_Immutable);

var _getState$_dependencyTracker = require('./appState');

var _dereference = require('./reference');

var promisify = function promisify(fn) {
	var timeout = arguments[1] === undefined ? 10 : arguments[1];

	return new _core.Promise(function (resolve, reject) {
		var tryToResolve = (function (_tryToResolve) {
			function tryToResolve() {
				return _tryToResolve.apply(this, arguments);
			}

			tryToResolve.toString = function () {
				return _tryToResolve.toString();
			};

			return tryToResolve;
		})(function () {
			// Run the function, watching any dependencies TODO: it might not be necessary to continuously re-run fn
			_getState$_dependencyTracker._dependencyTracker.start();

			var result = null;
			try {
				result = fn();
			} catch (e) {
				console.info('Ignoring exception in promisify: ' + e);
			}

			var dependencies = _getState$_dependencyTracker._dependencyTracker.end();
			console.log(dependencies.toJS());
			// If any dependencies are null then watch for the next change
			if (dependencies.some(function (dependency) {
				return _dereference.dereference(dependency.toArray()) == null;
			})) {
				_getState$_dependencyTracker.getState().once('swap', tryToResolve);
			} else {
				// Otherwise we can resolve the promise
				resolve(result);
			}
		});

		// If the timeout is exceeded without the promise resolving then remove the listener and reject the promise
		setTimeout(function () {
			_getState$_dependencyTracker.getState().removeListener('swap', tryToResolve);
			reject();
		}, timeout * 1000);

		tryToResolve();
	});
};

exports['default'] = promisify;
module.exports = exports['default'];
//# sourceMappingURL=promisify.js.map