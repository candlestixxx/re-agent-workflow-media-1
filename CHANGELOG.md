# CHANGELOG

All notable changes to this project will be documented in this file.

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