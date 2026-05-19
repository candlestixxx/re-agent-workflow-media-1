import { SocialPostDraft } from '../models/SocialPostDraft';

export class SocialPublishingService {
  public static async publishPost(draft: SocialPostDraft): Promise<SocialPostDraft> {
    if (draft.approvalStatus !== 'Approved') {
      throw new Error(`Cannot publish post. Draft approval status is '${draft.approvalStatus}', must be 'Approved'.`);
    }

    if (draft.publishStatus === 'Published') {
      throw new Error('Post is already published.');
    }

    const isLive = process.env.NODE_ENV === 'production';

    const mockPlatformUrlMap: Record<string, string> = {
      'Facebook': `https://facebook.com/excellegacyteam/posts/${draft.id}`,
      'LinkedIn': `https://linkedin.com/company/excellegacyteam/posts/${draft.id}`,
      'Instagram': `https://instagram.com/p/${draft.id}`,
      'X': `https://x.com/excellegacyteam/status/${draft.id}`
    };

    const finalUrl = isLive && mockPlatformUrlMap[draft.platform] ? mockPlatformUrlMap[draft.platform] : `mock_${draft.platform.toLowerCase()}_url_${draft.id}`;

    return {
      ...draft,
      publishStatus: 'Published',
      publishedUrl: finalUrl as string,
      updatedAt: new Date()
    };
  }
}
