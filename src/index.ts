import { AutomationTriggerService } from './services/AutomationTriggerService';
import { SocialCopyService } from './services/SocialCopyService';
import { LoftyIntegrationService } from './services/LoftyIntegrationService';
import { SocialPostDraft } from './models/SocialPostDraft';

/**
 * Main entry point for the Real Estate Marketing Media Pipeline.
 *
 * In a production environment, this file might wrap an Express.js server
 * listening for incoming webhooks. For this MVP skeleton, we simulate
 * the orchestration pipeline triggered by a mock webhook.
 */
async function run() {
  console.log('--- 🚀 Starting Real Estate Marketing Media Pipeline ---');

  // 1. Simulate an incoming webhook from the CRM when a new listing is created
  console.log('\n[1] Intercepting CRM Webhook (listing.created)...');

  const mockWebhookPayload = {
    event: 'listing.created',
    listingId: 'MLS-999999',
    address: '888 Test Runner Lane',
    agentId: 'lum-1'
  };

  try {
    // The trigger service safely verifies the folder structures and spins up a job
    const job = await AutomationTriggerService.handleWebhook(mockWebhookPayload);

    if (!job) {
      console.log('No job created for payload.');
      return;
    }

    console.log(`✅ Pipeline Job Initialized: ${job.id}`);
    console.log(`   Property: ${job.propertyAddress}`);
    console.log(`   Stage: ${job.stage}`);
    console.log(`   Source Path: ${job.sourceFolderPath}`);

    // 2. Generate Social Copy
    console.log('\n[2] Generating Social Copy via AI Wrapper...');
    const copy = await SocialCopyService.generateSocialCopy(
      job.propertyAddress,
      job.stage,
      ['Beautiful landscaping', 'Modern kitchen']
    );
    console.log(`✅ Copy Generated: "${copy.substring(0, 50)}..."`);

    // 3. Generate Landing Page
    console.log('\n[3] Building Lofty Landing Page Skeleton...');
    const landingPage = await LoftyIntegrationService.createOrUpdateLandingPage(
      job.id,
      job.propertyAddress,
      `${job.sourceFolderPath}/hero.jpg`,
      ['Beautiful landscaping', 'Modern kitchen']
    );
    console.log(`✅ Landing Page Job Status: ${landingPage.publishStatus}`);
    if (landingPage.pageUrl) {
      console.log(`   URL: ${landingPage.pageUrl}`);
    }

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

    console.log(`✅ Draft Created (${draft.platform})`);
    console.log(`   Approval Status: ${draft.approvalStatus}`);

    console.log('\n--- 🎉 Pipeline Execution Complete ---');

  } catch (error) {
    console.error('❌ Pipeline Error:', error instanceof Error ? error.message : error);
  }
}

// Execute the mock pipeline run
run();
