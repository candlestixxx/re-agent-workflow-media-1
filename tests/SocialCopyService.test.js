"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const SocialCopyService_1 = require("../src/services/SocialCopyService");
describe('SocialCopyService', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules(); // clears the cache
        process.env = { ...originalEnv }; // make a copy
    });
    afterAll(() => {
        process.env = originalEnv; // restore original env
    });
    it('should build a prompt string properly formatted', () => {
        const address = '123 Fake St';
        const stage = 'Just Listed';
        const highlights = ['Pool', '4 Bed', '3 Bath'];
        const prompt = SocialCopyService_1.SocialCopyService.buildPrompt(address, stage, highlights);
        expect(prompt).toContain('123 Fake St');
        expect(prompt).toContain('Just Listed');
        expect(prompt).toContain('Pool, 4 Bed, 3 Bath');
        expect(prompt).toContain('#RealEstate');
    });
    it('should use fallback template when no API keys are present', async () => {
        delete process.env.OPENAI_API_KEY;
        const copy = await SocialCopyService_1.SocialCopyService.generateSocialCopy('456 Oak Dr', 'Open House', ['Renovated Kitchen']);
        expect(copy).toContain('Check out this amazing property at 456 Oak Dr!');
        expect(copy).toContain('Status: Open House');
        expect(copy).toContain('Highlights: Renovated Kitchen');
        expect(copy).not.toContain('[API_ERROR]');
    });
    it('should execute live API requests when OPENAI_API_KEY is present', async () => {
        process.env.OPENAI_API_KEY = 'fake-openai-key';
        (axios_1.default.post).mockResolvedValueOnce({
            data: {
                choices: [
                    { message: { content: 'This is an AI generated response!' } }
                ]
            }
        });
        const copy = await SocialCopyService_1.SocialCopyService.generateSocialCopy('789 Pine Ln', 'Coming Soon', ['Large Backyard']);
        expect(copy).toBe('This is an AI generated response!');
        expect((axios_1.default.post)).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', expect.objectContaining({
            model: 'gpt-4',
            messages: expect.arrayContaining([
                expect.objectContaining({ role: 'system' }),
                expect.objectContaining({ role: 'user', content: expect.stringContaining('789 Pine Ln') })
            ])
        }), {
            headers: {
                'Authorization': 'Bearer fake-openai-key',
                'Content-Type': 'application/json'
            }
        });
    });
    it('should handle API errors gracefully during live fetching', async () => {
        process.env.OPENAI_API_KEY = 'fake-openai-key';
        (axios_1.default.post).mockRejectedValue(new Error('Network error'));
        const result = await SocialCopyService_1.SocialCopyService.generateSocialCopy('/mock/fail', 'Coming Soon', []);
        expect(result).toBe('[API_ERROR] Failed to fetch live completion from OpenAI');
    });
});
//# sourceMappingURL=SocialCopyService.test.js.map