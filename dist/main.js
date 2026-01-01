/**
 * A library to throttle promises
 */
export default class PromiseThrottler {
    /**
     * @param options A set of options to pass to the throttle function
     * @param options.requestsPerSecond The amount of requests per second the library will limit to
     * @param options.promiseImplementation The Promise library you are using (defaults to native Promise)
     */
    constructor(options) {
        this.requestsPerSecond = options.requestsPerSecond;
        this.runSequentially = options.runSequentially === true;
        this.promiseImplementation = options.promiseImplementation ?? Promise;
        this.delayId = null;
        this.executing = false;
        this.queued = [];
    }
    /**
     * Adds a promise
     * @param promise A function returning the promise to be added
     * @returns A promise
     */
    add(promise, dequeueImmediately = true) {
        return new this.promiseImplementation((resolve, reject) => {
            this.queued.push({
                resolve,
                reject,
                promise
            });
            if (dequeueImmediately && !this.delayId && !this.executing) {
                this.dequeue();
            }
        });
    }
    /**
     * Adds all the promises passed as parameters
     * @param promises An array of functions that return a promise
     * @returns A promise that resolves to an array of results
     */
    addAll(promises) {
        const addedPromises = promises.map((promise, idx) => {
            const dequeueImmediately = this.runSequentially ?
                true :
                idx === promises.length - 1;
            return this.add(promise, dequeueImmediately);
        });
        return Promise.all(addedPromises);
    }
    /**
     * Dequeues a promise
     */
    dequeue() {
        if (this.queued.length === 0) {
            this.delayId = null;
            return;
        }
        if (this.runSequentially) {
            this._executeSequentially();
            return;
        }
        this._executeInParallel();
    }
    /**
     * Executes the promise sequentially
     */
    _executeSequentially() {
        const candidate = this.queued.shift();
        this.executing = true;
        candidate.promise()
            .then((r) => {
            candidate.resolve(r);
        })
            .catch((r) => {
            candidate.reject(r);
        })
            .finally(() => {
            const delay = Math.floor(1000 / this.requestsPerSecond);
            this._setupNextDequeue(delay);
        });
    }
    /**
     * Executes promises in parallel
     */
    _executeInParallel() {
        const pCount = this.requestsPerSecond >= 1 ? this.requestsPerSecond : 1;
        const delay = this.requestsPerSecond >= 1 ? 1000 : Math.floor(1000 / this.requestsPerSecond);
        const candidates = this.queued.splice(0, pCount);
        this.executing = true;
        Promise.all(candidates.map(candidate => candidate.promise()))
            .then((results) => {
            results.forEach((result, index) => candidates[index].resolve(result));
        })
            .catch((reason) => {
            candidates.forEach((candidate) => candidate.reject(reason));
        })
            .finally(() => {
            this._setupNextDequeue(delay);
        });
    }
    _setupNextDequeue(delay) {
        this.executing = false;
        this.delayId = setTimeout(() => this.dequeue(), delay);
    }
}
//# sourceMappingURL=main.js.map