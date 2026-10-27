/* ===== D.M.R v38: ranking con foto/tarjeta/rango · stats · JUGAR · foto pública · perfil ===== */
(function(){
if(window.__dmr38)return;window.__dmr38=1;
const $$=(s,r)=>[...(r||document).querySelectorAll(s)];

/* ---------- datos de rangos ---------- */
const TIERS=[100,120,150,180,220,260,320],RN=['BRONCE','PLATA','ORO','PLATINO','DIAMANTE','MAESTRO','ÉLITE'],RM=['I','II','III','IV'];
const TC=[['#ffd0a0','#e07a2b','#5e2a08'],['#ffffff','#b8c6d8','#4a5a70'],['#fff1a8','#f2b41c','#7a4a05'],['#d6fbff','#37c8e6','#0b4f78'],['#e4e0ff','#6a7cff','#2a1a8a'],['#ffc2f0','#e0309c','#5a0a50'],['#ffb0a8','#e0243a','#560812'],['#fffbd0','#ffd21f','#8a5a00']];
const SH=['M50 6L88 20V52C88 74 70 88 50 96C30 88 12 74 12 52V20Z','M50 4L90 24L82 70L50 96L18 70L10 24Z','M14 22L32 32L50 8L68 32L86 22V54C86 76 68 88 50 96C32 88 14 76 14 54Z','M50 4L90 27V73L50 96L10 73V27Z','M50 4L92 38L50 96L8 38Z','M50 3L61 30L92 32L68 52L77 84L50 66L23 84L32 52L8 32L39 30Z','M50 4C64 22 88 24 88 50C88 76 68 90 50 97C32 90 12 76 12 50C12 24 36 22 50 4Z','M8 80L4 26L30 48L50 10L70 48L96 26L92 80Z'];
function rpNow(){try{const s=JSON.parse(localStorage.getItem('dmr36_'+((prof&&prof.id)||'guest'))||'{}');return +s.rp||0}catch(e){return 0}}
function rankIdx(rp){let c=0;for(let t=0;t<7;t++){const n=TIERS[t]*4;if(rp<c+n)return t*4+Math.floor((rp-c)/TIERS[t]);c+=n}return 28}
function divRange(rp){let c=0;for(let t=0;t<7;t++){const n=TIERS[t]*4;if(rp<c+n){const k=Math.floor((rp-c)/TIERS[t]);return[c+k*TIERS[t],c+(k+1)*TIERS[t]]}c+=n}return[c,c]}
const rname=rp=>{const i=rankIdx(rp);return i>=28?'LEYENDA':RN[i>>2]+' '+RM[i&3]};
let uq=0;
function rb(rp,sz){const i=rankIdx(rp),t=i>=28?7:i>>2,d=i>=28?-1:i&3,c=TC[t],u='rb38_'+(++uq);
 return '<svg class="rb38" width="'+sz+'" height="'+sz+'" viewBox="0 0 100 100"><defs><linearGradient id="'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset=".5" stop-color="'+c[1]+'"/><stop offset="1" stop-color="'+c[2]+'"/></linearGradient></defs><path d="'+SH[t]+'" fill="url(#'+u+')" stroke="'+c[0]+'" stroke-width="3" stroke-linejoin="round"/><text x="50" y="62" text-anchor="middle" font-size="'+(d<0?44:36)+'" font-weight="900" font-style="italic" fill="#fff" stroke="'+c[2]+'" stroke-width="3" paint-order="stroke" font-family="Arial,sans-serif">'+(d<0?'★':RM[d])+'</text></svg>'}
const lvOf=d=>d.ver?100:Math.min(100,Math.floor((d.xp||0)/XP_PER_LV)+1);

/* ---------- CSS ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
/* ventana "Próximamente": el emoji ya no es un botón gigante */
#m35 .mb .big{width:auto!important;padding:0!important;margin:0 0 4px!important;background:none!important;border:0!important;box-shadow:none!important;font-size:46px!important;letter-spacing:0!important;border-radius:0!important;display:block!important;line-height:1.2!important}
.mo36 .big{width:100%!important;padding:12px!important;font-size:14px!important;letter-spacing:0!important;border-radius:14px!important;box-shadow:none!important;line-height:1.2!important;font-weight:400!important}
/* botón de estadísticas en el lobby */
#h36 .stp>*:not(.st38){display:none!important}
#h36 .stp{cursor:pointer;align-items:center;justify-content:center;text-align:center}
#h36 .stp .st38{display:flex;flex-direction:column;align-items:center;gap:2px}
#h36 .stp .st38 i{font-style:normal;font-size:24px}
#h36 .stp .st38 b{font-size:12px;letter-spacing:1px}
#h36 .stp .st38 small{font-size:10px;letter-spacing:0;color:#8fe8ff}
/* pantallas nuevas */
#rk38,#st38{position:fixed;inset:0;z-index:44;color:#fff;font-family:Roboto,system-ui,sans-serif;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:radial-gradient(70% 35% at 0 0,rgba(40,80,255,.4),transparent),radial-gradient(70% 35% at 100% 100%,rgba(255,40,70,.3),transparent),#05061f}
#rk38,#rk38 *,#st38,#st38 *{touch-action:pan-y!important}
.w38{max-width:520px;margin:0 auto;padding:max(12px,env(safe-area-inset-top)) 12px 26px}
.h38{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.h38 b{flex:1;text-align:center;letter-spacing:4px;font-size:16px;text-shadow:0 0 12px #3b6bff}
.h38 button{width:38px;height:38px;border-radius:50%;border:1.5px solid #3b6bff;background:#080e32;color:#fff;font-size:20px}
.h38 span{width:38px}
/* filas del ranking */
.r38{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;gap:9px;padding:9px 10px;margin-bottom:7px;border:1.5px solid #2a3a80;border-radius:14px;background-size:100% 100%,170% 100%;background-color:#0a1030;animation:bg38 9s ease-in-out infinite alternate}
.r38::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.13) 50%,transparent 65%);transform:translateX(-120%);animation:sh38 5s ease-in-out infinite;pointer-events:none;z-index:0}
#rk38 .r38>canvas.c38{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}
.r38.me{border-color:#ffd21f}
.r38>*:not(canvas){position:relative;z-index:1}
.r38 .p{width:26px;text-align:center;font-weight:900;font-size:15px}
.r38 .p1{color:#ffd21f}.r38 .p2{color:#d8e2f2}.r38 .p3{color:#e0873a}
.r38 .a38{width:44px;height:44px;flex:none;border-radius:50%;border:2px solid #fff;background:#14246a center/cover no-repeat;box-shadow:0 0 10px rgba(59,107,255,.8)}
.r38 .i{flex:1;min-width:0}
.r38 .n38{display:flex;align-items:center;gap:5px;min-width:0;font-size:15px}
.r38 .n38 .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 4px #000}
.r38 .n38>*:not(.t){flex:none}
.r38 small{display:block;font-size:10px;color:#d5defc;text-shadow:0 1px 3px #000}
.r38 em{font-style:normal;font-weight:800;font-size:12px;color:#ffd21f;white-space:nowrap;text-shadow:0 1px 3px #000}
.rb38{display:block;filter:drop-shadow(0 0 4px rgba(255,255,255,.35))}
@keyframes bg38{from{background-position:0 0,0% 50%}to{background-position:0 0,100% 50%}}
@keyframes sh38{55%,100%{transform:translateX(120%)}}
@media(prefers-reduced-motion:reduce){.r38,.r38::after{animation:none!important}}
/* estadísticas */
.s38r{display:flex;gap:14px;align-items:center;padding:12px;border:1.5px solid #3b6bff;border-radius:18px;background:rgba(10,18,60,.8);margin-bottom:12px}
.ring38{--p:0;position:relative;width:104px;height:104px;border-radius:50%;flex:none;background:conic-gradient(#19e68c calc(var(--p)*1%),rgba(255,255,255,.12) 0);display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring38::before{content:"";position:absolute;inset:9px;border-radius:50%;background:#070b2a}
.ring38>*{position:relative}
.ring38 b{font-size:24px}.ring38 small{font-size:8px;letter-spacing:1px;color:#9fb6ff}
.s38k{flex:1;min-width:0}
.s38k .rr{display:flex;align-items:center;gap:8px}
.s38k b{display:block;font-size:16px}
.s38k small{font-size:10px;color:#9fb6ff;letter-spacing:.06em}
.bar38{height:7px;border-radius:5px;background:rgba(255,255,255,.14);overflow:hidden;margin:6px 0 3px}
.bar38 i{display:block;height:100%;background:linear-gradient(90deg,#19d3ff,#8b3dff)}
.s38g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.s38t{padding:11px 8px;border:1px solid #2a3a80;border-radius:14px;background:rgba(8,14,52,.85);text-align:center}
.s38t i{font-style:normal;font-size:20px;display:block}
.s38t b{display:block;font-size:22px;margin:2px 0;color:#8fe8ff}
.s38t small{font-size:9px;letter-spacing:.08em;color:#b9c4ee}
/* perfil completo: sin scroll y sin zoom */
#pfp{overflow:hidden!important}
#pfp,#pfp *{touch-action:none!important}
#pfp #cn,#pfp #upF{touch-action:auto!important}
#pfp .panel{position:absolute!important;left:50%;top:50%;margin:0!important;width:min(94vw,400px)!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%);transform-origin:center center}
</style>`);

/* ---------- JUGAR: ya no sale "Próximamente" ---------- */
const np=$('nPlay'),nd=$('ndf');
if(np&&nd)np.insertBefore(document.createTextNode(' '),nd);

/* ---------- clics (antes que v36 y v37) ---------- */
window.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 if(t.closest('#m35 [data-a="rk"]')){e.stopImmediatePropagation();e.preventDefault();try{au();SFX.click()}catch(x){}openRank();return}
 if(t.closest('#m35 [data-a="pf"]')){e.stopImmediatePropagation();e.preventDefault();try{au();SFX.click()}catch(x){}const p=$('pf');if(p)p.click();return}
 if(t.closest('#m35 [data-a="play"]'))setTimeout(()=>{const m=$$('#m35 .mo').find(z=>/⏳/.test(z.textContent));if(m){m.remove();const b=$('nPlay');if(b)b.click()}},30);
},true);

/* ---------- foto de perfil visible para todos (miniatura en tu cuenta) ---------- */
function thumbOf(src){return new Promise(r=>{if(!src)return r('');const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),m=Math.min(im.width,im.height);g.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,96,96);r(c.toDataURL('image/jpeg',.72))}catch(e){r('')}};im.onerror=()=>r('');im.src=src})}
let lastId='',srv='',phBusy=0;
async function syncPhoto(){
 if(!(ME&&fb&&SY&&prof.id)||phBusy)return;phBusy=1;
 try{
  if(lastId!==prof.id){lastId=prof.id;const d=await pget(prof.id);srv=(d&&d.photo)||'';
   if(!prof.photo&&srv){prof.photo=srv;try{localStorage.setItem('dmr_ph_'+prof.id,srv)}catch(e){}try{setAv();buildAv()}catch(e){}}}
  const ph=prof.photo||'';
  if(ph!==srv){const s=ph?await thumbOf(ph):'';await FS.setDoc(FS.doc(fb.db,'players',prof.id),{photo:ph,photoS:s},{merge:true});srv=ph}
 }catch(e){}finally{phBusy=0}}
setInterval(syncPhoto,3000);

/* ---------- RANKING con foto, tarjeta animada y rango al lado del nombre ---------- */
let last=0;
function loop(n){
 if(!$('rk38'))return;requestAnimationFrame(loop);
 if(n-last<50)return;last=n;
 const X=window.__X;if(!X||!X.CD)return;
 $$('#rk38 canvas.c38').forEach(c=>{const r=c.parentNode.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
  const w=Math.max(60,Math.round(r.width/2)),h=Math.max(20,Math.round(r.height/2));if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
  g.save();try{X.CD[c.dataset.id](g,w,h,n/1000,h/70)}catch(er){}g.restore();g.fillStyle='rgba(4,6,22,.45)';g.fillRect(0,0,w,h)})}
async function openRank(){
 const old=$('rk38');if(old)old.remove();
 const o=document.createElement('div');o.id='rk38';
 o.innerHTML='<div class="w38"><div class="h38"><button type="button" id="rk38x">‹</button><b>🏆 RANKING</b><span></span></div><div id="rk38l"><div class="pst">Cargando…</div></div></div>';
 document.body.appendChild(o);
 $('rk38x').onclick=()=>{SFX.click();o.remove()};
 const L=$('rk38l');
 try{
  if(!fb||!ME||!SY){L.innerHTML='<div class="pst">Entra con tu cuenta para ver el ranking</div>';return}
  const s=await FS.getDocs(FS.query(FS.collection(fb.db,'players'),FS.orderBy('xp','desc'),FS.limit(50)));
  const a=[];s.forEach(d=>{const x=d.data();if(x&&x.name&&!x.hidden)a.push(x)});
  const mine=rpNow();
  a.forEach(d=>{d.rp=d.id===prof.id?mine:(+d.rp||0)});
  if(!a.some(d=>d.id===prof.id))a.push({id:prof.id,name:prof.name,xp:prof.xp||0,rp:mine,ver:VER});
  a.sort((p,q)=>q.rp-p.rp||(q.xp||0)-(p.xp||0));
  const X=window.__X;
  L.innerHTML=a.map((d,i)=>{
   const me=d.id===prof.id,eq=(me?prof.eq:d.eq)||{},anim=!!(X&&X.CD&&eq.tc&&X.CD[eq.tc]);
   const cu=(CARDS[me?effCard():(d.card||0)]||CARDS[0]).u;
   const ph=me?(prof.photo||AVS[effAv()]||AVS[0]):(d.photoS||d.photo||AVS[d.av||0]||AVS[0]);
   return '<div class="r38'+(me?' me':'')+'" data-i="'+i+'" style=\'background-image:linear-gradient(rgba(5,8,28,.5),rgba(5,8,28,.72)),url("'+cu+'")\'>'
    +(anim?'<canvas class="c38" data-id="'+esc(eq.tc)+'"></canvas>':'')
    +'<span class="p'+(i<3?' p'+(i+1):'')+'">'+(i+1)+'</span>'
    +'<span class="a38" style=\'background-image:url("'+ph+'")\'></span>'
    +'<div class="i"><b class="n38"><span class="t">'+esc(d.name)+'</span>'+(d.ver?VF:'')+(d.gver?'<span class="vg"></span>':'')+rb(d.rp,22)+'</b><small>'+rname(d.rp)+' · NIVEL '+(me?plv():lvOf(d))+'</small></div>'
    +'<em>'+d.rp+' PTS</em></div>'}).join('')||'<div class="pst">Aún no hay jugadores</div>';
  $$('#rk38l .r38').forEach(e=>e.onclick=()=>{SFX.click();const d=a[+e.dataset.i];if(d&&d.id)openPv(d.id)});
  requestAnimationFrame(loop)
 }catch(e){L.innerHTML='<div class="pst">'+esc(errEs(e))+'</div>'}}

/* perfil de otro jugador: su foto y su rango */
const _pv=openPv;
openPv=async function(id){await _pv(id);
 try{const d=await pget(id);if(d){if(d.photo)$('pvAv').style.backgroundImage='url("'+d.photo+'")';$('pvNm').insertAdjacentHTML('beforeend',' '+rb(+d.rp||0,22))}}catch(e){}};

/* ---------- ESTADÍSTICAS: botón en el lobby ---------- */
const stp=document.querySelector('#h36 .stp');
if(stp){stp.setAttribute('role','button');stp.insertAdjacentHTML('beforeend','<div class="st38"><i>📊</i><b>ESTADÍSTICAS</b><small id="st38p">0% de victorias</small></div>');stp.onclick=()=>{try{au();SFX.click()}catch(e){}openStats()}}
setInterval(()=>{const e=$('st38p');if(!e)return;const W=prof.w||0,L=prof.l||0;e.textContent=(W+L?Math.round(W/(W+L)*100):0)+'% de victorias'},1200);
function openStats(){
 const old=$('st38');if(old)old.remove();
 let S={};try{S=JSON.parse(localStorage.getItem('dmr36_'+((prof&&prof.id)||'guest'))||'{}')||{}}catch(e){}
 const W=prof.w||0,Lo=prof.l||0,G=W+Lo,P=G?Math.round(W/G*100):0,rp=+S.rp||0,dr=divRange(rp),pc=dr[1]>dr[0]?Math.max(0,Math.min(100,(rp-dr[0])/(dr[1]-dr[0])*100)):100;
 const tiles=[['🏆','VICTORIAS',W],['✖','DERROTAS',Lo],['🎮','PARTIDAS',G],['🔥','RACHA ACTUAL',S.streak||0],['⚡','MEJOR RACHA',S.bestStreak||0],['🥇','VICT. CLASIFICATORIAS',S.rwins||0],['🔴','VICT. DIFÍCIL',S.hardWins||0],['🧱','PARTIDAS 11-0',S.shut||0],['⭐','NIVEL',plv()],['✨','XP TOTAL',fmt(prof.xp||0)]];
 const o=document.createElement('div');o.id='st38';
 o.innerHTML='<div class="w38"><div class="h38"><button type="button" id="st38x">‹</button><b>📊 ESTADÍSTICAS</b><span></span></div>'
  +'<div class="s38r"><div class="ring38" style="--p:'+P+'"><b>'+P+'%</b><small>VICTORIAS</small></div>'
  +'<div class="s38k"><small>RANGO ACTUAL</small><div class="rr">'+rb(rp,40)+'<b>'+rname(rp)+'</b></div><div class="bar38"><i style="width:'+pc+'%"></i></div><small>'+(dr[1]>dr[0]?rp+' / '+dr[1]+' PTS':rp+' PTS · MAX')+'</small></div></div>'
  +'<div class="s38g">'+tiles.map(t=>'<div class="s38t"><i>'+t[0]+'</i><b>'+t[2]+'</b><small>'+t[1]+'</small></div>').join('')+'</div></div>';
 document.body.appendChild(o);
 $('st38x').onclick=()=>{SFX.click();o.remove()}}

/* ---------- PERFIL: se ajusta a la pantalla, sin scroll ni zoom ---------- */
const pf=$('pfp');
function fit(){const p=pf.querySelector('.panel');if(!p||pf.classList.contains('hide'))return;
 if(document.activeElement&&document.activeElement.tagName==='INPUT')return;
 p.style.transform='translate(-50%,-50%)';
 const s=Math.min(1,(innerHeight-10)/p.offsetHeight,(innerWidth-10)/p.offsetWidth);
 p.style.transform='translate(-50%,-50%) scale('+s+')'}
new MutationObserver(()=>setTimeout(fit,30)).observe(pf,{attributes:true,attributeFilter:['class'],subtree:true,childList:true});
addEventListener('resize',fit);
/* si el navegador llega a hacer zoom, se reinicia */
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{
 if(visualViewport.scale>1.01){const m=document.querySelector('meta[name=viewport]');if(m){const c=m.content;m.content=c+',minimum-scale=1';setTimeout(()=>{m.content=c},60)}}});
})();