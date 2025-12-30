interface PromiseThrottlerOptions {
  requestsPerSecond: number;
  promiseImplementation?: PromiseConstructor;
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
  private requestsPerSecond: number;
  private delay: number;
  private delayId: NodeJS.Timeout | null;
  private executing: boolean;
  private queued: QueuedPromise<any>[];

  promiseImplementation: PromiseConstructor;


  /**
   * @param options A set of options to pass to the throttle function
   * @param options.requestsPerSecond The amount of requests per second the library will limit to
   * @param options.promiseImplementation The Promise library you are using (defaults to native Promise)
   */
  constructor(options: PromiseThrottlerOptions) {
    this.requestsPerSecond = options.requestsPerSecond;
    this.promiseImplementation = options.promiseImplementation || Promise;
    this.delay = Math.floor(1000 / this.requestsPerSecond);
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
    return new this.promiseImplementation<T>((resolve, reject) => {
      this.queued.push({
        resolve,
        reject,
        promise
      });

      if (!this.delayId && !this.executing) {
        this.dequeue();
      }
    });
  }

  /**
   * Adds all the promises passed as parameters
   * @param promises An array of functions that return a promise
   * @returns A promise that resolves to an array of results
   */
  addAll<T>(promises: (() => Promise<T>)[]): Promise<T[]> {
    const addedPromises = promises.map(promise => this.add(promise));
    return Promise.all(addedPromises);
  }

  /**
   * Dequeues a promise
   */
  private dequeue(): void {
    if (this.queued.length === 0) {
      this.delayId = null;
      return;
    }

    this._execute();
  }

  /**
   * Executes the promise
   */
  private _execute(): void {
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
        this._setupNextDequeue();
      });
  }

  private _setupNextDequeue(): void {
    this.executing = false;
    this.delayId = setTimeout(() => this.dequeue(), this.delay);
  }
}