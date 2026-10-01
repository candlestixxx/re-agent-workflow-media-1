import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';

const execFileAsync = promisify(execFile);

const OUTPUT_DIR = process.env.VIDEO_OUTPUT_DIR || '/var/tmp/promo-videos';
const MAGNIFIC_API_KEY = process.env.MAGNIFIC_API_KEY;
const MAGNIFIC_API_URL = process.env.MAGNIFIC_API_URL || 'https://api.magnific.ai/v1';

/**
 * AI Promotional Video Pipeline
 * Combines listing photos + AI-enhanced imagery (Magnific) + FFmpeg assembly
 * into polished promotional videos.
 */
export class PromoVideoPipeline {
  /**
   * Generates a promotional video from listing photos and a script.
   */
  static async generate(params: {
    listingId: string;
    photoPaths: string[];
    script: {
      hook: string;
      scenes: { description: string; voiceover?: string; onScreenText?: string }[];
      cta: string;
      captions?: string;
    };
    aspectRatio: '1:1' | '9:16' | '16:9';
    includeCaptions: boolean;
    enhanceWithAI: boolean;
  }): Promise<{ videoPath: string; thumbnailPath: string; duration: number }> {
    const { listingId, photoPaths, script, aspectRatio, includeCaptions, enhanceWithAI } = params;

    await mkdir(OUTPUT_DIR, { recursive: true });

    // Step 1: Enhance photos with Magnific AI (if enabled)
    let processedPhotos = photoPaths;
    if (enhanceWithAI && MAGNIFIC_API_KEY) {
      processedPhotos = await this.enhancePhotos(photoPaths);
    }

    // Step 2: Generate subtitle file from script
    const captionsPath = await this.generateCaptions(listingId, script, includeCaptions);

    // Step 3: Assemble video with FFmpeg (Ken Burns effect on photos + transitions)
    const videoPath = path.join(OUTPUT_DIR, `${listingId}_promo.mp4`);
    await this.assembleVideo(processedPhotos, captionsPath, videoPath, aspectRatio);

    // Step 4: Generate thumbnail
    const thumbnailPath = path.join(OUTPUT_DIR, `${listingId}_thumb.jpg`);
    await execFileAsync('ffmpeg', ['-y', '-i', videoPath, '-ss', '00:00:01', '-vframes', '1', thumbnailPath]);

    // Get duration
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', videoPath,
    ]);
    const duration = parseFloat(stdout.trim()) || 0;

    return { videoPath, thumbnailPath, duration };
  }

  /**
   * Enhances photos using Magnific AI upscaler.
   */
  private static async enhancePhotos(photos: string[]): Promise<string[]> {
    if (!MAGNIFIC_API_KEY) return photos;

    const enhanced: string[] = [];
    for (const photo of photos.slice(0, 8)) {
      try {
        const imageBuffer = await readFile(photo);
        const base64 = imageBuffer.toString('base64');

        const resp = await fetch(`${MAGNIFIC_API_URL}/enhance`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MAGNIFIC_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64, scale: 2, enhance: true }),
          signal: AbortSignal.timeout(60000),
        });

        const result = await resp.json();
        if (result.enhancedImage) {
          const enhPath = path.join(OUTPUT_DIR, `enhanced_${path.basename(photo)}`);
          await writeFile(enhPath, Buffer.from(result.enhancedImage, 'base64'));
          enhanced.push(enhPath);
        } else {
          enhanced.push(photo);
        }
      } catch {
        enhanced.push(photo); // Fall back to original on failure
      }
    }
    return enhanced;
  }

  /**
   * Generates SRT captions from the video script.
   */
  private static async generateCaptions(listingId: string, script: any, include: boolean): Promise<string | null> {
    if (!include || !script.captions) return null;

    const captionsPath = path.join(OUTPUT_DIR, `${listingId}_captions.srt`);
    const captions = script.captions
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string, i: number) => {
        const start = i * 4;
        const end = start + 3.5;
        const fmt = (s: number) => {
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = s % 60;
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`;
        };
        return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${line}\n`;
      })
      .join('\n');

    await writeFile(captionsPath, captions, 'utf-8');
    return captionsPath;
  }

  /**
   * Assembles photos into a video with Ken Burns effect and crossfade transitions.
   */
  private static async assembleVideo(
    photos: string[],
    captionsPath: string | null,
    outputPath: string,
    aspectRatio: string
  ): Promise<void> {
    const sizeFilter = {
      '1:1': '1080:1080',
      '9:16': '1080:1920',
      '16:9': '1920:1080',
    }[aspectRatio] || '1080:1080';

    // Build complex filter: Ken Burns zoompan on each photo + concat
    const duration = Math.max(3, Math.floor(30 / photos.length)); // ~30s total video

    let filterParts: string[] = [];
    let concatInputs: string[] = [];

    photos.forEach((photo, i) => {
      filterParts.push(
        `[${i}:v]scale=${sizeFilter.split(':')[0]}:${sizeFilter.split(':')[1]}:force_original_aspect_ratio=increase,crop=${sizeFilter.split(':')[0]}:${sizeFilter.split(':')[1]},zoompan=z='min(zoom+0.0015,1.2)':d=${duration * 25}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${sizeFilter},format=yuv420p[v${i}]`
      );
      concatInputs.push(`[v${i}]`);
    });

    let filterComplex = filterParts.join(';');
    filterComplex += `;${concatInputs.join('')}concat=n=${photos.length}:v=1:a=0[outv]`;

    const args = ['-y'];
    photos.forEach(p => args.push('-loop', '1', '-t', String(duration), '-i', p));

    args.push('-filter_complex', filterComplex, '-map', '[outv]');

    if (captionsPath) {
      args.push('-vf', `subtitles=${captionsPath}:force_style='FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000'`);
    }

    args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', outputPath);

    await execFileAsync('ffmpeg', args, { timeout: 300000 });
  }
}
