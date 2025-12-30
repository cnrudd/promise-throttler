const PromiseThrottler = require('../lib/main');

const promiseThrottler = new PromiseThrottler({
  requestsPerSecond: 2,
  promiseImplementation: Promise
});

/**
 * Creates a promise that resolves with a random number after a short delay.
 * @returns {Promise<number>} A promise that resolves to a random number.
 */
function createPromise() {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      const n = Math.random();
      console.log(n);
      resolve(n);
    }, 10);
  });
}

let amountOfPromises = 10;
while (amountOfPromises-- > 0) {
  promiseThrottler.add(function() {
    return createPromise();
  });
};
