import should from 'should'
import sinon from 'sinon'
import Reflux from 'reflux'

import Immutable from 'immutable'

import * as PureReflux from '../index'

function needsState() {
	const state1 = PureReflux.state(["state1"]);
	return state1;
};

describe("promisify", () => {
	beforeEach(() => {
		PureReflux.clearState();
	});

	it("should not resolve when dependencies are null", () => {
		const spy = sinon.spy();
		PureReflux.promisify(needsState).then(spy);

		spy.called.should.be.false;
	});

	it("should resolve instantly when dependencies are non-null", (done) => {
		PureReflux.getState().reference().cursor().set("state1", "something");
		
		PureReflux.promisify(needsState).then(state => {
			state.should.eql("something");
			done();
		});
	});

	it("should resolve when dependencies become non-null", (done) => {
		PureReflux.promisify(needsState).then(state => {
			state.should.eql("async");
			done();
		});

		setTimeout(() => PureReflux.getState().reference().cursor().set("state1", "async"), 100);
	});
});