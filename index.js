import Reflux from 'reflux'
import Immutable from 'immutable'
import immstruct from 'immstruct'

// This is the global application state
let state = immstruct({});

const clearState = () => state = immstruct({});

const createStore = function(storeKey, definition) {
    // Start with a normal Reflux store
    //let store = Reflux.createStore({});

    let store = {};

    // Figure out the listeners

    // Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
    state.reference().cursor().update(() => Immutable.fromJS({ [storeKey]: definition.getInitialState() }));

    // Add the getters to the returned object as they can be accessed directly through the store singleton
    Object.assign(store, definition.getters);

    // Add the Reflux-style listener methods to the store
    Object.assign(store, {
        listenTo() {

        },

        listenToMany() {

        }
    });

    // Implement the listenables property
    /*if (this.listenables){
        arr = [].concat(this.listenables);
        for(;i < arr.length;i++){
            this.listenToMany(arr[i]);
        }
    }*/

    // Call init if it exists
    if (this.init && typeof(this.init) === "function")
        this.init();

    return store;
};

const getState = () => state;

const getCurrentState = () => state.current;

/**
 * Split a path up into an array that can be used with an immstruct cursor
 *
 * @param keyPath
 */
const keyPathToKeyArray = (keyPath) => keyPath.split(".");

/**
 * Turn a path or Getter into a real value
 *
 * @param pathOrGetter
 * @returns {*}
 */
const dereference = pathOrGetter => {
    if (typeof(pathOrGetter) === "string") {
        // TODO: This needs to throw an exception if the path doesn't exist
        return state.cursor(keyPathToKeyArray(pathOrGetter)).deref();
    } else if (typeof(pathOrGetter) === "function" && pathOrGetter.isPureFluxGetter) {
        return pathOrGetter();
    } else {
        throw new Error("Illegal argument type for this Getter");
    }
};

/**
 * A getter returns a function that can be called to get a value.  There are two forms of the Getter function:
 *
 * Getter(path): this returns a function that gets the value at path
 * Getter(path1, path2, function(valueAtPath1, valueAtPath2) { return value(); }): this returns a function that
 * gets the value returned by the function, with dependency injection for its parameters.  Note that path1 and
 * path2 can either be paths or other Getters.
 *
 * @returns {Function}
 * @constructor
 */
const GetterOLD = function(...args) {
    let resultFn, dependencies;

    if (args.length == 0) {
        throw new Error("A Getter needs at least one argument.");
    } else if (args.length == 1) {
        let keyPath = args[0];
        if (typeof(keyPath) !== "string") throw new Error("A single-argument Getter takes a string as its argument.");

        // Set the getter function and the single dependency
        resultFn = (() => dereference(keyPath));
        dependencies = [ keyPath ];
    } else {
        // Split the arguments into dependency injection and function
        let fn = args.pop(), pathsOrGetters = Immutable.List(args);
        if (typeof(fn) !== "function") throw new Error("A multi-argument Getter takes a function as its last argument.");

        // Construct the dependencies, ironing out any nested arrays (not sure why flatMap doesn't work here)
        dependencies = pathsOrGetters
            .map(pathOrGetter => typeof(pathOrGetter) === "string" ? pathOrGetter : Immutable.List(pathOrGetter.dependencies))
            .flatten()
            .toArray();

        // Finally return a function that calls fn with these arguments.  'this' inside getters is (currently) set to null to discourage us from trying to use it!
        resultFn = function() {
            // Go through each path/Getter resolving them into values
            let values = pathsOrGetters.map(dereference);

            // Add any extra arguments
            values = values.concat(Array.from(arguments));

            // And return a function with these values applied
            return fn.call(null, ...values);
        };
    }

    // This is so that we can identify something as a Getter
    resultFn.isPureFluxGetter = true;

    // Set the dependencies for observers TODO: this should really be an ES6 Set
    resultFn.dependencies = dependencies;

    // This is the chainable memoize function
    resultFn.memoize = memoize;

    return resultFn;
};

const Getter = function(fn) {
	let resultFn, dependencies;

	if (arguments.length !== 1)
		throw new Error("A Getter takes exactly one argument.");

	if (typeof(fn) === "string") {
		// If we are passed a single path then return a function that simply dereferences it
		resultFn = (() => dereference(fn));

		// Set the path as a dependency
		resultFn.dependencies = fn;
	} else if (typeof(fn) === "function") {
		// Otherwise we just want to call the function that was passed in, passing on any arguments and parent context (which can be changed by .inject).
		resultFn = (function() {
			return fn.apply(this, arguments);
		});
	} else {
		throw new Error("A Getter must take a path string or a function as its only argument.");
	}

	// This lets us identify something as a Getter
	resultFn.isPureFluxGetter = true;

	// This is the chainable injection function
	resultFn.inject = inject;

	// This is the chainable memoize function
	resultFn.memoize = memoize;

	return resultFn;
};

/**
 * @param deps An object containing a map of injection points to paths (string) and Getters
 *
 * @returns {inject}
 */
const inject = function(deps) {
	// The context is the Getter this is chained to
	let getter = this;

	// I want to return a new function that when called first retrieves the dependencies, then calls the original function
	// with those dependencies as its context.
	return function() {
		let context = Immutable.Map(deps).map(dereference).toJS();
		return getter.apply(context, arguments);
	};
}

/**
 * A React mixin to link state paths or Getters to a React state.
 *
 * @param bindingsObj
 * @returns {{getInitialState: Function, componentDidMount: Function, componentWillUnmount: Function}}
 */
const stateBindings = function(bindingsObj) {
    let unobservers = Immutable.List();

    const bindings = Immutable.Map(bindingsObj);

    return {
        getInitialState() {
            return bindings.map(dereference).toJS();
        },

        componentDidMount() {
            // This is a slightly confusing algorithm that gathers up the state properties that need to be updated per
            // path (so that we only need one observer per path).
            let pathsMap = bindings
                .map(binding => typeof(binding) === "string" ? [ binding ] : binding.dependencies)
                .reduce((acc, dependencies, stateProperty) => {
                    dependencies.forEach(dependency => {
                        let set = (acc.get(dependency) || Immutable.Set()).add(stateProperty);
                        acc = acc.set(dependency, set);
                    });
                    return acc;
                }, Immutable.Map());

            // Observe each of the keyPaths
            unobservers = pathsMap.map((stateProperties, keyPath) => {
                return state.reference(keyPathToKeyArray(keyPath)).observe(() => {
                    // I want to get a map of stateProperties to values to pass to setState
                    const newStates = stateProperties.reduce((acc, stateProperty) => {
                        return acc.set(stateProperty, dereference(bindings.get(stateProperty)))
                    }, Immutable.Map()).toJS();

                    this.setState(newStates);
                });
            }).toList();
        },

        componentWillUnmount() {
            unobservers.forEach(unobserver => unobserver());
        }
    };

};

const memoize = function(fn) {
    console.log(this);
};


export { createStore, Getter, stateBindings, clearState, getCurrentState, getState }