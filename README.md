# Real Estate Marketing Media Pipeline

Welcome to the automated real estate marketing media pipeline engine. This application orchestrates and routes CRM webhooks through various marketing processes:
- Ingesting property media based on prioritized fallback paths.
- Transforming images into varying day/night variations via **Magnific AI**.
- Appending branding via **Canva**.
- Spinning up dedicated landing pages inside **Lofty**.
- Generating and posting context-aware social captions to **Facebook**, **LinkedIn**, and **Instagram**.

## Initialization
Ensure you have `.env` variables assigned per the `.env.example` mapping.

1. **Install Dependencies:** `npm install`
2. **Build TypeScript:** `npm run build`
3. **Test Safety Framework:** `npm run test`
4. **Boot Server:** `npm start`
5. *(Optional) Boot with Postgres via Docker Compose: `docker-compose up --build`*

## Application Overview
When a `POST /webhook/crm` payload hits the server:
1. `FolderDetectionService` verifies the media source.
2. `AssetStorageService` and `MagnificAiService` generate property assets.
3. `SocialCopyService` generates brand-safe marketing captions.
4. An `ApprovalWorkflowService` logs audit records.
5. Finally, the post is pushed asynchronously into `SocialPublishingService`.

If integrations fail or keys are omitted (such as `DATABASE_URL`), the environment actively falls back onto safe-memory routines to prevent crashing staging bounds.
