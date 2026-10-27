/* ===== D.M.R v35: JUGAR clasificatorio (puntos de rango) · rangos con scroll · todo cabe en pantalla · sin zoom ===== */
(function(){
if(window.__dmr35)return;window.__dmr35=1;

const WIN_BONUS=15;      /* puntos de rango extra por ganar (además de 1 por cada punto que metes) */
const MINZ=.62;          /* lo más que se puede encoger la pantalla para que quepa */

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
const vis=el=>{if(!el||!el.isConnected)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'};
function textEl(re){
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const v=n.nodeValue;if(v.length>60||!v.trim())continue;
  if(re.test(norm(v))){const e=n.parentElement;if(e&&vis(e))return e}}
 return null}

document.head.insertAdjacentHTML('beforeend',`<style>
.sc34,.sc34 *{touch-action:pan-y!important}
.sc34{overscroll-behavior:contain}
#sv,#sv *{touch-action:pan-y!important}
/* tarjeta "ACTUAL" de rangos: mismo orden que las demás */
[data-fx35]{position:relative!important;display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;height:auto!important;min-height:0!important;padding:18px 12px!important;gap:8px}
[data-fx35] *{position:static!important;transform:none!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;margin-left:0!important;margin-right:0!important}
[data-fx35] [data-big35]{width:96px!important;height:auto!important;max-width:96px!important;object-fit:contain;flex:none}
[data-fx35] [data-ba35]{position:absolute!important;top:12px!important;right:12px!important}
</style>`);

/* =====================================================================
   1) SIN ZOOM
   ===================================================================== */
document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false,capture:true});
['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));
const mv=document.querySelector('meta[name=viewport]');
if(mv&&!/minimum-scale/.test(mv.content))mv.content+=',minimum-scale=1';

/* =====================================================================
   2) JUGAR = partida clasificatoria: da PUNTOS DE RANGO (no toca el progreso de niveles)
   ===================================================================== */
const KEYS=['rankPts','rankPoints','rp','rkp','pts','puntosRango','rankedPts'];
const rkKey=()=>{for(const k of KEYS)if(typeof prof[k]==='number')return k;return 'rkp'};
let ranked=false,snap=null,hidden=[];

document.addEventListener('click',e=>{
 let a=e.target;
 for(let i=0;i<7&&a&&a!==document.body;i++,a=a.parentElement){
  const t=norm(a.textContent);
  if(t.length>=80)break;
  if(/JUGAR/.test(t)&&/CLASIFICATORIA|SUBE DE RANGO/.test(t)){
   e.preventDefault();e.stopImmediatePropagation();startRanked(a);return}
 }
},true);

function startRanked(btn){
 if(ranked)return;
 ranked=true;
 snap={best:prof.best,lst:JSON.parse(JSON.stringify(prof.lst||{})),lrw:JSON.parse(JSON.stringify(prof.lrw||{})),pc:prof.pc};
 /* dificultad según tus puntos de rango (solo para elegir los retos de la partida) */
 selLv=Math.max(1,Math.min(100,1+Math.floor((+prof[rkKey()]||0)/25)));
 try{paintGrid()}catch(e){}
 hidden=[];
 const m=$('menu');let root=null;
 if(m&&m.contains(btn))root=m;
 else{let a=btn;while(a&&a!==document.body){const r=a.getBoundingClientRect();
   if(getComputedStyle(a).position==='fixed'&&r.width>=innerWidth*.9&&r.height>=innerHeight*.9){root=a;break}a=a.parentElement}}
 [m,root].forEach(x=>{if(x&&!x.classList.contains('hide')){x.classList.add('hide');hidden.push(x)}});
 try{newGame(false)}catch(er){ranked=false;snap=null;hidden.forEach(x=>x.classList.remove('hide'));hidden=[];toast('No se pudo iniciar la partida')}}

const _tm=toMenu;
toMenu=function(){
 hidden.forEach(x=>x.classList.remove('hide'));hidden=[];
 if(ranked&&mode!=='over'){ranked=false;snap=null}
 return _tm.apply(this,arguments)};

let pm=mode;
setInterval(()=>{const m=mode;
 if(ranked&&pm==='play'&&m==='over'&&!two)setTimeout(finishRanked,550);
 pm=m},120);
function finishRanked(){
 if(!ranked)return;ranked=false;
 const win=sc[0]>sc[1],add=sc[0]+(win?WIN_BONUS:0);
 if(snap){prof.best=snap.best;prof.lst=snap.lst;prof.lrw=snap.lrw;prof.pc=snap.pc;try{updPC()}catch(e){}}  /* sin recompensas de nivel */
 const k=rkKey();prof[k]=(+prof[k]||0)+add;
 try{saveP()}catch(e){}
 try{const ex=$('exp');if(ex)ex.textContent=ex.textContent.replace(/ · [★☆]+.*$/,'')+' · 🏅 +'+add+' PTS DE RANGO (total '+prof[k]+')'}catch(e){}
 try{const b=$('bnext');if(b)b.classList.add('hide')}catch(e){}
 snap=null}

/* =====================================================================
   3) Arreglos de pantalla: rangos (scroll + tarjeta ACTUAL) y que todo quepa sin subir
   ===================================================================== */
function scrollerFrom(el){
 for(let a=el;a&&a!==document.documentElement;a=a.parentElement){
  if(a===document.body)break;
  if(a.scrollHeight>a.clientHeight+4&&a.clientHeight>250)return a}
 return null}

function rankFix(){
 const h=textEl(/^SISTEMA DE RANGOS$/);if(!h)return;
 const chain=[];for(let a=h;a&&a!==document.documentElement;a=a.parentElement)chain.push(a);
 const fixed=[...chain].reverse().find(x=>getComputedStyle(x).position==='fixed')||chain[chain.length-1];
 fixed.classList.add('sc34');
 chain.forEach(a=>{if(a===document.body)return;
  if(a.scrollHeight>a.clientHeight+4&&a.clientHeight>200){a.style.overflowY='auto';a.style.webkitOverflowScrolling='touch'}});
 const b=textEl(/^ACTUAL$/);
 if(b&&!b.dataset.ba35){
  let c=b;while(c.parentElement&&!(c.offsetWidth>innerWidth*.85&&c.offsetHeight>150))c=c.parentElement;
  b.dataset.ba35='1';c.dataset.fx35='1';
  const big=[...c.querySelectorAll('img,svg')].find(x=>!b.contains(x));if(big)big.dataset.big35='1'}}

const FIT=new Set();
function fit(S){
 const kids=[...S.children].filter(k=>{const p=getComputedStyle(k).position;return p!=='fixed'&&p!=='absolute'});
 kids.forEach(k=>k.style.zoom='');
 let z=1;
 for(let i=0;i<5;i++){
  const ch=S.clientHeight,sh=S.scrollHeight;if(sh<=ch+2)break;
  z=Math.max(MINZ,z*ch/sh*.985);kids.forEach(k=>k.style.zoom=z);if(z<=MINZ)break}
 S.dataset.min35=(S.scrollHeight>S.clientHeight+4)?'1':''}

function tick(){
 try{
  const l=textEl(/CLASIFICATORIA|SUBE DE RANGO/);if(l){const s=scrollerFrom(l);if(s)FIT.add(s)}
  const pf=$('pf');if(pf&&vis(pf)){const s=scrollerFrom(pf);if(s)FIT.add(s)}
  FIT.forEach(S=>{
   if(!S.isConnected){FIT.delete(S);return}
   if(!vis(S))return;
   S.classList.add('sc34');
   if(S.scrollHeight>S.clientHeight+4&&S.dataset.min35!=='1')fit(S)});
  rankFix()
 }catch(e){}}
setInterval(tick,900);
addEventListener('resize',()=>{FIT.forEach(S=>{S.dataset.min35='';if(vis(S)&&S.scrollHeight>S.clientHeight+4)fit(S)})});
})();
