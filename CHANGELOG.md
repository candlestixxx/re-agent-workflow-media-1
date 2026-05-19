# CHANGELOG

All notable changes to this project will be documented in this file.

## [2.2.0] - Postgres Database Layer
### Added
- Integrated `pg` connection pool into a new `DatabaseService` (`src/services/DatabaseService.ts`).
- Modified `AutomationTriggerService` to directly persist active jobs into the database upon initial webhook evaluation, maintaining local mock fallbacks natively in the Catch block for test-suite integrity.
- Setup specific Postgres mocking inside `tests/DatabaseService.test.ts`.

## [2.1.0] - Express API Webhook Server
### Added
- Upgraded the `src/index.ts` CLI runner into an active Express.js server listening on `process.env.PORT`.
- Deployed `/webhook/crm` POST endpoint to ingest automated triggers from Lofty/HubSpot systems asynchronously.

## [2.0.0] - Orchestrator Entry Point Initialization
### Added
- Created `src/index.ts` to act as the primary executable entry point for the backend logic.
- Implemented terminal-based mock webhook simulations linking together folder detection, AI copies, CRM payload generations, and Social Draft approvals.

## [1.9.0] - Social Publishing Live Graph API Adapters
### Added
- Upgraded `SocialPublishingService` (`src/services/SocialPublishingService.ts`) to intercept local draft mocks and replace them with live REST payloads targeting Facebook's Graph API and LinkedIn's UGC Posts API.
- Added live API token fallback constraints (leveraging `FACEBOOK_GRAPH_TOKEN` and `LINKEDIN_API_TOKEN`).

## [1.8.0] - Lofty CRM API Live Adapter
### Added
- Upgraded `LoftyIntegrationService` to execute active `axios` REST calls targeting Lofty's CRM `v1/landing-pages` API endpoint when `LOFTY_API_KEY` is present.
- Updated tests to safely isolate HTTP boundaries while verifying valid CRM payload generation and configuration injection.

## [1.7.0] - Social Copy Live Adapter
### Added
- Upgraded `SocialCopyService` to execute active `axios` REST calls targeting OpenAI's `v1/chat/completions` API endpoint when `OPENAI_API_KEY` is present.
- Updated tests to safely isolate HTTP boundaries while verifying valid GPT model and role configurations.

## [1.6.0] - Canva API Live Adapter
### Added
- Upgraded `CanvaIntegrationService` to execute active `axios` REST calls mapping to Canva's `api.canva.com/rest/v1/autocreates` design generation endpoints.
- Expanded testing suite to isolate and mock active Axios post routines simulating Canva HTTP returns.

## [1.5.0] - Magnific AI Live Adapter
### Added
- Integrated `axios` dependency for making live network calls.
- Upgraded `MagnificAiService` to actively trigger HTTP POSTs to `api.magnific.ai` when a valid `MAGNIFIC_API_KEY` is present.
- Improved unit testing suite to mock Axios responses for continuous offline capability mapping.

## [1.4.0] - Phase 6 Planning
### Added
- Outlined Phase 6 goals ("Live API Integration") inside `ROADMAP.md`, `TODO.md`, and `HANDOFF.md` to guide the next iteration cycle.

## [1.3.1] - Roadmap Documentation Sync
### Fixed
- Updated `ROADMAP.md` toggles to properly reflect the completed implementation of Phase 1 (Folder Detection) and Phase 3 (Lofty API, Gemini API/Social Copy) logic built in prior releases.

## [1.3.0] - Batch Processing Automation
### Added
- Implemented `BatchProcessingService` (`src/services/BatchProcessingService.ts`) to initialize multiple `ListingMediaJob`s at once.
- Hardened batch queue loops to log and ignore individual property folder detection failures without crashing the parent process.

## [1.2.0] - Automated Just Sold Pipeline
### Added
- Implemented `JustSoldPipelineService` to automatically spin up customized social media drafts for the Facebook, LinkedIn, and Instagram platforms when a property enters the "Just Sold" stage.
- Added tests verifying platform multi-draft generation logic and specific status checks.

## [1.1.0] - Advanced Automation Triggers
### Added
- Implemented `AutomationTriggerService` (`src/services/AutomationTriggerService.ts`) to intercept CRM webhooks and construct workflow jobs.
- Added tests asserting payload constraints and conditional mappings depending on the webhook event.

## [1.0.0] - Foundation Skeleton Complete
### Added
- Implemented `SocialPublishingService` (`src/services/SocialPublishingService.ts`) to finalize the pipeline's end-to-end mock architecture.
- Added network simulation routing ensuring drafts target correct external platforms (Facebook, LinkedIn, Instagram, X).
- Checked off Phase 4 of `ROADMAP.md`.

## [0.9.0] - Canva Integration Stub Adapter
### Added
- Implemented `CanvaIntegrationService` (`src/services/CanvaIntegrationService.ts`) to handle mock asset generation and local directory routing based on Canva templates.
- Added tests asserting fallback logic functionality depending on `CANVA_API_KEY` configuration.

## [0.8.0] - Magnific AI Stub Adapter
### Added
- Implemented `MagnificAiService` to simulate fetching day and night image generation buffers.
- Configured `.env` fallback toggles (`MAGNIFIC_API_KEY`, `MAGNIFIC_MODEL`) to allow CI systems to generate mock visual assets without tokens.
- Updated `ROADMAP.md` to note the completion of Phase 2 logic (Magnific generation and local asset saving).

## [0.7.0] - Video Pipeline Expansion
### Added
- Created `VideoProcessingJob` model to track video specific metadata (source types, aspect ratios, editing states).
- Implemented `VideoProcessingService` to initialize video jobs and manage state transitions from `Queued` through `Completed`.

## [0.6.0] - Approval Workflow Logic
### Added
- Implemented `ApprovalWorkflowService` to handle pipeline state transitions.
- Added strict validations to ensure Jobs cannot be published without passing an explicitly audited `Approved` status containing a `reviewerId`.
- Added unit tests for valid and invalid job state transition sequences.

## [0.5.0] - Lofty CRM Landing Page Integration
### Added
- Implemented `LoftyIntegrationService` (`src/services/LoftyIntegrationService.ts`) to generate LandingPageJobs.
- Added automated tracking ID injection (Google Analytics, Facebook Pixel) based on environment configurations.
- Included unit tests to verify payload creation and conditional publish states based on API key presence.

## [0.4.0] - Image Saving Logic
### Added
- Implemented `AssetStorageService` (`src/services/AssetStorageService.ts`) to enforce consistent file naming patterns (`{Address}_{Stage}_{Type}_{Variation}.jpg`).
- Added utility to mock buffer saving of generated assets to existing property folders.
- Included comprehensive test suite for testing file paths and `fs` integration.

## [0.3.0] - AI Copy Generation
### Added
- Implemented `SocialCopyService` (`src/services/SocialCopyService.ts`) to build prompts and handle social media copy generation.
- Added graceful fallback to local template strings if Gemini or OpenAI API keys are not provided.
- Added comprehensive unit tests for prompt construction and environment-based fallback logic.

## [0.2.0] - Folder Detection Update
### Added
- Implemented `FolderDetectionService` (`src/services/FolderDetectionService.ts`) to handle fallback file path searching (Network share, MLS, Downloads, Desktop).
- Added unit tests for `FolderDetectionService` mocking the `fs` module.

## [0.1.0] - Initial Setup
### Added
- Created complete initial project documentation (`VISION.md`, `ROADMAP.md`, `TODO.md`, `HANDOFF.md`, `DEPLOY.md`, `CHANGELOG.md`, `VERSION.md`, `AGENTS.md` and related AI model files).
- Initialized Node.js/TypeScript project.
- Implemented core data models (`ListingMediaJob`, `GeneratedAsset`, `LandingPageJob`, `SocialPostDraft`, `ComplianceLog`).
- Set up unit testing using Jest.
- Provided `.env.example` placeholder file for environment configuration.