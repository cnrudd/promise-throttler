Promise Throttler 
==================

[![Coverage Status](https://coveralls.io/repos/github/cnrudd/promise-throttler/badge.svg?branch=master)](https://coveralls.io/github/cnrudd/promise-throttler?branch=master) [![Build Status](https://travis-ci.org/cnrudd/promise-throttler.svg?branch=master)](https://travis-ci.org/cnrudd/promise-throttler)

This is a small library adapted from (https://github.com/JMPerez/promise-throttle) to limit the amount of promises run per unit of time. It is useful for scenarios such as Rest APIs consumption, where we are normally rate-limited to a certain amount of requests per time.

This version differs from JMPerez/promise-throttle in that it will run promises only N time after the previous one **has been resolved/rejected**.  The JMPerez lib fires the next promise N time after the previous one **started**.  In both libraries, N time is 1 second / requests per second.

This approach reduces the risk that your calls are blocked for rate limit abuse due to latent calls piling up on the endpoint.
If the rate limit is 3 requests per second, you may end up making only an average of 2 1/2 requests per second, but you are virtually guaranteed to not get dinged for exceeding the rate limit.

A queue is created, into which promises from any source in your code can be added.  So, unrelated processes that use the same API endpoint don't have to worry about the other processes causing rate limits to be reached.

This library has no dependencies. If you are running this on Node.js, you will need to pass whatever Promise library you are using in the constructor.

Then, you add functions to the `PromiseThrottle` that, once called, return a `Promise`.

## Use

The library can be used either server-side or in the browser.

```javascript
  var PromiseThrottle = require('promise-throttle');
  /**
   * A function that once called returns a promise
   * @returns Promise
   */
  var myFunction = function(i) {
    return new Promise(function(resolve, reject) {
      // here we simulate that the promise runs some code
      // asynchronously
      setTimeout(function() {
        console.log(i + ": " + Math.random());
        resolve(i);
      }, 10);
    });
  };

  var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 1,           // up to 1 request per second
    promiseImplementation: Promise  // the Promise library you are using
  });

  var amountOfPromises = 10;
  while (amountOfPromises-- > 0) {
    promiseThrottle.add(myFunction.bind(this, amountOfPromises))
      .then(function(i) {
        console.log("Promise " + i + " done");
      });
  }

  // example using Promise.all
  var one = promiseThrottle.add(myFunction.bind(this, 1));
  var two = promiseThrottle.add(myFunction.bind(this, 2));
  var three = promiseThrottle.add(myFunction.bind(this, 3));

  Promise.all([one, two, three])
    .then(function(r) {
        console.log("Promises " + r.join(", ") + " done");
    });
```

## Requirements
* Node.js >= 10.0.0

## Installation

For node.js, install the module with: `npm i promise-throttle`

## Development

Install the dependencies using `npm install`.
Run `npm start` to lint, test and browserify promise-thottle.

## License

MIT
