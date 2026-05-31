# Legacy code (F1–F7 intake)

This folder holds the pre–Travel Agent onboarding stack. The active product path uses:

- `travel_state` + `travel_phase` (phase1–4)
- `src/features/travel/session/`
- `server/travel/*` pipeline

Do not extend these modules for new features. Prefer `@nauta/shared` and the Travel Agent modules.
