import axios from 'axios';
jest.mock('axios');
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

  it('should execute live API requests when API key is present', async () => {
    process.env.CANVA_API_KEY = 'real-api-key';
    process.env.CANVA_TEAM_ID = 'test_team';

    (((axios.post) as jest.Mock) as jest.Mock).mockResolvedValueOnce({
      data: { id: 'generated-job-xyz' }
    });

    const result = await CanvaIntegrationService.exportDesign(
      '/mock/property',
      'template-456',
      'Just Listed 123 Main'
    );

    // Custom text should be sanitized: just_listed_123_main
    expect(result).toBe(path.join('/mock/property', 'live_canva_export_test_team_generated-job-xyz_just_listed_123_main.jpg'));

    expect(((axios.post) as jest.Mock)).toHaveBeenCalledWith(
      'https://api.canva.com/rest/v1/autocreates',
      {
        template_id: 'template-456',
        data: {
          text_fields: {
            main_text: 'Just Listed 123 Main'
          }
        }
      },
      {
        headers: {
          'Authorization': 'Bearer real-api-key',
          'Content-Type': 'application/json'
        }
      }
    );
  });

  it('should handle API errors gracefully during live fetching', async () => {
    process.env.CANVA_API_KEY = 'real-api-key';

    (((axios.post) as jest.Mock) as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await CanvaIntegrationService.exportDesign('/mock/fail', 'tpl-1', 'fail');

    expect(result).toBe(path.join('/mock/fail', 'live_canva_export_network_error.jpg'));
  });
});
