import { ListingStage } from '../models/ListingMediaJob';

export class SocialCopyService {
  /**
   * Generates social media copy for a property listing.
   * If a GEMINI_API_KEY is present, it will eventually call the API.
   * Otherwise, it returns a templated string.
   */
  public static async generateSocialCopy(
    address: string,
    stage: ListingStage,
    highlights: string[]
  ): Promise<string> {
    const prompt = this.buildPrompt(address, stage, highlights);

    // TODO: Implement actual Gemini or OpenAI HTTP API call here.
    // For now, if the API key exists, we pretend we called it.
    if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
      return `[AI Generated Copy] ${prompt}`;
    }

    // Fallback template
    const highlightsText = highlights.length > 0 ? `Highlights: ${highlights.join(', ')}` : '';
    return `Check out this amazing property at ${address}! Status: ${stage}. ${highlightsText} #RealEstate #ExcelLegacyTeam`;
  }

  /**
   * Constructs the prompt to send to the AI.
   */
  public static buildPrompt(address: string, stage: ListingStage, highlights: string[]): string {
    return `Generate an engaging social media post for a real estate listing.
Address: ${address}
Stage: ${stage}
Highlights: ${highlights.join(', ')}
Requirements: Include appropriate emojis, hashtags (#RealEstate, #ExcelLegacyTeam), and keep it brand-safe.`;
  }
}
