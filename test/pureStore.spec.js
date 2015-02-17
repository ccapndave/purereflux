import Reflux from 'reflux'
import should from 'should'

import * as PureReflux from '../index'

const initialState = {
    name: "Dave",
    feet: [ "left", "right" ],
    hair: {
        length: "short",
        colour: "black"
    }
};

describe("stores", () => {
	beforeEach(() => {
		PureReflux.clearState();

		const store = PureReflux.createStore('exerciseStore', {
			getInitialState() {
				return initialState;
			}
		});
	});

	it("should call the init method on creation if there is one", () => {
		let didCallInit = false;
		const initStore = PureReflux.createStore('initStore', {
			init() {
				didCallInit = true;
			}
		});
		didCallInit.should.be.True
	});

	it("should not throw an exception if getInitialState method is missing", () => {
		PureReflux.createStore('emptyStore', {});
	});

    it("should put their initial state into the global state under the store key", () => {
        let state = PureReflux.getCurrentState();
        state.toJS().should.eql({ exerciseStore: initialState });
    });
});

describe("store handlers", () => {
	let action1, action2, action3;

	beforeEach(() => {
		PureReflux.clearState();

		action1 = Reflux.createAction();
		action2 = Reflux.createAction();
		action3 = Reflux.createAction();
	});

	it("should fire on an action registered with listenTo", () => {
		let actionWasCalled = false;
		const store = PureReflux.createStore('exerciseStore', {
			init() {
				this.listenTo(action1, this.onAction1);
			},

			onAction1() {
				actionWasCalled = true;
			}
		});

		action1.trigger();

		actionWasCalled.should.be.True;
	});

	it("should pass arguments to the handler", () => {
		const store = PureReflux.createStore('exerciseStore', {
			init() {
				this.listenTo(action1, this.onAction1);
			},

			onAction1(a, b, c) {
				a.should.eql(1);
				b.should.eql(2);
				c.should.eql("a");
			}
		});

		action1.trigger(1, 2, "a");
	});

	it("should fire listeners with matching names using listenToMany", () => {
		let action1WasCalled = false, action2WasCalled = false, action3WasCalled = false;
		const store = PureReflux.createStore('exerciseStore', {
			init() {
				this.listenToMany({ action1, action2, action3 });
			},

			onAction1() {
				action1WasCalled = true;
			},

			onAction2() {
				action2WasCalled = true;
			},

			onWrongName() {
				action3WasCalled = true;
			}
		});

		action1.trigger();
		action2.trigger();
		action3.trigger();

		action1WasCalled.should.be.True;
		action2WasCalled.should.be.True;
		action3WasCalled.should.be.False;
	});

	it("should fire listeners with matching names using listenables", () => {
		let action1WasCalled = false, action2WasCalled = false, action3WasCalled = false;
		const store = PureReflux.createStore('exerciseStore', {
			listenables: { action1, action2, action3 },

			onAction1() {
				action1WasCalled = true;
			},

			onAction2() {
				action2WasCalled = true;
			},

			onWrongName() {
				action3WasCalled = true;
			}
		});

		action1.trigger();
		action2.trigger();
		action3.trigger();

		action1WasCalled.should.be.True;
		action2WasCalled.should.be.True;
		action3WasCalled.should.be.False;
	});

	it("should pass a reference cursor into handlers as their context", () => {
		let action1WasCalled = false;
		const store = PureReflux.createStore('exerciseStore', {
			listenables: { action1 },

			onAction1() {
				action1WasCalled = true;
				console.log(this);
			}
		});

		// Goddamn this is annoying...

		action1.trigger();
		action1WasCalled.should.be.True;
	});

});