"""Build data/journeys.json (who reached each stage of each tournament) from the fixture workbooks."""
import json, re, openpyxl
HOUSES = ["Blue", "Green", "White", "Red"]
norm = lambda s: re.sub(r"\s+", " ", str(s or "").replace("\n", " ")).strip()
clean = lambda s: re.sub(r"\((winner|.*?house)\)", "", norm(s).replace("'", ""), flags=re.I).strip()

# --- name -> house knowledge -------------------------------------------------
known = {}
def learn(name, house):
    name = clean(name)
    if name and house in HOUSES: known.setdefault(name.lower(), (name, house))
for e in json.load(open("data/entries.json")):
    for n in re.split(r",|&|;|\band\b", e["participantNames"] or ""):
        if "(" not in n: learn(n, e["house"])
for f in json.load(open("data/finals.json")):
    for a, b in (("winner", "winnerHouse"), ("runnerUp", "runnerUpHouse"), ("player1", "house1"), ("player2", "house2")):
        learn(f[a], f[b])
def wb(p): return openpyxl.load_workbook(p, data_only=True)
c = wb("data/fixtures/Carrom_Fixtures.xlsx")
for sh in ("Single Mens", "Single Womens"):
    rows = list(c[sh].iter_rows(values_only=True)); hdr = rows[0]
    for r in rows[1:]:
        if r[0] is None and not any(r[1:5]): break
        for i, h in enumerate(hdr):
            if h and str(h).endswith("House") and i < len(r): learn(r[i], str(h).split()[0])
j = wb("data/fixtures/Jenga_Fixtures.xlsx")
for sh in ("Jenga Mens Single", "Jenga Womens Single "):
    for r in j[sh].iter_rows(min_row=5, max_row=20, values_only=True):
        if isinstance(r[0], int):
            for i, h in enumerate(["Green", "White", "Red", "Blue"], start=1): learn(r[i], h)
def house_of(name):
    n = clean(name).lower()
    if n in known: return known[n]
    toks = n.split()
    for k, (full, h) in known.items():                       # "Satyam Kesa" -> "Satyam Kesarwani"
        kt = k.split()
        if toks and kt and toks[0] == kt[0] and (len(toks) == 1 or len(kt) == 1 or kt[-1].startswith(toks[-1][:4])):
            return (full, h)
    return (clean(name), None)

# --- generic round-column reader ---------------------------------------------
STAGE = re.compile(r"^(round \d+|semi finals?|finals?)$", re.I)
def read(ws, extra_entrants=()):
    rows = list(ws.iter_rows(values_only=True))
    hi = next(i for i, r in enumerate(rows) if sum(bool(STAGE.match(norm(c))) for c in r) >= 2)
    hdr = [norm(c) for c in rows[hi]]
    cols = [(k, h) for k, h in enumerate(hdr) if STAGE.match(h)]
    stages = []
    for k, h in cols:
        seen, names = set(), []
        for r in rows[hi + 1:]:
            v = clean(r[k]) if k < len(r) and r[k] is not None else ""
            if v and not v.startswith("=") and v.upper() != "TBD" and v.lower() not in seen and "scheduled" not in v.lower() and not re.search(r"\(\s*\d+(st|nd|rd|th)", v):
                seen.add(v.lower()); names.append(v)
        stages.append((h.title().replace("Finals", "Final") if h.lower().startswith("final") else h.title(), names))
    return stages, hdr, rows, hi

def mk(id_, sport, cat, ws, entrants=None, first_cols=None):
    stages, hdr, rows, hi = read(ws)
    out = []
    if first_cols:    # TT sheets list both players of each first-round match
        names = []
        for r in rows[hi + 1:]:
            for k in first_cols:
                v = clean(r[k]) if r[k] is not None else ""
                if v and not v.startswith("=") and v.upper() != "TBD": names.append(v)
        out.append(("Round 1", names))
    elif entrants: out.append(("Entered", entrants))
    out += stages
    seq = []
    for name, ns in out:
        pl, seen = [], set()
        for n in ns:
            full, h = house_of(n)
            if full.lower() in seen: continue
            seen.add(full.lower()); pl.append({"name": full, "house": h})
        seq.append({"name": name, "players": pl})
    return {"id": id_, "sport": sport, "category": cat, "stages": seq}

def carrom_entrants(sh):
    rows = list(c[sh].iter_rows(values_only=True)); hdr = rows[0]; out = []
    for r in rows[1:]:
        if r[0] is None and not any(r[1:5]): break
        for i, h in enumerate(hdr):
            if h and str(h).endswith("House") and i < len(r) and r[i] and not str(r[i]).lower().startswith("non"): out.append(clean(r[i]))
    return out
def jenga_entrants(sh):
    return [clean(v) for r in j[sh].iter_rows(min_row=5, max_row=20, values_only=True) if isinstance(r[0], int) for v in r[1:5] if v]

games = []
t = wb("data/fixtures/Table_Tennis_Fixtures.xlsx")
games.append(mk("tt-men", "Table Tennis", "Men", t["Mens "], first_cols=(1, 2)))
games.append(mk("tt-women", "Table Tennis", "Women", t["Female"], first_cols=(1, 3)))
games.append(mk("carrom-men", "Carrom", "Men", c["Single Mens"], carrom_entrants("Single Mens")))
games.append(mk("carrom-women", "Carrom", "Women", c["Single Womens"], carrom_entrants("Single Womens")))
games.append(mk("jenga-men", "Jenga", "Men", j["Jenga Mens Single"], jenga_entrants("Jenga Mens Single")))
games.append(mk("jenga-women", "Jenga", "Women", j["Jenga Womens Single "], jenga_entrants("Jenga Womens Single ")))

# --- tournament result comes from finals.json (authoritative) ----------------
fin = {(f["sport"], f["category"]): f for f in json.load(open("data/finals.json"))}
for g in games:
    f = fin.get((g["sport"], g["category"]), {})
    g["champion"] = {"name": house_of(f["winner"])[0], "house": f["winnerHouse"]} if f.get("winner") else None
    g["runnerUp"] = {"name": house_of(f["runnerUp"])[0], "house": f["runnerUp" + "House"]} if f.get("runnerUp") else None
    print(g["id"], [(s["name"], len(s["players"])) for s in g["stages"]], g["champion"])
json.dump({"games": games}, open("data/journeys.json", "w"), indent=1)
