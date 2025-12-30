import PromiseThrottler from '../dist/main.js';

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
while (amountOfPromises-- > 0) {
  promiseThrottler.add(() => {
    return createPromise();
  });
}