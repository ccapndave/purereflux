/*
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
		mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],
        getInitialState() {
            return initialState;
        }
    });

    getHairColour = PureReflux.Getter(function() { return this.colour; }).inject({ colour: 'exerciseStore.hair.colour' });

    stateBindings = PureReflux.stateBindings(() => ({
        name: 'exerciseStore.name',
        hairLengthAndColour: PureReflux.Getter(function() { return `I have ${this.length} ${this.colour} hair`; }).inject({ length: 'exerciseStore.hair.length', colour: getHairColour }),
        hairColour: getHairColour
    }));
});

describe("stateBindings", () => {

	it("should have the correct initial state (Immutable.js version of input)", () => {
		stateBindings.getInitialState();
		stateBindings.getInitialState().should.eql({
			name: "Dave",
			hairLengthAndColour: "I have short black hair",
			hairColour: "black"
		});
	});

    it("should call setState when a path updates", () => {
		stateBindings.getInitialState();
        stateBindings.componentDidMount();

        let stateWasChanged = false;

        stateBindings.setState = function(state) {
            state.should.eql({
                name: "John"
            });
            stateWasChanged = true;
        };

        PureReflux.getState().reference(["exerciseStore", "name"]).cursor().update(() => "John");

        stateWasChanged.should.be.True
    });

    it("should call multiple setStates when a path updates", () => {
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

        PureReflux.getState().reference(["exerciseStore", "hair", "colour"]).cursor().update(() => "white");

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

        PureReflux.getState().reference(["exerciseStore", "hair", "colour"]).cursor().update(() => "white");

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
			hair: 'immutableStore.hair'
		}));

		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		stateBindings.getInitialState().should.eql({ hair: initialState.get("hair") });
	});

	it("should not turn Immutable.js objects into real objects in setState", () => {
		stateBindings = PureReflux.stateBindings(() => ({
			name: 'exerciseStore.name',
			hair: 'exerciseStore.hair'
		}));

		stateBindings.getInitialState();
		stateBindings.componentDidMount();

		let stateWasChanged = false;

		stateBindings.setState = (state) => {
			stateWasChanged = true;

			// Check state is immutable
			// TODO: How to check if something is an Immutable.js structure?
		};

		PureReflux.getState().reference(["exerciseStore", "hair"]).cursor().update(() => "white");

		stateWasChanged.should.be.True
	});

});
*/
