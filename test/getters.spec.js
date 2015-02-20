/*
import should from 'should'
import Reflux from 'reflux'

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
    const store = Reflux.createStore({
		mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],
        getInitialState() {
            return initialState;
        }
    });

    it("should not allow illegal arguments", () => {
        (() => PureReflux.Getter()).should.throw();
        (() => PureReflux.Getter(100)).should.throw();
        (() => PureReflux.Getter(["arrays", "are", "not", "allowed"])).should.throw();
    });


    it("should retrieve the property from the global state", () => {
        PureReflux.Getter('exerciseStore.name')().should.equal("Dave");
        PureReflux.Getter('exerciseStore.hair.length')().should.equal("short");
    });


    it("should run their function", () => {
        // First check it actually runs the function
        let functionWasRun = false;
        PureReflux.Getter(() => { functionWasRun = true; }).inject({ name: 'exerciseStore.name' })();
        functionWasRun.should.be.True
    });

    it("should do path dependency injection into the function", () => {
        PureReflux.Getter(function() {
			return this.name.should.equal("Dave")
		}).inject({ name: 'exerciseStore.name' })();

        PureReflux.Getter(function() {
            this.name.should.equal("Dave");
            this.hairLength.should.equal("short");
        }).inject({ name: 'exerciseStore.name', hairLength: 'exerciseStore.hair.length' })();
    });

    it("should do Getter dependency injection into the function", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        PureReflux.Getter(function() { return this.name.should.equal("Dave"); }).inject({ name: getName })();
    });

    it("should have a valid dependency property for a single path", () => {
        PureReflux.Getter('exerciseStore.name').dependencies.should.eql(['exerciseStore.name']);
    });

    it("should have a valid dependency property for a multiple paths", () => {
        PureReflux.Getter(function() {}).inject({ name: 'exerciseStore.name', hairLength: 'exerciseStore.hair.length'}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length']);
    });

    it("should have valid dependency properties for one level of composed getters", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        PureReflux.Getter(function() { }).inject({ name: getName, hairLength: 'exerciseStore.hair.length'}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length']);
    });

    it("should have valid dependency properties for two levels of composed getters", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        const getNameAndHairLength = PureReflux.Getter(function() {}).inject({ name: getName, hairColour: 'exerciseStore.hair.length' });

        PureReflux.Getter(function() { }).inject({ nameAndHairLength: getNameAndHairLength, hairColour: 'exerciseStore.hair.colour' }).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length', 'exerciseStore.hair.colour']);
    });

	it("should allow multiple injects to be chained together", () => {
		// TODO
	});

	it("should return a new callable getter if called with arguments", () => {
		let functionWasRun = false;
		const newGetter = PureReflux.Getter((a, b) => {
			functionWasRun = true;

			a.should.eql(1);
			b.should.eql(2);
		})(1, 2);

		should.exist(newGetter);
		newGetter.isPureFluxGetter.should.be.True

		newGetter();
		functionWasRun.should.be.True
	});

	it("should work with Immutablejs structures as data", () => {
		// TODO
	});

	it("should work with arrays in the state", () => {
		// TODO
	});

    // TODO: Arrays don't seem to be working - add tests
*/
/*    it("should throw an exception if trying to get a non-existent property", () => {
        (() => PureReflux.Getter('exerciseStore.does.not.exist')).should.throw();
    });*//*

});
*/
/*
import should from 'should'
import Reflux from 'reflux'

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
    const store = Reflux.createStore({
		mixins: [ PureReflux.PureStoreMixin('exerciseStore') ],
        getInitialState() {
            return initialState;
        }
    });

    it("should not allow illegal arguments", () => {
        (() => PureReflux.Getter()).should.throw();
        (() => PureReflux.Getter(100)).should.throw();
        (() => PureReflux.Getter(["arrays", "are", "not", "allowed"])).should.throw();
    });


    it("should retrieve the property from the global state", () => {
        PureReflux.Getter('exerciseStore.name')().should.equal("Dave");
        PureReflux.Getter('exerciseStore.hair.length')().should.equal("short");
    });


    it("should run their function", () => {
        // First check it actually runs the function
        let functionWasRun = false;
        PureReflux.Getter(() => { functionWasRun = true; }).inject({ name: 'exerciseStore.name' })();
        functionWasRun.should.be.True
    });

    it("should do path dependency injection into the function", () => {
        PureReflux.Getter(function() {
			return this.name.should.equal("Dave")
		}).inject({ name: 'exerciseStore.name' })();

        PureReflux.Getter(function() {
            this.name.should.equal("Dave");
            this.hairLength.should.equal("short");
        }).inject({ name: 'exerciseStore.name', hairLength: 'exerciseStore.hair.length' })();
    });

    it("should do Getter dependency injection into the function", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        PureReflux.Getter(function() { return this.name.should.equal("Dave"); }).inject({ name: getName })();
    });

    it("should have a valid dependency property for a single path", () => {
        PureReflux.Getter('exerciseStore.name').dependencies.should.eql(['exerciseStore.name']);
    });

    it("should have a valid dependency property for a multiple paths", () => {
        PureReflux.Getter(function() {}).inject({ name: 'exerciseStore.name', hairLength: 'exerciseStore.hair.length'}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length']);
    });

    it("should have valid dependency properties for one level of composed getters", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        PureReflux.Getter(function() { }).inject({ name: getName, hairLength: 'exerciseStore.hair.length'}).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length']);
    });

    it("should have valid dependency properties for two levels of composed getters", () => {
        const getName = PureReflux.Getter('exerciseStore.name');
        const getNameAndHairLength = PureReflux.Getter(function() {}).inject({ name: getName, hairColour: 'exerciseStore.hair.length' });

        PureReflux.Getter(function() { }).inject({ nameAndHairLength: getNameAndHairLength, hairColour: 'exerciseStore.hair.colour' }).dependencies.should.eql(['exerciseStore.name', 'exerciseStore.hair.length', 'exerciseStore.hair.colour']);
    });

	it("should allow multiple injects to be chained together", () => {
		// TODO
	});

	it("should return a new callable getter if called with arguments", () => {
		let functionWasRun = false;
		const newGetter = PureReflux.Getter((a, b) => {
			functionWasRun = true;

			a.should.eql(1);
			b.should.eql(2);
		})(1, 2);

		should.exist(newGetter);
		newGetter.isPureFluxGetter.should.be.True

		newGetter();
		functionWasRun.should.be.True
	});

	it("should work with Immutablejs structures as data", () => {
		// TODO
	});

	it("should work with arrays in the state", () => {
		// TODO
	});

    // TODO: Arrays don't seem to be working - add tests
*/
/*    it("should throw an exception if trying to get a non-existent property", () => {
        (() => PureReflux.Getter('exerciseStore.does.not.exist')).should.throw();
    });*//*

});
*/
