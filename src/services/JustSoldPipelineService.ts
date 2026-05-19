import { ListingMediaJob } from '../models/ListingMediaJob';
import { SocialPostDraft } from '../models/SocialPostDraft';

export class JustSoldPipelineService {
  /**
   * Processes a ListingMediaJob that has reached the "Just Sold" stage.
   * Scaffolds specialized social media drafts representing the sold milestone.
   *
   * @param job The ListingMediaJob hitting the Just Sold milestone.
   * @returns An array of freshly scaffolded SocialPostDrafts targeting multiple platforms.
   */
  public static async processJustSold(job: ListingMediaJob): Promise<SocialPostDraft[]> {
    if (job.stage !== 'Just Sold') {
      throw new Error(`Cannot process Just Sold pipeline for job in stage: ${job.stage}`);
    }

    const baseCaption = `🎉 We just sold ${job.propertyAddress}! Congratulations to our amazing clients and the Excel Legacy Team! #JustSold #ExcelLegacyTeam #RealEstate`;

    // Assuming a specialized "Just Sold" template ID configuration
    const templateId = process.env.CANVA_JUST_SOLD_TEMPLATE_ID || 'template_just_sold_default';
    const mockExportPath = `${job.sourceFolderPath}/mock_canva_export_${templateId}.jpg`;

    const platforms: Array<'Facebook' | 'LinkedIn' | 'Instagram'> = ['Facebook', 'LinkedIn', 'Instagram'];
    const drafts: SocialPostDraft[] = platforms.map((platform) => ({
      id: `draft-sold-${Date.now()}-${platform.toLowerCase()}`,
      jobId: job.id,
      platform,
      caption: baseCaption,
      imagePath: mockExportPath,
      approvalStatus: 'Pending',
      publishStatus: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // In a live system, this would queue up the CanvaIntegrationService, wait for the export,
    // construct the draft payloads, and save them to the database for user approval.
    return drafts;
  }
}
