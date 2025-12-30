interface PromiseThrottlerOptions {
    requestsPerSecond: number;
    promiseImplementation?: PromiseConstructor;
}
/**
 * A library to throttle promises
 */
export default class PromiseThrottler {
    private requestsPerSecond;
    private delay;
    private delayId;
    private executing;
    private queued;
    promiseImplementation: PromiseConstructor;
    /**
     * @param options A set of options to pass to the throttle function
     * @param options.requestsPerSecond The amount of requests per second the library will limit to
     * @param options.promiseImplementation The Promise library you are using (defaults to native Promise)
     */
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
     * Dequeues a promise
     */
    private dequeue;
    /**
     * Executes the promise
     */
    private _execute;
    private _setupNextDequeue;
}
export {};
//# sourceMappingURL=main.d.ts.map