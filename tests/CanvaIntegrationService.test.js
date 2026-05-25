"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const CanvaIntegrationService_1 = require("../src/services/CanvaIntegrationService");
const path_1 = __importDefault(require("path"));
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
        const result = await CanvaIntegrationService_1.CanvaIntegrationService.exportDesign('/mock/property', 'template-123', 'Just Listed 123 Main');
        expect(result).toBe(path_1.default.join('/mock/property', 'mock_canva_export_template-123.jpg'));
    });
    it('should execute live API requests when API key is present', async () => {
        process.env.CANVA_API_KEY = 'real-api-key';
        process.env.CANVA_TEAM_ID = 'test_team';
        (axios_1.default.post).mockResolvedValueOnce({
            data: { id: 'generated-job-xyz' }
        });
        const result = await CanvaIntegrationService_1.CanvaIntegrationService.exportDesign('/mock/property', 'template-456', 'Just Listed 123 Main');
        // Custom text should be sanitized: just_listed_123_main
        expect(result).toBe(path_1.default.join('/mock/property', 'live_canva_export_test_team_generated-job-xyz_just_listed_123_main.jpg'));
        expect((axios_1.default.post)).toHaveBeenCalledWith('https://api.canva.com/rest/v1/autocreates', {
            template_id: 'template-456',
            data: {
                text_fields: {
                    main_text: 'Just Listed 123 Main'
                }
            }
        }, {
            headers: {
                'Authorization': 'Bearer real-api-key',
                'Content-Type': 'application/json'
            }
        });
    });
    it('should handle API errors gracefully during live fetching', async () => {
        process.env.CANVA_API_KEY = 'real-api-key';
        (axios_1.default.post).mockRejectedValue(new Error('Network error'));
        const result = await CanvaIntegrationService_1.CanvaIntegrationService.exportDesign('/mock/fail', 'tpl-1', 'fail');
        expect(result).toBe(path_1.default.join('/mock/fail', 'live_canva_export_network_error.jpg'));
    });
});
//# sourceMappingURL=CanvaIntegrationService.test.js.map