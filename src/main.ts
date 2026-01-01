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

interface QueuedPromise<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  promise: () => Promise<T>;
}

/**
 * A library to throttle promises
 */
export default class PromiseThrottler {
  private runSequentially: boolean;
  private requestsPerSecond: number;
  private delayId: NodeJS.Timeout | null;
  private executing: boolean;
  private queued: QueuedPromise<any>[];

  promiseImplementation: PromiseConstructor;

  constructor(options: PromiseThrottlerOptions) {
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
  add<T>(promise: () => Promise<T>): Promise<T> {
    return this.addInternal<T>(promise);
  }

  /**
   * Adds all the promises passed as parameters
   * @param promises An array of functions that return a promise
   * @returns A promise that resolves to an array of results
   */
  addAll<T>(promises: (() => Promise<T>)[]): Promise<T[]> {
    const addedPromises = promises.map((promise, idx) => {
      const dequeueImmediately = this.runSequentially ? 
        true :
        idx === promises.length - 1;

      return this.addInternal<T>(promise, dequeueImmediately);
    });
    return Promise.all(addedPromises);
  }

  /**
   * Adds a promise
   * @param promise A function returning the promise to be added
   * @param dequeueImmediately Whether the promise should be dequeued immediately or not, defaults to true
   * @returns A promise
   */
  private addInternal<T>(promise: () => Promise<T>, dequeueImmediately = true): Promise<T> {
    return new this.promiseImplementation<T>((resolve, reject) => {
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
   * Dequeues all promises in the promise queue.
   */
  private dequeue(): void {
    if (this.queued.length === 0) {
      this.delayId = null;
      return;
    }

    if (this.runSequentially) {
      this.executeSequentially();
      return;
    }
    this.executeInParallel();
  }

  /**
   * Executes the promise sequentially
   */
  private executeSequentially(): void {
    const candidate = this.queued.shift()!;

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
        this.setupNextDequeue(delay);
      });
  }

  /**
   * Executes promises in parallel
   */
  private executeInParallel(): void {
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
        this.setupNextDequeue(delay);
      });
  }

  private setupNextDequeue(delay: number): void {
    this.executing = false;
    this.delayId = setTimeout(() => this.dequeue(), delay);
  }
}