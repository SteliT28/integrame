# Creator Integrame — Prototype 1
Static browser-based Romanian integrame editor prepared for Cloudflare Workers Assets.

## Files
- `public/index.html` interface
- `public/style.css` layout/print styling
- `public/app.js` grid editor + validation
- `src/worker.js` Cloudflare Worker entry
- `wrangler.toml` Worker/Assets config

## Prototype behavior
- No database, accounts, AI, or automatic puzzle generation.
- Manual grid sizing (5–30 rows/columns).
- Letter, clue, blocked and empty cells.
- Up to three clues in one clue cell.
- Four answer directions.
- Prevents out-of-grid placement, clue/block collisions and conflicting crossing letters.
- Creator and reader preview modes.
- Browser Print / Save as PDF, with answers hidden in reader mode.
