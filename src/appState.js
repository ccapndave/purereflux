import immstruct from 'immstruct'

// This is the global application state
let state = immstruct({});

export function clearState() {
	state = immstruct({})
}

export function getState() {
	return state;
}

export function getCurrentState() {
	return state.current;
}