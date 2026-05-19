import { ListingMediaJob } from '../src/models/ListingMediaJob';
import { GeneratedAsset } from '../src/models/GeneratedAsset';

describe('Data Models', () => {
  it('should allow creating a valid ListingMediaJob', () => {
    const job: ListingMediaJob = {
      id: 'job-123',
      propertyAddress: '123 Main St',
      stage: 'Just Listed',
      sourceFolderPath: 'C:/Listings/123 Main St',
      status: 'Draft',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    expect(job.id).toBe('job-123');
    expect(job.stage).toBe('Just Listed');
  });

  it('should allow creating a valid GeneratedAsset', () => {
    const asset: GeneratedAsset = {
      id: 'asset-456',
      jobId: 'job-123',
      type: 'day',
      ratio: '16:9',
      sourceImagePath: 'source.jpg',
      outputPath: 'output_day_01.jpg',
      versionNumber: 1,
      approvalStatus: 'Pending',
      createdAt: new Date()
    };
    expect(asset.type).toBe('day');
    expect(asset.ratio).toBe('16:9');
  });
});
