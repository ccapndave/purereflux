"use strict";

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

exports.clearState = clearState;
exports.getState = getState;
exports.getCurrentState = getCurrentState;
exports.state = state;
Object.defineProperty(exports, "__esModule", {
	value: true
});

var immstruct = _interopRequire(require("immstruct"));

var Immutable = _interopRequire(require("immutable"));

// This is the global application state
var appState = createState(true);

// This is used to track dependencies
var isTracking = false,
    dependencies = undefined;

function onSwap() {
	if (typeof localStorage !== "undefined") localStorage.setItem("appState", JSON.stringify(getCurrentState().toJSON()));
}

// If there is a state in localStorage then use that, otherwise make a fresh one
function createState(useLocalStorage) {
	// Remove any swap listeners if they exist
	if (appState) appState.removeListener("swap", onSwap);

	// Create a state - either a fresh one, or a restoration from localStorage.appState
	var state = undefined;
	if (useLocalStorage && typeof localStorage !== "undefined" && localStorage.getItem("appState")) {
		var storedState = JSON.parse(localStorage.getItem("appState"));
		state = immstruct(Immutable.fromJS(storedState));
	} else {
		state = immstruct({});
	}

	// Add a swap listener
	state.on("swap", onSwap);
	return state;
}

function clearState() {
	appState = immstruct({});
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
	if (!Array.isArray(keyPath)) throw new Error("State paths must be given as an array");

	if (isTracking) dependencies = dependencies.add(Immutable.List(keyPath));
	return getState().cursor(keyPath).deref();
}

var _dependencyTracker = {

	start: function start() {
		isTracking = true;
		dependencies = Immutable.Set();
	},

	end: function end() {
		isTracking = false;
		return dependencies;
	}

};

exports._dependencyTracker = _dependencyTracker;

// For debugging in a browser
if (typeof window !== "undefined") {
	window.getState = getState;
	window.getCurrentState = getCurrentState;
	window.state = state;
}
//# sourceMappingURL=appState.js.map