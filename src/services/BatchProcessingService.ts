import { ListingMediaJob, ListingStage } from '../models/ListingMediaJob';
import { FolderDetectionService } from './FolderDetectionService';
import { AlertingService } from './AlertingService';

export class BatchProcessingService {
  /**
   * Processes a batch of multiple property addresses at once.
   * If a property is missing its source folder, it is safely logged and skipped,
   * allowing the rest of the batch to continue processing.
   *
   * @param addresses Array of property addresses to process.
   * @param targetStage The marketing stage to initialize all batch jobs to.
   * @returns A promise resolving to an array of successfully initialized ListingMediaJobs.
   */
  public static async processBatch(addresses: string[], targetStage: ListingStage): Promise<ListingMediaJob[]> {
    const jobs: ListingMediaJob[] = [];
    const failedAddresses: string[] = [];

    for (const address of addresses) {
      try {
        const sourceFolder = FolderDetectionService.findPropertyFolder(address);

        if (!sourceFolder) {
          failedAddresses.push(address);
          continue; // Skip to the next address without crashing the batch
        }

        const newJob: ListingMediaJob = {
          id: `batch-job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          propertyAddress: address,
          stage: targetStage,
          sourceFolderPath: sourceFolder,
          status: 'Pending_Generation',
          createdBy: 'batch-system',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        jobs.push(newJob);
      } catch (error) {
        failedAddresses.push(address);
        // In a live system, we would log this to a monitoring service.
      }
    }

    // Fire an alert via the AlertingService if there are failures, or just a success summary.
    if (failedAddresses.length > 0) {
      await AlertingService.sendAlert(
        `Batch processing completed with errors. ${jobs.length} successful, ${failedAddresses.length} failed.`,
        'warning'
      );
    } else {
      await AlertingService.sendAlert(
        `Batch processing completed perfectly. ${jobs.length} properties initialized.`,
        'info'
      );
    }

    return jobs;
  }
}
