import { ListingMediaJob } from '../models/ListingMediaJob';
import { SocialPostDraft } from '../models/SocialPostDraft';
import { CanvaIntegrationService } from './CanvaIntegrationService';

export class JustSoldPipelineService {
  /**
   * Processes a ListingMediaJob that has reached the "Just Sold" stage.
   * Generates the branded export via Canva, then scaffolds social media
   * drafts representing the sold milestone.
   *
   * @param job The ListingMediaJob hitting the Just Sold milestone.
   * @returns An array of freshly scaffolded SocialPostDrafts targeting multiple platforms.
   */
  public static async processJustSold(job: ListingMediaJob): Promise<SocialPostDraft[]> {
    if (job.stage !== 'Just Sold') {
      throw new Error(`Cannot process Just Sold pipeline for job in stage: ${job.stage}`);
    }

    const baseCaption = `🎉 We just sold ${job.propertyAddress}! Congratulations to our amazing clients and the Excel Legacy Team! #JustSold #ExcelLegacyTeam #RealEstate`;

    // Specialized "Just Sold" template ID configuration
    const templateId = process.env.CANVA_JUST_SOLD_TEMPLATE_ID || 'template_just_sold_default';

    // Real Canva export (throws when CANVA_API_KEY is missing — the caller
    // surfaces the error rather than publishing drafts with fake artwork).
    const exportPath = await CanvaIntegrationService.exportDesign(
      job.sourceFolderPath,
      templateId,
      `Just Sold — ${job.propertyAddress}`
    );

    const platforms: Array<'Facebook' | 'LinkedIn' | 'Instagram'> = ['Facebook', 'LinkedIn', 'Instagram'];
    const drafts: SocialPostDraft[] = platforms.map((platform) => ({
      id: `draft-sold-${Date.now()}-${platform.toLowerCase()}`,
      jobId: job.id,
      platform,
      caption: baseCaption,
      imagePath: exportPath,
      approvalStatus: 'Pending',
      publishStatus: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return drafts;
  }
}
