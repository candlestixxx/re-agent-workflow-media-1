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

4. **Build the project:**
   ```bash
   npm run build
   ```
   This will compile the TypeScript code into the `dist/` directory.

5. **Run the application (Development):**
   *(Note: Entry points to be defined in subsequent tasks. Use standard npm scripts.)*
   ```bash
   npm run dev
   ```

6. **Run tests:**
   ```bash
   npm test
   ```