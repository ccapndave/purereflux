import should from 'should'

import * as PureReflux from '../index'

let initialState, store, getHairColour, stateBindings;

/*
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

    store = PureReflux.createStore('exerciseStore', {
        getInitialState() {
            return initialState;
        }
    });

    getHairColour = PureReflux.Getter(() => this.colour).inject({ colour: 'exerciseStore.hair.colour' });

    stateBindings = PureReflux.stateBindings({
        name: 'exerciseStore.name',
        hairLengthAndColour: PureReflux.Getter(() => `I have ${this.length} ${this.colour} hair`).inject({ length: 'exerciseStore.hair.length', colour: getHairColour }),
        hairColour: getHairColour
    });
});

describe("stateBindings", () => {

    it("should have the correct initial state", () => {
        stateBindings.getInitialState().should.eql({
            name: "Dave",
            hairLengthAndColour: "I have short black hair",
            hairColour: "black"
        });
    });

    it("should call setState when a path updates", () => {
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
        stateBindings.componentDidMount();

        let stateWasChanged = false;

        stateBindings.setState = (state) => {
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
        stateBindings.componentDidMount();

        let stateWasChanged = false;

        stateBindings.setState = (state) => {
            stateWasChanged = true;
        };

        stateBindings.componentWillUnmount();

        PureReflux.getState().reference(["exerciseStore", "hair", "colour"]).cursor().update(() => "white");

        stateWasChanged.should.be.False
    });

});
*/
