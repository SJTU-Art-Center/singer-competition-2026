# AGENTS.md — Codebase Guide for Coding Agents

## Overview
Singer Competition Semifinal visualization system.
This repo has one React frontend and one Node.js backend:
- `/admin` — operator-facing control panel
- `/screen` — audience-facing display
The app is real-time. State is persisted to `server/data.json` and synchronized to connected clients through Socket.io.
There is no database.

## Agent Instruction Sources
This repository has one agent instruction file: the root `AGENTS.md`.
Verified absent files:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`
Treat this file as the single instruction source for agentic coding work in this repo.

## Repo Layout
```text
/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   ├── eslint.config.js
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── data.json
│   ├── index.js
│   └── package.json
└── README.md
```

## Runtime Architecture
- Frontend: React 18 + Vite + TailwindCSS v4
- Backend: Express + Socket.io
- Persistence: JSON file at `server/data.json`
- Uploads: avatar images live in `server/uploads/` and are served from `/avatar`
- Routes live in `client/src/App.jsx`
- Route pages are `client/src/pages/Admin.jsx` and `client/src/pages/Screen.jsx`

## Build, Lint, Run
Frontend commands in `client/`:
```bash
npm run dev
npm run build
npm run preview
npm run lint
```
- `npm run dev` — start Vite dev server
- `npm run build` — create production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint on the frontend

Backend command in `server/`:
```bash
node index.js
```
This starts the Express + Socket.io server on port `3001`.

## Tests
There is no configured automated test framework in this repository.
- No supported frontend test command exists
- No supported backend test command exists
- No single-test command exists anywhere in the repo
- `server/package.json` contains only a placeholder `npm test` script that exits with failure
Do not invent test commands. If a user asks for tests, explain that no automated test suite is currently configured.

## Module and Language Boundaries
- Frontend uses ES modules
- Backend uses CommonJS
- The repo uses JavaScript and JSX only
- Do not introduce TypeScript unless the user explicitly asks for it
- Use `import` / `export` in `client/`
- Use `require()` / `module.exports` in `server/`

## Hard Project Constraints
These are verified repo facts:
- Keep backend logic in `server/index.js` unless the user explicitly asks for a split
- TailwindCSS v4 is configured through `@tailwindcss/vite` in `client/vite.config.js`
- Do not add `tailwind.config.js` unless the project is intentionally reworked
- Use inline Tailwind utility classes in JSX; do not introduce CSS modules or component-scoped CSS files
- `useGameState()` is the central synchronization hook
- Client updates must send the full `gameState` object, not partial patches
- Socket event names are `requestState`, `stateSync`, and `updateState`
- State changes are broadcast to all clients after persistence
- Data persistence is file-based through `server/data.json`

## Real-Time State Flow
1. Client connects to Socket.io
2. Client requests state with `requestState`
3. Server responds with `stateSync`
4. Client calls `updateState(newState)` with the full state object
5. Server replaces `gameState`, writes it to disk, and emits `stateSync` to all clients
Do not implement patch-style state updates unless the architecture is deliberately changed.

## Key Data Shapes
Representative player shape:
```js
{ id: 1, name: 'Singer Name', avatar: 'filename.png', group: 1, score: 0, status: 'active', pkAgainst: null }
```
Representative top-level state shape:
```js
{ adminRound: 0, screenRound: 0, currentGroup: 1, pickingChallengerId: null, players: [], pkMatches: [], demonKingScore: 0 }
```
Scoring rule documented in the codebase:
```js
finalScore = judgeScore * 0.75 + publicScore * 0.25;
```

## Verified Coding Conventions
Observed patterns that are consistently useful:
- Component and page files use PascalCase, for example `PlayerManager.jsx` and `Admin.jsx`
- Hook files use `useXxx.js`, for example `useGameState.js`
- Utility files use camelCase names, for example `avatar.js`
- Event handlers usually use `handleXxx` naming
- Functional components are used throughout
- `export default function ComponentName(...)` is the dominant component pattern
- Props are often destructured in the function signature
- Keep transient UI state local with `useState`
- Treat `useGameState()` as the source of truth for shared competition state

## Imports, Formatting, Error Handling
Observed import order is usually:
1. React and external packages
2. Internal hooks, components, and utilities
3. Relative styles or side-effect imports

Formatting is not consistently enforced across the repo:
- `import React from 'react'` appears in many JSX files, but not all
- Semicolons are inconsistent
- Indentation width is inconsistent
- Single vs double quote usage is inconsistent
When editing, follow the style already present in the file you are touching instead of normalizing the whole repo.

Error-handling patterns:
- Client validation commonly uses `alert(...)`
- Destructive client actions often use `window.confirm(...)`
- Async client operations usually use `try/catch`, log failures, and show a user-facing alert
- Server failures are logged with `console.error(...)`
- HTTP failures typically return JSON via `res.status(...).json({ error: '...' })`

## ESLint Notes
Frontend linting is defined in `client/eslint.config.js`.
- Uses ESLint v9 flat config
- Targets `**/*.{js,jsx}`
- Extends JS recommended, React recommended, and React Hooks recommended rules
- `react/jsx-no-target-blank` is disabled
- `react-refresh/only-export-components` is a warning
Lint checks correctness and React usage more than formatting.

## Agent Guardrails
- Prefer small, local edits that match the existing file style
- Do not convert the project to TypeScript
- Do not add a test framework unless the user requests it
- Do not refactor `server/index.js` into multiple files unless asked
- Do not replace full-state socket updates with patch semantics
- Do not introduce Redux, Zustand, or another global state store for competition state
- Do not add database dependencies unless the architecture is intentionally changed

## Practical Editing Advice
- For admin/screen behavior, inspect `client/src/pages/Admin.jsx`, `client/src/pages/Screen.jsx`, and `client/src/hooks/useGameState.js` first
- For state mutations, preserve optimistic local updates on the client and full-state broadcasts from the server
- For avatar-related work, inspect server upload handling and frontend avatar utilities together
- When changing competition logic, verify the effect on both admin controls and audience display flows

## When Unsure
Prefer the existing runtime architecture over generic abstractions. If a choice conflicts with this guide, follow verified code behavior in the touched files and keep changes minimal.
