/* exported PromiseThrottle */

'use strict';

/**
 * @constructor
 * @param {Object} options A set of options to pass to the throttle function
 * @param {number} requestsPerSecond The amount of requests per second
 *                                          the library will limit to
 */
function PromiseThrottle (options) {
  this.requestsPerSecond = options.requestsPerSecond;
  this.promiseImplementation = options.promiseImplementation || Promise;
  this.delay = Math.floor(1000 / this.requestsPerSecond);
  this.delayId = null;
  this.executing = false;
  this.queued = [];
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

    if (!self.delayId && !self.executing) {
      self.dequeue();
    }
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
  var self = this;
  if (self.queued.length === 0) {
    self.delayId = null;
    return;
  }

  self._execute();
};

/**
 * Executes the promise
 * @private
 * @return {void}
 */
PromiseThrottle.prototype._execute = function () {
  var self = this;
  var candidate = self.queued.shift();

  self.executing = true;
  candidate.promise()
    .then(function (r) {
      self._setupNextDequeue();
      candidate.resolve(r);
    })
    .catch(function (r) {
      self._setupNextDequeue();
      candidate.reject(r);
    });
};

PromiseThrottle.prototype._setupNextDequeue = function () {
  var self = this;
  self.executing = false;
  self.delayId = setTimeout(self.dequeue.bind(self), self.delay);
};

module.exports = PromiseThrottle;
