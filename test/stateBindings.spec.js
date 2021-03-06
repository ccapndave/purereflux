/*
node-debug ./node_modules/mocha/bin/_mocha --compilers js:mocha-traceur ./test --ui bdd
*/

import should from 'should'
import Reflux from 'reflux'

import Immutable from 'immutable'

import * as PureReflux from '../index'

let initialState, store, getHairColour, stateBindings;

beforeEach(() => {
	PureReflux.clearState();

	initialState = {
		name: "Dave",
		feet: [ "left", "right" ],
		hair: {
			length: "short",
			colour: "black"
		}
	};

	store = Reflux.createStore({
		mixins: [ PureReflux.PureStoreMixin('store') ],
		getInitialState() {
			return initialState;
		}
	});

	getHairColour = () => PureReflux.state(['store', 'hair', 'colour']);

	stateBindings = PureReflux.stateBindings(() => ({
		name: ['store', 'name'],
		hairLengthAndColour: () => {
			const length = PureReflux.state(['store', 'hair', 'length']),
				  colour = getHairColour();

			return `I have ${length} ${colour} hair`;
		},
		hairColour: getHairColour
	}));

	stateBindings.setState = function(state) {};
});

afterEach(() => {
	stateBindings.componentWillUnmount();
});

describe("stateBindings", () => {

	it("should have the correct initial state (Immutable.js version of input)", () => {
		stateBindings.getInitialState().should.eql({
			name: "Dave",
			hairLengthAndColour: "I have short black hair",
			hairColour: "black"
		});
	});

	it("should call setState once when a single path updates", () => {
		let setStateCallCount = 0;
		stateBindings.setState = () => setStateCallCount++;

		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		PureReflux.getState().reference(['store', 'name']).cursor().update(() => "John");

		setStateCallCount.should.eql(1);
	});

	it("should call setState with the correctly changed state", () => {
		let stateWasChanged = false;
		stateBindings.setState = function(state) {
			state.should.eql({
				name: "John"
			});
			stateWasChanged = true;
		};

		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		PureReflux.getState().reference(['store', 'name']).cursor().update(() => "John");

		stateWasChanged.should.be.True
	});

	it("should updated multiple bindings (if appropriate) when a path updates", () => {
		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		let stateWasChanged = false;
		stateBindings.setState = (state) => {
			// Convert the Immutable.js structure to an object in order to compare it
			state.should.eql({
				hairColour: 'white',
				hairLengthAndColour: 'I have short white hair'
			});
			stateWasChanged = true;
		};

		PureReflux.getState().reference(['store', 'hair', 'colour']).cursor().update(() => "white");

		stateWasChanged.should.be.True
	});

	it("should update subpaths of bindings (if appropriate) when a parent path updates", () => {
		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		let stateWasChanged = false;
		stateBindings.setState = (state) => {
			// Convert the Immutable.js structure to an object in order to compare it
			state.should.eql({
				hairColour: 'yellow',
				hairLengthAndColour: 'I have crewcut yellow hair'
			});
			stateWasChanged = true;
		};

		PureReflux.getState().reference(['store', 'hair']).cursor().update(hair =>
			hair.merge({ colour: "yellow", length: "crewcut" })
		);

		stateWasChanged.should.be.True
	});

	it("should update parent paths of bindings (if appropriate) when a sub path updates", () => {
		// Create a different binding for this test
		const newStateBindings = PureReflux.stateBindings(() => ({
			hair: ['store', 'hair']
		}));

		newStateBindings.getInitialState();
		newStateBindings.componentDidMount();

		let stateWasChanged = false;
		newStateBindings.setState = (state) => {
			state.should.have.property("hair")
			state.hair.toJS().should.eql({
				length: "short",
				colour: "pink"
			});
			stateWasChanged = true;
		};

		PureReflux.getState().reference(['store', 'hair']).cursor().set('colour', 'pink');

		stateWasChanged.should.be.True
	});

	it("should remove listeners when the component is unmounted", () => {
		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		let stateWasChanged = false;
		stateBindings.setState = (state) => {
			stateWasChanged = true;
		};

		stateBindings.componentWillUnmount();

		PureReflux.getState().reference(['store', 'hair', 'colour']).cursor().update(() => "white");

		stateWasChanged.should.be.False
	});

	it("should work with Immutable.js structures in the state", () => {
		initialState = Immutable.fromJS(initialState);
		store = Reflux.createStore({
			mixins: [ PureReflux.PureStoreMixin('immutableStore') ],
			getInitialState() {
				return initialState;
			}
		});
		stateBindings = PureReflux.stateBindings(() => ({
			hair: ['immutableStore', 'hair']
		}));

		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		stateBindings.getInitialState().should.eql({ hair: initialState.get("hair") });
	});

	xit("should not turn Immutable.js objects into real objects in setState", () => {

	});

	xit("should be rerun when executeAllStateBindings is called", () => {

	});

});
