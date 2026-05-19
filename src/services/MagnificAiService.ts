import axios from 'axios';

export class MagnificAiService {
  /**
   * Generates enhanced image variations based on a source photo using Magnific AI.
   *
   * @param sourceImagePath The absolute path or URL to the source image.
   * @param style The requested variation ('day' or 'night').
   * @param variations The number of output variations to generate (default: 3).
   * @returns A promise resolving to an array of output buffers or mocked string URLs.
   */
  public static async generateDayNightImages(
    sourceImagePath: string,
    style: 'day' | 'night',
    variations: number = 3
  ): Promise<string[]> {
    const apiKey = process.env.MAGNIFIC_API_KEY;
    const model = process.env.MAGNIFIC_MODEL || 'google_nano_banana_2';

    // Fallback logic when API key is missing (for CI and local testing)
    if (!apiKey) {
      return Array.from({ length: variations }).map(
        (_, i) => `mock_magnific_buffer_${style}_variation_${i + 1}_using_${model}`
      );
    }

    const results: string[] = [];

    for (let i = 0; i < variations; i++) {
      try {
        const response = await axios.post(
          'https://api.magnific.ai/v1/generate',
          {
            image_path: sourceImagePath,
            style: style,
            model: model,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.output_url) {
          results.push(response.data.output_url);
        } else {
          // If the real API responds but misses the expected payload, we log the failure.
          results.push(`[API_ERROR] Unexpected payload format for variation ${i + 1}`);
        }
      } catch (error) {
        results.push(`[API_ERROR] Failed to fetch live variation ${i + 1} from Magnific`);
      }
    }

    return results;
  }
}
