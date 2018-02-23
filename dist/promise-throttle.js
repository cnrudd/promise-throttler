(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
/* global window */

'use strict';
window.PromiseThrottle = require('./main');

},{"./main":2}],2:[function(require,module,exports){
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
  console.log(new Date())
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

},{}]},{},[1]);
