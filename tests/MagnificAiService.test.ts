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

  it('should return mock buffers when API key is missing', async () => {
    delete process.env.MAGNIFIC_API_KEY;
    process.env.MAGNIFIC_MODEL = 'test_nano_model';

    const results = await MagnificAiService.generateDayNightImages('/path/source.jpg', 'night', 2);

    expect(results).toHaveLength(2);
    expect(results[0]).toBe('mock_magnific_buffer_night_variation_1_using_test_nano_model');
    expect(results[1]).toBe('mock_magnific_buffer_night_variation_2_using_test_nano_model');
  });

  it('should simulate API responses when an API key is present', async () => {
    process.env.MAGNIFIC_API_KEY = 'real-api-key';

    const results = await MagnificAiService.generateDayNightImages('/path/to/day.jpg', 'day', 3);

    expect(results).toHaveLength(3);
    expect(results[0]).toContain('[API_RESPONSE]');
    expect(results[0]).toContain('Enhanced day image buffer 1 from /path/to/day.jpg');
    expect(results[2]).toContain('Enhanced day image buffer 3');
  });
});
