import fs from 'fs';
import path from 'path';
import { FolderDetectionService } from '../src/services/FolderDetectionService';

jest.mock('fs');

describe('FolderDetectionService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should find the folder in the primary path', () => {
    const address = '123 Main St';
    const mockPaths = ['/mock/share/1 LISTINGS/2026 Listings', '/mock/downloads'];

    // Setup fs mock to say the folder exists in the first path
    (fs.existsSync as jest.Mock).mockImplementation((checkPath: string) => {
      return checkPath === path.join('/mock/share/1 LISTINGS/2026 Listings', address);
    });

    (fs.statSync as jest.Mock).mockReturnValue({
      isDirectory: () => true
    });

    const result = FolderDetectionService.findPropertyFolder(address, mockPaths);
    expect(result).toBe(path.join('/mock/share/1 LISTINGS/2026 Listings', address));
  });

  it('should fallback to secondary path if primary fails', () => {
    const address = '456 Oak Ave';
    const mockPaths = ['/mock/missing', '/mock/downloads'];

    (fs.existsSync as jest.Mock).mockImplementation((checkPath: string) => {
      return checkPath === path.join('/mock/downloads', address);
    });

    (fs.statSync as jest.Mock).mockReturnValue({
      isDirectory: () => true
    });

    const result = FolderDetectionService.findPropertyFolder(address, mockPaths);
    expect(result).toBe(path.join('/mock/downloads', address));
  });

  it('should return null if folder is not found in any path', () => {
    const address = '789 Pine Rd';
    const mockPaths = ['/mock/missing1', '/mock/missing2'];

    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const result = FolderDetectionService.findPropertyFolder(address, mockPaths);
    expect(result).toBeNull();
  });

  it('should return null if path exists but is a file instead of a directory', () => {
    const address = '123 Main St';
    const mockPaths = ['/mock/share'];

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({
      isDirectory: () => false // It's a file, not a directory
    });

    const result = FolderDetectionService.findPropertyFolder(address, mockPaths);
    expect(result).toBeNull();
  });
});
