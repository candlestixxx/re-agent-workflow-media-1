import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

interface Job {
  id: string;
  propertyAddress: string;
  stage: string;
  status: string;
  createdAt: string;
}

interface DiscoveredFolder {
  name: string;
  path: string;
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [folders, setFolders] = useState<DiscoveredFolder[]>([]);

  useEffect(() => {
    // Fetch initial state
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(console.error);

    fetch('/api/discover')
      .then(res => res.json())
      .then(data => setFolders(data))
      .catch(console.error);

    // Socket Setup
    const socket: Socket = io();

    socket.on('job_update', (updatedJob: Job) => {
      setJobs(prevJobs => {
        const idx = prevJobs.findIndex(j => j.id === updatedJob.id);
        if (idx > -1) {
          const newJobs = [...prevJobs];
          newJobs[idx] = updatedJob;
          return newJobs;
        } else {
          return [updatedJob, ...prevJobs];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const triggerManualJob = async (address: string) => {
    if (!window.confirm(`Start processing media for "${address}"?`)) return;

    try {
      const response = await fetch('/webhook/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'listing.created',
          listingId: 'MANUAL-' + Date.now(),
          address: address,
          agentId: 'manual-trigger'
        })
      });

      if (response.ok) {
        alert('Job started for ' + address);
      } else {
        const error = await response.json();
        alert('Error starting job: ' + (error.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to connect to server: ' + err.message);
    }
  };

  const retryJob = async (jobId: string) => {
    if (!window.confirm(`Are you sure you want to retry job ${jobId}?`)) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}/retry`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Job requeued successfully.');
      } else {
        const error = await response.json();
        alert('Error retrying job: ' + (error.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Failed to connect to server: ' + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1>Real Estate Marketing Media Pipeline</h1>
        <a href="https://excellegacyrealtygroup.site" style={{ fontSize: '13px', color: '#f57c00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← Main Dashboard
        </a>
      </div>

      {/* Project Goal */}
      <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>🎬</div>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', margin: 0 }}>Media Workflow — Photo/Video Pipeline</h2>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', lineHeight: '1.6' }}>
              Property photo import, storyboard generation, AI promo videos, and FFmpeg export.
              Automates the marketing media pipeline from raw listing photos to published promo videos
              with brand overlay. Part of the <a href="https://excellegacyrealtygroup.site" style={{ color: '#f57c00', textDecoration: 'underline' }}>Excel Legacy Realty Group</a> platform.
            </p>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="card">
          <h3>Total Jobs</h3>
          <p>{jobs.length}</p>
        </div>
        <div className="card">
          <h3>Active Pipeline</h3>
          <p>{jobs.filter(j => j.status !== 'Published').length}</p>
        </div>
        <div className="card">
          <h3>System Status</h3>
          <p style={{ color: '#00b894' }}>Online</p>
        </div>
      </div>

      <div className="grid">
        <div className="main-panel">
          <h2>Active Pipeline Jobs</h2>
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Property Address</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? jobs.map(job => (
                <tr key={job.id}>
                  <td><code>{job.id}</code></td>
                  <td>{job.propertyAddress}</td>
                  <td>{job.stage}</td>
                  <td>
                    <span className={`status ${job.status === 'Published' ? 'status-completed' : job.status === 'Failed' ? 'status-failed' : 'status-pending'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    {new Date(job.createdAt).toLocaleString()}
                    {job.status === 'Failed' && (
                      <button className="btn retry-btn" onClick={() => retryJob(job.id)} style={{ marginLeft: '10px' }}>
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No jobs found in the pipeline.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="side-panel">
          <h2>Discovered Folders</h2>
          <p className="discovery-help">We found these potential property folders on your Desktop/Downloads. Click process to start a manual job.</p>
          <ul className="discovery-list">
            {folders.slice(0, 15).map((f) => (
              <li key={f.name} className="discovery-item">
                <div>
                  <span>{f.name}</span><br />
                  <code>.../{f.name}</code>
                </div>
                <button className="btn" onClick={() => triggerManualJob(f.name)}>Process</button>
              </li>
            ))}
            {folders.length > 15 && (
              <li style={{ textAlign: 'center', fontSize: '0.8rem', color: '#7f8c8d' }}>
                ... and {folders.length - 15} more
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
