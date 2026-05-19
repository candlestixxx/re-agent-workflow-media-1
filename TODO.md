# TODO

*Tasks are ordered by priority.*

1. **Implement Core Data Models**: Define the foundational objects that the system will use to track jobs, assets, and approvals (Completed in initial sprint).
2. **Setup Folder Detection Logic**: Build a module to search for source photos following the priority order (Network share, MLS, Downloads, Desktop). (Completed)
3. **Implement AI Copy Generation Integration**: Write the wrapper around Gemini/ChatGPT API to generate social copy based on property details and stage. (Completed)
4. **Implement Image Saving Module**: Build logic to save processed outputs into specific folders with consistent naming conventions (e.g., `{Address}_{Stage}_Day_01`). (Completed)
5. **Implement Lofty Landing Page Skeleton**: Set up the basic API calls to create or fetch a Lofty landing page and inject tracking IDs (GA, Facebook Pixel). (Completed)
6. **Implement Approval Logic**: Add state transition logic to `ListingMediaJob` requiring approval before moving to "Published" status. (Completed)
7. **Expand Pipeline for Video**: Begin drafting data models and workflow steps for video processing (parallel to image logic). (Completed)
8. **Implement Magnific AI Integration**: Build the API wrapper stub for generating day/night variations of listing source images. (Completed)
9. **Implement Social Publishing Queue**: Build adapters to simulate pushing completed SocialPostDrafts to target external networks. (Completed)
10. **Implement Automation Triggers**: Add support for parsing CRM webhooks and scaffolding pipeline jobs based on listing status events. (Completed)
11. **Implement Automated Just Sold Pipeline**: Add transition logic mapping 'Just Sold' statuses to newly spawned specialized marketing assets. (Completed)
12. **Implement Batch Processing**: Allow iterating array queues of addresses to concurrently spawn tracking Jobs. (Completed)
13. **Wire Live SDK: Magnific AI**: Build `axios`/`fetch` requests inside `MagnificAiService` using `process.env.MAGNIFIC_API_KEY`. (Completed)
14. **Wire Live SDK: Canva**: Build template export API requests inside `CanvaIntegrationService`. (Completed)
15. **Wire Live SDK: Gemini/OpenAI**: Build completion API requests inside `SocialCopyService` for dynamic captions. (Completed)
16. **Wire Live SDK: Lofty**: Build POST payload dispatch logic inside `LoftyIntegrationService`. (Completed)
17. **Wire Live SDK: Social Networks**: Build OAuth/Graph API routes inside `SocialPublishingService` to push payloads to live platform profiles. (Completed)
18. **Implement Application Orchestrator**: Create main `index.ts` entry point tying services together for executable flow. (Completed)
19. **Express API Bindings**: Spin up persistent REST endpoints listening for CRM webhooks, responding with 202 async statuses. (Completed)
20. **Database Initialization**: Implement PostgreSQL persistence layer mapping `ListingMediaJob` records. (Completed)