import Reflux from 'reflux'
import should from 'should'
import Immutable from 'immutable'
import { getCurrentState } from '../src/appState'

import * as PureReflux from '../index'

describe("the global state", () => {
	beforeEach(() => {
		PureReflux.clearState();
	});

	it("should serialize and deserialize Immutable.JS collections correctly", () => {
		const origState = Immutable.fromJS({
			"key1": {
				"key1.1": [ 1, 2, 3 ]
			}
		});

		origState.get("key1").should.be.instanceOf(Immutable.Map);
		origState.get("key1").get("key1.1").should.be.instanceOf(Immutable.List);

		const json = JSON.stringify(origState.toJS());

		const loadedState = Immutable.fromJS(JSON.parse(json));

		loadedState.get("key1").should.be.instanceOf(Immutable.Map);
		loadedState.get("key1").get("key1.1").should.be.instanceOf(Immutable.List);

		Immutable.is(origState, loadedState).should.be.True;
	});
});