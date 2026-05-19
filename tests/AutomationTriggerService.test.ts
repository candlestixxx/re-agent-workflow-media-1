import { AutomationTriggerService, WebhookPayload } from '../src/services/AutomationTriggerService';
import { FolderDetectionService } from '../src/services/FolderDetectionService';
import { DatabaseService } from '../src/services/DatabaseService';

// Mock internal dependencies
jest.mock('../src/services/FolderDetectionService');
jest.mock('../src/services/DatabaseService');

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

  it('should successfully initialize a job for a new listing and persist to DB', async () => {
    const payload: WebhookPayload = {
      event: 'listing.created',
      listingId: 'mls-456',
      address: '123 Main St',
      agentId: 'agent-1'
    };

    (FolderDetectionService.findPropertyFolder as jest.Mock).mockReturnValue('/mock/path/123 Main St');
    (DatabaseService.insertListingMediaJob as jest.Mock).mockImplementation(async (j) => j);

    const job = await AutomationTriggerService.handleWebhook(payload);

    expect(job).not.toBeNull();
    expect(job?.propertyAddress).toBe('123 Main St');
    expect(job?.stage).toBe('Just Listed');
    expect(job?.status).toBe('Pending_Generation');
    expect(job?.sourceFolderPath).toBe('/mock/path/123 Main St');

    expect(DatabaseService.insertListingMediaJob).toHaveBeenCalledTimes(1);
    expect(DatabaseService.insertListingMediaJob).toHaveBeenCalledWith(
      expect.objectContaining({ propertyAddress: '123 Main St' })
    );
  });

  it('should fallback to returning an in-memory job if DB throws an error', async () => {
    const payload: WebhookPayload = {
      event: 'listing.created',
      listingId: 'mls-456',
      address: 'DB Fail St',
      agentId: 'agent-1'
    };

    (FolderDetectionService.findPropertyFolder as jest.Mock).mockReturnValue('/mock/path');
    (DatabaseService.insertListingMediaJob as jest.Mock).mockRejectedValueOnce(new Error('PG Connection Failed'));

    const job = await AutomationTriggerService.handleWebhook(payload);

    expect(job).not.toBeNull();
    expect(job?.propertyAddress).toBe('DB Fail St');
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
    (DatabaseService.insertListingMediaJob as jest.Mock).mockImplementation(async (j) => j);

    const job = await AutomationTriggerService.handleWebhook(payload);

    expect(job).not.toBeNull();
    expect(job?.stage).toBe('Just Sold');
  });
});
