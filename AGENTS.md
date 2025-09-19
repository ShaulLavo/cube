# Repository Guidelines

## Project Structure & Module Organization
- `src/` — TypeScript source.
  - `threeSetup.ts` — Three.js init, controls, postprocessing (bloom + AA).
  - `cube/` — Cube geometry, materials, state, solver worker.
  - `ui/` — UI helpers (HUD, etc.).
  - `index.ts` — Public API (init, start, moves, quality controls).
- `public/` — Static assets (e.g., EXR/HDR maps, icons).
- `index.html` — Dev entry that loads `example.ts`.
- `vite.config.ts` — Build/chunk splitting.
- `tsconfig.json` — Strict TS settings (noUnusedLocals, bundler resolution).

## Build, Test, and Development Commands
- Bun (preferred):
  - `bun dev` — Start Vite dev server.
  - `bun run build` — Type-check + Vite build.
  - `bun run preview` — Serve production build.
  - Add dev deps: `bun add -d <pkg>` (e.g., `bun add -d ts-toolbelt`).
- npm (alternative):
  - `npm run dev | build | preview`

## Coding Style & Naming Conventions
- TypeScript strict; prefer `import type` for types and dynamic `import()` for heavy modules (`three/examples/*`, `postprocessing`).
- Exports: prefer named exports; avoid default exports.
- Files: camelCase (e.g., `threeSetup.ts`, `uiState.ts`).
- Indentation: tabs (match existing files). Max line length ~100.
- Avoid `any`; annotate public surfaces. Keep `verbatimModuleSyntax`-friendly imports.

## Testing Guidelines
- No formal test suite yet. If adding tests, use Vitest:
  - Layout: `src/**/__tests__/*.spec.ts` or `src/**/*.spec.ts`.
  - Run: `bun x vitest` (or `npm run test` if you add a script).
  - Keep tests fast and deterministic; mock WebGL when possible.

## Commit & Pull Request Guidelines
- Commits: clear, imperative subject (e.g., "Add SMAA AA; remove shadow plane").
- PRs: include purpose, before/after notes, screenshots/video for visuals, and mention perf impact (bundle size, FPS, load).
- Link issues; keep diffs focused.

## Performance & Assets
- Prefer code-splitting for heavy libs; keep initial JS lean.
- Use smaller HDR/EXR maps (≤2MB) or prefiltered PMREM; avoid introducing large assets without lazy loading.

## Agent-Specific Instructions
- Do not reintroduce a ground shadow plane unless requested.
- Do not alter bezel geometry/look without explicit approval.
- Maintain hover, floating animation, and quality-first rendering by default.
- Do not run 'build', ask me to do it