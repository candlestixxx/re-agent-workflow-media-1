"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FolderDetectionService_1 = require("../src/services/FolderDetectionService");
jest.mock('fs');
describe('FolderDetectionService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('should find the folder in the primary path', () => {
        const address = '123 Main St';
        const mockPaths = ['/mock/share/1 LISTINGS/2026 Listings', '/mock/downloads'];
        // Setup fs mock to say the folder exists in the first path
        fs_1.default.existsSync.mockImplementation((checkPath) => {
            return checkPath === path_1.default.join('/mock/share/1 LISTINGS/2026 Listings', address);
        });
        fs_1.default.statSync.mockReturnValue({
            isDirectory: () => true
        });
        const result = FolderDetectionService_1.FolderDetectionService.findPropertyFolder(address, mockPaths);
        expect(result).toBe(path_1.default.join('/mock/share/1 LISTINGS/2026 Listings', address));
    });
    it('should fallback to secondary path if primary fails', () => {
        const address = '456 Oak Ave';
        const mockPaths = ['/mock/missing', '/mock/downloads'];
        fs_1.default.existsSync.mockImplementation((checkPath) => {
            return checkPath === path_1.default.join('/mock/downloads', address);
        });
        fs_1.default.statSync.mockReturnValue({
            isDirectory: () => true
        });
        const result = FolderDetectionService_1.FolderDetectionService.findPropertyFolder(address, mockPaths);
        expect(result).toBe(path_1.default.join('/mock/downloads', address));
    });
    it('should return null if folder is not found in any path', () => {
        const address = '789 Pine Rd';
        const mockPaths = ['/mock/missing1', '/mock/missing2'];
        fs_1.default.existsSync.mockReturnValue(false);
        const result = FolderDetectionService_1.FolderDetectionService.findPropertyFolder(address, mockPaths);
        expect(result).toBeNull();
    });
    it('should return null if path exists but is a file instead of a directory', () => {
        const address = '123 Main St';
        const mockPaths = ['/mock/share'];
        fs_1.default.existsSync.mockReturnValue(true);
        fs_1.default.statSync.mockReturnValue({
            isDirectory: () => false // It's a file, not a directory
        });
        const result = FolderDetectionService_1.FolderDetectionService.findPropertyFolder(address, mockPaths);
        expect(result).toBeNull();
    });
});
//# sourceMappingURL=FolderDetectionService.test.js.map