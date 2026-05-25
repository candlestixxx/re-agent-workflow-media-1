import express, { Request, Response } from 'express';
import { AutomationTriggerService } from './services/AutomationTriggerService';
import { SocialCopyService } from './services/SocialCopyService';
import { LoftyIntegrationService } from './services/LoftyIntegrationService';
import { SocialPostDraft } from './models/SocialPostDraft';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
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

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(`[${new Date().toISOString()}] 🛑 UNHANDLED ERROR:`, err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : 'An unexpected error occurred'
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`--- 🚀 Real Estate Marketing Media Pipeline Server listening on port ${PORT} ---`);
});
