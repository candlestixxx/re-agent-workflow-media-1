export type AssetType = 'day' | 'night' | 'social_graphic' | 'video';

export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface GeneratedAsset {
  id: string;
  jobId: string;
  type: AssetType;
  ratio: AspectRatio;
  sourceImagePath: string;
  outputPath: string;
  promptUsed?: string;
  versionNumber: number;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
}
