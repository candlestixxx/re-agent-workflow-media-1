import { ListingMediaJob, ListingStage } from '../models/ListingMediaJob';
import { FolderDetectionService } from './FolderDetectionService';

export interface WebhookPayload {
  event: string;
  listingId: string;
  address: string;
  agentId: string;
  statusUpdate?: ListingStage;
}

export class AutomationTriggerService {
  /**
   * Evaluates an incoming CRM webhook payload and initializes a new ListingMediaJob if appropriate.
   *
   * @param payload The parsed JSON payload from the CRM webhook.
   * @returns A promise resolving to a new ListingMediaJob if created, or null if ignored.
   */
  public static async handleWebhook(payload: WebhookPayload): Promise<ListingMediaJob | null> {

    // Ignore unrelated events
    if (payload.event !== 'listing.created' && payload.event !== 'listing.status_updated') {
      return null;
    }

    if (!payload.address || !payload.listingId) {
      throw new Error('Invalid webhook payload: Missing required address or listingId');
    }

    // Determine target stage
    let targetStage: ListingStage = 'Coming Soon';
    if (payload.event === 'listing.status_updated' && payload.statusUpdate) {
      targetStage = payload.statusUpdate;
    } else if (payload.event === 'listing.created') {
      targetStage = 'Just Listed'; // default for new full listings
    }

    // Locate source folder
    const sourceFolder = FolderDetectionService.findPropertyFolder(payload.address);
    if (!sourceFolder) {
      throw new Error(`Automation blocked: Cannot locate source media folder for ${payload.address}`);
    }

    // Initialize the job pipeline
    const job: ListingMediaJob = {
      id: `auto-job-${Date.now()}`,
      mlsId: payload.listingId,
      propertyAddress: payload.address,
      stage: targetStage,
      sourceFolderPath: sourceFolder,
      status: 'Pending_Generation',
      createdBy: payload.agentId || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return job;
  }
}
