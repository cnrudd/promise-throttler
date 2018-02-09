/* exported PromiseThrottle */

'use strict';

/**
 * @constructor
 * @param {Object} options A set of options to pass to the throttle function
 *        @param {number} requestsPerSecond The amount of requests per second
 *                                          the library will limit to
 */
function PromiseThrottle(options) {
  this.requestsPerSecond = options.requestsPerSecond;
  this.promiseImplementation = options.promiseImplementation || Promise;

  this.queued = [];
  this.promisesFired = 0;
  this.promisesResolved = 0;
}

/**
 * Adds a promise
 * @param {Function} promise A function returning the promise to be added
 * @return {Promise} A promise
 */
PromiseThrottle.prototype.add = function (promise) {
  var self = this;
  return new self.promiseImplementation(function (resolve, reject) {
    self.queued.push({
      resolve: resolve,
      reject: reject,
      promise: promise
    });

    self.dequeue();
  });
};

/**
 * Adds all the promises passed as parameters
 * @param {Function} promises An array of functions that return a promise
 * @return {void}
 */
PromiseThrottle.prototype.addAll = function (promises) {
  var addedPromises = promises.map(function (promise) {
    return this.add(promise);
  }.bind(this));

  return Promise.all(addedPromises);
};

/**
 * Dequeues a promise
 * @return {void}
 */
PromiseThrottle.prototype.dequeue = function () {
  if (this.queued.length > 0) {

    if (this.promisesFired === this.requestsPerSecond) {
      if (this.promisesResolved === this.promisesFired &&
        new Date() - this.cycleStartTime > 1000
      ) {
        this.promisesFired = 0;
        this.promisesResolved = 0;
      } else {
        setTimeout(function () {
          this.dequeue();
        }.bind(this), 100);
        return;
      }
    }

    if (this.promisesFired === 0) {
      this.cycleStartTime = new Date();
    }

    if (this.requestsPerSecond > this.promisesFired) {
      this.promisesFired++;
      this._execute();
    } else {
      // we have reached the limit, schedule a dequeue operation
      var timer = Math.max(0, 1000 - (new Date() - this.cycleStartTime));
      setTimeout(function () {
        this.dequeue();
      }.bind(this),
        timer);
    }
  }
};

/**
 * Executes the promise
 * @private
 * @return {void}
 */
PromiseThrottle.prototype._execute = function () {
  var self = this;
  var candidate = self.queued.shift();
  candidate.promise().then(function (r) {
    self.promisesResolved++;
    candidate.resolve(r);
  }).catch(function (r) {
    self.promisesResolved++;
    candidate.reject(r);
  });
};

module.exports = PromiseThrottle;
