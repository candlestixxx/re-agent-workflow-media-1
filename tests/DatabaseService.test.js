"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService_1 = require("../src/services/DatabaseService");
const pg_1 = require("pg");
jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    };
    const mPool = {
        connect: jest.fn(() => mClient),
    };
    return { Pool: jest.fn(() => mPool) };
});
describe('DatabaseService', () => {
    let pool;
    let client;
    beforeEach(() => {
        jest.resetModules();
        pool = new pg_1.Pool();
        client = pool.connect();
        jest.clearAllMocks();
    });
    it('should successfully persist a ListingMediaJob to PostgreSQL', async () => {
        // Setup Mock response shape representing SQL returning rows
        const mockDbRow = {
            id: 'job-1',
            mls_id: 'mls-123',
            property_address: '123 DB Street',
            stage: 'Just Listed',
            source_folder_path: '/path',
            status: 'Pending_Generation',
            created_by: 'lum-1',
            created_at: new Date('2026-01-01T00:00:00Z'),
            updated_at: new Date('2026-01-01T00:00:00Z')
        };
        client.query.mockResolvedValueOnce({ rows: [mockDbRow] });
        const jobInput = {
            id: 'job-1',
            mlsId: 'mls-123',
            propertyAddress: '123 DB Street',
            stage: 'Just Listed',
            sourceFolderPath: '/path',
            status: 'Pending_Generation',
            createdBy: 'lum-1',
            createdAt: mockDbRow.created_at,
            updatedAt: mockDbRow.updated_at
        };
        const persistedJob = await DatabaseService_1.DatabaseService.insertListingMediaJob(jobInput);
        expect(client.query).toHaveBeenCalledTimes(1);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO listing_media_jobs'), expect.arrayContaining(['job-1', 'mls-123', '123 DB Street']));
        expect(client.release).toHaveBeenCalledTimes(1);
        // Assert mapped response translates snake_case back to camelCase
        expect(persistedJob.mlsId).toBe('mls-123');
        expect(persistedJob.propertyAddress).toBe('123 DB Street');
    });
    it('should throw an error and release client when DB fails', async () => {
        client.query.mockRejectedValueOnce(new Error('Connection timeout'));
        const jobInput = { id: 'job-fail' };
        await expect(DatabaseService_1.DatabaseService.insertListingMediaJob(jobInput)).rejects.toThrow('Failed to persist ListingMediaJob: job-fail');
        expect(client.release).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=DatabaseService.test.js.map