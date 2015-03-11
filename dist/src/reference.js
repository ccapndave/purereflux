"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _appState = require("./appState");

var getState = _appState.getState;
var state = _appState.state;

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

exports.dereference = dereference;
exports.reference = reference;
//# sourceMappingURL=reference.js.map