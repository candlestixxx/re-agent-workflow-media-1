import express, { Request, Response } from 'express';
import { FolderDetectionService } from './services/FolderDetectionService';
import { DatabaseService } from './services/DatabaseService';
import { MessageBroker } from './utils/MessageBroker';
import { MicroserviceOrchestrator } from './services/MicroserviceOrchestrator';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Initialize the API Gateway subscriptions
MessageBroker.init().then(() => {
  MessageBroker.subscribe('job_state_changed', (job) => {
    console.log(`[API Gateway] Received job state update for ${job.id}`);
    io.emit('job_update', job);
  });
});

// Spin up the background worker (In a true microservice setup, this would be a separate Node process)
// For Phase 10 demo purposes, we boot it concurrently.
MicroserviceOrchestrator.startWorker();

io.on('connection', (socket) => {
  console.log('[WebSocket] Client connected');
  socket.on('disconnect', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

/**
 * Root route serving a simple dashboard.
 */
app.get('/', async (req: Request, res: Response) => {
  const jobs = await DatabaseService.getAllListingMediaJobs();
  const availableFolders = FolderDetectionService.discoverAvailableFolders();
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Marketing Pipeline Dashboard</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f7f6; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .card h3 { margin-top: 0; color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; }
            .card p { font-size: 1.8rem; font-weight: bold; margin: 0; color: #2c3e50; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 30px; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
            th { background-color: #3498db; color: white; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; }
            tr:hover { background-color: #f9f9f9; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
            .status-pending { background: #ffeaa7; color: #d63031; }
            .status-completed { background: #55efc4; color: #00b894; }
            .nav { margin-bottom: 20px; }
            .nav a { margin-right: 15px; color: #3498db; text-decoration: none; font-weight: bold; }
            .nav a:hover { text-decoration: underline; }
            .btn { background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; }
            .btn:hover { background: #2980b9; }
            .discovery-list { list-style: none; padding: 0; }
            .discovery-item { background: white; padding: 10px; border-radius: 4px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
            .discovery-item span { font-size: 0.9rem; font-weight: 500; }
            .discovery-item code { font-size: 0.75rem; color: #7f8c8d; }
        </style>
    </head>
    <body>
        <h1>Real Estate Marketing Media Pipeline</h1>
        <div class="nav">
            <a href="/">Dashboard</a>
            <a href="/health">Health Check</a>
            <a href="/api/jobs">JSON API</a>
        </div>
        
        <div class="stats">
            <div class="card">
                <h3>Total Jobs</h3>
                <p>${jobs.length}</p>
            </div>
            <div class="card">
                <h3>Active Pipeline</h3>
                <p>${jobs.filter(j => j.status !== 'Published').length}</p>
            </div>
            <div class="card">
                <h3>System Status</h3>
                <p style="color: #00b894;">Online</p>
            </div>
        </div>

        <div class="grid">
            <div class="main-panel">
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
                        ${jobs.length > 0 ? jobs.map(job => `
                            <tr id="job-row-${job.id}">
                                <td><code>${job.id}</code></td>
                                <td>${job.propertyAddress}</td>
                                <td class="job-stage">${job.stage}</td>
                                <td class="job-status"><span class="status ${job.status === 'Published' ? 'status-completed' : 'status-pending'}">${job.status}</span></td>
                                <td>${new Date(job.createdAt).toLocaleString()}</td>
                            </tr>
                        `).join('') : '<tr id="no-jobs-row"><td colspan="5" style="text-align:center;">No jobs found in the pipeline.</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div class="side-panel">
                <h2>Discovered Folders</h2>
                <p style="font-size: 0.8rem; color: #7f8c8d; margin-bottom: 15px;">We found these potential property folders on your Desktop/Downloads. Click process to start a manual job.</p>
                <ul class="discovery-list">
                    ${availableFolders.slice(0, 15).map((f: any) => `
                        <li class="discovery-item">
                            <div>
                                <span>${f.name}</span><br>
                                <code>.../${f.name}</code>
                            </div>
                            <button class="btn" onclick="triggerManualJob('${f.name}')">Process</button>
                        </li>
                    `).join('')}
                    ${availableFolders.length > 15 ? '<li style="text-align:center; font-size: 0.8rem; color: #7f8c8d;">... and ' + (availableFolders.length - 15) + ' more</li>' : ''}
                </ul>
            </div>
        </div>
        
        <p style="margin-top: 20px; font-size: 0.8rem; color: #95a5a6;">Server Port: ${PORT} | Environment: Production</p>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();

            socket.on('job_update', (job) => {
                const tbody = document.querySelector('tbody');
                let row = document.getElementById('job-row-' + job.id);

                const statusClass = job.status === 'Published' ? 'status-completed' : 'status-pending';
                const statusHtml = '<span class="status ' + statusClass + '">' + job.status + '</span>';

                if (row) {
                    // Update existing row
                    row.querySelector('.job-stage').innerText = job.stage;
                    row.querySelector('.job-status').innerHTML = statusHtml;
                } else {
                    // Remove "No jobs" row if it exists
                    const noJobsRow = document.getElementById('no-jobs-row');
                    if (noJobsRow) noJobsRow.remove();

                    // Create new row
                    row = document.createElement('tr');
                    row.id = 'job-row-' + job.id;
                    row.innerHTML = '<td><code>' + job.id + '</code></td>' +
                                    '<td>' + job.propertyAddress + '</td>' +
                                    '<td class="job-stage">' + job.stage + '</td>' +
                                    '<td class="job-status">' + statusHtml + '</td>' +
                                    '<td>' + new Date(job.createdAt).toLocaleString() + '</td>';
                    tbody.prepend(row);
                }
            });

            async function triggerManualJob(address) {
                if (!confirm('Start processing media for "' + address + '"?')) return;
                
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
                        window.location.reload();
                    } else {
                        const error = await response.json();
                        alert('Error starting job: ' + (error.error || 'Unknown error'));
                    }
                } catch (err) {
                    alert('Failed to connect to server: ' + err.message);
                }
            }
        </script>
    </body>
    </html>
  `;
  res.send(html);
});

/**
 * JSON API for listing jobs.
 */
app.get('/api/jobs', async (req: Request, res: Response) => {
  const jobs = await DatabaseService.getAllListingMediaJobs();
  res.json(jobs);
});

/**
 * Discovery API to list available folders.
 */
app.get('/api/discover', (req: Request, res: Response) => {
  const folders = FolderDetectionService.discoverAvailableFolders();
  res.json(folders);
});

/**
 * Health check endpoint.
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Real Estate Marketing Media Pipeline is running.' });
});

/**
 * Webhook interceptor for CRM events (API Gateway Boundary).
 */
app.post('/webhook/crm', async (req: Request, res: Response) => {
  const payload = req.body;
  console.log('\n[API Gateway Webhook Received] Event: ' + (payload.event || 'Unknown'));

  try {
    // Push the payload to Redis for background processing
    await MessageBroker.publish('job_created', payload);

    // Immediately respond to the CRM to prevent timeouts
    res.status(202).json({ message: 'Payload received and queued for processing.' });
  } catch (error) {
    console.error('❌ Gateway Error:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Failed to queue payload' });
  }
});

// Start the Express server
server.listen(PORT, () => {
  console.log('--- 🚀 Real Estate Marketing Media Pipeline Server listening on port ' + PORT + ' ---');
});
