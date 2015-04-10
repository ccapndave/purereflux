"use strict";

var _core = require("babel-runtime/core-js")["default"];

_core.Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getState$state = require("./appState");

/**
 * Turn a path or function into a real value
 *
 * @param dependency
 * @returns {*}
 */
var dereference = function dereference(dependency) {
  if (_core.Array.isArray(dependency)) {
    return _getState$state.state(dependency);
  } else if (typeof dependency === "function") {
    return dependency();
  } else {
    throw new Error("Illegal argument type for dependency (" + typeof dependency + "): " + dependency);
  }
};

/**
 * Get a reference cursor for the given keyPath
 */
var reference = function reference(keyPath) {
  return _getState$state.getState().reference(keyPath);
};

exports.dereference = dereference;
exports.reference = reference;
//# sourceMappingURL=reference.js.map