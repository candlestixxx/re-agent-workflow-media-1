"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BatchProcessingService_1 = require("../src/services/BatchProcessingService");
const FolderDetectionService_1 = require("../src/services/FolderDetectionService");
jest.mock('../src/services/FolderDetectionService');
describe('BatchProcessingService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('should process a batch of valid addresses', async () => {
        FolderDetectionService_1.FolderDetectionService.findPropertyFolder.mockImplementation((address) => {
            return `/mock/path/${address}`;
        });
        const addresses = ['123 Main St', '456 Oak Dr'];
        const jobs = await BatchProcessingService_1.BatchProcessingService.processBatch(addresses, 'Coming Soon');
        expect(jobs).toHaveLength(2);
        expect(jobs[0]?.propertyAddress).toBe('123 Main St');
        expect(jobs[0]?.stage).toBe('Coming Soon');
        expect(jobs[1]?.propertyAddress).toBe('456 Oak Dr');
    });
    it('should skip addresses with missing folders and continue processing others', async () => {
        FolderDetectionService_1.FolderDetectionService.findPropertyFolder.mockImplementation((address) => {
            if (address === 'Missing St')
                return null;
            return `/mock/path/${address}`;
        });
        const addresses = ['123 Main St', 'Missing St', '789 Pine Ln'];
        const jobs = await BatchProcessingService_1.BatchProcessingService.processBatch(addresses, 'Just Listed');
        expect(jobs).toHaveLength(2); // One failed, two succeeded
        expect(jobs[0]?.propertyAddress).toBe('123 Main St');
        expect(jobs[1]?.propertyAddress).toBe('789 Pine Ln');
    });
    it('should return an empty array if all addresses fail', async () => {
        FolderDetectionService_1.FolderDetectionService.findPropertyFolder.mockReturnValue(null);
        const addresses = ['Fail 1', 'Fail 2'];
        const jobs = await BatchProcessingService_1.BatchProcessingService.processBatch(addresses, 'Open House');
        expect(jobs).toHaveLength(0);
    });
});
//# sourceMappingURL=BatchProcessingService.test.js.map