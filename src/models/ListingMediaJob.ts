export type ListingStage =
  | 'Coming Soon'
  | 'Just Listed'
  | 'Open House'
  | 'Price Improvement'
  | 'Just Sold';

export type JobStatus =
  | 'Draft'
  | 'Pending_Generation'
  | 'Pending_Approval'
  | 'Approved'
  | 'Published'
  | 'Failed';

export interface ListingMediaJob {
  id: string;
  propertyAddress: string;
  mlsId?: string;
  stage: ListingStage;
  sourceFolderPath: string;
  status: JobStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
