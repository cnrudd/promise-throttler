import PromiseThrottler from 'promise-throttler';
import https from 'https';

// Create a throttler that allows 2 requests per second
const throttler = new PromiseThrottler({
  requestsPerSecond: 2
});

function formatEpochToHourMinSecMs(epochMs) {
  const date = new Date(epochMs);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * Makes an HTTP GET request to a URL
 */
function makeHttpRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`✓ Request to ${url} started at ${formatEpochToHourMinSecMs(startTime)}, completed in ${duration}ms`);
        resolve({
          url,
          statusCode: res.statusCode,
          duration,
          dataLength: data.length
        });
      });
    }).on('error', (err) => {
      console.error(`✗ Request to ${url} failed:`, err.message);
      reject(err);
    });
  });
}

/**
 * Demonstrates throttled API requests
 */
async function demonstrateThrottling() {
  console.log('🚀 Starting throttled HTTP requests demo...');
  console.log('📊 Rate limit: 2 requests per second\n');

  // List of URLs to request (using httpbin.org for testing)
  const urls = [
    'https://httpbin.org/delay/0.1',
    'https://httpbin.org/delay/0.2', 
    'https://httpbin.org/delay/0.3',
    'https://httpbin.org/delay/0.4',
    'https://httpbin.org/delay/0.5',
    'https://httpbin.org/delay/0.6'
  ];

  const startTime = Date.now();

  try {
    // Add all requests to the throttler
    const promises = urls.map(url => 
      throttler.add(() => makeHttpRequest(url))
    );

    // Wait for all requests to complete
    const results = await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 All ${results.length} requests completed in ${totalTime}ms`);
    console.log('📈 Results summary:');
    
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.url} - ${result.statusCode} (${result.duration}ms)`);
    });

    console.log(`\n⏱️  Average time between requests: ${totalTime / results.length}ms`);
    console.log('🔄 Notice how requests are spaced out due to throttling!');

  } catch (error) {
    console.error('❌ Error during demonstration:', error);
  }
}

// Run the demonstration
demonstrateThrottling();