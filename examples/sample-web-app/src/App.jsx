import React, { useState } from 'react'
import PromiseThrottler from 'promise-throttler'

const throttler = new PromiseThrottler({
  requestsPerSecond: 2
})

/**
 * Formats an epoch time in milliseconds to a string in HH:MM:SS.mmm format.
 * @param {number} epochMs - The epoch time in milliseconds.
 * @returns {string} The formatted time string.
 */
function formatEpochToHourMinSecMs(epochMs) {
  const date = new Date(epochMs);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function App() {
  const [requests, setRequests] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const makeRequest = (id) => {
    const startTime = Date.now();
    return fetch(`https://httpbin.org?count=${id}`)
      .then(response => ({
        id,
        status: response.status,
        startTime: formatEpochToHourMinSecMs(startTime),
        endTime: Date.now(),
        duration: Date.now() - startTime
      }))
  }

  const runDemo = async () => {
    setIsRunning(true)
    setRequests([])
    
    const promises = Array.from({ length: 6 }, (_, i) => 
      throttler.add(() => makeRequest(i + 1))
    )

    for (const promise of promises) {
      promise.then(result => {
        setRequests(prev => [...prev, result])
      })
    }

    await Promise.all(promises)
    setIsRunning(false)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Promise Throttler Demo</h1>
      <p>This demo makes 6 API requests throttled to 2 requests per second.</p>
      
      <button 
        onClick={runDemo} 
        disabled={isRunning}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: isRunning ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRunning ? 'not-allowed' : 'pointer'
        }}
      >
        {isRunning ? 'Running...' : 'Start Demo'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Request Results:</h3>
        {requests.length === 0 && !isRunning && (
          <p>Click "Start Demo" to see throttled requests in action.</p>
        )}
        {requests.map(request => (
          <div key={request.id} style={{ 
            padding: '8px', 
            margin: '4px 0', 
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px'
          }}>
            Request {request.id}: Status {request.status}.  Started at {request.startTime}, completed in {request.duration}ms
          </div>
        ))}
      </div>
    </div>
  )
}

export default App