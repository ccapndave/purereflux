"use strict";

var _appState = require("./appState");

var getState = _appState.getState;
var state = _appState.state;

/**
 * Split a path up into an array that can be used with an immstruct cursor
 *
 * @param keyPath
 */
var keyPathToKeyArray = function (keyPath) {
  return keyPath ? keyPath.split(".") : null;
};

/**
 * Turn a path or function into a real value
 *
 * @param dependency
 * @returns {*}
 */
var dereference = function (dependency) {
  if (Array.isArray(dependency)) {
    return state(dependency);
  } else if (typeof dependency === "function") {
    return dependency();
  } else {
    throw new Error("Illegal argument type for dependency (" + typeof dependency + "): " + dependency);
  }
};

/**
 * Get a reference cursor for the given keyPath
 */
var reference = function (keyPath) {
  return getState().reference(keyPath);
};

/**
 * Get a cursor for the given keyPath
 */
var cursor = function (keyPath) {
  return getState().cursor(keyPathToKeyArray(keyPath));
};

exports.dereference = dereference;
exports.reference = reference;
exports.cursor = cursor;
Object.defineProperty(exports, "__esModule", {
  value: true
});
//# sourceMappingURL=reference.js.map