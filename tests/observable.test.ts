import {Observable} from "../dist/index";

export class ObservableTestRunner {

    private samples: number = 100;
    private iterations: number = 100;

    private observable: Observable<String> = null;

    private listOfSubscribers: Array<number> = [];
    private listOfChangeListeners: Array<number> = [];
    private listOfCreateListeners: Array<number> = [];
    private listOfDeleteListeners: Array<number> = [];

    private executedSubscribers: number = 0;
    private executedChangeListeners: number = 0;
    private executedCreateListeners: number = 0;
    private executedDeleteListeners: number = 0;

    /**
     * Build new Observable test with amount of samples per iteration
     *
     * @param {number} samplesToAdd
     * @param {number} iterationsToLoop
     */
    constructor(samplesToAdd?: number, iterationsToLoop?: number) {

        this.observable = new Observable<String>();

        if(samplesToAdd)
            this.samples = Number(samplesToAdd);

        if(iterationsToLoop)
            this.iterations = Number(iterationsToLoop);

    }

    /**
     *  Run tests defined by amount of samples and iterations
     */
    run() {

        this.testCreation();

        for(let i = 0; i < this.iterations; i++ ) {

            this.testPopulation();
            this.testExecution();
            this.testShrinking();
            this.testExecution();

        }

        this.visualiseResults();

    }

    /**
     *  Test of creation for series of different types of events
     */
    public testCreation() {

        console.log("\nTest Observable creation started!");

        this.observable
            .appendActionType("change")
            .appendActionType("create")
            .appendActionType("delete");

    }

    /**
     *  Test of events population
     */
    public testPopulation() {

        console.log("\n ------------ Start population -------------\n ");

        for(let i=0; i < this.samples; i++) {

            this.listOfSubscribers.push(this.observable.subscribe(() => {
                this.executedSubscribers++;
            }));

        }

        console.log("Subscribers populated by : " + this.samples);

        for(let i=0; i < this.samples; i++) {

            this.listOfChangeListeners.push(this.observable.on("change", () => {
                this.executedChangeListeners++;
            }));

        }

        console.log("Change listeners populated by : " + this.samples);

        for(let i=0; i < this.samples; i++) {

            this.listOfCreateListeners.push(this.observable.on("create", () => {
                this.executedCreateListeners++;
            }));

        }

        console.log("Create listeners populated by : " + this.samples);

        for(let i=0; i < this.samples; i++) {

            this.listOfDeleteListeners.push(this.observable.on("delete", () => {
                this.executedDeleteListeners++;
            }));

        }

        console.log("Delete listeners populated by : " + this.samples);

    }

    /**
     *  Test of events execution
     */
    public testExecution() {

        console.log("\n ------------- Start execution --------------\n ");

        const prevSub = this.executedSubscribers;
        const prevCreated = this.executedCreateListeners;
        const prevChange = this.executedChangeListeners;
        const prevDel = this.executedDeleteListeners;

        this.observable.pushUpdate("Mine super data");
        this.observable.pushActionUpdate("change", "Data changed");
        this.observable.pushActionUpdate("create", "Data created");
        this.observable.pushActionUpdate("delete", "Data deleted");

        console.log("~~~ Intermediate subscribers executed : " + (this.executedSubscribers - prevSub));
        console.log("~~~ Intermediate Create listeners executed : " + (this.executedCreateListeners - prevCreated));
        console.log("~~~ Intermediate Change listeners executed : " + (this.executedChangeListeners - prevChange));
        console.log("~~~ Intermediate Delete listeners executed : " + (this.executedDeleteListeners - prevDel));

    }

    public testShrinking() {

        console.log("\n ------------ Start shirinking -------------\n ");

        let s = 0;

        for(let i = 0; i < this.listOfSubscribers.length; i++) {

            if(this.listOfSubscribers[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfSubscribers[i]);
                this.listOfSubscribers[i] = null;
                s++;
            }

        }

        console.log("--- Subscribers shrinked by : " + s);

        s = 0;

        for(let i = 0; i < this.listOfCreateListeners.length; i++) {

            if(this.listOfCreateListeners[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfCreateListeners[i]);
                this.listOfCreateListeners[i] = null;
                s++;
            }

        }

        console.log("--- Create listeners shrinked by : " + s);

        s = 0;

        for(let i = 0; i < this.listOfChangeListeners.length; i++) {

            if(this.listOfChangeListeners[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfChangeListeners[i]);
                this.listOfChangeListeners[i] = null;
                s++;
            }

        }

        console.log("--- Change listeners shrinked by : " + s);

        s = 0;

        for(let i = 0; i < this.listOfDeleteListeners.length; i++) {

            if(this.listOfDeleteListeners[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfDeleteListeners[i]);
                this.listOfDeleteListeners[i] = null;
                s++;
            }

        }

        console.log("--- Delete listeners shrinked by : " + s);

    }

    /**
     *  Total results output
     */
    public visualiseResults() {

        console.log("\nResults Observable test");

        console.log(">>> Total Subscribers executed : " + this.executedSubscribers);
        console.log(">>> Total Create listeners executed : " + this.executedCreateListeners);
        console.log(">>> Total Change listeners executed : " + this.executedChangeListeners);
        console.log(">>> Total Delete listeners executed : " + this.executedDeleteListeners);

    }

}