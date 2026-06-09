import { AutomationTriggerService } from '../../src/services/AutomationTriggerService';
import { SocialCopyService } from '../../src/services/SocialCopyService';
import { LoftyIntegrationService } from '../../src/services/LoftyIntegrationService';
import { AssetStorageService } from '../../src/services/AssetStorageService';
import { SocialPublishingService } from '../../src/services/SocialPublishingService';
import { SocialPostDraft } from '../../src/models/SocialPostDraft';

// Skip this deep integration test locally if live keys are not fully present.
// We require at least ONE major platform key to confidently say the E2E works.
// Temporarily executing locally to verify integration
const runE2E = describe;

runE2E('Pipeline End-to-End Walkthrough', () => {
  it('should take a mock webhook payload and drive it completely through the pipeline', async () => {
    // 1. Initial Webhook Payload
    const mockPayload = {
      event: 'listing_status_changed',
      listingId: 'MLS-999-E2E',
      address: '999 E2E Testing Blvd',
      agentId: 'agent-1'
    };

    // 2. Trigger the job creation
    const job = await AutomationTriggerService.handleWebhook(mockPayload);
    expect(job).toBeDefined();
    if (!job) return; // TS guard
    expect(job.propertyAddress).toBe('999 E2E Testing Blvd');

    // 3. Mock file ingestion and save
    const mockFiles = ['/tmp/source1.jpg', '/tmp/source2.jpg'];
    // AssetStorageService saves files via buffers. We will mock the output path for testing purposes.
    const finalImagePath = AssetStorageService.generateFilename('999 E2E Testing Blvd', 'Just Listed', 'day', 1);

    // 4. Generate Copy
    const copy = await SocialCopyService.generateSocialCopy(
      job.propertyAddress,
      job.stage,
      ['End to End Highlights']
    );
    expect(copy.length).toBeGreaterThan(0);

    // 5. Create Landing Page
    const page = await LoftyIntegrationService.createOrUpdateLandingPage(
      job.id,
      job.propertyAddress,
      'http://mock.com/hero.jpg',
      ['End to End Highlights']
    );
    expect(page.publishStatus).toBe('Draft');

    // 6. Finalize and Mock Publish
    const draft: SocialPostDraft = {
      id: `draft-e2e-${Date.now()}`,
      jobId: job.id,
      platform: 'Facebook',
      caption: copy,
      imagePath: '/mock/final.jpg',
      approvalStatus: 'Approved', // Mock approved so we can publish immediately
      publishStatus: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const published = await SocialPublishingService.publishPost(draft);
    expect(published.publishStatus).toBe('Published');
  });
});
