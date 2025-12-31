# Promise Throttler React Demo

A minimal React single page application demonstrating the promise-throttler package.

## Features

- Makes throttled HTTP requests using promise-throttler
- Visual feedback showing request timing
- Configurable throttling rate (set to 2 requests per second)

## Running the Demo

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

4. Click "Start Demo" to see 6 API requests being throttled to 2 per second

## How it Works

The demo creates 6 HTTP requests to httpbin.org and adds them all to a PromiseThrottler instance configured for 2 requests per second. You'll see the requests complete at roughly 500ms intervals, demonstrating the throttling behavior.