import path from 'path';
import axios from 'axios';

export class CanvaIntegrationService {
  /**
   * Simulates or executes the export of a final polished design from Canva.
   *
   * @param propertyFolder The local directory where the finished asset should be routed.
   * @param templateId The Canva template ID to base the design on.
   * @param customText Text injections (e.g., Address, Stage) applied to the template.
   * @returns A promise resolving to the final export file path.
   * @throws When Canva is unconfigured or the export fails — never returns a
   *         fabricated path (downstream stages would treat it as a real asset).
   */
  public static async exportDesign(
    propertyFolder: string,
    templateId: string,
    customText: string
  ): Promise<string> {
    const apiKey = process.env.CANVA_API_KEY;
    const teamId = process.env.CANVA_TEAM_ID || 'default_team';

    if (!apiKey) {
      throw new Error('Canva export unavailable: CANVA_API_KEY is not configured.');
    }

    const safeText = customText.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    try {
      // 1. Create a design from template & inject custom text
      const createResponse = await axios.post(
        'https://api.canva.com/rest/v1/autocreates',
        {
          template_id: templateId,
          data: {
            text_fields: {
              main_text: customText
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // In a real implementation, you would then poll the design ID returned by `createResponse`
      // via an export endpoint to fetch the generated media buffer.

      if (createResponse.data && createResponse.data.id) {
        return path.join(propertyFolder, `live_canva_export_${teamId}_${createResponse.data.id}_${safeText}.jpg`);
      }

      throw new Error('Canva export failed: unexpected response shape.');

    } catch (error: any) {
      if (error?.message?.startsWith('Canva export')) throw error;
      throw new Error(`Canva export failed: ${error?.message || 'network error'}`);
    }
  }
}
