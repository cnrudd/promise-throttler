Promise Throttle 
==================


This is a small library adapted from (https://github.com/JMPerez/promise-throttle) [JMPerez/promise-throttle] to limit the amount of promises run per unit of time. It is useful for scenarios such as Rest APIs consumption, where we are normally rate-limited to a certain amount of requests per time.

This version differs from JMPerez/promise-throttle in that it will run all promises allowed within a unit of time without delay, and then will wait for all promises to be resolved and for the unit of time to have expired, before starting the next batch of promises.
This eliminates the risk of latency in network requests causing your well behaved throttled calls to still get dinged for rate limit abuse due to latent calls piling up on the endpoint.

It doesn't have any dependencies. If you are running this on Node.js, you will need to pass whatever Promise library you are using in the constructor.

Then, you add functions to the `PromiseThrottle` that, once called, return a `Promise`.

## Use

The library can be used either server-side or in the browser.

```javascript
  var PromiseThrottle = require('promise-throttle');
  /**
   * A function that once called returns a promise
   * @return Promise
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

## Installation

For node.js, install the module with: `npm i promise-throttle`

If you are using it in a browser, you can use bower: `bower install promise-throttle`

## Development

Install the dependencies using `npm install`.
Run `npm start` to lint, test and browserify promise-thottle.

## License

MIT
