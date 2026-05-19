import { ListingMediaJob, ListingStage } from '../models/ListingMediaJob';
import { FolderDetectionService } from './FolderDetectionService';

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

    // In a real application, you might want to return the failed array as well for the UI to report on,
    // but for this implementation we simply return the successful jobs.
    return jobs;
  }
}
