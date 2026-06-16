import axios from 'axios';

export interface CrmSyncResult {
  success: boolean;
  pageUrl?: string;
  error?: string;
}

export class RealEstateCrmService {
  private static BASE_URL = 'http://localhost:3000';

  /**
   * Syncs generated marketing assets back to the local RealEstateCRM.
   * 
   * @param listingId The internal listing ID.
   * @param address The property address.
   * @param caption The AI generated social caption.
   * @param highlights Property highlights.
   * @returns A promise resolving to the sync result.
   */
  public static async syncToCrm(
    listingId: string,
    address: string,
    caption: string,
    highlights: string[]
  ): Promise<CrmSyncResult> {
    // Construct the workflow ID used by your CRM
    const workflowId = `marketing-media:${listingId}`;
    
    try {
      console.log(`[CRM Sync] Pushing media assets to ${this.BASE_URL}/api/workflows/${workflowId}`);
      
      const response = await axios.put(
        `${this.BASE_URL}/api/workflows/${encodeURIComponent(workflowId)}`,
        {
          snapshot: {
            draft: {
              propertyAddress: address,
              socialCaption: caption,
              highlights: highlights,
              lastSync: new Date().toISOString()
            },
            banner: "Marketing assets successfully generated and synced from Media Pipeline."
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.found) {
        return { 
          success: true, 
          pageUrl: `${this.BASE_URL}/workflows/marketing-media?listingId=${listingId}` 
        };
      }
      
      return { success: false, error: 'CRM workflow record not found.' };
    } catch (error) {
      console.error('❌ CRM Sync Failed:', error instanceof Error ? error.message : error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
