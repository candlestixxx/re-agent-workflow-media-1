import { ListingStage } from './ListingMediaJob';

export type VideoSourceType = 'drone' | 'walkthrough' | 'slideshow' | 'phone';
export type VideoAspectRatio = '16:9' | '9:16' | '1:1';
export type VideoStatus = 'Queued' | 'Editing' | 'Rendering' | 'Completed' | 'Failed';

export interface VideoProcessingJob {
  id: string;
  listingId: string;
  stage: ListingStage;
  sourceType: VideoSourceType;
  targetRatio: VideoAspectRatio;
  includeCaptions: boolean;
  status: VideoStatus;
  outputPath?: string;
  createdAt: Date;
  updatedAt: Date;
}
