# DEPLOY

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy the example environment file and fill in your actual credentials.
   ```bash
   cp .env.example .env
   ```
   *Note: Do not commit `.env` or hard-code any API keys in the source code.*

   **Transitioning from Mock to Live (Sandbox Testing):**
   The application degrades gracefully to mock responses if API keys are absent. To enable live integration testing, retrieve sandbox or test API keys from the respective providers and add them to your `.env` file:
   - **Magnific AI:** `MAGNIFIC_API_KEY`
   - **Canva:** `CANVA_API_KEY`
   - **Lofty CRM:** `LOFTY_API_KEY`
   - **OpenAI/Gemini:** `OPENAI_API_KEY`

4. **Database Provisioning (PostgreSQL):**
   The application requires a PostgreSQL database to persist jobs when running in production.
   - Install PostgreSQL and create a new database.
   - Update `DATABASE_URL` in your `.env` file.
   - Run the initial migration script to build the schema:
     ```bash
     psql -d <your-database-name> -f migrations/001_initial_schema.sql
     ```

5. **Build the project:**
   ```bash
   npm run build
   ```
   This will compile the TypeScript code into the `dist/` directory.

6. **Run the application (Development):**
   *(Note: Entry points to be defined in subsequent tasks. Use standard npm scripts.)*
   ```bash
   npm run dev
   ```

7. **Run tests:**
   ```bash
   npm test
   ```