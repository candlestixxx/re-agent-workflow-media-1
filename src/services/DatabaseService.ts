import { Pool } from 'pg';
import { ListingMediaJob } from '../models/ListingMediaJob';

export class DatabaseService {
  private static pool: Pool;

  /**
   * Returns a singleton connection pool.
   * Parses the DATABASE_URL connection string if provided, otherwise falls back to standard PG env vars.
   */
  public static getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });
    }
    return this.pool;
  }

  /**
   * Persists a new ListingMediaJob to the PostgreSQL database.
   *
   * @param job The structured job object to save.
   * @returns The persisted job data from the database.
   */
  public static async insertListingMediaJob(job: ListingMediaJob): Promise<ListingMediaJob> {
    const query = `
      INSERT INTO listing_media_jobs
        (id, mls_id, property_address, stage, source_folder_path, status, created_by, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      job.id,
      job.mlsId || null,
      job.propertyAddress,
      job.stage,
      job.sourceFolderPath,
      job.status,
      job.createdBy,
      job.createdAt,
      job.updatedAt
    ];

    try {
      const client = await this.getPool().connect();
      try {
        const res = await client.query(query, values);

        // Map snake_case DB columns back to our application domain object structure
        const row = res.rows[0];
        return {
          id: row.id,
          mlsId: row.mls_id,
          propertyAddress: row.property_address,
          stage: row.stage,
          sourceFolderPath: row.source_folder_path,
          status: row.status,
          createdBy: row.created_by,
          approvedBy: row.approved_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database insertion failed:', error);
      throw new Error(`Failed to persist ListingMediaJob: ${job.id}`);
    }
  }

  /**
   * Retrieves all ListingMediaJobs from the database, sorted by creation date descending.
   *
   * @returns A promise resolving to an array of ListingMediaJob objects.
   */
  public static async getAllListingMediaJobs(): Promise<ListingMediaJob[]> {
    const query = 'SELECT * FROM listing_media_jobs ORDER BY created_at DESC;';

    // If no DATABASE_URL is provided, skip the connection attempt and return mock data directly
    if (!process.env.DATABASE_URL) {
      console.log('[Database] No DATABASE_URL found. Operating in mock mode.');
      return this.getMockJobs();
    }

    try {
      const client = await this.getPool().connect();
      try {
        const res = await client.query(query);
        return res.rows.map(row => ({
          id: row.id,
          mlsId: row.mls_id,
          propertyAddress: row.property_address,
          stage: row.stage,
          sourceFolderPath: row.source_folder_path,
          status: row.status,
          createdBy: row.created_by,
          approvedBy: row.approved_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[Database] Connection failed. Falling back to mock data.', error instanceof Error ? error.message : error);
      return this.getMockJobs();
    }
  }

  /**
   * Helper to provide consistent mock data for demonstration.
   */
  private static getMockJobs(): ListingMediaJob[] {
    return [
      {
        id: `mock-job-1`,
        mlsId: '123456',
        propertyAddress: '123 Ocean Drive, Miami, FL',
        stage: 'Just Listed' as any,
        sourceFolderPath: '/listings/123-ocean-drive',
        status: 'Completed',
        createdBy: 'Agent Smith',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
      },
      {
        id: `mock-job-2`,
        mlsId: '789012',
        propertyAddress: '456 Mountain View, Aspen, CO',
        stage: 'Coming Soon' as any,
        sourceFolderPath: '/listings/456-mountain-view',
        status: 'Pending_Generation',
        createdBy: 'Agent Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
