import fs from 'fs';
import path from 'path';

export class FolderDetectionService {
  /**
   * The default priority order of paths to search for a property folder.
   */
  private static defaultPaths: string[] = [
    process.env.LISTING_SHARE_PATH || '\\\\excelserver\\WeichertShare\\1 LISTINGS\\2026 Listings',
    // Fallbacks typically use the user's home directory
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'MLS'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads'),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'Desktop')
  ];

  /**
   * Discovers all subdirectories within the default search paths.
   * Useful for manual selection from the dashboard.
   */
  public static discoverAvailableFolders(): { name: string; path: string }[] {
    const discovered: { name: string; path: string }[] = [];

    for (const searchPath of this.defaultPaths) {
      if (!searchPath || !fs.existsSync(searchPath)) continue;

      try {
        const entries = fs.readdirSync(searchPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            discovered.push({
              name: entry.name,
              path: path.join(searchPath, entry.name)
            });
          }
        }
      } catch (error) {
        continue;
      }
    }

    // Filter out obvious system/non-property folders to keep it clean
    const ignoredFolders = ['node_modules', '.git', 'AppData', 'Cookies', 'Local Settings', 'My Documents', 'NetHood', 'PrintHood', 'Recent', 'SendTo', 'Start Menu', 'Templates'];
    return discovered.filter(f => !ignoredFolders.includes(f.name));
  }

  /**
   * Searches for a property folder matching the given address across priority paths.
   * @param address The street address to search for (e.g., "123 Main St").
   * @param overridePaths Optional paths to search instead of the defaults.
   * @returns The absolute path to the found folder, or null if not found.
   */
  public static findPropertyFolder(address: string, overridePaths?: string[]): string | null {
    const pathsToSearch = overridePaths || this.defaultPaths;

    for (const searchPath of pathsToSearch) {
      if (!searchPath) continue;

      try {
        // Build the expected path. Note: in a real implementation, we might
        // do fuzzy matching via fs.readdirSync(searchPath) to find partial matches.
        // For MVP, we do exact string matching based on the spec.
        const expectedFolderPath = path.join(searchPath, address);

        if (fs.existsSync(expectedFolderPath)) {
          const stats = fs.statSync(expectedFolderPath);
          if (stats.isDirectory()) {
            return expectedFolderPath;
          }
        }
      } catch (error) {
        // Ignore permission errors or missing root drives and continue to the next fallback.
        continue;
      }
    }

    return null;
  }
}
