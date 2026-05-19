import { SocialCopyService } from '../src/services/SocialCopyService';
import { ListingStage } from '../src/models/ListingMediaJob';

describe('SocialCopyService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // clears the cache
    process.env = { ...originalEnv }; // make a copy
  });

  afterAll(() => {
    process.env = originalEnv; // restore original env
  });

  it('should build a prompt string properly formatted', () => {
    const address = '123 Fake St';
    const stage: ListingStage = 'Just Listed';
    const highlights = ['Pool', '4 Bed', '3 Bath'];

    const prompt = SocialCopyService.buildPrompt(address, stage, highlights);

    expect(prompt).toContain('123 Fake St');
    expect(prompt).toContain('Just Listed');
    expect(prompt).toContain('Pool, 4 Bed, 3 Bath');
    expect(prompt).toContain('#RealEstate');
  });

  it('should use fallback template when no API keys are present', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const copy = await SocialCopyService.generateSocialCopy('456 Oak Dr', 'Open House', ['Renovated Kitchen']);

    expect(copy).toContain('Check out this amazing property at 456 Oak Dr!');
    expect(copy).toContain('Status: Open House');
    expect(copy).toContain('Highlights: Renovated Kitchen');
    expect(copy).not.toContain('[AI Generated Copy]');
  });

  it('should simulate an AI response when an API key is present', async () => {
    process.env.GEMINI_API_KEY = 'fake-api-key';

    const copy = await SocialCopyService.generateSocialCopy('789 Pine Ln', 'Coming Soon', ['Large Backyard']);

    expect(copy).toContain('[AI Generated Copy]');
    expect(copy).toContain('Address: 789 Pine Ln');
    expect(copy).toContain('Stage: Coming Soon');
  });
});
