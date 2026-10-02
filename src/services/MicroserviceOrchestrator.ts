import { AutomationTriggerService } from './AutomationTriggerService';
import { SocialCopyService } from './SocialCopyService';
import { LoftyIntegrationService } from './LoftyIntegrationService';
import { DatabaseService } from './DatabaseService';
import { ApprovalWorkflowService } from './ApprovalWorkflowService';
import { SocialPostDraft } from '../models/SocialPostDraft';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { MessageBroker } from '../utils/MessageBroker';

export class MicroserviceOrchestrator {
  public static async startWorker() {
    await MessageBroker.init();
    console.log('[Worker] Listening for background pipeline jobs...');

    await MessageBroker.subscribe('job_created', async (payload: any) => {
      console.log(`[Worker] Received job execution request for webhook payload: ${payload.event}`);

      let currentJob: any = null;

      try {
        PerformanceMonitor.snapshotMemory();
        const job = await PerformanceMonitor.measure('handleWebhook', async () => {
          return await AutomationTriggerService.handleWebhook(payload);
        });

        if (!job) {
          console.log('[Worker] Payload ignored. Event type not actionable.');
          return;
        }

        currentJob = job;

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

        // Submit Job to 'Pending_Approval' queue
        let currentStatusJob = ApprovalWorkflowService.submitForApproval(job);
        await MessageBroker.publish('job_state_changed', currentStatusJob);
        console.log(`✅ Draft Created (${draft.platform}). Job state shifted to Pending_Approval.`);

        // Phase 14: Headless AI Auto-Approval execution
        // autoApproveJob returns { job, review } — keep the review available for
        // logging/audit while carrying the updated job forward.
        console.log('\n[5] Executing AI Agent Compliance Check...');
        const { job: approvedJob, review: autoReview } = await ApprovalWorkflowService.autoApproveJob(currentStatusJob);
        currentStatusJob = approvedJob;
        await MessageBroker.publish('job_state_changed', currentStatusJob);
        console.log(`✅ Job Auto-Approved by AI Reviewer. passed=${autoReview.passed} score=${autoReview.score}`);

        console.log('\n--- 🎉 Pipeline Execution Cycle Complete ---');
        PerformanceMonitor.snapshotMemory();
        console.log(PerformanceMonitor.getAverages());
        PerformanceMonitor.clear();

      } catch (error) {
        console.error('❌ Worker Pipeline Error:', error instanceof Error ? error.message : error);

        if (currentJob) {
          // Implement Dead Letter Queue logic by emitting a failed state
          currentJob.status = 'Failed';
          await DatabaseService.updateJobStatus(currentJob.id, 'Failed');
          await MessageBroker.publish('job_state_changed', currentJob);
          console.log(`[DLQ] Job ${currentJob.id} moved to Failed state.`);
        }
      }
    });
  }
}
