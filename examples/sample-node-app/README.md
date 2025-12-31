# Sample Node.js App - Promise Throttler Demo

This sample application demonstrates how to use the `promise-throttler` package to make rate-limited HTTP requests.

## What it does

- Creates a throttler that limits requests to 2 per second
- Makes 6 HTTP requests to httpbin.org (a testing service)
- Shows how requests are automatically spaced out to respect the rate limit
- Displays timing information to demonstrate the throttling effect

## Running the demo

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the application:
   ```bash
   npm start
   ```

## Expected output

You should see output similar to:
```
🚀 Starting throttled HTTP requests demo...
📊 Rate limit: 2 requests per second

✓ Request to https://httpbin.org/delay/0.1 completed in 234ms
✓ Request to https://httpbin.org/delay/0.2 completed in 345ms
✓ Request to https://httpbin.org/delay/0.1 completed in 156ms
✓ Request to https://httpbin.org/delay/0.3 completed in 423ms
✓ Request to https://httpbin.org/delay/0.1 completed in 167ms
✓ Request to https://httpbin.org/delay/0.2 completed in 278ms

🎉 All 6 requests completed in 3456ms
📈 Results summary:
   1. https://httpbin.org/delay/0.1 - 200 (234ms)
   2. https://httpbin.org/delay/0.2 - 200 (345ms)
   3. https://httpbin.org/delay/0.1 - 200 (156ms)
   4. https://httpbin.org/delay/0.3 - 200 (423ms)
   5. https://httpbin.org/delay/0.1 - 200 (167ms)
   6. https://httpbin.org/delay/0.2 - 200 (278ms)

⏱️  Average time between requests: 576ms
🔄 Notice how requests are spaced out due to throttling!
```

## Key concepts demonstrated

- **Rate limiting**: Requests are automatically spaced to respect the 2 requests/second limit
- **Promise handling**: All requests use Promises and can be awaited with `Promise.all()`
- **Error handling**: Failed requests are caught and handled gracefully
- **Real-world usage**: Shows practical HTTP request throttling for API consumption