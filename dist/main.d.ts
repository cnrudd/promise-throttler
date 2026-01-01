interface PromiseThrottlerOptions {
    /**
     * The amount of requests per second the library will limit to
     */
    requestsPerSecond: number;
    /**
     * The Promise library you are using (defaults to native Promise)
     */
    promiseImplementation?: PromiseConstructor;
    /**
     * Whether the promises should be run sequentially or not. Defaults to false.
     * If your `requestsPerSecond` limit is greater than 2, using parallel execution (`runSequentially: false`)
     * will usually result in faster total execution time.
     * If your `requestsPerSecond` limit is less than 1, ie: 0.3 or 1 promise every 3 seconds, this flag has no effect.
     */
    runSequentially?: boolean;
}
/**
 * A library to throttle promises
 */
export default class PromiseThrottler {
    private runSequentially;
    private requestsPerSecond;
    private delayId;
    private executing;
    private queued;
    promiseImplementation: PromiseConstructor;
    constructor(options: PromiseThrottlerOptions);
    /**
     * Adds a promise
     * @param promise A function returning the promise to be added
     * @returns A promise
     */
    add<T>(promise: () => Promise<T>): Promise<T>;
    /**
     * Adds all the promises passed as parameters
     * @param promises An array of functions that return a promise
     * @returns A promise that resolves to an array of results
     */
    addAll<T>(promises: (() => Promise<T>)[]): Promise<T[]>;
    /**
     * Adds a promise
     * @param promise A function returning the promise to be added
     * @param dequeueImmediately Whether the promise should be dequeued immediately or not, defaults to true
     * @returns A promise
     */
    private addInternal;
    /**
     * Dequeues all promises in the promise queue.
     */
    private dequeue;
    /**
     * Executes the promise sequentially
     */
    private executeSequentially;
    /**
     * Executes promises in parallel
     */
    private executeInParallel;
    private setupNextDequeue;
}
export {};
//# sourceMappingURL=main.d.ts.map