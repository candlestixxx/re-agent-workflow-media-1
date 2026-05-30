import { ListingStage } from '../models/ListingMediaJob';
import axios from 'axios';

export class SocialCopyService {
  /**
   * Generates social media copy for a property listing.
   * Executes completion API requests if GEMINI_API_KEY or OPENAI_API_KEY is present.
   * Otherwise, it returns a templated string.
   */
  public static async generateSocialCopy(
    address: string,
    stage: ListingStage,
    highlights: string[]
  ): Promise<string> {
    const prompt = this.buildPrompt(address, stage, highlights);
    const apiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Try Gemini if API key is present
    if (geminiApiKey && !geminiApiKey.includes('your_gemini_api_key_here')) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `${prompt}\n\nSystem Instruction: You are a professional real estate marketing copywriter.`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.candidates && response.data.candidates[0]?.content?.parts[0]?.text) {
          return response.data.candidates[0].content.parts[0].text.trim();
        }
      } catch (error) {
        console.warn('Gemini API failed, falling back to OpenAI if available.');
      }
    }

    // 2. Try OpenAI if API key is present
    if (apiKey && !apiKey.includes('your_openai_api_key_here')) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a professional real estate marketing copywriter.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
          return response.data.choices[0].message.content.trim();
        }
      } catch (error) {
        return '[API_ERROR] Failed to fetch live completion from OpenAI';
      }
    }

    // 3. Fallback template
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
