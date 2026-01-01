import { useState } from 'react'
import PromiseThrottler from 'promise-throttler'

interface RequestResult {
  id: number;
  status: number;
  startTime: string;
  endTime: number;
  duration: number;
}

function formatEpochToHourMinSecMs(epochMs: number): string {
  const date = new Date(epochMs);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function App() {
  const [requests, setRequests] = useState<RequestResult[]>([])
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [requestCount, setRequestCount] = useState<number>(6)
  const [requestsPerSecond, setRequestsPerSecond] = useState<number>(2)
  const [runSequentially, setRunSequentially] = useState<boolean>(false)

  const makeRequest = (id: number): Promise<void> => {
    const startTime = Date.now();
    return fetch(`https://httpbin.org?count=${id}`)
      .then(response => {
        const result: RequestResult = {
          id,
          status: response.status,
          startTime: formatEpochToHourMinSecMs(startTime),
          endTime: Date.now(),
          duration: Date.now() - startTime
        };
        setRequests(prev => [...prev, result]);
      });
  }

  const runDemo = async (): Promise<void> => {
    setIsRunning(true)
    setRequests([])
    
    const throttler = new PromiseThrottler({ requestsPerSecond, runSequentially })
    
    if (!runSequentially) {
      const fns = Array.from({ length: requestCount }, (_, i) => () => makeRequest(i + 1))
      await throttler.addAll(fns)
    } else {
      const promises = Array.from({ length: requestCount }, (_, i) => 
        throttler.add(() => makeRequest(i + 1))
      )
      
      await Promise.all(promises)
    }
    
    setIsRunning(false)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Promise Throttler Demo</h1>
      <p>Configure and run throttled API requests to https://httpbin.org.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Request Count:
          <input 
            type="number" 
            value={requestCount} 
            onChange={(e) => setRequestCount(Number(e.target.value))} 
            min="1" 
            max="20"
            disabled={isRunning}
            style={{ marginLeft: '8px', padding: '4px', width: '60px' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Requests per Second:
          <input 
            type="number" 
            value={requestsPerSecond} 
            onChange={(e) => setRequestsPerSecond(Number(e.target.value))} 
            min="0.1" 
            max="10" 
            step="0.1"
            disabled={isRunning}
            style={{ marginLeft: '8px', padding: '4px', width: '60px' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Run Sequentially:
          <input 
            type="checkbox" 
            checked={runSequentially} 
            onChange={(e) => setRunSequentially(e.target.checked)} 
            disabled={isRunning}
            style={{ marginLeft: '8px' }}
          />
        </label>
      </div>
      
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