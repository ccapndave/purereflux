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

describe("getters", () => {
    const store = PureReflux.createStore('exerciseStore', {
        getInitialState() {
            return initialState;
        }
    });

    it("should not allow illegal arguments", () => {
        (() => PureReflux.Getter()).should.throw();
        (() => PureReflux.Getter(100)).should.throw();
        (() => PureReflux.Getter(["arrays", "are", "not", "allowed"])).should.throw();
        (() => PureReflux.Getter("the second argument", "should be a function")).should.throw();
        (() => PureReflux.Getter(["arrays", "are", "not", "allowed"], () => {})).should.throw();
    });

    it("should retrieve the property from the global state", () => {
        PureReflux.Getter('exerciseStore.name')().should.equal("Dave");
        PureReflux.Getter('exerciseStore.hair.length')().should.equal("short");
    });

    it("should run their function", () => {
        // First check it actually runs the function
        let functionWasRun = false;
        PureReflux.Getter('exerciseStore.name', name => { functionWasRun = true; })();
        functionWasRun.should.be.True
    });

    it("should do path dependency injection into the function", () => {
        PureReflux.Getter('exerciseStore.name', name => name.should.equal("Dave"))();
        PureReflux.Getter('exerciseStore.name', 'exerciseStore.hair.length', (name, hairLength) => {
            name.should.equal("Dave");
            hairLength.should.equal("short");
        })();
    });

    it("should do Getter dependency injection into the function", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        PureReflux.Getter(getName, name => name.should.equal("Dave"))();
    });

    it("should have this=null inside their functions", () => {
        PureReflux.Getter('exerciseStore.name', function(name) { should.equal(this, null); })();
    });

    it("should have a valid dependency property for a single path", () => {
        PureReflux.Getter('exerciseStore.name').dependencies.should.eql(['exerciseStore.name']);
    });

    it("should have a valid dependency property for a multiple paths", () => {
        PureReflux.Getter('exerciseStore.name', 'exerciseStore.hair.length', () => {}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length']);
    });

    it("should have valid dependency properties for one level of composed getters", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        PureReflux.Getter(getName, 'exerciseStore.hair.length', () => {}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length']);
    });

    it("should have valid dependency properties for two levels of composed getters", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        const getNameAndHairLength = PureReflux.Getter(getName, 'exerciseStore.hair.length', () => {});

        PureReflux.Getter(getNameAndHairLength, 'exerciseStore.hair.colour', () => {}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length', 'exerciseStore.hair.colour']);
    });

    // TODO: Arrays don't seem to be working - add tests

/*    it("should throw an exception if trying to get a non-existent property", () => {
        (() => PureReflux.Getter('exerciseStore.does.not.exist')).should.throw();
    });*/
});
