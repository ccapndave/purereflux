import Reflux from 'reflux'
import should from 'should'
import Immutable from 'immutable'
import { getCurrentState } from '../src/appState'

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

		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],
			getInitialState() {
				return initialState;
			}
		});
	});

	it("should call the init method on creation if there is one", () => {
		let didCallInit = false;
		const initStore = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('initStore') ],
			init() {
				didCallInit = true;
			}
		});
		didCallInit.should.be.True
	});

	it("should not throw an exception if getInitialState method is missing", () => {
		Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('emptyStore') ]
		});
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
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

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
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

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
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

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
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

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

	it("should pass a reference cursor pointing at the store state to handlers", () => {
		let action1WasCalled = false;
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1 },

			getInitialState() {
				return initialState;
			},

			onAction1() {
				action1WasCalled = true;
				should.equal(Immutable.is(this.cursor().deref(), getCurrentState().get("exerciseStore")), true);
			}
		});

		action1.trigger();
		action1WasCalled.should.be.True;
	});

	it("should expose a shorthand get methods on handlers", () => {
		let action1WasCalled = false;
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1 },

			getInitialState() {
				return initialState;
			},

			onAction1() {
				action1WasCalled = true;
				this.get("name").should.eql("Dave");
			}
		});

		action1.trigger();
		action1WasCalled.should.be.True;
	});

	it("should expose a shorthand 'set' method on handlers which sets a value on the state", () => {
		let action1WasCalled = false;
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1 },

			getInitialState() {
				return initialState;
			},

			onAction1() {
				action1WasCalled = true;
				this.set("name", "Peter");
				this.get("name").should.equal("Peter");
				getCurrentState().get("exerciseStore").get("name").should.equal("Peter");
			}
		});

		action1.trigger();
		action1WasCalled.should.be.True;
	});

	it("should expose a shorthand 'update' method on handlers which updates the state", () => {
		let action1WasCalled = false;
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1 },

			getInitialState() {
				return initialState;
			},

			onAction1() {
				action1WasCalled = true;

				const newState = { a: 1 };

				this.update(() => Immutable.Map(newState));
				this.get("a").should.equal(1);
				getCurrentState().get("exerciseStore").get("a").should.equal(1);
			}
		});

		action1.trigger();
		action1WasCalled.should.be.True;
	});

	it("should have a working get() shortcut in handlers", () => {
		// TODO
	});

	it("should have a working set() shortcut in handlers", () => {
		// TODO
	});

	it("should have a working update() shortcut in handlers", () => {
		// TODO
	});

	it("should have a working resetToInitialState() shortcut in handlers", () => {
		// TODO
	});

});