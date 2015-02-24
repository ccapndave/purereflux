"use strict";

var getState = require("./appState").getState;

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
  if (typeof dependency === "string") {
    // TODO: This needs to throw an exception if the path doesn't exist
    return getState().cursor(keyPathToKeyArray(dependency)).deref();
  } else if (typeof dependency === "function") {
    return dependency();
  } else {
    throw new Error("Illegal argument type for dependency: " + dependency);
  }
};

/**
 * Get a reference cursor for the given keyPath
 */
var reference = function (keyPath) {
  return getState().reference(keyPathToKeyArray(keyPath));
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