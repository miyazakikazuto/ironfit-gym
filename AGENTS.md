# AGENTS.md

This repo contains **three unrelated projects** under one root:

- **Gym** (root-level files) — static landing page + kasir app
- **Gym Tracker** (`gym-tracker/`) — PWA pelacak latihan pribadi
- **Meridian** (`meridian/`) — autonomous Solana DeFi LP agent

---

## Gym (root)

### Files

| File | Purpose |
|---|---|
| `index.html` | Landing page + WhatsApp-based member registration. Nav tabs via `switchTab()`. Prices: Harian 12k, Mingguan 45k, Bulanan 120k. WA target = `6285842851310`. |
| `kasir.html` | Cashier with PIN gate (`1234`). Records payments, checks member status, filters history. Connects to Google Apps Script backend. Auto-nominal on plan change. |
| `kasir.gs` | Google Apps Script web app. Token auth: `ironfit_kasir_2024`. Two sheets: `Transaksi` (8 cols) and `Member` (6 cols). Actions: `add`, `delete`, `cekMember`. Re-deploy web app after every edit. |

### Guardrails

- Never change `TOKEN`, `SPREADSHEET_ID`, `PIN`, or `WA_NUMBER` without explicit instruction.
- If adding a sheet field, update both sheet header and GAS code.

### Skill

The Gym skill at `.opencode/skills/gym/SKILL.md` has full details and is auto-loaded when working on these files.

---

## Gym Tracker (`gym-tracker/`)

### Stack & structure

React 19 + Vite 8 + TypeScript SPA. Backend: Firebase Auth (1 akun email) + Firestore (`users/{uid}/gym/**`, project `xauusd-jurnal`). Domain logic murni di `src/lib/` (`progression.ts` 5/3/1, `rotation.ts`, `e1rm.ts`) — **wajib ada test** sebelum refactor; jalankan dengan `npm test` (vitest, CI via `.github/workflows/test.yml`).

### Dev commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` + postbuild generate service worker |
| `npm run lint` | oxlint |
| `npm test` | vitest run (46 test domain logic) |

### Deploy dual-platform

| Branch | Target | URL |
|---|---|---|
| `freebuff` | Production branch Vercel (auto-deploy tiap push) | Tetap: `https://gym-tracker-inky-rho.vercel.app` |
| `main` | GitHub Pages (production asli) | `https://miyazakikazuto.github.io/gym-tracker/` |

Alur kerja: uji fitur di `freebuff` → mantap → merge ke `main`. CLI manual: `vercel deploy --prod` (auth via token atau `vercel login`).

### Guardrails & pitfalls

- Firebase config hardcoded di `src/lib/firebase.ts` itu **publik by design** (bukan secret); keamanan lewat `firestore.rules` (source of truth, path dibagi dengan app XAUUSD — jangan sampai bentrok).
- Base path adaptif: `/gym-tracker/` di GH Pages, `/` di Vercel — dikendalikan env `VERCEL` di **dua tempat**: `vite.config.ts` dan `scripts/gen-sw.cjs`. Ubah keduanya bersamaan.
- Firestore offline persistence aktif (`db.ts` `initializeFirestore` + persistent cache multi-tab) — jangan diganti balik ke `getFirestore` biasa.
- Card volume otot di Progress punya baris "(Lainnya)": volume dari set yang gerakannya hilang dari Library / grup Cardio. Kalau total card ≠ chart mingguan, itu sebabnya.
- `vercel.json` kosong (tanpa `ignoreCommand`) — semua branch dapat preview Vercel; hanya `freebuff` yang production.
- `.env.local` di repo ini buatan Vercel CLI (OIDC expired), di-gitignore, tidak dipakai aplikasi.

---

## Meridian (`meridian/`)

### Before editing

**Read `meridian/CLAUDE.md` first.** It is the canonical engineering manual (435 lines). Everything below is a supplement, not a replacement.

### Entry points & dev commands

| Command | Purpose |
|---|---|
| `node index.js` | Full daemon (REPL + cron + Telegram). |
| `npm start` | Same as above. |
| `npm run dev` | `DRY_RUN=true node index.js` — no on-chain txs. |
| `node cli.js <cmd>` | One-shot CLI tool. |
| `node setup.js` | First-run wizard. |
| `npm run pm2:start` | PM2 via ecosystem file ONLY (not `pm2 start index.js`). |
| `npm run pm2:restart` | Restart with `.env` re-read. |
| `npm run test:syntax` | Syntax check all `.js` files. |
| `npm test` | Alias for `test:syntax`. |
| `npm run test:screen` | Screening pipeline test. |
| `npm run test:agent` | Agent ReAct test (DRY_RUN). |

### Architecture essentials

- **All state**: JSON files at `meridian/` root — no database.
- **LLM role system**: `SCREENER`, `MANAGER`, `GENERAL` — each has a filtered tool subset.
- **ReAct loop** (`agent.js`): system prompt built fresh each cycle with portfolio/positions/lessons.
- **Management cycle is JS-first, LLM-last**: most close decisions are deterministic; LLM only invoked for non-STAY actions.
- **Once-per-session tool locks**: `deploy_position`, `swap_token`, `close_position` are locked after first call.
- **Lazy SDK load**: `@meteora-ag/dlmm` is dynamic-imported — never import it eagerly.
- **Race guards**: `_managementBusy`, `_screeningBusy`, `_pnlPollBusy`, `_pollTriggeredAt` flags prevent overlap.
- **`.claude/settings.json`** blocks `rm -rf`, `wget`, `Read(./.env*)`, and `run_in_background: true`.

### Key pitfalls

| Issue | Detail |
|---|---|
| Config drift | `user-config.json` keys must match the flat `CONFIG_MAP` in `executor.js:333`. New keys must be added to both. |
| HiveMind disable | Blank `url`/`apiKey` falls back to built-in defaults, not off. Set `pullMode: "manual"` to suppress auto-pull. |
| `evolveThresholds` bug | Only evolves `minOrganic` and `minFeeActiveTvlRatio`; references `maxVolatility`/`minFeeTvlRatio` (no-ops). |
| Tool registration | Adding a tool requires changes in 4 files: `definitions.js`, `executor.js`, `agent.js` (role sets), and optionally `index.js` (Telegram menu). |
