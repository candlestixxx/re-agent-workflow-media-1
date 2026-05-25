"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AssetStorageService_1 = require("../src/services/AssetStorageService");
jest.mock('fs');
describe('AssetStorageService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('should generate properly formatted and sanitized filenames', () => {
        const address = '123 Main St., Apt 4B';
        const stage = 'Just Listed';
        const type = 'day';
        const filename = AssetStorageService_1.AssetStorageService.generateFilename(address, stage, type, 1);
        expect(filename).toBe('123_Main_St_Apt_4B_Just_Listed_Day_01.jpg');
    });
    it('should save the generated asset to the target folder', async () => {
        const mockFolder = '/mock/1 LISTINGS/123 Main St';
        const address = '123 Main St';
        const stage = 'Open House';
        const type = 'night';
        const variation = 2;
        const mockData = 'mock-image-buffer-data';
        fs_1.default.existsSync.mockReturnValue(true);
        const savedPath = await AssetStorageService_1.AssetStorageService.saveGeneratedAsset(mockData, mockFolder, address, stage, type, variation);
        const expectedFilename = '123_Main_St_Open_House_Night_02.jpg';
        const expectedPath = path_1.default.join(mockFolder, expectedFilename);
        expect(savedPath).toBe(expectedPath);
        expect(fs_1.default.writeFileSync).toHaveBeenCalledWith(expectedPath, mockData);
    });
    it('should throw an error if the target property folder does not exist', async () => {
        const mockFolder = '/mock/missing/folder';
        fs_1.default.existsSync.mockReturnValue(false);
        await expect(AssetStorageService_1.AssetStorageService.saveGeneratedAsset('data', mockFolder, 'address', 'Coming Soon', 'day', 1)).rejects.toThrow(`Property folder does not exist at path: ${mockFolder}`);
    });
});
//# sourceMappingURL=AssetStorageService.test.js.map