import { MagnificAiService } from '../../src/services/MagnificAiService';

/**
 * Integration Test Suite - Sandbox Environment
 *
 * This suite is designed to test actual network connectivity against external vendor Sandbox APIs.
 * It strictly bypasses execution if the required API keys are not present in the `.env` file,
 * preventing offline CI pipeline failures.
 */
const runIntegrationTests = process.env.MAGNIFIC_API_KEY ? describe : describe.skip;

runIntegrationTests('Live Sandbox Integrations', () => {
  it('should successfully ping the Magnific AI endpoint with valid auth', async () => {
    // Note: This relies on the live environment having a valid MAGNIFIC_API_KEY
    const mockSourcePath = "/var/tmp/mock_source.jpg";
    const result = await MagnificAiService.generateDayNightImages(mockSourcePath, 'day', 1);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});
