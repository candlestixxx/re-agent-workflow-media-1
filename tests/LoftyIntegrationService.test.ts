import { LoftyIntegrationService } from '../src/services/LoftyIntegrationService';

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

    const job = await LoftyIntegrationService.createOrUpdateLandingPage(
      'list-123',
      '123 Main St',
      '/path/to/hero.jpg',
      ['Pool']
    );

    expect(job.listingId).toBe('list-123');
    expect(job.analyticsId).toBe('G-TEST');
    expect(job.pixelId).toBe('FB-TEST');
    expect(job.popupDelaySeconds).toBe(7);
    expect(job.publishStatus).toBe('Pending');
    expect(job.pageUrl).toBeUndefined();
  });

  it('should create a published job with URL when API key is present', async () => {
    process.env.LOFTY_API_KEY = 'fake-key';

    // Test env fallbacks
    delete process.env.DEFAULT_GOOGLE_ANALYTICS_ID;
    delete process.env.DEFAULT_FACEBOOK_PIXEL_ID;

    const job = await LoftyIntegrationService.createOrUpdateLandingPage(
      'list-456',
      '456 Oak Avenue',
      '/path/to/hero2.jpg',
      ['Garage']
    );

    expect(job.publishStatus).toBe('Published');
    expect(job.pageUrl).toBe('https://crm.lofty.com/landing/456-oak-avenue');
    expect(job.analyticsId).toBe('G-DEFAULT');
    expect(job.pixelId).toBe('FB-DEFAULT');
  });
});
