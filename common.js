const HOUSES = {
  Blue:  {full:'Blue Hawks',      logo:'assets/blue.png',  solid:'#2563EB', tint:'#C7D8FB', text:'#1D4ED8', chip:'#EEF3FE'},
  White: {full:'White Knights',   logo:'assets/white.png', solid:'#7D7F8F', tint:'#D8D9E2', text:'#41414B', chip:'#F1F1F7'},
  Red:   {full:'Red Titans',      logo:'assets/red.png',   solid:'#DF1B12', tint:'#F8C4C1', text:'#B6160F', chip:'#FDEEED'},
  Green: {full:'Green Mavericks', logo:'assets/green.png', solid:'#00874C', tint:'#BDE6D2', text:'#006A3C', chip:'#EAF6F0'}
};
const fmt = n => Number(n).toLocaleString('en-US');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fdate = t => { const d = new Date(t); return isNaN(d) ? '' : d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); };
function totals(entries){ const t={Blue:0,White:0,Red:0,Green:0}; entries.forEach(e=>{ if(e.house in t) t[e.house]+=Number(e.points)||0; }); return t; }
const ranked = t => Object.keys(t).sort((a,b)=>t[b]-t[a]);
const chip = (h,cls='') => `<span class="chip ${cls}" style="background:${HOUSES[h].solid}" aria-label="${h}">${h[0]}</span>`;
function houseStats(entries){ const s={}; Object.keys(HOUSES).forEach(h=>s[h]={acts:0,set:new Set()});
  entries.forEach(e=>{ const x=s[e.house]; if(!x)return; x.acts++;
    String(e.participantNames||'').replace(/\([^)]*\)/g,'').split(/,|&|;|\band\b/i).map(n=>n.trim().toLowerCase().replace(/\s+/g,' ')).filter(Boolean).forEach(n=>x.set.add(n)); });
  Object.values(s).forEach(x=>x.people=x.set.size); return s; }
async function loadEntries(){ const r = await fetch('data/entries.json?t='+Date.now(),{cache:'no-store'}); return r.json().then(d=>d.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))); }

function entryTitle(e){
  const m=/^(.*?)\s*-\s*(Round \d+)\s*Win$/i.exec(e.reason||''), n=(e.participantNames||'').trim();
  const f=/^(.*?)\s*-\s*Final (Winner|Runner Up)$/i.exec(e.reason||'');
  if(f&&n) return f[2].toLowerCase()==='winner' ? `${esc(n)} won the Final <em>${esc(f[1])}</em>` : `${esc(n)} Runner Up <em>${esc(f[1])}</em>`;
  if(m&&n) return `${esc(n)} won ${esc(m[2])} <em>${esc(m[1])}</em>`;
  return esc(e.reason);
}

async function loadFinals(){ try{ const r=await fetch('data/finals.json?t='+Date.now(),{cache:'no-store'}); return r.json(); }catch(e){ return []; } }
const S=(p)=>`<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONS={
 'Darts':S('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 12l8-8M17 3.5l3.5-.5-.5 3.5"/>'),
 'Jenga':S('<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/><path d="M9 4v4M15 10v4M9 16v4"/>'),
 'Chess':S('<path d="M8 20h9M9 20c0-3 1-4 1-6-2-1-3-3-3-5 0-3 2-5 5-5l1 2 3 1v2l-3 1c1 2 2 3 2 5 0 2-1 3-1 5"/><circle cx="12.5" cy="7.5" r=".6" fill="currentColor"/>'),
 'Carrom':S('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3.2"/><circle cx="5.8" cy="5.8" r="1.1" fill="currentColor"/><circle cx="18.2" cy="5.8" r="1.1" fill="currentColor"/><circle cx="5.8" cy="18.2" r="1.1" fill="currentColor"/><circle cx="18.2" cy="18.2" r="1.1" fill="currentColor"/>'),
 'Pool':S('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="11" r="3.6"/><path d="M10.6 11h2.8" /><path d="M12 9.6v2.8"/>'),
 'Table Tennis':S('<path d="M14 3.5a7 7 0 1 0 2 9.5l4.5 4.5-2.5 2.5L13.500 15.500"/><path d="M9 8.500l5 5"/><circle cx="19" cy="6" r="1.800"/>')
};
const TROPHY=`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.900V17h3v2H8v-2h3v-2.100A5 5 0 0 1 8.300 12H8a4 4 0 0 1-4-4V5h3V3zm-1 4v1a2 2 0 0 0 1.200 1.800A5 5 0 0 1 7 8V7H6zm12 0h-1v1a5 5 0 0 1-.2 1.800A2 2 0 0 0 18 8V7z"/></svg>`;
const MEDAL=`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 2h4l1 5-3 1-2-6zm10 0h-4l-1 5 3 1 2-6z" opacity=".55"/><circle cx="12" cy="15" r="6"/><text x="12" y="18" font-size="8" font-weight="800" text-anchor="middle" fill="#fff">2</text></svg>`;
function finalRow(f){
  const hl=(n,h)=>`<span class="pl">${h&&HOUSES[h]?chip(h,'xs'):''}<span>${esc(n)}</span></span>`;
  const tag=`<div class="ftag"><b>${f.category==='Men'?'Men':'Women'}</b></div>`;
  if(f.winner) return `<div class="frow done">${tag}<span class="st">${f.date&&f.date!=='Today'?'Completed · '+esc(f.date.replace(/ 2026$/,'')):'Final complete'}</span></div>
    <div class="win"><span class="ic gold">${TROPHY}</span>${hl(f.winner,f.winnerHouse)}<span class="pt">+100</span></div>
    <div class="win ru"><span class="ic silver">${MEDAL}</span>${hl(f.runnerUp,f.runnerUpHouse)}<span class="pt">+50</span></div>`;
  if(f.status==='Scheduled'){
    const when=[f.date==='Tomorrow'?'Tomorrow':'',f.time,f.venue].filter(Boolean).join(' · ');
    const vs=f.player1?`<div class="vs">${hl(f.player1,f.house1)}<i>vs</i>${hl(f.player2,f.house2)}</div>`:`<div class="vs muted2">Finalists to be announced</div>`;
    return `<div class="frow">${tag}<span class="st live">Scheduled</span></div><div class="when">${esc(when)}</div>${vs}`;
  }
  return `<div class="frow">${tag}<span class="st">Final TBA</span></div><div class="vs muted2">Schedule to be announced</div>`;
}
function renderFinals(list){
  const sports=['Darts','Jenga','Chess','Carrom','Pool','Table Tennis'];
  return sports.map(s=>`<article class="fcard"><header><span class="sico">${ICONS[s]}</span><b>${s}</b></header>${['Men','Women'].map(cat=>{const f=list.find(x=>x.sport===s&&x.category===cat)||{category:cat,status:'TBA'};return `<div class="fm">${finalRow(f)}</div>`}).join('')}</article>`).join('');
}
