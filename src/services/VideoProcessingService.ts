import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdir } from 'fs/promises';
import path from 'path';
import { VideoProcessingJob, VideoSourceType, VideoAspectRatio } from '../models/VideoProcessingJob';
import { ListingStage } from '../models/ListingMediaJob';

const execFileAsync = promisify(execFile);

const OUTPUT_DIR = process.env.VIDEO_OUTPUT_DIR || '/var/tmp/videos';

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
   * Spawns FFmpeg to render video at the target aspect ratio.
   * Supports crop-to-square (1:1), portrait (9:16), and landscape (16:9).
   */
  public static async executeLocalRendering(job: VideoProcessingJob): Promise<VideoProcessingJob> {
    const renderingJob = this.updateJobStatus(job, 'Rendering');

    try {
      await mkdir(OUTPUT_DIR, { recursive: true });

      const inputPath = path.join(OUTPUT_DIR, `${job.listingId}_input.mp4`);
      const outputPath = path.join(OUTPUT_DIR, `${job.listingId}_${job.targetRatio}_rendered.mp4`);

      const vf = this.getVideoFilter(job.targetRatio, job.includeCaptions);

      await execFileAsync('ffmpeg', [
        '-y',
        '-i', inputPath,
        '-vf', vf,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputPath,
      ], { timeout: 300000 });

      return this.updateJobStatus(renderingJob, 'Completed', outputPath);
    } catch (err: any) {
      return this.updateJobStatus(renderingJob, 'Failed');
    }
  }

  private static getVideoFilter(ratio: VideoAspectRatio, includeCaptions: boolean): string {
    const filters: Record<string, string> = {
      '1:1': "crop='min(ih,iw)':'min(ih,iw)'",
      '9:16': "crop=ih*9/16:ih",
      '16:9': "crop=iw:ih*9/16",
    };
    let vf = filters[ratio] || "crop='min(ih,iw)':'min(ih,iw)'";
    if (includeCaptions) {
      vf += ",subtitles=captions.srt:force_style='FontSize=20,PrimaryColour=&H00FFFFFF'";
    }
    return vf;
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
