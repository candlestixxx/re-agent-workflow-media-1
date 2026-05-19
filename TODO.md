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