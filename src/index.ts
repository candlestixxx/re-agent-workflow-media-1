import express, { Request, Response } from 'express';
import { FolderDetectionService } from './services/FolderDetectionService';
import { DatabaseService } from './services/DatabaseService';
import { MessageBroker } from './utils/MessageBroker';
import { MicroserviceOrchestrator } from './services/MicroserviceOrchestrator';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

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

// Serve the compiled Vite React frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

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
