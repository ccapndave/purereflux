import immstruct from 'immstruct'
import Immutable from 'immutable'

// This is the global application state
let appState = immstruct({});

// This is used to track dependencies
let isTracking = false, dependencies;

export function clearState() {
	appState = immstruct({})
	isTracking = false;
	dependencies = null;
}

export function getState() {
	return appState;
}

export function getCurrentState() {
	return appState.current;
}

export function state(keyPath) {
	if (!Array.isArray(keyPath))
		throw new Error("State paths must be given as an array");

	if (isTracking) dependencies = dependencies.add(Immutable.List(keyPath));
	return getState().cursor(keyPath).deref();
}

const _dependencyTracker = {

	start() {
		isTracking = true;
		dependencies = Immutable.Set();
	},

	end() {
		isTracking = false;
		return dependencies;
	}

};

export { _dependencyTracker };

// For debugging in a browser
if (typeof window !== "undefined") {
	setInterval(() => {
		localStorage.setItem("appState", JSON.stringify(getCurrentState().toJSON()))
	}, 2000);
	window.getState = getState;
	window.getCurrentState = getCurrentState;
	window.state = state;
}