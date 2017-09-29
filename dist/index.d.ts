/**
 * Class Observable - provides observations on some of the events
 * ---------------------------------------------------------------------
 */
export declare class Observable<T> {
    /**
     * Integer key HashMap to keep all Observers in one not contiguous array reachable by Integer
     *
     * @type {[]}
     * @private
     */
    private _observers;
    /**
     * Counter for observers presented at observers HashMap
     *
     * @type {number}
     * @private
     */
    private _observersAmount;
    /**
     * Iteger key HashMap of Action to Observer, keeping observer id's inside sub-array of MINT
     *
     * @type {{}}
     * @private
     */
    private _observerMap;
    /**
     * Total Capacity of observers per action Id
     *
     * @type {number[]}
     * @private
     */
    private _observerActionCapacity;
    /**
     * Actual capacity of observers per some action id (Valid observers by action)
     *
     * @type {number[]}
     * @private
     */
    private _observerActionActualCapacity;
    /**
     * List of valid actions
     *
     * @type {string[]}
     * @private
     */
    private _actions;
    /**
     * Counter for list of actions
     *
     * @type {number}
     * @private
     */
    private _actionsLength;
    /**
     * HashMap of action name to action Id
     *
     * @type {{}}
     * @private
     */
    private _actionsMap;
    /**
     * Shortcut for type of action of kind <*> (any)
     *
     * @type {number}
     * @private
     */
    private _anyTypeBinder;
    /**
     * Will construct new observable
     * ---------------------------------------------------------------------
     * Observable have following capacities:
     *
     *  - 32 types of action
     *  - up to 65000 listeners per action
     */
    constructor();
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
    appendActionType(action: string): this;
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
    getAmountOfSubscribersForAction(action: string): number;
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
    subscribe(execute: (data?: T) => any): number;
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
    on(action: string, execute: (data?: T) => any): number;
    /**
     * Will unsubscribe some observer Id from observations
     * ---------------------------------------------------------------------
     * @param {number} id
     */
    unsubscribe(id: number): void;
    /**
     * Push update for type of the actions which or subscribed or attached
     * by '*' wildcard action string
     * ---------------------------------------------------------------------
     *
     * @param {*} data
     */
    pushUpdate(data: T): void;
    /**
     * Push update for specific action type if any specified and to
     * any '*' wildcard subscribers as well
     * ---------------------------------------------------------------------
     *
     * @param {string} action
     * @param {*} data
     */
    pushActionUpdate(action: string, data: T): void;
    /**
     * Create new observer in the integer hashMap object
     * ---------------------------------------------------------------------
     * @param {Observer} exec
     * @returns {number}
     */
    private pushObserver(exec);
    /**
     * Will resize subscription array to next power(2, current + 1)
     * ---------------------------------------------------------------------
     * @param {Uint16Array} a
     * @returns {Uint16Array}
     */
    private static bloat(a);
    /**
     * Will resize subscription array to previous power(2, current - 1)
     * ---------------------------------------------------------------------
     * @param {Uint16Array} a
     * @returns {Uint16Array}
     */
    private static shrink(a);
    /**
     * Maintenance function
     * ---------------------------------------------------------------------
     * @param {number} action
     */
    private recountCapacityForAction(action);
}
/**
 * Observer Entity representation
 * ---------------------------------------------------------------------
 *
 * Storage class object for maintain action mapping inside it
 *
 */
export declare class Observer<T> {
    action: number;
    executor: (data?: T) => any;
    constructor(action: number, executor: (data?: T) => any);
}
