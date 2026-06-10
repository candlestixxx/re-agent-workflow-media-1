import express, { Request, Response } from 'express';
import { AutomationTriggerService } from './services/AutomationTriggerService';
import { SocialCopyService } from './services/SocialCopyService';
import { LoftyIntegrationService } from './services/LoftyIntegrationService';
import { SocialPostDraft } from './models/SocialPostDraft';
import { DatabaseService } from './services/DatabaseService';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Root route serving a simple dashboard.
 */
app.get('/', async (req: Request, res: Response) => {
  const jobs = await DatabaseService.getAllListingMediaJobs();
  
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
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .card h3 { margin-top: 0; color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; }
            .card p { font-size: 1.8rem; font-weight: bold; margin: 0; color: #2c3e50; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
            th { background-color: #3498db; color: white; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; }
            tr:hover { background-color: #f9f9f9; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
            .status-pending { background: #ffeaa7; color: #d63031; }
            .status-completed { background: #55efc4; color: #00b894; }
            .nav { margin-bottom: 20px; }
            .nav a { margin-right: 15px; color: #3498db; text-decoration: none; font-weight: bold; }
            .nav a:hover { text-decoration: underline; }
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
                    <tr>
                        <td><code>${job.id}</code></td>
                        <td>${job.propertyAddress}</td>
                        <td>${job.stage}</td>
                        <td><span class="status ${job.status === 'Published' ? 'status-completed' : 'status-pending'}">${job.status}</span></td>
                        <td>${new Date(job.createdAt).toLocaleString()}</td>
                    </tr>
                `).join('') : '<tr><td colspan="5" style="text-align:center;">No jobs found in the pipeline.</td></tr>'}
            </tbody>
        </table>
        
        <p style="margin-top: 20px; font-size: 0.8rem; color: #95a5a6;">Server Port: ${PORT} | Environment: Production</p>
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
 * Health check endpoint.
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Real Estate Marketing Media Pipeline is running.' });
});

/**
 * Webhook interceptor for CRM events.
 */
app.post('/webhook/crm', async (req: Request, res: Response) => {
  const payload = req.body;
  console.log(`\n[Webhook Received] Event: ${payload.event || 'Unknown'}`);

  try {
    // 1. Trigger service safely verifies the folder structures and spins up a job
    const job = await AutomationTriggerService.handleWebhook(payload);

    if (!job) {
      res.status(200).json({ message: 'Payload ignored. Event type not actionable.' });
      return;
    }

    console.log(`✅ Pipeline Job Initialized: ${job.id}`);
    console.log(`   Property: ${job.propertyAddress}`);
    console.log(`   Stage: ${job.stage}`);

    // Respond to the webhook early to prevent timeouts; process the rest asynchronously.
    res.status(202).json({ message: 'Job initialized', jobId: job.id });

    // 2. Asynchronously Generate Social Copy
    console.log('\n[2] Generating Social Copy via AI Wrapper...');
    const copy = await SocialCopyService.generateSocialCopy(
      job.propertyAddress,
      job.stage,
      ['Beautiful landscaping', 'Modern kitchen'] // Example highlights
    );
    console.log(`✅ Copy Generated: "${copy.substring(0, 50)}..."`);

    // 3. Asynchronously Generate Landing Page
    console.log('\n[3] Building Lofty Landing Page Skeleton...');
    const landingPage = await LoftyIntegrationService.createOrUpdateLandingPage(
      job.id,
      job.propertyAddress,
      `${job.sourceFolderPath}/hero.jpg`,
      ['Beautiful landscaping', 'Modern kitchen']
    );
    console.log(`✅ Landing Page Job Status: ${landingPage.publishStatus}`);

    // 4. Draft the final Social Post artifact
    console.log('\n[4] Drafting Social Post for Approval...');
    const draft: SocialPostDraft = {
      id: `draft-${Date.now()}`,
      jobId: job.id,
      platform: 'Facebook',
      caption: copy,
      imagePath: `${job.sourceFolderPath}/final_export.jpg`,
      approvalStatus: 'Pending',
      publishStatus: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(`✅ Draft Created (${draft.platform}). Pending Approval.`);
    console.log('\n--- 🎉 Pipeline Execution Cycle Complete ---');

  } catch (error) {
    console.error('❌ Pipeline Error:', error instanceof Error ? error.message : error);

    // If headers haven't been sent yet, return the error to the caller
    if (!res.headersSent) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`--- 🚀 Real Estate Marketing Media Pipeline Server listening on port ${PORT} ---`);
});
