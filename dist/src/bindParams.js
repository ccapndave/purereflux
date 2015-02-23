"use strict";

var _core = require("babel-runtime/core-js")["default"];

var bindParams = function bindParams(fn) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	var boundFn = (function (_boundFn) {
		var _boundFnWrapper = function boundFn() {
			return _boundFn.apply(this, arguments);
		};

		_boundFnWrapper.toString = function () {
			return _boundFn.toString();
		};

		return _boundFnWrapper;
	})(function () {
		// Call the function
		var result = fn.call.apply(fn, [fn].concat(args));

		// At this point the dependencies are available so copy them (in fact copy every property)
		_core.Object.assign(boundFn, fn);

		return result;
	});

	return boundFn;
};

module.exports = bindParams;
//# sourceMappingURL=bindParams.js.map