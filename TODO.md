# TODO

*Tasks are ordered by priority.*

1. **Implement Core Data Models**: Define the foundational objects that the system will use to track jobs, assets, and approvals (Completed in initial sprint).
2. **Setup Folder Detection Logic**: Build a module to search for source photos following the priority order (Network share, MLS, Downloads, Desktop).
3. **Implement AI Copy Generation Integration**: Write the wrapper around Gemini/ChatGPT API to generate social copy based on property details and stage.
4. **Implement Image Saving Module**: Build logic to save processed outputs into specific folders with consistent naming conventions (e.g., `{Address}_{Stage}_Day_01`).
5. **Implement Lofty Landing Page Skeleton**: Set up the basic API calls to create or fetch a Lofty landing page and inject tracking IDs (GA, Facebook Pixel).
6. **Implement Approval Logic**: Add state transition logic to `ListingMediaJob` requiring approval before moving to "Published" status.
7. **Expand Pipeline for Video**: Begin drafting data models and workflow steps for video processing (parallel to image logic).