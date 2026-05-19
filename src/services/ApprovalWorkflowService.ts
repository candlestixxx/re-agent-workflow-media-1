import { ListingMediaJob, JobStatus } from '../models/ListingMediaJob';

export class ApprovalWorkflowService {
  /**
   * Submits a job for approval, transitioning its state to 'Pending_Approval'.
   * @param job The job to submit.
   * @returns The updated job.
   */
  public static submitForApproval(job: ListingMediaJob): ListingMediaJob {
    if (job.status !== 'Draft' && job.status !== 'Pending_Generation') {
      throw new Error(`Cannot submit job for approval from status: ${job.status}`);
    }

    return {
      ...job,
      status: 'Pending_Approval',
      updatedAt: new Date()
    };
  }

  /**
   * Approves a job, attaching the reviewer's ID.
   * @param job The job to approve.
   * @param reviewerId The ID of the broker or manager approving the job.
   * @returns The updated job.
   */
  public static approveJob(job: ListingMediaJob, reviewerId: string): ListingMediaJob {
    if (job.status !== 'Pending_Approval') {
      throw new Error(`Only jobs in 'Pending_Approval' can be approved. Current status: ${job.status}`);
    }

    return {
      ...job,
      status: 'Approved',
      approvedBy: reviewerId,
      updatedAt: new Date()
    };
  }

  /**
   * Transitions an approved job to a Published state.
   * @param job The job to publish.
   * @returns The updated job.
   */
  public static publishJob(job: ListingMediaJob): ListingMediaJob {
    if (job.status !== 'Approved') {
      throw new Error(`A job must be 'Approved' before it can be published. Current status: ${job.status}`);
    }

    if (!job.approvedBy) {
      throw new Error('A job cannot be published without a recorded approver (approvedBy is empty).');
    }

    return {
      ...job,
      status: 'Published',
      updatedAt: new Date()
    };
  }
}
