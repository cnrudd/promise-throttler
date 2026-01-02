Promise Throttler 
==================

[![Coverage Status](https://coveralls.io/repos/github/cnrudd/promise-throttler/badge.svg?branch=main)](https://coveralls.io/github/cnrudd/promise-throttler?branch=main)
[![Node.js CI](https://github.com/cnrudd/promise-throttler/actions/workflows/node.js.yml/badge.svg)](https://github.com/cnrudd/promise-throttler/actions/workflows/node.js.yml)

[![npm version](https://badge.fury.io/js/promise-throttler.svg?icon=si%3Anpm)](https://badge.fury.io/js/promise-throttler)
[![npm downloads](https://badgen.net/npm/dm/promise-throttler)](https://www.npmjs.com/package/promise-throttler)
[![Bundlephobia](https://badgen.net/bundlephobia/min/promise-throttler)](https://bundlephobia.com/result?p=promise-throttler)
[![Bundlephobia](https://badgen.net/bundlephobia/minzip/promise-throttler)](https://bundlephobia.com/result?p=promise-throttler)
[![Bundlephobia](https://badgen.net/bundlephobia/dependency-count/promise-throttler)](https://bundlephobia.com/result?p=promise-throttler)

[![Bundlephobia](https://badgen.net/badge/icon/typescript?icon=typescript&label)]()

[![Bundlephobia](https://badgen.net/npm/license/promise-throttler)]()

This is a small library adapted from JMPerez's (https://github.com/JMPerez/promise-throttle) to limit the amount of promises run per unit of time. It is useful for scenarios such as Rest APIs consumption, where we are normally rate-limited to a certain amount of requests per time.

This version differs from JMPerez/promise-throttle in that it will run promises only N time after the previous one **has been resolved/rejected**.  The JMPerez lib fires the next promise N time after the previous one **started**.  In both libraries, N time is 1 second / requests per second.

This version's approach reduces the risk that your calls are blocked for rate limit abuse due to latent calls piling up on the endpoint.
If the rate limit is 3 requests per second, you may end up making only an average of 2 1/2 requests per second, but you are virtually guaranteed to not get dinged for exceeding the rate limit.

A queue is created, into which promises from any source in your code can be added.  So, unrelated processes that use the same API endpoint don't have to worry about the other processes causing rate limits to be reached.

This library has no dependencies. If you are running this on Node.js, you can use the global Promise, or you can pass whatever Promise library you are using in the constructor.

Then, you add functions to the `PromiseThrottler` that, once called, return a `Promise`.

## API
### Types
```javascript
interface PromiseThrottlerOptions {

  /**
   * The amount of requests per second the library will limit to
   */
  requestsPerSecond: number;

  /**
   * The Promise library you are using (defaults to native Promise)
   */
  promiseImplementation?: PromiseConstructor;

  /**
   * Whether the promises should be run sequentially or not. Defaults to false.
   * If your `requestsPerSecond` limit is greater than 2, using the default parallel execution (`runSequentially: false`) 
   * will usually result in faster total execution time.
   * If your `requestsPerSecond` limit is less than 1, ie: 0.3 or 1 promise every 3 seconds, this flag has no effect, promises are run sequentially.
   */
  runSequentially?: boolean;
}

const myAppsPromiseThrottle = new PromiseThrottler({
  requestsPerSecond: 5,    // up to 5 request per second
});
```

### Public Methods
```javascript
    /**
     * Adds a promise
     * @param promise A function returning the promise to be added
     * @returns A promise
     */
    PromiseThrottler.add<T>(promise: () => Promise<T>): Promise<T>;
    /**
     * Adds all the promises passed as parameters
     * @param promises An array of functions that return a promise
     * @returns A promise that resolves to an array of results
     */
    PromiseThrottler.addAll<T>(promises: (() => Promise<T>)[]): Promise<T[]>;
```

## Use

The library can be used server-side or in the browser.
This is an ES 6 modules only project.

#### Basic Example
```javascript
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
```

#### Other Examples
In the `examples` directory, there is a sample react web app and a sample nodejs app.  Both apps demonstrate making real calls to https://httpbin.org.

## Requirements
* Node.js >= 14.0.0

## Installation

For node.js, install the module with: `npm i promise-throttle`

## Development

Install the dependencies using `npm install`.
Run `npm start` to lint, build, and test.

## License

MIT

## Top Alternatives on NPM
* https://www.npmjs.com/search?page=0&q=keywords%3Apromise%20throttle&sortBy=score&perPage=20

## Roadmap
1. consolidate methods `add` and `addAll` into just one method that takes 1 promise, an array of promises, or multiple args that are promises or arrays of promises.
2. provide a `quitEarly` method to kill execution and flush queue early.
3. provide an option `ignoreErrors` to keep running the queue if a promise ends with a rejection.
4. ensure promises in queue can be aborted
