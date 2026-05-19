# VISION

## Long-term Product Goal
Create an automated, repeatable real estate marketing media pipeline that takes a new property listing from raw source photos to polished, multi-channel marketing campaigns. This pipeline aims to eliminate manual friction, enforce brand consistency, and streamline the marketing process for agents, brokers, and office managers.

## Design Direction
The system serves as a backend orchestration layer (a CRM workflow engine) integrating various services:
- **Local File Shares**: Source of truth for raw assets.
- **Magnific AI**: Generating enhanced, styled daytime and nighttime images.
- **Canva**: Final design, text refinement, and brand application.
- **Gemini / ChatGPT**: Copy generation for social media and landing pages.
- **Lofty**: Automated landing page creation with injected analytics and pixels.
- **Social Media Platforms (Facebook, LinkedIn, Instagram)**: Distribution and publishing.

The design emphasizes modularity, ensuring each step can operate independently or as part of the full automated pipeline, while preserving human-in-the-loop review capabilities for compliance and quality assurance.
