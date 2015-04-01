import Reflux from 'reflux'
import should from 'should'
import sinon from 'sinon'
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

		Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],
			getInitialState: () => initialState
		});
	});

	it("should call the init method on creation if there is one", () => {
		const
			init = sinon.spy(),
			initDef = {
				mixins: [ PureReflux.PureStoreMixin('initStore') ],
				init
			};

		Reflux.createStore(initDef);

		init.called.should.be.true;
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

	xit("shouldn't put initial state into the global state if it already exists", () => {

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
		const onAction1 = sinon.spy();
		Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			init() {
				this.listenTo(action1, this.onAction1);
			},

			onAction1
		});

		action1.trigger();

		onAction1.called.should.be.true;
	});

	it("should pass arguments to the handler", () => {
		const onAction1 = sinon.spy();
		Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			init() {
				this.listenTo(action1, this.onAction1);
			},

			onAction1
		});

		action1.trigger(1, 2, "a");

		onAction1.args[0][0].should.eql(1);
		onAction1.args[0][1].should.eql(2);
		onAction1.args[0][2].should.eql("a");
	});

	it("should fire listeners with matching names using listenToMany", () => {
		let onAction1 = sinon.spy(), onAction2 = sinon.spy(), onWrongName = sinon.spy();
		Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			init() {
				this.listenToMany({ action1, action2, action3 });
			},

			onAction1,
			onAction2,
			onWrongName
		});

		action1.trigger();
		action2.trigger();
		action3.trigger();

		onAction1.called.should.be.true;
		onAction2.called.should.be.true;
		onWrongName.called.should.be.false;
	});

	it("should fire listeners with matching names using listenables", () => {
		let onAction1 = sinon.spy(), onAction2 = sinon.spy(), onWrongName = sinon.spy();
		Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1, action2, action3 },

			onAction1,
			onAction2,
			onWrongName
		});

		action1.trigger();
		action2.trigger();
		action3.trigger();

		onAction1.called.should.be.true;
		onAction2.called.should.be.true;
		onWrongName.called.should.be.false;
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
		action1WasCalled.should.be.true;
	});

	it("should expose a shorthand get methods on handlers that takes a string key", () => {
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

	it("should expose a shorthand get methods that takes an array keyPath", () => {
		let action1WasCalled = false;
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1 },

			getInitialState() {
				return initialState;
			},

			onAction1() {
				action1WasCalled = true;
				this.get(["hair", "length"]).should.eql("short");
			}
		});

		action1.trigger();
		action1WasCalled.should.be.True;
	});

	it("should expose a shorthand 'set' method on handlers which takes a string and sets a value on the state", () => {
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

	it("should expose a shorthand 'set' method on handlers which takes an array keyPath and sets a value on the state", () => {
		let action1WasCalled = false;
		const store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],

			listenables: { action1 },

			getInitialState() {
				return initialState;
			},

			onAction1() {
				action1WasCalled = true;
				this.set(["hair", "length"], "wiggly");
				this.get(["hair", "length"]).should.equal("wiggly");
				getCurrentState().get("exerciseStore").get("hair").get("length").should.equal("wiggly");
			}
		});

		action1.trigger();
		action1WasCalled.should.be.True;
	});

	xit("should expose a chainable 'set' method");

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

	xit("should expose a shorthand 'update' method on handlers which accepts a string key and a function");
	xit("should expose a shorthand 'update' method on handlers which accepts an array keypath and a function");
	xit("should expose a chainable 'update' method");
});