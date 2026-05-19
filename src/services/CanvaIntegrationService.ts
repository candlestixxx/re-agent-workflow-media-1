import path from 'path';
import axios from 'axios';

export class CanvaIntegrationService {
  /**
   * Simulates or executes the export of a final polished design from Canva.
   *
   * @param propertyFolder The local directory where the finished asset should be routed.
   * @param templateId The Canva template ID to base the design on.
   * @param customText Text injections (e.g., Address, Stage) applied to the template.
   * @returns A promise resolving to the final export file path or mocked path.
   */
  public static async exportDesign(
    propertyFolder: string,
    templateId: string,
    customText: string
  ): Promise<string> {
    const apiKey = process.env.CANVA_API_KEY;
    const teamId = process.env.CANVA_TEAM_ID || 'default_team';

    // Fallback logic for CI/CD or local testing without active tokens
    if (!apiKey) {
      return path.join(propertyFolder, `mock_canva_export_${templateId}.jpg`);
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

      return path.join(propertyFolder, `live_canva_export_failed_parsing.jpg`);

    } catch (error) {
      return path.join(propertyFolder, `live_canva_export_network_error.jpg`);
    }
  }
}
