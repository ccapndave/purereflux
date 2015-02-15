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

describe("stateBindings", () => {
    const store = PureReflux.createStore('exerciseStore', {
        getInitialState() {
            return initialState;
        }
    });

    const getHairColour = PureReflux.Getter('exerciseStore.hair.colour', colour => colour);

    const stateBindings = PureReflux.stateBindings({
        name: 'exerciseStore.name',
        hairLengthAndColour: PureReflux.Getter('exerciseStore.hair.length', getHairColour, (length, colour) => `I have ${length} ${colour} hair`),
        hairColour: getHairColour
    });

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

});