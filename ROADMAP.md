# ROADMAP

## Phase 1: Foundation (Current Phase)
- ✅ Project structure initialization and core documentation.
- ✅ Core data model definition (`ListingMediaJob`, `GeneratedAsset`, etc.).
- ✅ Implement property folder detection and photo selection (Stage A & B).
- ✅ Basic manual workflow for tracking state.

## Phase 2: AI & Image Enhancement
- ✅ Integrate Magnific AI for day/night image generation (Stage C).
- ✅ Implement file downloading and saving logic back to listing folders (Stage D).
- ✅ Build Canva integration or manual handoff workflow (Stage E).

## Phase 3: Landing Pages & Copy
- ✅ Integrate Lofty API for landing page creation and updating (Stage F).
- ✅ Integrate Gemini/ChatGPT for social description generation (Stage G).

## Phase 4: Publishing & Approvals
- ✅ Implement social publishing queue for Facebook, LinkedIn, Instagram (Stage H).
- ✅ Build out full approval and compliance workflow.
- ✅ Add video processing capabilities parallel to image generation.

## Phase 5: Advanced Automation
- ✅ Full CRM trigger integration (e.g., auto-start pipeline on new listing).
- ✅ Automated "Just Sold" pipeline.
- ✅ Batch generation across multiple listings.

## Phase 8: Persistence
- ✅ Implement database layer integration to track jobs reliably via PostgreSQL.

## Phase 7: Live App Orchestration
- ✅ Build main application execution boundary (`src/index.ts`).
- ✅ Wrap execution boundaries within an active Express.js webhook listening server.

## Phase 6: Live API Integration
- ✅ Swap `MagnificAiService` mocks for live HTTP SDK endpoints.
- ✅ Swap `CanvaIntegrationService` mocks for live OAuth Canva integration.
- ✅ Swap `SocialCopyService` mocks for live Gemini / OpenAI wrapper calls.
- ✅ Swap `LoftyIntegrationService` mocks for live CRM Landing Page POST endpoints.
- ✅ Swap `SocialPublishingService` mocks for live Facebook, Instagram, and LinkedIn Graph API routes.