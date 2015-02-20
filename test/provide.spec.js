import should from 'should'
import Reflux from 'reflux'
import { provide, bindParams, PureStoreMixin } from '../index'

let store, fn1, fn2, fn3, fn4;

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
		}

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

		fn1().toJS().should.eql([1]);
		fn2().toJS().should.eql([2, [1]]);
		fn3().toJS().should.eql([3, [2, [1]], [1]]);
	});

	it("should work with bound arguments", () => {
		var newFunc = bindParams(fn4, "hello", "dave");

		var result = newFunc();

		console.dir(newFunc.dependencies);

		result.should.eql([ "hello", "dave" ]);
		newFunc.dependencies.toJS().should.eql(["provideStore.c", "provideStore.b", "provideStore.a"]);
	});

});