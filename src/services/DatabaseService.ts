import { Pool } from 'pg';
import { ListingMediaJob } from '../models/ListingMediaJob';

export class DatabaseService {
  private static pool: Pool;

  /**
   * Returns a singleton connection pool using standard PG environment variables.
   * (e.g. PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT)
   */
  public static getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool();
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
}
