/**
 * @class
 * @param {object} options A set of options to pass to the throttle function
 * @param {number} options.requestsPerSecond The amount of requests per second
 * the library will limit to
 */
export default class PromiseThrottler {
  constructor(options) {
    this.requestsPerSecond = options.requestsPerSecond;
    this.promiseImplementation = options.promiseImplementation || Promise;
    this.delay = Math.floor(1000 / this.requestsPerSecond);
    this.delayId = null;
    this.executing = false;
    this.queued = [];
  }

  /**
   * Adds a promise
   * @param {() => Promise} promise A function returning the promise to be added
   * @returns {Promise} A promise
   */
  add(promise) {
    const self = this;
    return new self.promiseImplementation(function(resolve, reject) {
      self.queued.push({
        resolve: resolve,
        reject: reject,
        promise: promise
      });

      if (!self.delayId && !self.executing) {
        self.dequeue();
      }
    });
  }

  /**
   * Adds all the promises passed as parameters
   * @param {Array<() => Promise>} promises An array of functions that return a promise
   * @returns {Promise} A promise
   */
  addAll(promises) {
    const addedPromises = promises.map(function(promise) {
      return this.add(promise);
    }.bind(this));

    return Promise.all(addedPromises);
  }

  /**
   * Dequeues a promise
   * @returns {void}
   */
  dequeue() {
    const self = this;
    if (self.queued.length === 0) {
      self.delayId = null;
      return;
    }

    self._execute();
  }

  /**
   * Executes the promise
   * @private
   * @returns {void}
   */
  _execute() {
    const self = this;
    const candidate = self.queued.shift();

    self.executing = true;
    candidate.promise()
      .then(function(r) {
        candidate.resolve(r);
      })
      .catch(function(r) {
        candidate.reject(r);
      })
      .finally(function() {
        self._setupNextDequeue();
      });
  }

  _setupNextDequeue() {
    const self = this;
    self.executing = false;
    self.delayId = setTimeout(self.dequeue.bind(self), self.delay);
  }
}
