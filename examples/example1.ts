import PromiseThrottler from 'promise-throttler';

const promiseThrottler = new PromiseThrottler({
  requestsPerSecond: 2,
  promiseImplementation: Promise
});

/**
 * Creates a promise that resolves with a random number after a short delay.
 */
function createPromise(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const n = Math.random();
      console.log(n);
      resolve(n);
    }, 10);
  });
}

let amountOfPromises = 10;
const promises = [];
while (amountOfPromises-- > 0) {
  promises.push(() => createPromise())
}

// use addAll to add all promises at once and
// ensure they will run in parallel.
promiseThrottler.addAll(promises);