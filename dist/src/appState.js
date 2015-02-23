"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

exports.clearState = clearState;
exports.getState = getState;
exports.getCurrentState = getCurrentState;

var immstruct = _babelHelpers.interopRequire(require("immstruct"));

// This is the global application state
var state = immstruct({});

function clearState() {
	state = immstruct({});
}

function getState() {
	return state;
}

function getCurrentState() {
	return state.current;
}
Object.defineProperty(exports, "__esModule", {
	value: true
});
//# sourceMappingURL=appState.js.map