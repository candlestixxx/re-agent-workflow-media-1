import fs from 'fs';
import path from 'path';
import { ListingStage } from '../models/ListingMediaJob';
import { AssetType } from '../models/GeneratedAsset';

export class AssetStorageService {
  /**
   * Cleans strings to be safely used in file names.
   */
  private static sanitizeForFilename(input: string): string {
    return input.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
  }

  /**
   * Constructs a consistent, standardized filename for the generated asset.
   * Format: {Address}_{Stage}_{Type}_{Variation}.jpg
   * Example: 123_Main_St_Just_Listed_Day_01.jpg
   */
  public static generateFilename(address: string, stage: ListingStage, type: AssetType, variation: number): string {
    const cleanAddress = this.sanitizeForFilename(address);
    const cleanStage = this.sanitizeForFilename(stage);
    const cleanType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    // Pad variation with leading zero (01, 02, etc.)
    const paddedVariation = variation.toString().padStart(2, '0');

    return `${cleanAddress}_${cleanStage}_${cleanType}_${paddedVariation}.jpg`;
  }

  /**
   * Saves the generated asset buffer to the correct property folder.
   * @param sourceData The image buffer to save.
   * @param propertyFolderPath The absolute path to the listing folder.
   * @param address The property address.
   * @param stage The current marketing stage.
   * @param type Day, Night, etc.
   * @param variation The variation number (e.g. 1, 2, 3).
   * @returns The absolute path to the saved file.
   */
  public static async saveGeneratedAsset(
    sourceData: Buffer | string,
    propertyFolderPath: string,
    address: string,
    stage: ListingStage,
    type: AssetType,
    variation: number
  ): Promise<string> {

    if (!fs.existsSync(propertyFolderPath)) {
      throw new Error(`Property folder does not exist at path: ${propertyFolderPath}`);
    }

    const filename = this.generateFilename(address, stage, type, variation);
    const fullOutputPath = path.join(propertyFolderPath, filename);

    // In a real implementation this might be an async write or a stream from Magnific API
    fs.writeFileSync(fullOutputPath, sourceData);

    return fullOutputPath;
  }
}
