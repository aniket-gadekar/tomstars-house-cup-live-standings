"""Convert the scores workbook (Entries sheet) into data/entries.json."""
import json, sys, datetime, openpyxl
src = sys.argv[1] if len(sys.argv) > 1 else "data/Tomstars_House_Cup_2026_Entries_Win_Log.xlsx"
ws = openpyxl.load_workbook(src, data_only=True)["Entries"]
out = []
for r in list(ws.iter_rows(values_only=True))[1:]:
    if not r[0]:
        continue
    ts = r[8]
    if isinstance(ts, datetime.datetime):
        ts = ts.isoformat()
    out.append({"id": r[0], "house": r[1], "points": r[2], "reason": r[3], "category": r[4],
                "participantCount": int(r[5] or 0), "participantNames": r[6] or "", "timestamp": ts})
out.sort(key=lambda e: str(e["timestamp"]), reverse=True)
json.dump(out, open("data/entries.json", "w"), indent=1)
print(len(out), "entries")
