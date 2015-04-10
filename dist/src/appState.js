'use strict';

var _core = require('babel-runtime/core-js')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

_core.Object.defineProperty(exports, '__esModule', {
	value: true
});

exports.clearState = clearState;
exports.getState = getState;
exports.getCurrentState = getCurrentState;
exports.state = state;

var _immstruct = require('immstruct');

var _immstruct2 = _interopRequireWildcard(_immstruct);

var _Immutable = require('immutable');

var _Immutable2 = _interopRequireWildcard(_Immutable);

// This is the global application state
var appState = createState(false);

// This is used to track dependencies
var isTracking = false,
    dependencies = undefined;

function onSwap() {
	if (typeof localStorage !== 'undefined') localStorage.setItem('appState', JSON.stringify(getCurrentState().toJSON()));
}

// If there is a state in localStorage then use that, otherwise make a fresh one
function createState(useLocalStorage) {
	// Remove any swap listeners if they exist
	if (appState) appState.removeListener('swap', onSwap);

	// Create a state - either a fresh one, or a restoration from localStorage.appState
	var state = undefined;
	if (useLocalStorage && typeof localStorage !== 'undefined' && localStorage.getItem('appState')) {
		var storedState = JSON.parse(localStorage.getItem('appState'));
		state = _immstruct2['default'](_Immutable2['default'].fromJS(storedState));
	} else {
		state = _immstruct2['default']({});
	}

	// Add a swap listener
	state.on('swap', onSwap);
	return state;
}

function clearState() {
	appState = _immstruct2['default']({});
	isTracking = false;
	dependencies = null;
}

function getState() {
	return appState;
}

function getCurrentState() {
	return appState.current;
}

function state(keyPath) {
	if (!_core.Array.isArray(keyPath)) throw new Error('State paths must be given as an array');

	if (isTracking) dependencies = dependencies.add(_Immutable2['default'].List(keyPath));
	return getState().cursor(keyPath).deref();
}

var _dependencyTracker = {

	start: function start() {
		isTracking = true;
		dependencies = _Immutable2['default'].Set();
	},

	end: function end() {
		isTracking = false;
		return dependencies;
	}

};

exports._dependencyTracker = _dependencyTracker;

// For debugging in a browser
if (typeof window !== 'undefined') {
	window.getState = getState;
	window.getCurrentState = getCurrentState;
	window.state = state;
}
//# sourceMappingURL=appState.js.map