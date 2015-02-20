import should from 'should'
import Reflux from 'reflux'
import { provide, bindParams, PureStoreMixin } from '../index'

let store, fn1, fn2, fn3, fn4, fn5;

describe("getter functions", () => {
	beforeEach(() => {
		store = Reflux.createStore({
			mixins: [ PureStoreMixin('provideStore') ],
			getInitialState() {
				return {
					a: 1,
					b: 2,
					c: 3
				};
			}
		});

		fn1 = function() {
			return provide(fn1, ["provideStore.a"]);
		};

		fn2 = function() {
			return provide(fn2, ["provideStore.b", fn1]);
		};

		fn3 = function() {
			return provide(fn3, ["provideStore.c", fn2, fn1]);
		};

		fn4 = function(arg1, arg2) {
			const deps = provide(fn4, ["provideStore.c", fn2, fn1]);
			return [ arg1, arg2 ];
		};

		fn5 = function(arg1, arg2) {
			const deps = provide(fn5, [bindParams(fn4, "nested1", "nested2")]);
			return [ arg1, arg2, deps ];
		};

	});

	it("should have no dependencies before they are run", () => {
		should.not.exist(fn3.dependencies);
		should.not.exist(fn2.dependencies);
		should.not.exist(fn1.dependencies);
	});

	it("should have correct dependencies after they are run", () => {
		fn3();

		should.exist(fn3.dependencies);
		should.exist(fn2.dependencies);
		should.exist(fn1.dependencies);

		fn1.dependencies.toJS().should.eql(["provideStore.a"]);
		fn2.dependencies.toJS().should.eql(["provideStore.b", "provideStore.a"]);
		fn3.dependencies.toJS().should.eql(["provideStore.c", "provideStore.b", "provideStore.a"]);

		fn1().should.eql([1]);
		fn2().should.eql([2, [1]]);
		fn3().should.eql([3, [2, [1]], [1]]);
	});

	it("should work with bindParams", () => {
		var newFunc = bindParams(fn4, "hello", "dave");

		var result = newFunc();

		result.should.eql([ "hello", "dave" ]);
		newFunc.dependencies.toJS().should.eql(["provideStore.c", "provideStore.b", "provideStore.a"]);
	});

	it("should work with nested bindParams", () => {
		var newFunc = bindParams(fn5, "top1", "top2");

		var result = newFunc();

		result.should.eql([ "top1", "top2", [ "nested1", "nested2" ]]);
	});

	it("should accept a non-array argument if there is just a single dependency", () => {
		const singleDepFn = function f() {
			return provide(fn4, "provideStore.a");
		};

		singleDepFn().should.eql(1);
	});

});