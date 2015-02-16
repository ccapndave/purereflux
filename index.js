import Reflux from 'reflux'
import Immutable from 'immutable'
import immstruct from 'immstruct'

// This is the global application state
let state = immstruct({});

const clearState = () => state = immstruct({});

const getMatchingHandler = function(store, action) {
	return null;
};

const createStore = function(storeKey, definition) {
    // Start with a normal Reflux store
    //let store = Reflux.createStore({});

    //let store = {};

	// If no initial state is defined set it to an empty object
	if (!definition.getInitialState) definition.getInitialState = () => {};

    // Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
    state.reference().cursor().update(() => Immutable.fromJS({ [storeKey]: definition.getInitialState() }));

    // Add the Reflux-style listener methods to the store API

	// First put all the handlers into the store
	let store = bindHandlers({}, definition);

	// Then add the listener methods
    store = Object.assign(store, {
        listenTo(action, handler) {
			if (arguments.length !== 2)
				throw new Error("listenTo must be called with exactly two arguments");

			if (!action._isAction)
				throw new Error("The first argument of listenTo must be an action");

			action.listen(handler);
        },

        listenToMany(actions) {
			// Go through the actions
			// For each action see if there is a matching listener method
			// If there is then add a listener to it
			actions.map(getMatchingHandler).filter(x => x !== null).forEach((action) => {
				console.log(action);
			});
        }
    });

    // Implement the listenables property
    /*if (this.listenables){
        arr = [].concat(this.listenables);
        for(;i < arr.length;i++){
            this.listenToMany(arr[i]);
        }
    }*/

    // Call init if it exists.  Give it the store as a context.
    if (definition.init && typeof(definition.init) === "function")
		definition.init.call(store);

    return store;
};

const getState = () => state;

const getCurrentState = () => state.current;

const bindHandlers = function(store, definition) {
	for (var name in definition) {
		// Don't copy getInitialState or init (everything else is a handler)
		if (name == "getInitialState" || name == "init") continue;

		if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
			var propertyDescriptor = Object.getOwnPropertyDescriptor(definition, name);
			if (!propertyDescriptor.value || typeof propertyDescriptor.value !== 'function' || !definition.hasOwnProperty(name)) continue;
			store[name] = definition[name].bind(store);
		} else {
			var property = definition[name];
			if (typeof property !== 'function' || !definition.hasOwnProperty(name)) continue;
			store[name] = property.bind(store);
		}
	}

	return store;
}

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
 * A Getter returns a function that can be invoked to get a value.  There are two forms of the Getter function:
 *
 * Getter(path): this returns a function that gets the value at path
 * Getter(function() { return value; }): this returns a function that gets the value returned by the function.
 *
 * @returns {Function}
 * @constructor
 */
const Getter = function(fn) {
	let resultFn;

	if (arguments.length !== 1)
		throw new Error("A Getter takes exactly one argument.");

	if (typeof(fn) === "string") {
		// If we are passed a single path then return a function that simply dereferences it
		resultFn = (() => dereference(fn));

		// Set the path as a dependency
		resultFn.dependencies = [ fn ];
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
 * This can be chained onto a Getter in order to provide dependency injection into its context.
 *
 * @param deps An object containing a map of injection points to paths (string) and Getters
 * @returns {inject}
 */
const inject = function(deps) {
	// The context is the Getter this is chained to
	let getter = this;
	deps = Immutable.Map(deps);

	// I want to return a new function that when called first retrieves the dependencies, then calls the original function
	// with those dependencies as its context.
	let newGetter = function() {
		let context = deps.map(dereference).toJS();
		return getter.apply(context, arguments);
	};

	// Copy over the properties
	Object.assign(newGetter, getter);

	// Update the dependencies
	newGetter.dependencies = deps.map(dep => typeof(dep) === "string" ? dep : Immutable.List(dep.dependencies))
			.flatten()
			.toArray();

	return newGetter;
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
			// TODO: Check references are getting garbage collected (might need to use Reference#destroy() in componentWillUnmount)
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