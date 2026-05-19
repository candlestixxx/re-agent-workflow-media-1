import { VideoProcessingJob, VideoSourceType, VideoAspectRatio } from '../models/VideoProcessingJob';
import { ListingStage } from '../models/ListingMediaJob';

export class VideoProcessingService {
  /**
   * Initializes a new video processing job in a queued state.
   */
  public static initializeJob(
    listingId: string,
    stage: ListingStage,
    sourceType: VideoSourceType,
    targetRatio: VideoAspectRatio,
    includeCaptions: boolean = true
  ): VideoProcessingJob {
    return {
      id: `vid-job-${Date.now()}`,
      listingId,
      stage,
      sourceType,
      targetRatio,
      includeCaptions,
      status: 'Queued',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Progresses the status of a video job through its pipeline.
   * Typical flow: Queued -> Editing -> Rendering -> Completed.
   */
  public static updateJobStatus(
    job: VideoProcessingJob,
    newStatus: VideoProcessingJob['status'],
    outputPath?: string
  ): VideoProcessingJob {
    // Validate transitions
    if (job.status === 'Completed' || job.status === 'Failed') {
      throw new Error(`Cannot transition a job that is already ${job.status}`);
    }

    if (newStatus === 'Completed' && !outputPath) {
      throw new Error('An outputPath must be provided when marking a video job as Completed');
    }

    return {
      ...job,
      status: newStatus,
      ...((outputPath || job.outputPath) && { outputPath: outputPath || job.outputPath }),
      updatedAt: new Date()
    };
  }
}
