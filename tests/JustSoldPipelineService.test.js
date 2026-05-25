"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JustSoldPipelineService_1 = require("../src/services/JustSoldPipelineService");
describe('JustSoldPipelineService', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });
    it('should successfully scaffold drafts for a Just Sold job', async () => {
        const job = {
            id: 'job-sold-1',
            propertyAddress: '123 Success Ln',
            stage: 'Just Sold',
            sourceFolderPath: '/mock/123 Success Ln',
            status: 'Approved',
            createdBy: 'agent-1',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const drafts = await JustSoldPipelineService_1.JustSoldPipelineService.processJustSold(job);
        expect(drafts).toHaveLength(3); // FB, LinkedIn, Insta
        expect(drafts[0]?.platform).toBe('Facebook');
        expect(drafts[0]?.caption).toContain('123 Success Ln');
        expect(drafts[0]?.caption).toContain('#JustSold');
        expect(drafts[0]?.approvalStatus).toBe('Pending');
        expect(drafts[0]?.imagePath).toBe('/mock/123 Success Ln/mock_canva_export_template_just_sold_default.jpg');
    });
    it('should use custom template ID from environment if provided', async () => {
        process.env.CANVA_JUST_SOLD_TEMPLATE_ID = 'custom-sold-template-123';
        const job = {
            id: 'job-sold-2',
            propertyAddress: '456 Winner Blvd',
            stage: 'Just Sold',
            sourceFolderPath: '/mock/456 Winner Blvd',
            status: 'Approved',
            createdBy: 'agent-2',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const drafts = await JustSoldPipelineService_1.JustSoldPipelineService.processJustSold(job);
        expect(drafts[0]?.imagePath).toBe('/mock/456 Winner Blvd/mock_canva_export_custom-sold-template-123.jpg');
    });
    it('should throw an error if the job stage is not Just Sold', async () => {
        const job = {
            id: 'job-open-house',
            propertyAddress: '789 Party Ave',
            stage: 'Open House',
            sourceFolderPath: '/mock/789 Party Ave',
            status: 'Approved',
            createdBy: 'agent-1',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await expect(JustSoldPipelineService_1.JustSoldPipelineService.processJustSold(job)).rejects.toThrow('Cannot process Just Sold pipeline for job in stage: Open House');
    });
});
//# sourceMappingURL=JustSoldPipelineService.test.js.map