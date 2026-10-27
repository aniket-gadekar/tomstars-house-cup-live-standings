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
const chip = (h,cls='') => `<span class="chip ${cls}" style="background:${HOUSES[h].chip}"><img src="${HOUSES[h].logo}" alt=""></span>`;
async function loadEntries(){ const r = await fetch('data/entries.json',{cache:'no-store'}); return r.json(); }
