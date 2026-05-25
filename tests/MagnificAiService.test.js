"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const MagnificAiService_1 = require("../src/services/MagnificAiService");
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
        const results = await MagnificAiService_1.MagnificAiService.generateDayNightImages('/path/source.jpg', 'night', 2);
        expect(results).toHaveLength(2);
        expect(results[0]).toBe('mock_magnific_buffer_night_variation_1_using_test_nano_model');
        expect(results[1]).toBe('mock_magnific_buffer_night_variation_2_using_test_nano_model');
    });
    it('should execute live API requests when an API key is present', async () => {
        process.env.MAGNIFIC_API_KEY = 'real-api-key';
        process.env.MAGNIFIC_MODEL = 'test-model';
        // Import axios so we can mock its resolved value
        // Use mockResolvedValueOnce three times since variation defaults to 3 requests
        (axios_1.default.post)
            .mockResolvedValueOnce({ data: { output_url: 'https://cdn.magnific.ai/result1.jpg' } })
            .mockResolvedValueOnce({ data: { output_url: 'https://cdn.magnific.ai/result2.jpg' } })
            .mockResolvedValueOnce({ data: { output_url: 'https://cdn.magnific.ai/result3.jpg' } });
        const results = await MagnificAiService_1.MagnificAiService.generateDayNightImages('/path/to/day.jpg', 'day', 3);
        expect(results).toHaveLength(3);
        expect(results[0]).toBe('https://cdn.magnific.ai/result1.jpg');
        expect(results[2]).toBe('https://cdn.magnific.ai/result3.jpg');
        // Assert correct headers and payload
        expect((axios_1.default.post)).toHaveBeenCalledWith('https://api.magnific.ai/v1/generate', {
            image_path: '/path/to/day.jpg',
            style: 'day',
            model: 'test-model'
        }, {
            headers: {
                'Authorization': 'Bearer real-api-key',
                'Content-Type': 'application/json'
            }
        });
    });
    it('should handle API errors gracefully during live fetching', async () => {
        process.env.MAGNIFIC_API_KEY = 'real-api-key';
        (axios_1.default.post).mockRejectedValue(new Error('Network error'));
        const results = await MagnificAiService_1.MagnificAiService.generateDayNightImages('/path/to/fail.jpg', 'night', 1);
        expect(results).toHaveLength(1);
        expect(results[0]).toBe('[API_ERROR] Failed to fetch live variation 1 from Magnific');
    });
});
// Define the axios mock at the file scope
//# sourceMappingURL=MagnificAiService.test.js.map