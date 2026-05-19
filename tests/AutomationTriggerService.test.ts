import { AutomationTriggerService, WebhookPayload } from '../src/services/AutomationTriggerService';
import { FolderDetectionService } from '../src/services/FolderDetectionService';

// Mock the FolderDetectionService
jest.mock('../src/services/FolderDetectionService');

describe('AutomationTriggerService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return null for unrelated webhook events', async () => {
    const payload: WebhookPayload = {
      event: 'listing.deleted',
      listingId: '123',
      address: '123 Main St',
      agentId: 'agent-1'
    };

    const result = await AutomationTriggerService.handleWebhook(payload);
    expect(result).toBeNull();
  });

  it('should throw an error if address or listingId is missing', async () => {
    const payload: any = {
      event: 'listing.created',
      agentId: 'agent-1'
      // missing address and listingId
    };

    await expect(AutomationTriggerService.handleWebhook(payload)).rejects.toThrow(
      'Invalid webhook payload: Missing required address or listingId'
    );
  });

  it('should throw an error if the source folder cannot be found', async () => {
    const payload: WebhookPayload = {
      event: 'listing.created',
      listingId: 'mls-123',
      address: 'Missing Folder St',
      agentId: 'agent-1'
    };

    (FolderDetectionService.findPropertyFolder as jest.Mock).mockReturnValue(null);

    await expect(AutomationTriggerService.handleWebhook(payload)).rejects.toThrow(
      'Automation blocked: Cannot locate source media folder for Missing Folder St'
    );
  });

  it('should successfully initialize a job for a new listing', async () => {
    const payload: WebhookPayload = {
      event: 'listing.created',
      listingId: 'mls-456',
      address: '123 Main St',
      agentId: 'agent-1'
    };

    (FolderDetectionService.findPropertyFolder as jest.Mock).mockReturnValue('/mock/path/123 Main St');

    const job = await AutomationTriggerService.handleWebhook(payload);

    expect(job).not.toBeNull();
    expect(job?.propertyAddress).toBe('123 Main St');
    expect(job?.stage).toBe('Just Listed');
    expect(job?.status).toBe('Pending_Generation');
    expect(job?.sourceFolderPath).toBe('/mock/path/123 Main St');
  });

  it('should assign a specific target stage when status_updated event fires', async () => {
    const payload: WebhookPayload = {
      event: 'listing.status_updated',
      listingId: 'mls-789',
      address: '456 Oak Dr',
      agentId: 'agent-2',
      statusUpdate: 'Just Sold'
    };

    (FolderDetectionService.findPropertyFolder as jest.Mock).mockReturnValue('/mock/path/456 Oak Dr');

    const job = await AutomationTriggerService.handleWebhook(payload);

    expect(job).not.toBeNull();
    expect(job?.stage).toBe('Just Sold');
  });
});
