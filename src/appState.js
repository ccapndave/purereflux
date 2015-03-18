import immstruct from 'immstruct'
import Immutable from 'immutable'

// This is the global application state
let appState = createState(true);

// This is used to track dependencies
let isTracking = false, dependencies;

function onSwap() {
	if (typeof localStorage !== "undefined") localStorage.setItem("appState", JSON.stringify(getCurrentState().toJSON()))
}

// If there is a state in localStorage then use that, otherwise make a fresh one
function createState(useLocalStorage) {
	// Remove any swap listeners if they exist
	if (appState) appState.removeListener("swap", onSwap);

	// Create a state - either a fresh one, or a restoration from localStorage.appState
	let state;
	if (useLocalStorage && typeof localStorage !== "undefined" && localStorage.getItem("appState")) {
		const storedState = JSON.parse(localStorage.getItem("appState"));
		state = immstruct(Immutable.fromJS(storedState));
	} else {
		state = immstruct({});
	}

	// Add a swap listener
	state.on("swap", onSwap);
	return state;
}

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
	window.getState = getState;
	window.getCurrentState = getCurrentState;
	window.state = state;
}