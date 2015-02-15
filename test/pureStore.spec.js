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

describe("createPureStore", () => {
    const store = PureReflux.createStore('exerciseStore', {
        getInitialState() {
            return initialState;
        }
    });

    it("should put its initial state into the global state under the store key", () => {
        let state = PureReflux.getCurrentState();
        state.toJS().should.eql({ exerciseStore: initialState });
    });
});
