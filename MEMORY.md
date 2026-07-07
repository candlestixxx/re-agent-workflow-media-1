# MEMORY

## Core Directives & Architecture
- **Language/Stack:** Node.js, TypeScript, Express.js.
- **Persistence Layer:** PostgreSQL accessed via a standard `pg` connection pool (`DatabaseService`). Includes offline degradation fallback to in-memory models if connection is refused.
- **Deployment:** Containerized through a multi-stage Dockerfile and orchestrated via Docker Compose.
- **Workflow State Management:** Job states flow from `Pending_Generation` -> `Pending_Approval` -> `Approved` -> `Published` via `ApprovalWorkflowService`.

## Implementation Observations
- **External Dependencies:** API interactions (Magnific AI, Canva, Lofty, Social Platforms, Gemini) are strictly mocked within `.env` configurations to ensure robust local execution during CI. The live API boundaries are isolated via `axios` calls inside respective service wrappers.
- **Project Structure:** Central orchestrator is `src/index.ts` handling webhooks. Domain services live in `src/services/` while domain models are in `src/models/`.
- **Code Maintenance:** Commit messages must refer to explicit version bumps. All changes must be synced across central documents (`CHANGELOG.md`, `HANDOFF.md`).
