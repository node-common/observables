import {Exception} from 'ts-exceptions';

/**
 * Class Observable - provides observations on some of the events
 * ---------------------------------------------------------------------
 */
export class Observable<T> {

    /**
     * Integer key HashMap to keep all Observers in one not contiguous array reachable by Integer
     *
     * @type {[]}
     * @private
     */
    private _observers: {[key: number] : Observer<T>} = [];
    /**
     * Counter for observers presented at observers HashMap
     *
     * @type {number}
     * @private
     */
    private _observersAmount: number = 1;
    /**
     * Iteger key HashMap of Action to Observer, keeping observer id's inside sub-array of MINT
     *
     * @type {{}}
     * @private
     */
    private _observerMap: {[key: number] : Uint16Array} = {};
    /**
     * Total Capacity of observers per action Id
     *
     * @type {number[]}
     * @private
     */
    private _observerActionCapacity: Array<number> = null;
    /**
     * Actual capacity of observers per some action id (Valid observers by action)
     *
     * @type {number[]}
     * @private
     */
    private _observerActionActualCapacity: Array<number> = null;
    /**
     * List of valid actions
     *
     * @type {string[]}
     * @private
     */
    private _actions: Array<string> = null;
    /**
     * Counter for list of actions
     *
     * @type {number}
     * @private
     */
    private _actionsLength: number = 0;
    /**
     * HashMap of action name to action Id
     *
     * @type {{}}
     * @private
     */
    private _actionsMap: {[key: string] : number} = {};
    /**
     * Shortcut for type of action of kind <*> (any)
     *
     * @type {number}
     * @private
     */
    private _anyTypeBinder: number = null;

    /**
     * Will construct new observable
     * ---------------------------------------------------------------------
     * Observable have following capacities:
     *
     *  - 32 types of action
     *  - up to 65000 listeners per action
     */
    public constructor() {

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
    public appendActionType(action: string) : this {

        action = String(action);

        if(this._actions.indexOf(action) === -1) {

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
    public getAmountOfSubscribersForAction(action: string) : number {

        if(this._actionsMap.hasOwnProperty(action)) {

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
    public subscribe(execute: (data?: T) => any) : number {

        if(!this._observerMap.hasOwnProperty(this._anyTypeBinder)) {

            this._observerMap[this._anyTypeBinder] = new Uint16Array(32);

        }

        let a = this._observerMap[this._anyTypeBinder];

        const c = this._observerActionCapacity[this._anyTypeBinder];

        if(c + 1 > a.length - 1) {
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
    public on(action: string, execute: (data?: T) => any) : number {

        if(action === '*') {

            return this.subscribe(execute);

        } else {

            if (!this._actionsMap.hasOwnProperty(action))

                throw new Exception("Action [" + action + "] is not exists for that Observable", 400);


            const act = this._actionsMap[action];

            if(!this._observerMap.hasOwnProperty(act)) {

                this._observerMap[act] = new Uint16Array(32);

            }

            let a = this._observerMap[act];

            const c = this._observerActionCapacity[act];

            if(c + 1 > a.length - 1) {
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
    public unsubscribe(id: number) : void {

        if(id === null)
            return;

        if(this._observers.hasOwnProperty(id)) {

            const o = this._observers[id];
            const action = o.action;

            let a = this._observerMap[action];

            // Traverse array of actions to find id we trying to unsubscribe
            for (let i = 0; i < a.length; i++) {

                // If id found then zero it with reducing actual capacity
                if(a[i] === id) {

                    a[i] = 0;
                    this._observerActionActualCapacity[action]--;

                }

                const cc = this._observerActionActualCapacity[action];

                if((cc + cc / 2) < this._observerActionCapacity[action] / 2) {

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
    public pushUpdate(data: T) : void {

        if(this._observerMap.hasOwnProperty(this._anyTypeBinder)) {

            const e = this._observerMap[this._anyTypeBinder];

            for(let i = 0; i < e.length; i++) {

                if(e[i] !== 0)

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
    public pushActionUpdate(action: string, data: T) : void {

        if (!this._actionsMap.hasOwnProperty(action)) {

            throw new Exception("Can't pushActionUpdate for Observable: Action [" + action + "] " +
                "is not presented for that Observable. Use appendActionType(action) method prior to call pushActionUpdate.", 400);

        }

        const a = this._actionsMap[action];

        if(this._observerMap.hasOwnProperty(a)) {

            const e = this._observerMap[a];

            for(let i = 0; i < e.length; i++) {

                if(e[i] !== 0)
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
    private pushObserver(exec: Observer<T>) : number {

        this._observers[this._observersAmount] = exec;

        return this._observersAmount++;

    }

    /**
     * Will resize subscription array to next power(2, current + 1)
     * ---------------------------------------------------------------------
     * @param {Uint16Array} a
     * @returns {Uint16Array}
     */
    private static bloat(a: Uint16Array) : Uint16Array {

        const size: number = a.length;

        const na: Uint16Array = new Uint16Array(size * 2);

        for(let i = 0; i < a.length; i++) {
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
    private static shrink(a: Uint16Array) : Uint16Array {

        const size: number = a.length;

        const na: Uint16Array = new Uint16Array(size / 2);

        let k = 0;

        for(let i = 0; i < a.length; i++) {

            if(a[i] !== 0)
                na[k++] = a[i];


        }

        return na;

    }

    /**
     * Maintenance function
     * ---------------------------------------------------------------------
     * @param {number} action
     */
    private recountCapacityForAction(action: number) {

        const a = this._observerMap[action];

        let c: number = a.length;
        let ac: number = 0;

        for(let i = 0; i < a.length; i++) {

            if(a[i] !== 0)
                ac++;

        }

        this._observerActionCapacity[action] = c;
        this._observerActionActualCapacity[action] = ac;

    }

}

/**
 * Observer Entity representation
 * ---------------------------------------------------------------------
 *
 * Storage class object for maintain action mapping inside it
 *
 */
export class Observer<T> {

    public action: number = null;

    public executor: (data?: T) => any = null;

    constructor(action: number, executor: (data?: T) => any) {
        this.action = action;
        this.executor = executor;
    }

}