import axios from 'axios';
jest.mock('axios');
import { MagnificAiService } from '../src/services/MagnificAiService';

describe('MagnificAiService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('throws when API key is missing (never fabricates output URLs)', async () => {
    delete process.env.MAGNIFIC_API_KEY;
    process.env.MAGNIFIC_MODEL = 'test_nano_model';

    await expect(
      MagnificAiService.generateDayNightImages('/path/source.jpg', 'night', 2)
    ).rejects.toThrow(/MAGNIFIC_API_KEY is not configured/);
  });

  it('should execute live API requests when an API key is present', async () => {
    process.env.MAGNIFIC_API_KEY = 'real-api-key';
    process.env.MAGNIFIC_MODEL = 'test-model';

    // Use mockResolvedValueOnce three times since variation defaults to 3 requests
    ((axios.post) as jest.Mock)
      .mockResolvedValueOnce({ data: { output_url: 'https://cdn.magnific.ai/result1.jpg' } })
      .mockResolvedValueOnce({ data: { output_url: 'https://cdn.magnific.ai/result2.jpg' } })
      .mockResolvedValueOnce({ data: { output_url: 'https://cdn.magnific.ai/result3.jpg' } });

    const results = await MagnificAiService.generateDayNightImages('/path/to/day.jpg', 'day', 3);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('https://cdn.magnific.ai/result1.jpg');
    expect(results[2]).toBe('https://cdn.magnific.ai/result3.jpg');

    // Assert correct headers and payload
    expect(((axios.post) as jest.Mock)).toHaveBeenCalledWith(
      'https://api.magnific.ai/v1/generate',
      {
        image_path: '/path/to/day.jpg',
        style: 'day',
        model: 'test-model'
      },
      {
        headers: {
          'Authorization': 'Bearer real-api-key',
          'Content-Type': 'application/json'
        }
      }
    );
  });

  it('marks individual variations as API errors on failure', async () => {
    process.env.MAGNIFIC_API_KEY = 'real-api-key';

    ((axios.post) as jest.Mock).mockRejectedValue(new Error('Network error'));

    const results = await MagnificAiService.generateDayNightImages('/path/to/fail.jpg', 'night', 1);

    expect(results).toHaveLength(1);
    expect(results[0]).toBe('[API_ERROR] Failed to fetch live variation 1 from Magnific');
  });
});
