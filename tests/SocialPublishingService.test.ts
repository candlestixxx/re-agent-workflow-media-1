import { SocialPublishingService } from '../src/services/SocialPublishingService';
import { SocialPostDraft } from '../src/models/SocialPostDraft';

describe('SocialPublishingService', () => {
  const originalEnv = process.env;

  let baseDraft: SocialPostDraft;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    baseDraft = {
      id: 'post-123',
      jobId: 'job-xyz',
      platform: 'Facebook',
      caption: 'Check out this house!',
      imagePath: '/path/to/img.jpg',
      approvalStatus: 'Approved',
      publishStatus: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should successfully publish an approved draft and assign a mock URL', async () => {
    process.env.NODE_ENV = 'test';

    const result = await SocialPublishingService.publishPost(baseDraft);

    expect(result.publishStatus).toBe('Published');
    expect(result.publishedUrl).toBe('mock_facebook_url_post-123');
  });

  it('should generate production URLs when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    baseDraft.platform = 'LinkedIn';

    const result = await SocialPublishingService.publishPost(baseDraft);

    expect(result.publishStatus).toBe('Published');
    expect(result.publishedUrl).toBe('https://linkedin.com/company/excellegacyteam/posts/post-123');
  });

  it('should throw an error if the draft is not Approved', async () => {
    baseDraft.approvalStatus = 'Pending';

    await expect(SocialPublishingService.publishPost(baseDraft)).rejects.toThrow(
      "Cannot publish post. Draft approval status is 'Pending', must be 'Approved'."
    );
  });

  it('should throw an error if the post is already published', async () => {
    baseDraft.publishStatus = 'Published';

    await expect(SocialPublishingService.publishPost(baseDraft)).rejects.toThrow(
      'Post is already published.'
    );
  });
});
