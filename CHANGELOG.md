# CHANGELOG

All notable changes to this project will be documented in this file.

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