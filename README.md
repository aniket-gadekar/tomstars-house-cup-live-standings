# Tomstars House Cup – live standings

Static site (no build step), hosted with GitHub Pages.

- `index.html` – public standings ("Route to the Cup"); reads `data/entries.json`, refreshes every minute.
- `admin.html` – draft new entries in the browser, then download `entries.json`.
- `data/entries.json` and `data/finals.json` – generated from `data/Tomstars_House_Cup_2026_gsheet.xlsx` (sheets `Entries` and `Finals`) with `python3 scripts/build_data.py` (needs `openpyxl`).

## Updating scores
Replace `data/entries.json` (from the admin page download, or via the script) and commit to `main`; Pages redeploys in about a minute.

## Player journeys
`journeys.html` visualises each tournament round by round. Data comes from the fixture workbooks in `data/fixtures/`:
`python3 scripts/build_journeys.py` (run after `build_data.py`) regenerates `data/journeys.json`.
