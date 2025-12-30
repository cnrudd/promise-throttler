'use strict';

const sinon = require('sinon');

const PromiseThrottler = require('../lib/main');

/**
 * Creates a new PromiseThrottler instance with the specified requests per second.
 * @param {number} rps - The number of requests per second.
 * @returns {PromiseThrottler} A new PromiseThrottler instance.
 */
function createPromiseThrottler(rps) {
  return new PromiseThrottler({
    requestsPerSecond: rps,
    promiseImplementation: Promise
  });
}

describe('PromiseThrottle', function() {

  jest.setTimeout(10000);

  it('should use native Promise when promiseImplementation is not provided', function() {
    const pt = new PromiseThrottler({
      requestsPerSecond: 1
    });

    expect(pt.promiseImplementation).toBe(global.Promise);
  });

  it('should have the following API: add(), addAll()', function() {
    expect(typeof PromiseThrottler.prototype.add).toBe('function');
    expect(typeof PromiseThrottler.prototype.addAll).toBe('function');
  });

  describe('#add(fn)', function() {

    it('should return a promise', function() {
      const pt10 = createPromiseThrottler(10);

      const fn = function() {
        return Promise.resolve();
      };

      return expect(pt10.add(fn)).resolves.toBeUndefined();
    });

    it('should be resolved with the resolved value of the promise returned by the function', function() {
      const pt10 = createPromiseThrottler(10);

      const fn = function() {
        return Promise.resolve(42);
      };

      return expect(pt10.add(fn)).resolves.toBe(42);
    });

    it('should be rejected with the rejected error of the promise returned by the function', function() {
      const pt10 = createPromiseThrottler(10);

      const fnError = new Error('Ooops!');
      const fn = function() {
        return Promise.reject(fnError);
      };

      return expect(pt10.add(fn)).rejects.toBe(fnError);
    });

    it('should be rejected with the error thrown by the function', function() {
      const pt10 = createPromiseThrottler(10);

      const fnError = new Error('Ooops!');
      const fn = function() {
        throw fnError;
      };

      return expect(pt10.add(fn)).rejects.toBe(fnError);
    });

  });

  describe('#addAll([fn1, fn2, ...])', function() {

    it('should add all the functions passed as parameter', function() {
      const pt10 = createPromiseThrottler(10);

      const fn1 = function() {};
      const fn2 = function() {};

      sinon.stub(pt10, 'add');

      pt10.addAll([fn1, fn2]);

      expect(pt10.add.calledWith(fn1)).toBe(true);
      expect(pt10.add.calledWith(fn2)).toBe(true);
    });

    it('should return a promise that is resolved with the proper values', function() {
      const pt10 = createPromiseThrottler(10);

      const fn1 = function() {
        return Promise.resolve(12);
      };
      const fn2 = function() {
        return Promise.resolve(34);
      };

      return pt10.addAll([fn1, fn2])
        .then(function(values) {
          expect(values[0]).toBe(12);
          expect(values[1]).toBe(34);
        });
    });

    it('should return a promise that is rejected whenever one of the function rejects its promise', function() {
      const pt10 = createPromiseThrottler(10);

      const fn1 = function() {
        return Promise.resolve(12);
      };
      const fnError = new Error('Ooops!');
      const fn2 = function() {
        return Promise.resolve(fnError);
      };

      return pt10.addAll([fn1, fn2])
        .then(function(values) {
          expect(values[0]).toBe(12);
          expect(values[1]).toBe(fnError);
        });
    });

    it('respect-the-requestsPerSecond-option', function(done) {
      const pt2 = createPromiseThrottler(2);

      let count = 8;
      const fns = [];
      let resolvedCount = 0;
      const resolved = [];
      const fn = function() {
        resolvedCount++;
        return Promise.resolve();
      };

      while (count-- > 0) {
        fns.push(fn);
      }

      pt2.addAll(fns);

      setTimeout(function() {
        resolved.push(resolvedCount);
      }, 700);

      setTimeout(function() {
        resolved.push(resolvedCount);
      }, 1700);

      setTimeout(function() {
        resolved.push(resolvedCount);
      }, 2700);

      setTimeout(function() {
        resolved.push(resolvedCount);
        expect(resolved).toEqual([2, 4, 6, 8]);
        done();
      }, 3700);
    });

  });

});
