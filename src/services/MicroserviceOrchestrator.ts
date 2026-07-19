import { AutomationTriggerService } from './AutomationTriggerService';
import { SocialCopyService } from './SocialCopyService';
import { LoftyIntegrationService } from './LoftyIntegrationService';
import { SocialPostDraft } from '../models/SocialPostDraft';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { MessageBroker } from '../utils/MessageBroker';

export class MicroserviceOrchestrator {
  public static async startWorker() {
    await MessageBroker.init();
    console.log('[Worker] Listening for background pipeline jobs...');

    await MessageBroker.subscribe('job_created', async (payload: any) => {
      console.log(`[Worker] Received job execution request for webhook payload: ${payload.event}`);

      try {
        PerformanceMonitor.snapshotMemory();
        const job = await PerformanceMonitor.measure('handleWebhook', async () => {
          return await AutomationTriggerService.handleWebhook(payload);
        });

        if (!job) {
          console.log('[Worker] Payload ignored. Event type not actionable.');
          return;
        }

        console.log(`✅ Pipeline Job Initialized: ${job.id}`);
        console.log(`   Property: ${job.propertyAddress}`);
        console.log(`   Stage: ${job.stage}`);

        // Emit state back to API Gateway for UI updates
        await MessageBroker.publish('job_state_changed', job);

        // 2. Asynchronously Generate Social Copy
        console.log('\n[2] Generating Social Copy via AI Wrapper...');
        const copy = await PerformanceMonitor.measure('generateSocialCopy', async () => {
          return await SocialCopyService.generateSocialCopy(
            job.propertyAddress,
            job.stage,
            ['Beautiful landscaping', 'Modern kitchen'] // Example highlights
          );
        });
        console.log(`✅ Copy Generated: "${copy.substring(0, 50)}..."`);

        // 3. Asynchronously Sync to Local RealEstateCRM / Lofty Landing Page
        console.log('\n[3] Building Lofty Landing Page Skeleton...');
        const landingPage = await PerformanceMonitor.measure('createLandingPage', async () => {
          return await LoftyIntegrationService.createOrUpdateLandingPage(
            job.id,
            job.propertyAddress,
            `${job.sourceFolderPath}/hero.jpg`,
            ['Beautiful landscaping', 'Modern kitchen']
          );
        });
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

        // Simulate Job Update to 'Pending_Approval'
        job.status = 'Pending_Approval';
        await MessageBroker.publish('job_state_changed', job);

        console.log(`✅ Draft Created (${draft.platform}). Pending Approval.`);
        console.log('\n--- 🎉 Pipeline Execution Cycle Complete ---');
        PerformanceMonitor.snapshotMemory();
        console.log(PerformanceMonitor.getAverages());
        PerformanceMonitor.clear();

      } catch (error) {
        console.error('❌ Worker Pipeline Error:', error instanceof Error ? error.message : error);
      }
    });
  }
}
