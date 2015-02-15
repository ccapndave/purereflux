import Reflux from 'reflux'
import Immutable from 'immutable'
import immstruct from 'immstruct'

// This is the global application state
let state = immstruct({});

const createStore = function(storeKey, definition) {
    // Start with a normal Reflux store
    let store = Reflux.createStore({});

    // Add the initial state to the global state with the given key.  Use a reference cursor to edit it in-place.
    state.reference().cursor().update(() => Immutable.fromJS({ [storeKey]: definition.getInitialState() }));

    return store;
};

const getCurrentState = function() {
    return state.current;
};

const dereferenceKeyPath = keyPath => state.cursor(keyPath.split(".")).deref();

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
    /*switch (args.length) {
        case 0:
            throw new Error("A Getter needs at least one argument.");
        case 1:
            let keyPath = args[0];
            if (typeof(keyPath) !== "string") throw new Error("A single-argument Getter takes a string as its argument.");
            return () => dereferenceKeyPath(keyPath);
        default:
            // Split the arguments into dependency injection and function
            let fn = args.pop(), pathsOrGetters = args;
            if (typeof(fn) !== "function") throw new Error("A multi-argument Getter takes a function as its last argument.");

            // Go through each path/Getter resolving them into values
            var values = pathsOrGetters.map(pathOrGetter => {
                if (typeof(pathOrGetter) == "string") {
                    return dereferenceKeyPath(pathOrGetter);
                } else if (typeof(pathOrGetter) == "function") {
                    console.dir(pathOrGetter === Getter);
                }
            });

            // Finally return a function that calls fn with these arguments.  'this' inside getters is (currently) set to null
            // to discourage us from trying to use it!
            return fn.bind(null, ...values);
    }*/
    let resultFn;

    if (args.length == 0) {
        throw new Error("A Getter needs at least one argument.");
    } else if (args.length == 1) {
        let keyPath = args[0];
        if (typeof(keyPath) !== "string") throw new Error("A single-argument Getter takes a string as its argument.");
        resultFn = (() => dereferenceKeyPath(keyPath));
    } else {
        // Split the arguments into dependency injection and function
        let fn = args.pop(), pathsOrGetters = args;
        if (typeof(fn) !== "function") throw new Error("A multi-argument Getter takes a function as its last argument.");

        // Go through each path/Getter resolving them into values
        var values = pathsOrGetters.map(pathOrGetter => {
            if (typeof(pathOrGetter) == "string") {
                return dereferenceKeyPath(pathOrGetter);
            } else if (typeof(pathOrGetter) == "function" && pathOrGetter.isPureFluxGetter) {
                return pathOrGetter();
            }
        });

        // Finally return a function that calls fn with these arguments.  'this' inside getters is (currently) set to null
        // to discourage us from trying to use it!
        resultFn = () => fn.bind(null, ...values);
    }

/*    let getterFunction = () => resultFn;

    // Attach a few bits to the function
    getterFunction.isPureFluxGetter = true;
    getterFunction.memoize = memoize;

    return getterFunction;*/

    return resultFn;
};

const stateBindings = null;


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

export { createStore, Getter, stateBindings, getCurrentState }