(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* global window */

'use strict';
window.PromiseThrottle = require('./main');

},{"./main":2}],2:[function(require,module,exports){
/* exported PromiseThrottler */

'use strict';

/**
 * @class
 * @param {object} options A set of options to pass to the throttle function
 * @param {number} options.requestsPerSecond The amount of requests per second
 * the library will limit to
 */
function PromiseThrottler(options) {
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
PromiseThrottler.prototype.add = function(promise) {
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
};

/**
 * Adds all the promises passed as parameters
 * @param {Array<() => Promise>} promises An array of functions that return a promise
 * @returns {Promise} A promise
 */
PromiseThrottler.prototype.addAll = function(promises) {
  const addedPromises = promises.map(function(promise) {
    return this.add(promise);
  }.bind(this));

  return Promise.all(addedPromises);
};

/**
 * Dequeues a promise
 * @returns {void}
 */
PromiseThrottler.prototype.dequeue = function() {
  const self = this;
  if (self.queued.length === 0) {
    self.delayId = null;
    return;
  }

  self._execute();
};

/**
 * Executes the promise
 * @private
 * @returns {void}
 */
PromiseThrottler.prototype._execute = function() {
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
};

PromiseThrottler.prototype._setupNextDequeue = function() {
  const self = this;
  self.executing = false;
  self.delayId = setTimeout(self.dequeue.bind(self), self.delay);
};

module.exports = PromiseThrottler;

},{}]},{},[1]);
