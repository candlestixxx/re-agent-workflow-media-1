# DEPLOY

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Docker and Docker Compose (recommended for production/easy local setup)

## Setup Instructions

### Option A: Docker Compose (Recommended)
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Environment Configuration:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *Note: Docker will automatically set up PostgreSQL credentials based on `docker-compose.yml` defaults. Add live API keys to your `.env` file to transition from offline mock behavior to live sandbox integration.*

3. **Run the cluster:**
   ```bash
   docker-compose up -d --build
   ```
   This will build the Node.js application, stand up the PostgreSQL database, and automatically execute the `migrations/001_initial_schema.sql` script on first startup.

### Option B: Local Manual Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Provisioning (PostgreSQL):**
   - Install PostgreSQL locally.
   - Update `DATABASE_URL` in your `.env` file.
   - Run the initial migration script:
     ```bash
     psql -d <your-database-name> -f migrations/001_initial_schema.sql
     ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Start the server:**
   ```bash
   npm start
   ```