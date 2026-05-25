"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VideoProcessingService_1 = require("../src/services/VideoProcessingService");
describe('VideoProcessingService', () => {
    let baseJob;
    beforeEach(() => {
        baseJob = VideoProcessingService_1.VideoProcessingService.initializeJob('list-123', 'Coming Soon', 'drone', '16:9');
    });
    describe('initializeJob', () => {
        it('should create a new job in a Queued state with default captions to true', () => {
            expect(baseJob.listingId).toBe('list-123');
            expect(baseJob.stage).toBe('Coming Soon');
            expect(baseJob.sourceType).toBe('drone');
            expect(baseJob.targetRatio).toBe('16:9');
            expect(baseJob.status).toBe('Queued');
            expect(baseJob.includeCaptions).toBe(true);
            expect(baseJob.id).toContain('vid-job-');
        });
    });
    describe('updateJobStatus', () => {
        it('should transition to Editing correctly', () => {
            const updated = VideoProcessingService_1.VideoProcessingService.updateJobStatus(baseJob, 'Editing');
            expect(updated.status).toBe('Editing');
        });
        it('should transition to Completed only when outputPath is provided', () => {
            baseJob.status = 'Rendering';
            // Ensure it throws when output path is missing
            expect(() => VideoProcessingService_1.VideoProcessingService.updateJobStatus(baseJob, 'Completed')).toThrow('An outputPath must be provided when marking a video job as Completed');
            // Ensure it passes when output path is provided
            const completed = VideoProcessingService_1.VideoProcessingService.updateJobStatus(baseJob, 'Completed', '/mock/video.mp4');
            expect(completed.status).toBe('Completed');
            expect(completed.outputPath).toBe('/mock/video.mp4');
        });
        it('should throw an error if attempting to transition an already Completed job', () => {
            baseJob.status = 'Completed';
            expect(() => VideoProcessingService_1.VideoProcessingService.updateJobStatus(baseJob, 'Queued')).toThrow('Cannot transition a job that is already Completed');
        });
        it('should throw an error if attempting to transition a Failed job', () => {
            baseJob.status = 'Failed';
            expect(() => VideoProcessingService_1.VideoProcessingService.updateJobStatus(baseJob, 'Editing')).toThrow('Cannot transition a job that is already Failed');
        });
    });
});
//# sourceMappingURL=VideoProcessingService.test.js.map