# Tomstars House Cup – live standings

Static site (no build step), hosted with GitHub Pages.

- `index.html` – public standings ("Route to the Cup"); reads `data/entries.json`, refreshes every minute.
- `admin.html` – draft new entries in the browser, then download `entries.json`.
- `data/entries.json` – the scores. Regenerate from the workbook with `python3 scripts/build_data.py <file.xlsx>` (needs `openpyxl`).

## Updating scores
Replace `data/entries.json` (from the admin page download, or via the script) and commit to `main`; Pages redeploys in about a minute.
