import PromiseThrottler from '../dist/main.js';

/**
 * A function that once called returns a promise
 */
const myFunction = (i: number): Promise<number> => {
  return new Promise((resolve) => {
    // here we simulate that the promise runs some code
    // asynchronously
    setTimeout(() => {
      console.log(i + ': ' + Math.random());
      resolve(i);
    }, 10);
  });
};

const promiseThrottle = new PromiseThrottler({
  requestsPerSecond: 1,           // up to 1 request per second
  promiseImplementation: Promise  // the Promise library you are using
});

// Example using add from a loop
let amountOfPromises = 10;
const initialCount = amountOfPromises;
while (amountOfPromises-- > 0) {
  const idx = initialCount - amountOfPromises;
  promiseThrottle.add(() => myFunction(idx))
    .then((i: number) => {
      console.log('Promise ' + i + ' done');
    });
}

// Example using Promise.all
const one = promiseThrottle.add(() => myFunction(1));
const two = promiseThrottle.add(() => myFunction(2));
const three = promiseThrottle.add(() => myFunction(3));

Promise.all([one, two, three])
  .then((r: number[]) => {
    console.log('Promises ' + r.join(', ') + ' done');
  });