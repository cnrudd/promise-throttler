import PromiseThrottler from 'promise-throttler';

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
// Promises will be executed sequentially, since they 
// are executed as soon as they are added.
let amountOfPromises = 10;
const initialCount = amountOfPromises;
while (amountOfPromises-- > 0) {
  const idx = initialCount - amountOfPromises;
  promiseThrottle.add(() => myFunction(idx))
    .then((i: number) => {
      console.log('Promise ' + i + ' done');
    });
}

// Example using Promise.addAll
const threeP = promiseThrottle.addAll([() => myFunction(1), () => myFunction(2), () => myFunction(3)]);
threeP
  .then((r: number[]) => {
    console.log('Promises ' + r.join(', ') + ' done');
  });