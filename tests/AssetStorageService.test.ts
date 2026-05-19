import fs from 'fs';
import path from 'path';
import { AssetStorageService } from '../src/services/AssetStorageService';
import { ListingStage } from '../src/models/ListingMediaJob';
import { AssetType } from '../src/models/GeneratedAsset';

jest.mock('fs');

describe('AssetStorageService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate properly formatted and sanitized filenames', () => {
    const address = '123 Main St., Apt 4B';
    const stage: ListingStage = 'Just Listed';
    const type: AssetType = 'day';

    const filename = AssetStorageService.generateFilename(address, stage, type, 1);

    expect(filename).toBe('123_Main_St_Apt_4B_Just_Listed_Day_01.jpg');
  });

  it('should save the generated asset to the target folder', async () => {
    const mockFolder = '/mock/1 LISTINGS/123 Main St';
    const address = '123 Main St';
    const stage: ListingStage = 'Open House';
    const type: AssetType = 'night';
    const variation = 2;
    const mockData = 'mock-image-buffer-data';

    (fs.existsSync as jest.Mock).mockReturnValue(true);

    const savedPath = await AssetStorageService.saveGeneratedAsset(
      mockData,
      mockFolder,
      address,
      stage,
      type,
      variation
    );

    const expectedFilename = '123_Main_St_Open_House_Night_02.jpg';
    const expectedPath = path.join(mockFolder, expectedFilename);

    expect(savedPath).toBe(expectedPath);
    expect(fs.writeFileSync).toHaveBeenCalledWith(expectedPath, mockData);
  });

  it('should throw an error if the target property folder does not exist', async () => {
    const mockFolder = '/mock/missing/folder';

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    await expect(
      AssetStorageService.saveGeneratedAsset('data', mockFolder, 'address', 'Coming Soon', 'day', 1)
    ).rejects.toThrow(`Property folder does not exist at path: ${mockFolder}`);
  });
});
