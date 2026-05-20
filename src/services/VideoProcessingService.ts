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
  /**
   * Stub method for integrating external video manipulation libraries.
   * In a production environment, this method should spawn an FFmpeg child process
   * or call a cloud rendering API to manipulate the video based on the job's targetRatio.
   *
   * Example FFmpeg command structure:
   * `ffmpeg -i ${job.sourceType}_input.mp4 -vf "crop='min(ih,iw)':'min(ih,iw)'" -c:a copy ${job.listingId}_output.mp4`
   */
  public static async executeLocalRendering(job: VideoProcessingJob): Promise<VideoProcessingJob> {
    const renderingJob = this.updateJobStatus(job, 'Rendering');

    // Simulate FFmpeg processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Resolve completed job with simulated local output path
    const mockOutputPath = `/var/tmp/videos/${job.listingId}_${job.targetRatio}_rendered.mp4`;
    return this.updateJobStatus(renderingJob, 'Completed', mockOutputPath);
  }

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
