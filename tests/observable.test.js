"use strict";
exports.__esModule = true;
var index_1 = require("../dist/index");
var ObservableTestRunner = (function () {
    /**
     * Build new Observable test with amount of samples per iteration
     *
     * @param {number} samplesToAdd
     * @param {number} iterationsToLoop
     */
    function ObservableTestRunner(samplesToAdd, iterationsToLoop) {
        this.samples = 100;
        this.iterations = 100;
        this.observable = null;
        this.listOfSubscribers = [];
        this.listOfChangeListeners = [];
        this.listOfCreateListeners = [];
        this.listOfDeleteListeners = [];
        this.executedSubscribers = 0;
        this.executedChangeListeners = 0;
        this.executedCreateListeners = 0;
        this.executedDeleteListeners = 0;
        this.observable = new index_1.Observable();
        if (samplesToAdd)
            this.samples = Number(samplesToAdd);
        if (iterationsToLoop)
            this.iterations = Number(iterationsToLoop);
    }
    /**
     *  Run tests defined by amount of samples and iterations
     */
    ObservableTestRunner.prototype.run = function () {
        this.testCreation();
        for (var i = 0; i < this.iterations; i++) {
            this.testPopulation();
            this.testExecution();
            this.testShrinking();
            this.testExecution();
        }
        this.visualiseResults();
    };
    /**
     *  Test of creation for series of different types of events
     */
    ObservableTestRunner.prototype.testCreation = function () {
        console.log("\nTest Observable creation started!");
        this.observable
            .appendActionType("change")
            .appendActionType("create")
            .appendActionType("delete");
    };
    /**
     *  Test of events population
     */
    ObservableTestRunner.prototype.testPopulation = function () {
        var _this = this;
        console.log("\n ------------ Start population -------------\n ");
        for (var i = 0; i < this.samples; i++) {
            this.listOfSubscribers.push(this.observable.subscribe(function () {
                _this.executedSubscribers++;
            }));
        }
        console.log("Subscribers populated by : " + this.samples);
        for (var i = 0; i < this.samples; i++) {
            this.listOfChangeListeners.push(this.observable.on("change", function () {
                _this.executedChangeListeners++;
            }));
        }
        console.log("Change listeners populated by : " + this.samples);
        for (var i = 0; i < this.samples; i++) {
            this.listOfCreateListeners.push(this.observable.on("create", function () {
                _this.executedCreateListeners++;
            }));
        }
        console.log("Create listeners populated by : " + this.samples);
        for (var i = 0; i < this.samples; i++) {
            this.listOfDeleteListeners.push(this.observable.on("delete", function () {
                _this.executedDeleteListeners++;
            }));
        }
        console.log("Delete listeners populated by : " + this.samples);
    };
    /**
     *  Test of events execution
     */
    ObservableTestRunner.prototype.testExecution = function () {
        console.log("\n ------------- Start execution --------------\n ");
        var prevSub = this.executedSubscribers;
        var prevCreated = this.executedCreateListeners;
        var prevChange = this.executedChangeListeners;
        var prevDel = this.executedDeleteListeners;
        this.observable.pushUpdate("Mine super data");
        this.observable.pushActionUpdate("change", "Data changed");
        this.observable.pushActionUpdate("create", "Data created");
        this.observable.pushActionUpdate("delete", "Data deleted");
        console.log("~~~ Intermediate subscribers executed : " + (this.executedSubscribers - prevSub));
        console.log("~~~ Intermediate Create listeners executed : " + (this.executedCreateListeners - prevCreated));
        console.log("~~~ Intermediate Change listeners executed : " + (this.executedChangeListeners - prevChange));
        console.log("~~~ Intermediate Delete listeners executed : " + (this.executedDeleteListeners - prevDel));
    };
    ObservableTestRunner.prototype.testShrinking = function () {
        console.log("\n ------------ Start shirinking -------------\n ");
        var s = 0;
        for (var i = 0; i < this.listOfSubscribers.length; i++) {
            if (this.listOfSubscribers[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfSubscribers[i]);
                this.listOfSubscribers[i] = null;
                s++;
            }
        }
        console.log("--- Subscribers shrinked by : " + s);
        s = 0;
        for (var i = 0; i < this.listOfCreateListeners.length; i++) {
            if (this.listOfCreateListeners[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfCreateListeners[i]);
                this.listOfCreateListeners[i] = null;
                s++;
            }
        }
        console.log("--- Create listeners shrinked by : " + s);
        s = 0;
        for (var i = 0; i < this.listOfChangeListeners.length; i++) {
            if (this.listOfChangeListeners[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfChangeListeners[i]);
                this.listOfChangeListeners[i] = null;
                s++;
            }
        }
        console.log("--- Change listeners shrinked by : " + s);
        s = 0;
        for (var i = 0; i < this.listOfDeleteListeners.length; i++) {
            if (this.listOfDeleteListeners[i] !== null && (i % 2 !== 0 || (i > 30 && i < 60))) {
                this.observable.unsubscribe(this.listOfDeleteListeners[i]);
                this.listOfDeleteListeners[i] = null;
                s++;
            }
        }
        console.log("--- Delete listeners shrinked by : " + s);
    };
    /**
     *  Total results output
     */
    ObservableTestRunner.prototype.visualiseResults = function () {
        console.log("\nResults Observable test");
        console.log(">>> Total Subscribers executed : " + this.executedSubscribers);
        console.log(">>> Total Create listeners executed : " + this.executedCreateListeners);
        console.log(">>> Total Change listeners executed : " + this.executedChangeListeners);
        console.log(">>> Total Delete listeners executed : " + this.executedDeleteListeners);
    };
    return ObservableTestRunner;
}());
exports.ObservableTestRunner = ObservableTestRunner;
