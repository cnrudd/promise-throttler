const PromiseThrottler = require('../lib/main');

/**
 * A function that once called returns a promise
 * @param {number} i An index number
 * @returns {Promise<number>} A promise that resolves to the given index number
 */
const myFunction = function(i) {
  return new Promise(function(resolve, reject) {
    // here we simulate that the promise runs some code
    // asynchronously
    setTimeout(function() {
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
  promiseThrottle.add(myFunction.bind(this, initialCount - amountOfPromises))
    .then(function(i) {
      console.log('Promise ' + i + ' done');
    });
}


// Example using Promise.all
const one = promiseThrottle.add(myFunction.bind(this, 1));
const two = promiseThrottle.add(myFunction.bind(this, 2));
const three = promiseThrottle.add(myFunction.bind(this, 3));

Promise.all([one, two, three])
  .then(function(r) {
    console.log('Promises ' + r.join(', ') + ' done');
  });
