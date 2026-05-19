export type SocialPlatform = 'Facebook' | 'LinkedIn' | 'Instagram' | 'X';

export type PostApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type PostPublishStatus = 'Draft' | 'Queued' | 'Published' | 'Failed';

export interface SocialPostDraft {
  id: string;
  jobId: string;
  platform: SocialPlatform;
  caption: string;
  imagePath: string;
  approvalStatus: PostApprovalStatus;
  publishStatus: PostPublishStatus;
  publishedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
