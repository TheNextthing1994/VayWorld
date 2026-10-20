# VayWorld Hybrid Mission Control — Implementation V0.1

Status: implemented on feature branch; main remains unchanged.
Existing DTOS owner: DTOS-SPEC-001 / D.T. Lens, no new system owner or source of truth.

## Contract

- Existing VayWorld is the Explore mode. Keep the original canvas world, WASD / E actions, all existing UI, game save, idea gardens, rooms, and agent features untouched.
- An additive HYBRID button opens the new HybridOverview without replacing the old world.
- Four floating 3D mini-office islands are selectable and reuse the original department IDs: ops, strat, intel, core.
- The central energy core is a clickable Re-Entry Council trigger. Islands move toward the core; a panel explains which department should speak first.
- Council V0.1 runs locally and read-only against the existing GameSave. It is explicitly not a live DTOS Council or an LLM debate.
- Score inputs are only actual active/on-hold projects and open/pinned tasks. Existing data contains no reliable ownership/activity for Intel or Creation. They report unknown rather than invent priority.
- If none of the departments has verifiable work, there is no winner.
- An explicit button opens the chosen existing room/dashboard. No autonomous mutations.
- Navigation provides a direct way back to Explore with session state unchanged.

## Code locations

- src/components/HybridOverview.tsx — floating islands, camera, energy orb, council panel, navigation.
- src/services/councilService.ts — deterministic evidence-limited ranking.
- src/services/councilService.test.ts — unit tests.
- src/App.tsx — additive switch and existing view integration.

## Test / verification

On PC-15, temporary source snapshot:

- npm install --no-package-lock --no-audit --no-fund: PASS
- npm run lint: PASS
- npm run build: PASS (existing large-bundle warning)
- node --test src/services/councilService.test.ts: 4/4 PASS
- npm ci: BLOCKED by an existing package-lock / package.json mismatch (recharts and transitive dependencies missing from lock).
- No lockfile changes committed.
- Manual browser visual and interaction acceptance: NOT VERIFIED.

## Remaining acceptance checks

1. Launch original VayWorld; verify WASD, E, gardens and NPC chat.
2. Press HYBRID; verify four islands, orb click, responsive layout and camera.
3. Click orb; verify animation and one explainable winner or an explicit no-evidence result.
4. Select island; enter room/dashboard; close and return to Explore with no lost game progress.
5. Replace game-save projection with actual DTOS Work-State only after a provenance and timestamp contract is available.
6. Resolve the pre-existing package-lock sync issue in a separate maintenance task.

## Visual scope

Current islands are procedural Three.js geometry (desks, monitors, plants, steel-blue floating plates) rather than photoreal imported GLB scenes. The code establishes layout and interaction; final miniature assets remain a polish step.
