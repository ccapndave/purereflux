import Reflux from 'reflux'
import Immutable from 'immutable'
import immstruct from 'immstruct'

// This is the global application state
let state = immstruct({});

const clearState = () => state = immstruct({});

const createStore = function(storeKey, definition) {
    // Start with a normal Reflux store
    let store = Reflux.createStore({});

    // Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
    state.reference().cursor().update(() => Immutable.fromJS({ [storeKey]: definition.getInitialState() }));

    return store;
};

const getState = () => state;

const getCurrentState = () => state.current;

const keyPathToKeyArray = (keyPath) => keyPath.split(".");

/**
 * Turn a path or Getter into a real value
 *
 * @param pathOrGetter
 * @returns {*}
 */
const dereference = pathOrGetter => {
    if (typeof(pathOrGetter) == "string") {
        // TODO: This needs to throw an exception if the path doesn't exist
        return state.cursor(keyPathToKeyArray(pathOrGetter)).deref();
    } else if (typeof(pathOrGetter) == "function" && pathOrGetter.isPureFluxGetter) {
        return pathOrGetter();
    } else {
        throw new Error("Illegal argument type for this Getter");
    }
};

const memoize = function(fn) {
    console.log(this);
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
const Getter = function(...args) {
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
            .map(pathOrGetter => typeof(pathOrGetter) == "string" ? pathOrGetter : Immutable.List(pathOrGetter.dependencies))
            .flatten()
            .toArray();

        // Finally return a function that calls fn with these arguments.  'this' inside getters is (currently) set to null to discourage us from trying to use it!
        resultFn = (() => {
            // Go through each path/Getter resolving them into values
            let values = pathsOrGetters.map(dereference);

            // And return a function with these values applied
            return fn.call(null, ...values);
        });
    }

    // This is so that we can identify something as a Getter
    resultFn.isPureFluxGetter = true;

    // Set the dependencies for observers TODO: this should really be an ES6 Set
    resultFn.dependencies = dependencies;

    // This is the chainable memoize function
    resultFn.memoize = memoize;

    return resultFn;
};

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
                .map(binding => typeof(binding) == "string" ? [ binding ] : binding.dependencies)
                .reduce((acc, dependencies, stateProperty) => {
                    dependencies.forEach(dependency => {
                        let set = (acc.get(dependency) || Immutable.Set()).add(stateProperty);
                        acc = acc.set(dependency, set);
                    });
                    return acc;
                }, Immutable.Map());

            // Observer each of the keyPaths
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

/*function Store() {
    var i=0, arr;
    this.subscriptions = [];
    this.emitter = new _.EventEmitter();
    this.eventLabel = "change";
    bindMethods(this, definition);
    if (this.init && _.isFunction(this.init)) {
        this.init();
    }
    if (this.listenables){
        arr = [].concat(this.listenables);
        for(;i < arr.length;i++){
            this.listenToMany(arr[i]);
        }
    }
}*/

export { createStore, Getter, stateBindings, clearState, getCurrentState, getState }