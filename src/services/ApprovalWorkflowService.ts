import { ListingMediaJob, JobStatus } from '../models/ListingMediaJob';
import { GeneratedAsset } from '../models/GeneratedAsset';
import { SocialPostDraft } from '../models/SocialPostDraft';
import { AIBrandReviewService, ReviewResult } from './AIBrandReviewService';
import { AlertingService } from './AlertingService';

export class ApprovalWorkflowService {
  public static submitForApproval(job: ListingMediaJob): ListingMediaJob {
    if (job.status !== 'Draft' && job.status !== 'Pending_Generation') {
      throw new Error('Cannot submit job for approval from status: ' + job.status);
    }
    return {
      ...job,
      status: 'Pending_Approval',
      updatedAt: new Date()
    };
  }

  public static async autoApproveJob(
    job: ListingMediaJob,
    assets: GeneratedAsset[] = [],
    socialPosts: SocialPostDraft[] = []
  ): Promise<{ job: ListingMediaJob; review: ReviewResult }> {
    if (job.status !== 'Pending_Approval') {
      throw new Error('Only jobs in Pending_Approval can be auto-approved. Current: ' + job.status);
    }

    const review = await AIBrandReviewService.reviewJob(job, assets, socialPosts);
    await AIBrandReviewService.logCompliance(job.id, 'Asset', review);

    if (review.passed) {
      const approvedJob = this.approveJob(job, review.reviewer);
      await AlertingService.sendAlert(
        'Job ' + job.id + ' auto-approved by AI (' + review.score + '% compliance)',
        'info'
      );
      return { job: approvedJob, review };
    }

    await AlertingService.sendAlert(
      'Job ' + job.id + ' auto-approval REJECTED: ' + review.comments,
      'warning'
    );
    return { job, review };
  }

  public static approveJob(job: ListingMediaJob, reviewerId: string): ListingMediaJob {
    if (job.status !== 'Pending_Approval') {
      throw new Error('Only jobs in Pending_Approval can be approved. Current: ' + job.status);
    }
    return {
      ...job,
      status: 'Approved',
      approvedBy: reviewerId,
      updatedAt: new Date()
    };
  }

  public static rejectJob(job: ListingMediaJob, reviewerId: string, reason: string): ListingMediaJob {
    if (job.status !== 'Pending_Approval') {
      throw new Error('Only jobs in Pending_Approval can be rejected. Current: ' + job.status);
    }
    return {
      ...job,
      status: 'Failed',
      approvedBy: reviewerId,
      updatedAt: new Date()
    };
  }

  public static publishJob(job: ListingMediaJob): ListingMediaJob {
    if (job.status !== 'Approved') {
      throw new Error('A job must be Approved before publish. Current: ' + job.status);
    }
    if (!job.approvedBy) {
      throw new Error('Cannot publish without a recorded approver.');
    }
    return {
      ...job,
      status: 'Published',
      updatedAt: new Date()
    };
  }
}
