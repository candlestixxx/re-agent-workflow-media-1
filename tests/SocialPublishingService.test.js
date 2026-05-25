"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const SocialPublishingService_1 = require("../src/services/SocialPublishingService");
describe('SocialPublishingService', () => {
    const originalEnv = process.env;
    let baseDraft;
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
        const result = await SocialPublishingService_1.SocialPublishingService.publishPost(baseDraft);
        expect(result.publishStatus).toBe('Published');
        expect(result.publishedUrl).toBe('mock_facebook_url_post-123');
    });
    it('should execute live Facebook Graph API requests when token is present', async () => {
        process.env.FACEBOOK_GRAPH_TOKEN = 'mock-fb-token';
        baseDraft.platform = 'Facebook';
        (axios_1.default.post).mockResolvedValueOnce({
            data: { post_id: 'fb-post-789' }
        });
        const result = await SocialPublishingService_1.SocialPublishingService.publishPost(baseDraft);
        expect(result.publishStatus).toBe('Published');
        expect(result.publishedUrl).toBe('https://facebook.com/fb-post-789');
        expect(axios_1.default.post).toHaveBeenCalledWith('https://graph.facebook.com/v19.0/me/photos', { url: '/path/to/img.jpg', caption: 'Check out this house!' }, { headers: { 'Authorization': 'Bearer mock-fb-token', 'Content-Type': 'application/json' } });
    });
    it('should execute live LinkedIn API requests when token is present', async () => {
        process.env.LINKEDIN_API_TOKEN = 'mock-li-token';
        process.env.LINKEDIN_ORG_ID = '9999';
        baseDraft.platform = 'LinkedIn';
        (axios_1.default.post).mockResolvedValueOnce({
            headers: { 'x-restli-id': 'li-post-abc' }
        });
        const result = await SocialPublishingService_1.SocialPublishingService.publishPost(baseDraft);
        expect(result.publishStatus).toBe('Published');
        expect(result.publishedUrl).toBe('https://linkedin.com/feed/update/li-post-abc');
        expect(axios_1.default.post).toHaveBeenCalledWith('https://api.linkedin.com/v2/ugcPosts', expect.objectContaining({
            author: 'urn:li:organization:9999',
            specificContent: expect.objectContaining({
                'com.linkedin.ugc.ShareContent': expect.objectContaining({
                    shareCommentary: { text: 'Check out this house!' }
                })
            })
        }), {
            headers: {
                'Authorization': 'Bearer mock-li-token',
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
            }
        });
    });
    it('should mark as Failed if network error occurs', async () => {
        process.env.FACEBOOK_GRAPH_TOKEN = 'mock-fb-token';
        baseDraft.platform = 'Facebook';
        (axios_1.default.post).mockRejectedValueOnce(new Error('Network error'));
        const result = await SocialPublishingService_1.SocialPublishingService.publishPost(baseDraft);
        expect(result.publishStatus).toBe('Failed');
        expect(result.publishedUrl).toBeUndefined();
    });
    it('should throw an error if the draft is not Approved', async () => {
        baseDraft.approvalStatus = 'Pending';
        await expect(SocialPublishingService_1.SocialPublishingService.publishPost(baseDraft)).rejects.toThrow("Cannot publish post. Draft approval status is 'Pending', must be 'Approved'.");
    });
    it('should throw an error if the post is already published', async () => {
        baseDraft.publishStatus = 'Published';
        await expect(SocialPublishingService_1.SocialPublishingService.publishPost(baseDraft)).rejects.toThrow('Post is already published.');
    });
});
//# sourceMappingURL=SocialPublishingService.test.js.map