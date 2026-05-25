"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AlertingService_1 = require("../src/services/AlertingService");
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('AlertingService', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterAll(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });
    it('should fallback to console logging and return true when ALERT_WEBHOOK_URL is missing', async () => {
        delete process.env.ALERT_WEBHOOK_URL;
        const result = await AlertingService_1.AlertingService.sendAlert('Missing webhook test', 'info');
        expect(result).toBe(true);
        expect(mockedAxios.post).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('[ALERT - INFO] Missing webhook test');
    });
    it('should successfully post to the webhook URL when configured', async () => {
        process.env.ALERT_WEBHOOK_URL = 'https://mock.discord.webhook/api';
        mockedAxios.post.mockResolvedValueOnce({ status: 200, data: 'ok' });
        const result = await AlertingService_1.AlertingService.sendAlert('Batch finished', 'warning');
        expect(result).toBe(true);
        expect(mockedAxios.post).toHaveBeenCalledWith('https://mock.discord.webhook/api', {
            text: '[WARNING] Batch finished',
            content: '[WARNING] Batch finished'
        }, { headers: { 'Content-Type': 'application/json' } });
    });
    it('should return false and log error if the webhook post fails', async () => {
        process.env.ALERT_WEBHOOK_URL = 'https://mock.discord.webhook/api';
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
        const result = await AlertingService_1.AlertingService.sendAlert('Pipeline crash', 'error');
        expect(result).toBe(false);
        expect(mockedAxios.post).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Failed to send alert via webhook:', expect.any(Error));
    });
});
//# sourceMappingURL=AlertingService.test.js.map