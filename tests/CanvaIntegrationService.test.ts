import { CanvaIntegrationService } from '../src/services/CanvaIntegrationService';
import path from 'path';

describe('CanvaIntegrationService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return a local mock filepath when API key is missing', async () => {
    delete process.env.CANVA_API_KEY;

    const result = await CanvaIntegrationService.exportDesign(
      '/mock/property',
      'template-123',
      'Just Listed 123 Main'
    );

    expect(result).toBe(path.join('/mock/property', 'mock_canva_export_template-123.jpg'));
  });

  it('should simulate an API response payload when API key is present', async () => {
    process.env.CANVA_API_KEY = 'real-api-key';
    process.env.CANVA_TEAM_ID = 'test_team';

    const result = await CanvaIntegrationService.exportDesign(
      '/mock/property',
      'template-456',
      'Just Listed 123 Main'
    );

    // Custom text should be sanitized: just_listed_123_main
    expect(result).toBe(path.join('/mock/property', 'live_canva_export_test_team_template-456_just_listed_123_main.jpg'));
  });
});
