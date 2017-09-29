"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_exceptions_1 = require("ts-exceptions");
/**
 * Class Observable - provides observations on some of the events
 * ---------------------------------------------------------------------
 */
class Observable {
    /**
     * Will construct new observable
     * ---------------------------------------------------------------------
     * Observable have following capacities:
     *
     *  - 32 types of action
     *  - up to 65000 listeners per action
     */
    constructor() {
        /**
         * Integer key HashMap to keep all Observers in one not contiguous array reachable by Integer
         *
         * @type {[]}
         * @private
         */
        this._observers = [];
        /**
         * Counter for observers presented at observers HashMap
         *
         * @type {number}
         * @private
         */
        this._observersAmount = 1;
        /**
         * Iteger key HashMap of Action to Observer, keeping observer id's inside sub-array of MINT
         *
         * @type {{}}
         * @private
         */
        this._observerMap = {};
        /**
         * Total Capacity of observers per action Id
         *
         * @type {number[]}
         * @private
         */
        this._observerActionCapacity = null;
        /**
         * Actual capacity of observers per some action id (Valid observers by action)
         *
         * @type {number[]}
         * @private
         */
        this._observerActionActualCapacity = null;
        /**
         * List of valid actions
         *
         * @type {string[]}
         * @private
         */
        this._actions = null;
        /**
         * Counter for list of actions
         *
         * @type {number}
         * @private
         */
        this._actionsLength = 0;
        /**
         * HashMap of action name to action Id
         *
         * @type {{}}
         * @private
         */
        this._actionsMap = {};
        /**
         * Shortcut for type of action of kind <*> (any)
         *
         * @type {number}
         * @private
         */
        this._anyTypeBinder = null;
        this._actions = new Array(32);
        this._observerActionCapacity = new Array(32);
        this._observerActionActualCapacity = new Array(32);
        this.appendActionType('*');
        this._anyTypeBinder = this._actionsMap['*'];
    }
    /**
     * Define action type
     * ---------------------------------------------------------------------
     *
     * Action types must be defined prior action to be used per some obsevable
     * that restriction is for maintain list of actions which can be truly used
     * by observable neither than allowing undetermined set of actions which
     * is more harder to maintain inside a program linkage wise
     *
     * @param {string} action
     * @returns {this}
     */
    appendActionType(action) {
        action = String(action);
        if (this._actions.indexOf(action) === -1) {
            const cellId = this._actionsLength;
            this._actions[cellId] = action;
            this._actionsMap[action] = cellId;
            this._observerActionCapacity[cellId] = 0;
            this._observerActionActualCapacity[cellId] = 0;
            this._actionsLength++;
            return this;
        }
    }
    /**
     * Will provide statistics about how much
     * subscribers connected for some action
     * ---------------------------------------------------------------------
     *
     * Use '*' wildcard for retrieve subscribers for all kind of events
     *
     * @param {string} action
     * @returns {number}
     */
    getAmountOfSubscribersForAction(action) {
        if (this._actionsMap.hasOwnProperty(action)) {
            return this._observerActionActualCapacity[this._actionsMap[action]];
        }
        return 0;
    }
    /**
     * Subscribe for the actions to be executed
     * ---------------------------------------------------------------------
     *
     * @param {(data)} execute    : executor with some data signature
     *                                        should be callable function
     *
     * @returns {number}                    : will return an ID for the subscription
     *                                        using that ID allows to unsubscribe that
     *                                        event from observations
     */
    subscribe(execute) {
        if (!this._observerMap.hasOwnProperty(this._anyTypeBinder)) {
            this._observerMap[this._anyTypeBinder] = new Uint16Array(32);
        }
        let a = this._observerMap[this._anyTypeBinder];
        const c = this._observerActionCapacity[this._anyTypeBinder];
        if (c + 1 > a.length - 1) {
            a = Observable.bloat(a);
            this._observerMap[this._anyTypeBinder] = a;
        }
        const n = this.pushObserver(new Observer(this._anyTypeBinder, execute));
        a[c] = n;
        this._observerActionCapacity[this._anyTypeBinder]++;
        this._observerActionActualCapacity[this._anyTypeBinder]++;
        return n;
    }
    /**
     * Subscribe for some kind of an action represented by string
     * ---------------------------------------------------------------------
     *
     * @param {string} action               : string with action name
     *
     * @param {(data)} execute    : executor with some data signature
     *                                        should be callable function
     *
     * @returns {number}                    : will return an ID for the subscription
     *                                        using that ID allows to unsubscribe that
     *                                        event from observations
     *
     */
    on(action, execute) {
        if (action === '*') {
            return this.subscribe(execute);
        }
        else {
            if (!this._actionsMap.hasOwnProperty(action))
                throw new ts_exceptions_1.Exception("Action [" + action + "] is not exists for that Observable", 400);
            const act = this._actionsMap[action];
            if (!this._observerMap.hasOwnProperty(act)) {
                this._observerMap[act] = new Uint16Array(32);
            }
            let a = this._observerMap[act];
            const c = this._observerActionCapacity[act];
            if (c + 1 > a.length - 1) {
                a = Observable.bloat(a);
                this._observerMap[act] = a;
            }
            const n = this.pushObserver(new Observer(act, execute));
            a[c] = n;
            this._observerActionCapacity[act]++;
            this._observerActionActualCapacity[act]++;
            return n;
        }
    }
    /**
     * Will unsubscribe some observer Id from observations
     * ---------------------------------------------------------------------
     * @param {number} id
     */
    unsubscribe(id) {
        if (id === null)
            return;
        if (this._observers.hasOwnProperty(id)) {
            const o = this._observers[id];
            const action = o.action;
            let a = this._observerMap[action];
            // Traverse array of actions to find id we trying to unsubscribe
            for (let i = 0; i < a.length; i++) {
                // If id found then zero it with reducing actual capacity
                if (a[i] === id) {
                    a[i] = 0;
                    this._observerActionActualCapacity[action]--;
                }
                const cc = this._observerActionActualCapacity[action];
                if ((cc + cc / 2) < this._observerActionCapacity[action] / 2) {
                    // Shrink
                    a = Observable.shrink(a);
                    // Update observer map
                    this._observerMap[action] = a;
                    // Recount capacity for an action
                    this._observerActionCapacity[action] = a.length;
                }
            }
            // Delete observer from HashMap
            delete this._observers[id];
        }
    }
    /**
     * Push update for type of the actions which or subscribed or attached
     * by '*' wildcard action string
     * ---------------------------------------------------------------------
     *
     * @param {*} data
     */
    pushUpdate(data) {
        if (this._observerMap.hasOwnProperty(this._anyTypeBinder)) {
            const e = this._observerMap[this._anyTypeBinder];
            for (let i = 0; i < e.length; i++) {
                if (e[i] !== 0)
                    this._observers[e[i]].executor(data);
            }
        }
    }
    /**
     * Push update for specific action type if any specified and to
     * any '*' wildcard subscribers as well
     * ---------------------------------------------------------------------
     *
     * @param {string} action
     * @param {*} data
     */
    pushActionUpdate(action, data) {
        if (!this._actionsMap.hasOwnProperty(action)) {
            throw new ts_exceptions_1.Exception("Can't pushActionUpdate for Observable: Action [" + action + "] " +
                "is not presented for that Observable. Use appendActionType(action) method prior to call pushActionUpdate.", 400);
        }
        const a = this._actionsMap[action];
        if (this._observerMap.hasOwnProperty(a)) {
            const e = this._observerMap[a];
            for (let i = 0; i < e.length; i++) {
                if (e[i] !== 0)
                    this._observers[e[i]].executor(data);
            }
        }
        this.pushUpdate(data);
    }
    /**
     * Create new observer in the integer hashMap object
     * ---------------------------------------------------------------------
     * @param {Observer} exec
     * @returns {number}
     */
    pushObserver(exec) {
        this._observers[this._observersAmount] = exec;
        return this._observersAmount++;
    }
    /**
     * Will resize subscription array to next power(2, current + 1)
     * ---------------------------------------------------------------------
     * @param {Uint16Array} a
     * @returns {Uint16Array}
     */
    static bloat(a) {
        const size = a.length;
        const na = new Uint16Array(size * 2);
        for (let i = 0; i < a.length; i++) {
            na[i] = a[i];
        }
        return na;
    }
    /**
     * Will resize subscription array to previous power(2, current - 1)
     * ---------------------------------------------------------------------
     * @param {Uint16Array} a
     * @returns {Uint16Array}
     */
    static shrink(a) {
        const size = a.length;
        const na = new Uint16Array(size / 2);
        let k = 0;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== 0)
                na[k++] = a[i];
        }
        return na;
    }
    /**
     * Maintenance function
     * ---------------------------------------------------------------------
     * @param {number} action
     */
    recountCapacityForAction(action) {
        const a = this._observerMap[action];
        let c = a.length;
        let ac = 0;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== 0)
                ac++;
        }
        this._observerActionCapacity[action] = c;
        this._observerActionActualCapacity[action] = ac;
    }
}
exports.Observable = Observable;
/**
 * Observer Entity representation
 * ---------------------------------------------------------------------
 *
 * Storage class object for maintain action mapping inside it
 *
 */
class Observer {
    constructor(action, executor) {
        this.action = null;
        this.executor = null;
        this.action = action;
        this.executor = executor;
    }
}
exports.Observer = Observer;
//# sourceMappingURL=index.js.map