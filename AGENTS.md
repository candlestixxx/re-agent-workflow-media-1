# AGENTS

This file contains universal instructions for AI agents working on this project.

1. **Architecture & Scope**: The system is a CRM workflow engine managing the Real Estate Marketing Media Pipeline. It integrates external systems (Magnific, Canva, Lofty, Social Media) but acts as the central orchestrator.
2. **Version Control**: The single source of truth for the project version is `VERSION.md`. Always read it and update it as needed. Do not duplicate version strings in code if avoidable.
3. **Secrets Management**: Never hardcode API keys, passwords, or secrets. Always use environment variables defined in `.env` (and use `.env.example` as a template).
4. **Code Quality**:
   - Write clean, type-safe TypeScript.
   - Refactor only when it simplifies code without changing behavior.
   - Comments should explain the "why", not the "what". Do not comment obvious code.
5. **Testing**: Run all available tests (`npm test`) before finalizing any feature. Always practice proactive testing when adding features.
6. **Documentation**: Ensure `HANDOFF.md`, `CHANGELOG.md`, `ROADMAP.md`, and `TODO.md` stay up to date.
7. **Submodules/Dependencies**: Do not add submodules or large dependencies without a clear technical reason. Document any additions in `HANDOFF.md`.