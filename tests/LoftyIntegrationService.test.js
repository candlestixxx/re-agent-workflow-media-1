"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const LoftyIntegrationService_1 = require("../src/services/LoftyIntegrationService");
describe('LoftyIntegrationService', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });
    it('should create a pending job without URL when API key is missing', async () => {
        delete process.env.LOFTY_API_KEY;
        process.env.DEFAULT_GOOGLE_ANALYTICS_ID = 'G-TEST';
        process.env.DEFAULT_FACEBOOK_PIXEL_ID = 'FB-TEST';
        const job = await LoftyIntegrationService_1.LoftyIntegrationService.createOrUpdateLandingPage('list-123', '123 Main St', '/path/to/hero.jpg', ['Pool']);
        expect(job.listingId).toBe('list-123');
        expect(job.analyticsId).toBe('G-TEST');
        expect(job.pixelId).toBe('FB-TEST');
        expect(job.popupDelaySeconds).toBe(7);
        expect(job.publishStatus).toBe('Pending');
        expect(job.pageUrl).toBeUndefined();
    });
    it('should execute a live POST and mark as Published when API key is present', async () => {
        process.env.LOFTY_API_KEY = 'fake-lofty-key';
        // Test env fallbacks
        delete process.env.DEFAULT_GOOGLE_ANALYTICS_ID;
        delete process.env.DEFAULT_FACEBOOK_PIXEL_ID;
        (axios_1.default.post).mockResolvedValueOnce({
            data: { url: 'https://crm.lofty.com/live/456-oak-avenue' }
        });
        const job = await LoftyIntegrationService_1.LoftyIntegrationService.createOrUpdateLandingPage('list-456', '456 Oak Avenue', '/path/to/hero2.jpg', ['Garage']);
        expect(job.publishStatus).toBe('Published');
        expect(job.pageUrl).toBe('https://crm.lofty.com/live/456-oak-avenue');
        expect(job.analyticsId).toBe('G-DEFAULT');
        expect(job.pixelId).toBe('FB-DEFAULT');
        expect((axios_1.default.post)).toHaveBeenCalledWith('https://api.lofty.com/v1/landing-pages', expect.objectContaining({
            title: '456 Oak Avenue',
            hero_image: '/path/to/hero2.jpg',
            tracking: expect.objectContaining({
                google_analytics_id: 'G-DEFAULT'
            })
        }), {
            headers: {
                'Authorization': 'Bearer fake-lofty-key',
                'Content-Type': 'application/json'
            }
        });
    });
    it('should handle API errors gracefully, returning a Failed status', async () => {
        process.env.LOFTY_API_KEY = 'fake-lofty-key';
        (axios_1.default.post).mockRejectedValueOnce(new Error('Network error'));
        const job = await LoftyIntegrationService_1.LoftyIntegrationService.createOrUpdateLandingPage('list-fail', 'Error St', '/hero.jpg', []);
        expect(job.publishStatus).toBe('Failed');
        expect(job.pageUrl).toBeUndefined();
    });
});
//# sourceMappingURL=LoftyIntegrationService.test.js.map