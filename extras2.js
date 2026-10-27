/* ===== D.M.R v32: arreglo de barras anchas (ELIMINAR, PERFIL, NOTA) + acciones por jugador ===== */
(function(){
if(window.__dmr32)return;window.__dmr32=1;

document.head.insertAdjacentHTML('beforeend',`<style>
/* cualquier botón .mn que NO sea del mapa de niveles (el mapa los pone con left:..px) */
button.mn:not([style*="left"]){position:static!important;transform:none!important;inset:auto!important;width:auto!important;height:auto!important;min-height:40px;border-radius:12px!important;font-size:12px!important;letter-spacing:0!important;padding:9px 12px!important;margin:4px 0;box-shadow:none!important;animation:none!important;z-index:auto!important;background:rgba(10,20,70,.92)!important;color:#fff!important;border:2px solid #2a6bff!important;text-shadow:none!important;opacity:1!important;white-space:normal;line-height:1.2;display:inline-flex!important;align-items:center;justify-content:center}
button.mn:not([style*="left"])::before,button.mn:not([style*="left"])::after{display:none!important}
.pa30{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}
.pa30 b{grid-column:1/-1;font-size:11px;letter-spacing:2px;color:#37d6ff}
.pa30 button{width:100%!important;min-height:44px!important;margin:0!important}
.pa30 button.r{border-color:#ff4a5a!important;color:#ff8a95!important}
</style>`);

const tab=re=>[...document.querySelectorAll('#apT button')].find(x=>re.test(x.textContent));
function mk(txt,fn,cls){const b=document.createElement('button');b.type='button';b.className='tg mn'+(cls?' '+cls:'');b.textContent=txt;b.onclick=()=>{SFX.click();fn()};return b}

function scan(){
 const B=$('apB');if(!B)return;
 B.querySelectorAll('button').forEach(btn=>{
  if(btn.dataset.pa||!/ELIMINAR/i.test(btn.textContent))return;
  let c=btn,id=null;
  for(let i=0;i<6&&c;i++){c=c.parentElement;const m=c&&/ID\s*(\d{4,8})/.exec(c.textContent);if(m){id=m[1];break}}
  if(!id)return;
  btn.dataset.pa='1';
  const g=document.createElement('div');g.className='pa30';g.innerHTML='<b>ACCIONES CON ESTE JUGADOR</b>';
  g.appendChild(mk('✉ MENSAJE',()=>{const t=tab(/Mensajes/);if(!t)return;t.click();setTimeout(()=>{const m=$('mM');if(m){m.value='pm';m.dispatchEvent(new Event('change',{bubbles:true}))}const x=$('mT');if(x)x.value=id},80)}));
  g.appendChild(mk('🎁 REGALAR',()=>{const t=tab(/Regalos/);if(!t)return;t.click();setTimeout(()=>{const x=$('gT');if(x)x.value=id},80)}));
  g.appendChild(mk('🖼 QUITAR FOTO',()=>{const p=$('apPh');if(!p)return;p.click();setTimeout(()=>{const x=$('mpId');if(x)x.value=id},80)}));
  g.appendChild(mk('📋 COPIAR ID',()=>{try{navigator.clipboard.writeText(id);toast('ID copiado: '+id)}catch(e){toast('ID: '+id)}}));
  btn.classList.add('r');btn.style.gridColumn='1/-1';
  btn.parentNode.insertBefore(g,btn);g.appendChild(btn)})}
let q=0;const sched=()=>{if(!q)q=requestAnimationFrame(()=>{q=0;try{scan()}catch(e){}})};
const ap=$('ap');if(ap)new MutationObserver(sched).observe(ap,{childList:true,subtree:true});
setInterval(sched,1500);
})();

/* ===== D.M.R v33: ranking con tarjeta y foto · reemplazar animados · ONLINE bonito · lobby limpio · punto de oro · tutorial ===== */
(function(){
if(window.__dmr33)return;window.__dmr33=1;
const X=window.__X||{};
const MAXPTS=11;
const T0=Date.now();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();

document.head.insertAdjacentHTML('beforeend',`<style>
/* ranking: nombre + insignia en una fila */
.rkt .w33{display:flex;align-items:center;gap:6px;min-width:0}
.rkt .w33 b{flex:0 1 auto;min-width:0;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rkt .w33>*:not(b){flex:none}
canvas.tc33{position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none;border-radius:inherit}

/* ONLINE */
.on30s{display:flex;align-items:center;justify-content:center;gap:8px;margin:4px 0 12px;padding:9px 12px;border-radius:12px;border:1px solid rgba(55,214,255,.5);background:rgba(5,10,40,.7);font-size:12px;font-weight:800;letter-spacing:1px}
.on30s i{width:10px;height:10px;border-radius:50%;background:#ffb800;box-shadow:0 0 10px #ffb800;animation:on30 1.4s ease-in-out infinite}
.on30s[data-s=on] i{background:#19e68c;box-shadow:0 0 10px #19e68c}
.on30s[data-s=off] i{background:#ff4a5a;box-shadow:0 0 10px #ff4a5a;animation:none}
@keyframes on30{50%{transform:scale(1.5);opacity:.6}}
button.on30b{display:flex!important;align-items:center;gap:14px;text-align:left!important;padding:14px 16px!important;border-radius:16px!important;min-height:68px}
button.on30b.alt{background:linear-gradient(180deg,rgba(20,50,150,.7),rgba(5,10,40,.95))!important;border:2px solid #2a6bff!important}
.on30b .oi{font-size:30px;flex:none}
.on30b .ot b{display:block;font-size:15px;letter-spacing:1px}
.on30b .ot small{display:block;font-size:11px;font-weight:600;letter-spacing:0;opacity:.85;margin-top:3px}

/* LOBBY más limpio */
#menu .lbm{height:auto!important;min-height:0!important;aspect-ratio:auto!important;padding:10px 4px!important;gap:2px!important;font-size:11px!important;letter-spacing:1px!important}
#menu .lbm>*:first-child{font-size:24px!important;line-height:1!important;margin:0!important}
#menu .lbp{padding:8px!important;font-size:11px!important;min-height:0!important;opacity:.85}
#sg30Btn{margin-top:14px!important;padding:9px!important;font-size:12px!important;background:transparent!important;border:1px dashed #ffd400!important;box-shadow:none!important;opacity:.9}

/* TUTORIAL */
#tu33{position:fixed;inset:0;z-index:99990;pointer-events:none}
#tu33.hide{display:none}
#tu33 .bd{position:fixed;inset:0;background:rgba(0,0,12,.82);pointer-events:auto;display:none}
#tu33 .tr{position:fixed;border:3px solid #37d6ff;border-radius:16px;box-shadow:0 0 0 100vmax rgba(0,0,12,.78),0 0 22px #00c8ff;pointer-events:none;transition:all .2s;display:none}
#tu33 .ar{position:fixed;font-size:18px;color:#37d6ff;text-shadow:0 0 10px #00c8ff;animation:tu33 .8s ease-in-out infinite;display:none}
@keyframes tu33{50%{transform:translateY(5px)}}
#tu33 .tc{position:fixed;width:min(88vw,340px);padding:16px;border-radius:18px;border:2px solid #2a6bff;background:linear-gradient(180deg,#0a1650,#050a28);box-shadow:0 0 24px rgba(42,107,255,.7);pointer-events:auto;color:#fff;z-index:2}
#tu33 .tt{display:block;font-size:16px;letter-spacing:1px;margin-bottom:6px}
#tu33 .tx{font-size:13.5px;line-height:1.45;opacity:.95;margin-bottom:12px}
#tu33 .tb{display:flex;gap:8px;align-items:center}
#tu33 .tb button{flex:1;padding:12px;border-radius:12px;border:0;color:#fff;font-size:13px;font-weight:900;letter-spacing:1px;background:linear-gradient(90deg,#c0101f,#1a3fd8)}
#tu33 .tb button.sk{flex:none;background:transparent;border:1px solid #2a6bff;opacity:.8;font-size:11px;padding:10px}
#tg33{position:fixed;left:12px;right:12px;top:calc(60px + env(safe-area-inset-top,0px));z-index:99989;pointer-events:none;display:none}
#tg33 div{pointer-events:none;max-width:380px;margin:0 auto;padding:12px;border-radius:14px;border:2px solid #ffd400;background:rgba(10,12,40,.94);color:#fff;font-size:13px;line-height:1.4}
#tg33 button{pointer-events:auto;margin-top:8px;padding:9px 14px;border-radius:10px;border:0;background:#ffd400;color:#000;font-weight:900}
@media(prefers-reduced-motion:reduce){#tu33 .ar,.on30s i{animation:none}}
</style>`);

/* =====================================================================
   1) Al tocar una foto o tarjeta NORMAL se quita la animada y se pone la elegida
   ===================================================================== */
function setEq(k,v){prof.eq=prof.eq||{};prof.eq[k]=v;try{saveP()}catch(e){}}
const CARDN=['NEON','ONDAS','ESTRELLAS','CUADRICULA','FUEGO','HEXAGONOS','CIRCUITO','GALAXIA','DIAMANTES','REY DORADO','LEYENDA'];
document.addEventListener('click',e=>{
 try{
  const pf=$('pf');if(!pf||pf.offsetParent===null||pf.contains(e.target))return;
  const ov=pf.closest('.ov')||pf.closest('.panel');if(!ov||!ov.contains(e.target))return;
  let c=e.target;
  for(let i=0;i<5&&c&&c!==ov;i++,c=c.parentElement){
   const t=norm(c.textContent);
   if(CARDN.includes(t)){if((prof.eq||{}).tc){setEq('tc','');toast('Tarjeta animada reemplazada')}return}
   const w=c.offsetWidth,h=c.offsetHeight;
   if(!t&&w>=40&&w<=110&&Math.abs(w-h)<=4){if((prof.eq||{}).ph){setEq('ph','');toast('Foto animada reemplazada')}return}
  }
 }catch(er){}
},true);

/* lo que tienes equipado se guarda en tu cuenta para que los demás lo vean */
let eqPushed='';
const _sp=saveP;
saveP=function(){_sp.apply(this,arguments);
 try{if(ME&&fb&&SY&&prof.id){const j=JSON.stringify(prof.eq||{});
  if(j!==eqPushed){eqPushed=j;FS.setDoc(FS.doc(fb.db,'players',prof.id),{eq:JSON.parse(j)},{merge:true}).catch(()=>{eqPushed=''})}}}catch(e){}};

/* =====================================================================
   2) RANKING: foto animada, marco y TARJETA de cada jugador
   ===================================================================== */
const EQN={};let eqT=0;
async function loadEq(){
 if(!fb||!ME||!SY||Date.now()-eqT<12000)return;eqT=Date.now();
 try{const s=await FS.getDocs(FS.query(FS.collection(fb.db,'players'),FS.orderBy('xp','desc'),FS.limit(80)));
  s.forEach(d=>{const x=d.data();if(x&&x.name)EQN[String(x.name).toLowerCase()]=x.eq||{}})}catch(e){}}
const firstTxt=el=>{if(!el)return'';const n=[...el.childNodes].find(x=>x.nodeType===3&&x.nodeValue.trim());return n?n.nodeValue.trim().toLowerCase():''};
/* separa la insignia del nombre para que la foto animada del ranking también salga en TU fila */
function fixRows(){
 document.querySelectorAll('.rkt b').forEach(b=>{
  if(b.dataset.w33)return;b.dataset.w33='1';
  const kids=[...b.children];if(!kids.length)return;
  const w=document.createElement('span');w.className='w33';
  b.parentNode.insertBefore(w,b);w.appendChild(b);kids.forEach(k=>w.appendChild(k))})}
function rowCards(t){
 const mine=(prof.name||'').toLowerCase();
 document.querySelectorAll('.rk').forEach(r=>{
  let c=null;for(const k of r.children)if(k.tagName==='CANVAS'&&k.classList.contains('tc33')){c=k;break}
  const nm=firstTxt(r.querySelector('.rkt b'));
  const eq=nm&&nm===mine?prof.eq:EQN[nm];
  const id=eq&&eq.tc&&X.CD&&X.CD[eq.tc]?eq.tc:'';
  if(!id){if(c)c.remove();return}
  if(r.offsetParent===null)return;
  const b=r.getBoundingClientRect();if(b.bottom<0||b.top>innerHeight)return;
  if(!c){c=document.createElement('canvas');c.className='tc33';r.insertBefore(c,r.firstChild);r.style.position='relative';r.style.isolation='isolate'}
  const w=Math.max(60,Math.round(r.offsetWidth/2)),h=Math.max(20,Math.round(r.offsetHeight/2));
  if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
  g.save();try{X.CD[id](g,w,h,t,h/70)}catch(er){}g.restore();
  g.fillStyle='rgba(4,6,22,.45)';g.fillRect(0,0,w,h)})}
let rl=0;
function rankLoop(n){requestAnimationFrame(rankLoop);
 const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(n-rl<(rm?500:50))return;rl=n;
 try{const open=!['rnk','ap'].every(i=>{const e=$(i);return !e||e.classList.contains('hide')});
  if(!open)return;loadEq();fixRows();rowCards(rm?3:n/1000)}catch(e){}}
requestAnimationFrame(rankLoop);

/* =====================================================================
   3) ONLINE: ventana ordenada
   ===================================================================== */
function stTxt(){if(!navigator.onLine)return['off','Sin internet'];if(ME&&fb&&SY)return['on','Conectado al servidor'];return['wait','Inicia sesión para jugar online']}
function onl(){
 [...document.querySelectorAll('button')].filter(b=>/BUSCAR JUGADORES/i.test(b.textContent)&&!b.dataset.o30).forEach(b=>{
  b.dataset.o30='1';
  const p=b.closest('.panel')||b.parentElement;
  b.classList.add('on30b');
  b.innerHTML='<span class="oi">🔎</span><span class="ot"><b>BUSCAR JUGADORES</b><small>Partida rápida contra alguien en línea</small></span>';
  const inv=[...p.querySelectorAll('button')].find(x=>/INVITAR AMIGOS/i.test(x.textContent));
  if(inv){inv.dataset.o30='1';inv.classList.add('on30b','alt');inv.innerHTML='<span class="oi">📨</span><span class="ot"><b>INVITAR AMIGOS</b><small>Reta directamente a un amigo conectado</small></span>'}
  if(!p.querySelector('.on30s'))b.insertAdjacentHTML('beforebegin','<div class="on30s"><i></i><span></span></div>')});
 document.querySelectorAll('.on30s').forEach(s=>{const a=stTxt();s.dataset.s=a[0];s.querySelector('span').textContent=a[1]})}

/* =====================================================================
   4) LOBBY: botones más pequeños y ordenados
   ===================================================================== */
function lobby(){
 const m=$('menu');if(!m)return;
 m.querySelectorAll('button').forEach(b=>{
  if(b.dataset.l33)return;b.dataset.l33='1';
  const t=norm(b.textContent);
  if(/MISIONES|LOGROS|RANKING/.test(t)&&t.length<16)b.classList.add('lbm');
  else if(/PANEL MAESTRO/.test(t))b.classList.add('lbp')})}
setInterval(()=>{try{onl();lobby()}catch(e){}},700);

/* =====================================================================
   5) PUNTO DE ORO: si se acaba el tiempo empatados, el siguiente punto gana
   ===================================================================== */
let SD=false,sdStart=false,snap=null,pm=mode;
setInterval(()=>{if(mode==='play'&&!SD)snap={w:prof.w,l:prof.l,xp:prof.xp,best:prof.best}},200);
const _ng33=newGame;
newGame=function(t){if(!sdStart)SD=false;return _ng33.apply(this,arguments)};
function startSD(){
 const s=[sc[0],sc[1]],t2=two,sn=snap;
 if(sn){prof.w=sn.w;prof.l=sn.l;prof.xp=sn.xp;prof.best=sn.best;try{saveP()}catch(e){}}
 try{$('end').classList.add('hide')}catch(e){}
 setTimeout(()=>{
  sdStart=true;try{newGame(t2)}finally{sdStart=false}
  SD=true;sc=[s[0],s[1]];try{updScore()}catch(e){}
  const tm=$('tmr');if(tm)tm.style.display='none';
  try{gtx.push({s:'⏱ EMPATE · ¡EL PRÓXIMO PUNTO GANA!',l:3,c:'#ffd400'})}catch(e){}
  toast('⚡ PUNTO DE ORO: el próximo punto gana')},80)}
function finSD(){
 SD=false;mode='over';const el=$('tmr');if(el)el.style.display='none';
 const a=sc[0],c=sc[1],w0=a>c,pre='⚡ PUNTO DE ORO · '+a+' - '+c;
 if(two){$('et').textContent='¡GANA '+(w0?(NM[0]||'J1'):(NM[1]||'J2'))+'!';$('exp').textContent=pre}
 else{
  $('et').textContent=w0?'¡NIVEL '+lvl+' SUPERADO!':'PERDISTE (NIVEL '+lvl+')';
  const bon=w0?XP_WIN:XP_LOSS,l0=plv();prof.xp=(prof.xp||0)+bon;const l1=plv();
  $('exp').textContent=pre+' · +'+bon+' XP'+(l1>l0?' · ¡SUBISTE A NIVEL '+l1+'!':'');
  if(l1>l0)setTimeout(()=>SFX.hard(),700);
  if(w0){prof.w++;prof.best=Math.max(prof.best,lvl);if(lvl<100)$('bnext').classList.remove('hide')}
  else{prof.l++;vib(400)}
  saveP();showP()}
 (w0||two?SFX.win:SFX.lose)();$('end').classList.remove('hide')}
const _pt33=point;
point=function(w){_pt33(w);if(SD&&mode==='play'&&sc[0]!==sc[1])finSD()};
setInterval(()=>{
 const m=mode;
 if(pm==='play'&&m==='over'&&!SD&&sc[0]===sc[1]&&sc[0]<MAXPTS)startSD();
 pm=m},120);

/* =====================================================================
   6) TUTORIAL de bienvenida (una sola vez, hasta ganar la primera partida)
   ===================================================================== */
const ui=document.createElement('div');ui.id='tu33';ui.className='hide';
ui.innerHTML='<div class="bd"></div><div class="tr"></div><div class="ar"></div><div class="tc"><b class="tt"></b><p class="tx"></p><div class="tb"></div></div>';
document.body.appendChild(ui);
const tip=document.createElement('div');tip.id='tg33';
tip.innerHTML='<div>🎯 Mueve tu paleta con el dedo. Gana al llegar a <b>11 puntos</b>, o teniendo más puntos cuando se acabe el tiempo. Si empatan, <b>el próximo punto decide</b>.<br><button type="button">ENTENDIDO</button></div>';
document.body.appendChild(tip);
tip.querySelector('button').onclick=()=>{tip.style.display='none'};

const mb=re=>{const m=$('menu');return m?[...m.querySelectorAll('button')].find(b=>re.test(norm(b.textContent))):null};
const TOUR=[
 [()=>mb(/NIVELES/),'🎯 NIVELES','Aquí están los 100 niveles. Cada 10 niveles cambias de mundo.'],
 [()=>mb(/ONLINE/),'🌐 ONLINE','Juega contra personas reales o invita a tus amigos.'],
 [()=>mb(/2\s*JUGADORES/),'👥 2 JUGADORES','Dos personas jugando en el mismo teléfono.'],
 [()=>$('nSh')||mb(/TIENDA/),'🛒 TIENDA','Compra paletas, pelotas, fondos, fotos y tarjetas con tus monedas DOP.'],
 [()=>mb(/MISIONES/),'📅 MISIONES','Retos diarios que te dan recompensas.'],
 [()=>mb(/LOGROS/),'🏆 LOGROS','Aquí ves todo lo que has conseguido.'],
 [()=>mb(/RANKING/),'🥇 RANKING','Mira quiénes son los mejores jugadores del mundo.'],
 [()=>$('sg30Btn'),'💡 SUGERENCIAS','¿Tienes una idea para mejorar el juego? Envíala aquí.']];
let cur=null,tourI=0,tipShown=false,pm2=mode;
function setStage(n){prof.tut=n;try{saveP()}catch(e){}
 try{if(ME&&fb&&SY&&prof.id)FS.setDoc(FS.doc(fb.db,'players',prof.id),{tut:n},{merge:true}).catch(()=>{})}catch(e){}}
function show(step){cur=step;ui.classList.remove('hide');
 ui.querySelector('.tt').textContent=step.title;ui.querySelector('.tx').textContent=step.text;
 const tb=ui.querySelector('.tb');tb.innerHTML='';
 if(!step.forced){const b=document.createElement('button');b.type='button';b.textContent=step.btn||'SIGUIENTE';b.onclick=()=>{SFX.click();const f=step.on;hide();if(f)f()};tb.appendChild(b)}
 const s=document.createElement('button');s.type='button';s.className='sk';s.textContent='SALTAR';s.onclick=()=>{hide();setStage(9)};tb.appendChild(s)}
function hide(){cur=null;ui.classList.add('hide')}
function lay(){requestAnimationFrame(lay);
 if(!cur)return;
 const el=cur.el?cur.el():null,ok=!!(el&&el.offsetParent!==null);cur.ok=ok;
 const ring=ui.querySelector('.tr'),box=ui.querySelector('.tc'),bd=ui.querySelector('.bd'),ar=ui.querySelector('.ar');
 const bw=box.offsetWidth,bh=box.offsetHeight;
 if(!ok){ring.style.display='none';ar.style.display='none';bd.style.display=cur.el?'none':'block';
  box.style.left=Math.max(8,(innerWidth-bw)/2)+'px';box.style.top=Math.max(8,(innerHeight-bh)/2)+'px';return}
 bd.style.display='none';
 const r=el.getBoundingClientRect(),p=5;
 ring.style.display='block';ring.style.left=(r.left-p)+'px';ring.style.top=(r.top-p)+'px';ring.style.width=(r.width+2*p)+'px';ring.style.height=(r.height+2*p)+'px';
 const below=r.bottom+bh+34<innerHeight;
 const top=below?r.bottom+26:Math.max(8,r.top-bh-26);
 box.style.top=top+'px';box.style.left=Math.min(Math.max(8,r.left+r.width/2-bw/2),innerWidth-bw-8)+'px';
 ar.style.display='block';ar.textContent=below?'▲':'▼';ar.style.left=(r.left+r.width/2-8)+'px';ar.style.top=(below?r.bottom+4:r.top-26)+'px'}
requestAnimationFrame(lay);
/* bloquea todo lo que no sea la explicación o el botón indicado */
['click','pointerdown','mousedown','touchstart'].forEach(ev=>addEventListener(ev,e=>{
 if(!cur||!cur.ok&&cur.el)return;
 const t=e.target;
 if(ui.querySelector('.tc').contains(t))return;
 if(cur.forced&&cur.el&&cur.el()&&cur.el().contains(t))return;
 e.stopPropagation();e.preventDefault()},{capture:true,passive:false}));

const lobbyUp=()=>{const m=$('menu');return !!m&&!m.classList.contains('hide')&&m.offsetParent!==null&&mode!=='play'};
const covered=el=>{if(!el||el.offsetParent===null)return true;const r=el.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !(h&&el.contains(h))};
function wantPlay(txt){
 if(cur&&cur.key==='play')return;
 show({key:'play',el:()=>mb(/JUGAR/),forced:true,title:'▶ JUGAR',text:txt})}
setInterval(()=>{try{
 if(Date.now()-T0<4000)return;
 if(prof.tut==null)prof.tut=(prof.w>0||prof.l>0||(prof.best||0)>0)?9:0;
 const s=+prof.tut||0;
 if(s>=9){if(cur)hide();tip.style.display='none';pm2=mode;return}
 if(pm2==='play'&&mode==='over'&&s===3&&!two&&sc[0]>sc[1]){
  setStage(4);tourI=0;
  modal('🏆 ¡GANASTE TU PRIMERA PARTIDA!','Muy bien. Ahora te muestro rápido el resto del juego.',[['CONTINUAR',null]])}
 pm2=mode;
 if(mode==='play'){
  if(s===2)setStage(3);
  if(+prof.tut===3&&!tipShown){tipShown=true;tip.style.display='block'}
  if(cur)hide();return}
 tip.style.display='none';
 if(!lobbyUp()){return}
 if(s===0){if(!cur)show({key:'w',el:null,title:'¡BIENVENIDO A D.M.R PING PONG!',text:'Te voy a explicar el juego paso a paso. Solo toma un minuto y lo verás una sola vez.',btn:'COMENZAR TUTORIAL',on:()=>setStage(1)});return}
 if(s===1){if(cur||covered($('pcard')))return;
  show({key:'p',el:()=>$('pcard'),title:'👤 TU PERFIL',text:'Aquí ves tu nivel, tu foto y tu tarjeta. Tócalo cuando quieras cambiarlos.',on:()=>setStage(2)});return}
 if(s===2||s===3){const b=mb(/JUGAR/);if(!b||covered(b))return;
  wantPlay(s===2?'Pulsa JUGAR para empezar tu primera partida.':'Aún no has ganado. Pulsa JUGAR para intentarlo otra vez.');return}
 if(s===4){
  if(tourI>=TOUR.length){hide();setStage(9);modal('✅ ¡LISTO!','Ya conoces lo principal. ¡A jugar!',[['EMPEZAR',null]]);return}
  if(cur&&cur.key==='t'+tourI)return;
  const st=TOUR[tourI],el=st[0]();if(!el||covered(el)){tourI++;return}
  show({key:'t'+tourI,el:st[0],title:st[1],text:st[2],btn:tourI===TOUR.length-1?'TERMINAR':'SIGUIENTE',on:()=>{tourI++}})}
}catch(e){}},500);
/* cuenta nueva = tutorial nuevo; cuenta existente = no se repite */
const _fo=$('frOut')&&$('frOut').onclick;
if(_fo)$('frOut').onclick=async function(){await _fo.apply(this,arguments);delete prof.tut;try{_sv()}catch(e){}};
const _lm33=loadMe;
loadMe=async function(){await _lm33.apply(this,arguments);
 try{if(ME&&fb&&SY){const s=await FS.getDoc(FS.doc(fb.db,'players',prof.id));if(s.exists()){const d=s.data();
  if(d.tut!=null)prof.tut=Math.max(+prof.tut||0,+d.tut||0);else if(prof.w>0||prof.l>0)prof.tut=9}}}catch(e){}};
})();



/* ===== D.M.R v30: lobby limpio + tutorial guiado + 20 idiomas + foto con ajuste + ranking con tu fila ===== */
(function(){
if(window.__dmr30)return;window.__dmr30=1;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}return null};
const clampN=(v,a,b)=>Math.max(a,Math.min(b,v));

/* =========================================================
   1) IDIOMAS (20)
   ========================================================= */
const LG=[['es','Español','🇪🇸'],['en','English','🇬🇧'],['fr','Français','🇫🇷'],['de','Deutsch','🇩🇪'],['pt','Português','🇧🇷'],['it','Italiano','🇮🇹'],['nl','Nederlands','🇳🇱'],['ru','Русский','🇷🇺'],['zh','中文','🇨🇳'],['ja','日本語','🇯🇵'],['ko','한국어','🇰🇷'],['ar','العربية','🇸🇦'],['hi','हिन्दी','🇮🇳'],['tr','Türkçe','🇹🇷'],['pl','Polski','🇵🇱'],['sv','Svenska','🇸🇪'],['id','Indonesia','🇮🇩'],['vi','Tiếng Việt','🇻🇳'],['th','ไทย','🇹🇭'],['uk','Українська','🇺🇦']];
/* orden: en|fr|de|pt|it|nl|ru|zh|ja|ko|ar|hi|tr|pl|sv|id|vi|th|uk */
const RAW=`JUGAR=PLAY|JOUER|SPIELEN|JOGAR|GIOCA|SPELEN|ИГРАТЬ|开始|プレイ|플레이|العب|खेलें|OYNA|GRAJ|SPELA|MAIN|CHƠI|เล่น|ГРАТИ
2 JUGADORES=2 PLAYERS|2 JOUEURS|2 SPIELER|2 JOGADORES|2 GIOCATORI|2 SPELERS|2 ИГРОКА|双人|2人|2인|لاعبان|2 खिलाड़ी|2 OYUNCU|2 GRACZY|2 SPELARE|2 PEMAIN|2 NGƯỜI|2 ผู้เล่น|2 ГРАВЦІ
NIVELES=LEVELS|NIVEAUX|LEVEL|NÍVEIS|LIVELLI|LEVELS|УРОВНИ|关卡|レベル|레벨|المستويات|स्तर|SEVİYELER|POZIOMY|NIVÅER|LEVEL|CẤP ĐỘ|ด่าน|РІВНІ
ONLINE=ONLINE|EN LIGNE|ONLINE|ONLINE|ONLINE|ONLINE|ОНЛАЙН|在线|オンライン|온라인|أونلاين|ऑनलाइन|ÇEVRİMİÇİ|ONLINE|ONLINE|ONLINE|ONLINE|ออนไลน์|ОНЛАЙН
TIENDA=SHOP|BOUTIQUE|SHOP|LOJA|NEGOZIO|WINKEL|МАГАЗИН|商店|ショップ|상점|المتجر|दुकान|MAĞAZA|SKLEP|BUTIK|TOKO|CỬA HÀNG|ร้านค้า|МАГАЗИН
MISIONES=MISSIONS|MISSIONS|MISSIONEN|MISSÕES|MISSIONI|MISSIES|МИССИИ|任务|ミッション|미션|المهام|मिशन|GÖREVLER|MISJE|UPPDRAG|MISI|NHIỆM VỤ|ภารกิจ|МІСІЇ
LOGROS=ACHIEVEMENTS|SUCCÈS|ERFOLGE|CONQUISTAS|TRAGUARDI|PRESTATIES|ДОСТИЖЕНИЯ|成就|実績|업적|الإنجازات|उपलब्धियां|BAŞARIMLAR|OSIĄGNIĘCIA|PRESTATIONER|PENCAPAIAN|THÀNH TỰU|ความสำเร็จ|ДОСЯГНЕННЯ
RANKING=RANKING|CLASSEMENT|RANGLISTE|RANKING|CLASSIFICA|RANGLIJST|РЕЙТИНГ|排行榜|ランキング|랭킹|الترتيب|रैंकिंग|SIRALAMA|RANKING|RANKING|PERINGKAT|XẾP HẠNG|อันดับ|РЕЙТИНГ
AMIGOS=FRIENDS|AMIS|FREUNDE|AMIGOS|AMICI|VRIENDEN|ДРУЗЬЯ|好友|フレンド|친구|الأصدقاء|दोस्त|ARKADAŞLAR|ZNAJOMI|VÄNNER|TEMAN|BẠN BÈ|เพื่อน|ДРУЗІ
AJUSTES=SETTINGS|PARAMÈTRES|EINSTELLUNGEN|AJUSTES|IMPOSTAZIONI|INSTELLINGEN|НАСТРОЙКИ|设置|設定|설정|الإعدادات|सेटिंग्स|AYARLAR|USTAWIENIA|INSTÄLLNINGAR|PENGATURAN|CÀI ĐẶT|ตั้งค่า|НАЛАШТУВАННЯ
SONIDO=Sound|Son|Ton|Som|Suono|Geluid|Звук|声音|サウンド|소리|الصوت|ध्वनि|Ses|Dźwięk|Ljud|Suara|Âm thanh|เสียง|Звук
MÚSICA=Music|Musique|Musik|Música|Musica|Muziek|Музыка|音乐|音楽|음악|الموسيقى|संगीत|Müzik|Muzyka|Musik|Musik|Nhạc|เพลง|Музика
EFECTOS=Effects|Effets|Effekte|Efeitos|Effetti|Effecten|Эффекты|特效|エフェクト|효과|المؤثرات|प्रभाव|Efektler|Efekty|Effekter|Efek|Hiệu ứng|เอฟเฟกต์|Ефекти
BRILLO=Brightness|Luminosité|Helligkeit|Brilho|Luminosità|Helderheid|Яркость|亮度|明るさ|밝기|السطوع|चमक|Parlaklık|Jasność|Ljusstyrka|Kecerahan|Độ sáng|ความสว่าง|Яскравість
COLOR=Color|Couleur|Farbe|Cor|Colore|Kleur|Цвет|颜色|カラー|색상|اللون|रंग|Renk|Kolor|Färg|Warna|Màu sắc|สี|Колір
VIBRACIÓN=Vibration|Vibration|Vibration|Vibração|Vibrazione|Trillen|Вибрация|振动|振動|진동|الاهتزاز|कंपन|Titreşim|Wibracje|Vibration|Getar|Rung|การสั่น|Вібрація
CALIDAD=Quality|Qualité|Qualität|Qualidade|Qualità|Kwaliteit|Качество|画质|品質|품질|الجودة|गुणवत्ता|Kalite|Jakość|Kvalitet|Kualitas|Chất lượng|คุณภาพ|Якість
REDUCIR EFECTOS=Reduce effects|Réduire les effets|Effekte reduzieren|Reduzir efeitos|Riduci effetti|Effecten beperken|Меньше эффектов|减少特效|エフェクト軽減|효과 줄이기|تقليل المؤثرات|प्रभाव कम करें|Efektleri azalt|Mniej efektów|Minska effekter|Kurangi efek|Giảm hiệu ứng|ลดเอฟเฟกต์|Менше ефектів
SENSIBILIDAD=Sensitivity|Sensibilité|Empfindlichkeit|Sensibilidade|Sensibilità|Gevoeligheid|Чувствительность|灵敏度|感度|감도|الحساسية|संवेदनशीलता|Hassasiyet|Czułość|Känslighet|Sensitivitas|Độ nhạy|ความไว|Чутливість
VELOCIDAD=Speed|Vitesse|Geschwindigkeit|Velocidade|Velocità|Snelheid|Скорость|速度|スピード|속도|السرعة|गति|Hız|Prędkość|Hastighet|Kecepatan|Tốc độ|ความเร็ว|Швидкість
PANTALLA COMPLETA=Fullscreen|Plein écran|Vollbild|Tela cheia|Schermo intero|Volledig scherm|Полный экран|全屏|全画面|전체 화면|ملء الشاشة|फ़ुल स्क्रीन|Tam ekran|Pełny ekran|Helskärm|Layar penuh|Toàn màn hình|เต็มจอ|На весь екран
LISTO=DONE|OK|FERTIG|PRONTO|FATTO|KLAAR|ГОТОВО|完成|完了|완료|تم|हो गया|TAMAM|GOTOWE|KLAR|SELESAI|XONG|เสร็จสิ้น|ГОТОВО
RESTABLECER=RESET|RÉINITIALISER|ZURÜCKSETZEN|REDEFINIR|RIPRISTINA|HERSTELLEN|СБРОС|重置|リセット|초기화|إعادة ضبط|रीसेट|SIFIRLA|RESETUJ|ÅTERSTÄLL|RESET|ĐẶT LẠI|รีเซ็ต|СКИНУТИ
CERRAR SESIÓN=LOG OUT|SE DÉCONNECTER|ABMELDEN|SAIR|ESCI|UITLOGGEN|ВЫЙТИ|退出登录|ログアウト|로그아웃|تسجيل الخروج|लॉग आउट|ÇIKIŞ YAP|WYLOGUJ|LOGGA UT|KELUAR|ĐĂNG XUẤT|ออกจากระบบ|ВИЙТИ
TU CUENTA=YOUR ACCOUNT|TON COMPTE|DEIN KONTO|SUA CONTA|IL TUO ACCOUNT|JE ACCOUNT|ВАШ АККАУНТ|你的账号|アカウント|내 계정|حسابك|आपका खाता|HESABIN|TWOJE KONTO|DITT KONTO|AKUN ANDA|TÀI KHOẢN|บัญชีของคุณ|ВАШ АКАУНТ
ENTRAR=LOG IN|CONNEXION|ANMELDEN|ENTRAR|ACCEDI|INLOGGEN|ВОЙТИ|登录|ログイン|로그인|دخول|लॉग इन|GİRİŞ|ZALOGUJ|LOGGA IN|MASUK|ĐĂNG NHẬP|เข้าสู่ระบบ|УВІЙТИ
CREAR USUARIO=CREATE USER|CRÉER UN COMPTE|KONTO ERSTELLEN|CRIAR USUÁRIO|CREA UTENTE|GEBRUIKER MAKEN|СОЗДАТЬ АККАУНТ|创建用户|ユーザー作成|계정 만들기|إنشاء مستخدم|खाता बनाएं|KULLANICI OLUŞTUR|UTWÓRZ KONTO|SKAPA ANVÄNDARE|BUAT AKUN|TẠO TÀI KHOẢN|สร้างผู้ใช้|СТВОРИТИ АКАУНТ
YA TENGO UN USUARIO=I ALREADY HAVE AN ACCOUNT|J'AI DÉJÀ UN COMPTE|ICH HABE SCHON EIN KONTO|JÁ TENHO UMA CONTA|HO GIÀ UN ACCOUNT|IK HEB AL EEN ACCOUNT|У МЕНЯ ЕСТЬ АККАУНТ|我已有账号|アカウントあり|이미 계정이 있어요|لدي حساب|मेरे पास खाता है|HESABIM VAR|MAM JUŻ KONTO|JAG HAR REDAN KONTO|SAYA SUDAH PUNYA AKUN|TÔI ĐÃ CÓ TÀI KHOẢN|ฉันมีบัญชีแล้ว|Я ВЖЕ МАЮ АКАУНТ
ENTRAR COMO INVITADO=PLAY AS GUEST|JOUER EN INVITÉ|ALS GAST SPIELEN|ENTRAR COMO CONVIDADO|ENTRA COME OSPITE|ALS GAST SPELEN|ВОЙТИ ГОСТЕМ|游客进入|ゲストで入る|게스트로 입장|الدخول كضيف|अतिथि के रूप में|MİSAFİR GİRİŞİ|WEJDŹ JAKO GOŚĆ|SPELA SOM GÄST|MASUK TAMU|VÀO KHÁCH|เข้าเป็นแขก|УВІЙТИ ГОСТЕМ
NOMBRE DE USUARIO=Username|Nom d'utilisateur|Benutzername|Usuário|Nome utente|Gebruikersnaam|Имя пользователя|用户名|ユーザー名|사용자 이름|اسم المستخدم|उपयोगकर्ता नाम|Kullanıcı adı|Nazwa użytkownika|Användarnamn|Nama pengguna|Tên người dùng|ชื่อผู้ใช้|Ім'я користувача
CONTRASEÑA=Password|Mot de passe|Passwort|Senha|Password|Wachtwoord|Пароль|密码|パスワード|비밀번호|كلمة المرور|पासवर्ड|Şifre|Hasło|Lösenord|Kata sandi|Mật khẩu|รหัสผ่าน|Пароль
CORREO ELECTRÓNICO=Email|E-mail|E-Mail|E-mail|Email|E-mail|Эл. почта|邮箱|メール|이메일|البريد|ईमेल|E-posta|E-mail|E-post|Email|Email|อีเมล|Ел. пошта
PAUSA=PAUSE|PAUSE|PAUSE|PAUSA|PAUSA|PAUZE|ПАУЗА|暂停|ポーズ|일시정지|إيقاف مؤقت|रुकें|DURAKLAT|PAUZA|PAUS|JEDA|TẠM DỪNG|หยุดชั่วคราว|ПАУЗА
SEGUIR JUGANDO=KEEP PLAYING|CONTINUER|WEITERSPIELEN|CONTINUAR|CONTINUA|DOORSPELEN|ПРОДОЛЖИТЬ|继续游戏|続ける|계속하기|متابعة اللعب|खेलते रहें|DEVAM ET|GRAJ DALEJ|FORTSÄTT|LANJUT MAIN|TIẾP TỤC|เล่นต่อ|ПРОДОВЖИТИ
REPETIR=RESTART|RECOMMENCER|NEU STARTEN|REPETIR|RIPETI|OPNIEUW|ЗАНОВО|重玩|やり直す|다시 시작|إعادة|दोबारा|TEKRAR|OD NOWA|STARTA OM|ULANGI|CHƠI LẠI|เริ่มใหม่|ЗНОВУ
RENDIRSE=SURRENDER|ABANDONNER|AUFGEBEN|DESISTIR|ARRENDITI|OPGEVEN|СДАТЬСЯ|认输|降参|항복|استسلام|हार मानें|PES ET|PODDAJ SIĘ|GE UPP|MENYERAH|ĐẦU HÀNG|ยอมแพ้|ЗДАТИСЯ
VOLVER A JUGAR=PLAY AGAIN|REJOUER|NOCHMAL SPIELEN|JOGAR NOVAMENTE|GIOCA ANCORA|OPNIEUW SPELEN|ИГРАТЬ СНОВА|再玩一次|もう一度|다시 하기|العب مجددًا|फिर खेलें|TEKRAR OYNA|ZAGRAJ PONOWNIE|SPELA IGEN|MAIN LAGI|CHƠI LẠI|เล่นอีกครั้ง|ГРАТИ ЗНОВУ
MENÚ=MENU|MENU|MENÜ|MENU|MENU|MENU|МЕНЮ|菜单|メニュー|메뉴|القائمة|मेनू|MENÜ|MENU|MENY|MENU|MENU|เมนู|МЕНЮ
VOLVER=BACK|RETOUR|ZURÜCK|VOLTAR|INDIETRO|TERUG|НАЗАД|返回|戻る|뒤로|رجوع|वापस|GERİ|WRÓĆ|TILLBAKA|KEMBALI|QUAY LẠI|กลับ|НАЗАД
CLASIFICACIÓN=LEADERBOARD|CLASSEMENT|BESTENLISTE|CLASSIFICAÇÃO|CLASSIFICA|RANGLIJST|ТАБЛИЦА ЛИДЕРОВ|排行榜|ランキング|순위|لوحة المتصدرين|लीडरबोर्ड|LİDER TABLOSU|RANKING|TOPPLISTA|PAPAN PERINGKAT|BẢNG XẾP HẠNG|ลีดเดอร์บอร์ด|ТАБЛИЦЯ ЛІДЕРІВ
NIVEL=LEVEL|NIVEAU|LEVEL|NÍVEL|LIVELLO|NIVEAU|УРОВЕНЬ|等级|レベル|레벨|المستوى|स्तर|SEVİYE|POZIOM|NIVÅ|LEVEL|CẤP|เลเวล|РІВЕНЬ
INICIO=HOME|ACCUEIL|START|INÍCIO|HOME|START|ГЛАВНАЯ|首页|ホーム|홈|الرئيسية|होम|ANA SAYFA|START|HEM|BERANDA|TRANG CHỦ|หน้าหลัก|ГОЛОВНА
PERFIL=PROFILE|PROFIL|PROFIL|PERFIL|PROFILO|PROFIEL|ПРОФИЛЬ|资料|プロフィール|프로필|الملف|प्रोफ़ाइल|PROFİL|PROFIL|PROFIL|PROFIL|HỒ SƠ|โปรไฟล์|ПРОФІЛЬ
TU PROGRESO=YOUR PROGRESS|TA PROGRESSION|DEIN FORTSCHRITT|SEU PROGRESSO|I TUOI PROGRESSI|JE VOORTGANG|ВАШ ПРОГРЕСС|你的进度|進捗|내 진행도|تقدمك|आपकी प्रगति|İLERLEMEN|TWÓJ POSTĘP|DINA FRAMSTEG|KEMAJUANMU|TIẾN ĐỘ|ความคืบหน้า|ВАШ ПРОГРЕС
PARTIDAS=GAMES|PARTIES|SPIELE|PARTIDAS|PARTITE|SPELLEN|ИГРЫ|对局|試合|경기|المباريات|मैच|MAÇLAR|GRY|SPEL|PERMAINAN|TRẬN|เกม|ІГРИ
VICTORIAS=WINS|VICTOIRES|SIEGE|VITÓRIAS|VITTORIE|OVERWINNINGEN|ПОБЕДЫ|胜利|勝利|승리|الانتصارات|जीत|ZAFERLER|ZWYCIĘSTWA|SEGRAR|KEMENANGAN|CHIẾN THẮNG|ชัยชนะ|ПЕРЕМОГИ
IDIOMA=LANGUAGE|LANGUE|SPRACHE|IDIOMA|LINGUA|TAAL|ЯЗЫК|语言|言語|언어|اللغة|भाषा|DİL|JĘZYK|SPRÅK|BAHASA|NGÔN NGỮ|ภาษา|МОВА
SIGUIENTE=NEXT|SUIVANT|WEITER|PRÓXIMO|AVANTI|VOLGENDE|ДАЛЕЕ|下一步|次へ|다음|التالي|अगला|İLERİ|DALEJ|NÄSTA|LANJUT|TIẾP|ถัดไป|ДАЛІ
SALTAR=SKIP|PASSER|ÜBERSPRINGEN|PULAR|SALTA|OVERSLAAN|ПРОПУСТИТЬ|跳过|スキップ|건너뛰기|تخطي|छोड़ें|ATLA|POMIŃ|HOPPA ÖVER|LEWATI|BỎ QUA|ข้าม|ПРОПУСТИТИ
COMENZAR TUTORIAL=START TUTORIAL|COMMENCER LE TUTO|TUTORIAL STARTEN|INICIAR TUTORIAL|AVVIA TUTORIAL|START TUTORIAL|НАЧАТЬ ОБУЧЕНИЕ|开始教程|チュートリアル開始|튜토리얼 시작|ابدأ الشرح|ट्यूटोरियल शुरू करें|ÖĞRETİCİYİ BAŞLAT|ROZPOCZNIJ SAMOUCZEK|STARTA GUIDEN|MULAI TUTORIAL|BẮT ĐẦU HƯỚNG DẪN|เริ่มสอนเล่น|ПОЧАТИ НАВЧАННЯ
ENTRAR AL JUEGO=ENTER THE GAME|ENTRER DANS LE JEU|INS SPIEL|ENTRAR NO JOGO|ENTRA NEL GIOCO|NAAR HET SPEL|В ИГРУ|进入游戏|ゲームへ|게임 입장|ادخل اللعبة|खेल में जाएं|OYUNA GİR|WEJDŹ DO GRY|TILL SPELET|MASUK GAME|VÀO GAME|เข้าเกม|У ГРУ
VER TUTORIAL=VIEW TUTORIAL|VOIR LE TUTO|TUTORIAL ANSEHEN|VER TUTORIAL|VEDI TUTORIAL|BEKIJK TUTORIAL|ОБУЧЕНИЕ|查看教程|チュートリアルを見る|튜토리얼 보기|عرض الشرح|ट्यूटोरियल देखें|ÖĞRETİCİ|ZOBACZ SAMOUCZEK|VISA GUIDEN|LIHAT TUTORIAL|XEM HƯỚNG DẪN|ดูสอนเล่น|ПЕРЕГЛЯНУТИ НАВЧАННЯ`;
const D={};RAW.split('\n').forEach(l=>{const i=l.indexOf('=');if(i>0)D[l.slice(0,i)]=l.slice(i+1).split('|')});
let L=LS('dmr_lang29')||'es';if(!LG.some(z=>z[0]===L))L='es';
const lidx=()=>LG.findIndex(z=>z[0]===L)-1;
function trs(o){if(L==='es')return o;const m=o.match(/^([^\p{L}\p{N}]*)([\s\S]*?)(\s*)$/u);if(!m||!m[2])return o;const rest=m[2],key=rest.toUpperCase().replace(/\s+/g,' ');
 const up=rest===rest.toUpperCase();let d=D[key],suf='';
 if(!d){const n=key.match(/^NIVEL\s+(\S.*)$/);if(n&&D.NIVEL){d=D.NIVEL;suf=' '+n[1]}}
 if(!d)return o;let v=d[lidx()]||d[0];if(!v)return o;if(up)v=v.toUpperCase();return m[1]+v+suf+m[3]}
const ROOTS=['menu','acc','set','gm','end','nm','rnk','msn','ach','fr2','bn29','pg29','lp29','tut29'];
let busyT=false,obs=null,tmr=0;
function walk(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];let n;while((n=w.nextNode()))list.push(n);
 list.forEach(n=>{const p=n.parentNode&&n.parentNode.nodeName;if(/^(SCRIPT|STYLE|TEXTAREA)$/.test(p))return;
  if(!(n.__t!==undefined&&n.nodeValue===n.__t))n.__o=n.nodeValue;
  const t=trs(n.__o);if(t!==n.nodeValue)n.nodeValue=t;n.__t=n.nodeValue});
 root.querySelectorAll('input[placeholder]').forEach(i=>{if(!(i.__pt!==undefined&&i.placeholder===i.__pt))i.__po=i.placeholder;const t=trs(i.__po);if(t!==i.placeholder)i.placeholder=t;i.__pt=i.placeholder})}
function applyLang(){busyT=true;try{ROOTS.forEach(id=>{const r=$(id);if(r)walk(r)})}catch(e){}if(obs)obs.takeRecords();busyT=false;const c=$('lg29');if(c)c.textContent='🌐 '+L.toUpperCase()}
function schedule(){if(busyT)return;clearTimeout(tmr);tmr=setTimeout(applyLang,120)}
obs=new MutationObserver(schedule);obs.observe(document.body,{childList:true,subtree:true,characterData:true});

/* selector de idioma */
document.head.insertAdjacentHTML('beforeend',`<style>
#lg29{position:fixed;right:12px;bottom:calc(88px + env(safe-area-inset-bottom,0px));z-index:31;display:none;align-items:center;gap:4px;padding:8px 13px;border-radius:20px;border:2px solid #37d6ff;background:rgba(5,10,40,.92);color:#fff;font-size:13px;font-weight:900;letter-spacing:1px;box-shadow:0 0 14px rgba(55,214,255,.55);touch-action:manipulation}
#lp29{position:fixed;inset:0;z-index:9400;background:rgba(0,0,10,.85);display:flex;align-items:center;justify-content:center;padding:12px;touch-action:manipulation}
#lp29 .pn{width:min(100%,420px);max-height:90vh;display:flex;flex-direction:column;gap:10px;background:rgba(7,11,34,.98);border:2px solid #2a6bff;border-radius:22px;padding:14px;box-shadow:0 0 30px rgba(42,107,255,.5)}
#lp29 h3{text-align:center;letter-spacing:4px;font-size:15px}
#lp29 .gr{display:grid;grid-template-columns:1fr 1fr;gap:8px;overflow-y:auto;padding:2px}
#lp29 .gr button{display:flex;align-items:center;gap:8px;padding:11px 10px;border-radius:12px;border:2px solid #1d4fc4;background:#0a1030;color:#fff;font-size:13px;font-weight:700;text-align:left}
#lp29 .gr button.on{border-color:#37d6ff;background:rgba(0,90,200,.4);box-shadow:0 0 12px #00c8ff}
#lp29 .gr b{font-size:20px}
#lp29 .ac{display:flex;gap:8px}#lp29 .ac button{flex:1;padding:12px;border-radius:12px;border:2px solid #2a6bff;background:#0a1030;color:#fff;font-weight:800;font-size:12px}
</style>`);
document.body.insertAdjacentHTML('beforeend','<button id="lg29" type="button" aria-label="Idioma"></button><div id="lp29" class="hide"><div class="pn"><h3>🌐 <span>IDIOMA</span></h3><div class="gr" id="lgr"></div><div class="ac"><button type="button" id="lpT"><span>VER TUTORIAL</span></button><button type="button" id="lpX"><span>VOLVER</span></button></div></div></div>');
function drawLangs(){const g=$('lgr');g.innerHTML='';LG.forEach(z=>{const b=document.createElement('button');b.type='button';b.className=z[0]===L?'on':'';b.innerHTML='<b>'+z[2]+'</b>'+z[1];b.onclick=()=>{L=z[0];LS('dmr_lang29',L);try{SFX.click()}catch(e){}drawLangs();applyLang()};g.appendChild(b)})}
$('lg29').onclick=()=>{try{au();SFX.click()}catch(e){}drawLangs();$('lp29').classList.remove('hide');applyLang()};
$('lpX').onclick=()=>{try{SFX.click()}catch(e){}$('lp29').classList.add('hide')};
$('lpT').onclick=()=>{try{SFX.click()}catch(e){}$('lp29').classList.add('hide');tutStart(true)};
setInterval(()=>{const c=$('lg29');if(!c)return;const v=(!$('menu').classList.contains('hide')||!$('acc').classList.contains('hide'))&&$('tut29').classList.contains('hide')&&$('lp29').classList.contains('hide');c.style.display=v?'flex':'none';if(!c.textContent)c.textContent='🌐 '+L.toUpperCase()},600);

/* =========================================================
   2) LOBBY: fondo con el león + barra inferior + tu progreso
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style>
#menu{background:linear-gradient(180deg,rgba(2,3,12,.55),rgba(2,3,12,.86)),url(./lion.png) center/cover no-repeat!important}
#menu #m2{padding-bottom:98px!important}
#pg29{width:100%;display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:20px;border:2px solid #2a6bff;background:linear-gradient(180deg,rgba(14,26,80,.78),rgba(4,8,30,.9));box-shadow:0 0 16px rgba(42,107,255,.35)}
#pg29 .hx{flex:none;width:72px;height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#2a2fd0,#10145a);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
#pg29 .hx small{font-size:9px;letter-spacing:2px;opacity:.85}#pg29 .hx b{font-size:28px;line-height:1}
#pg29 .pr{flex:1;min-width:0}#pg29 h4{font-size:11px;letter-spacing:3px;margin-bottom:6px;color:#9fc4ff}
#pg29 .st{display:flex;gap:16px}#pg29 .st div{display:flex;flex-direction:column;font-size:11px;opacity:.95}#pg29 .st b{font-size:20px}#pg29 .st small{font-size:9px;letter-spacing:1px;opacity:.75}
#pg29 .bar{height:8px;border-radius:5px;background:#ffffff22;margin:8px 0 3px;overflow:hidden}#pg29 .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--a),var(--b))}
#pg29 #pgX{font-size:10px;opacity:.75}
#bn29{position:fixed;left:0;right:0;bottom:0;z-index:8;display:flex;padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px));background:linear-gradient(180deg,rgba(5,10,40,.94),rgba(2,3,14,.98));border-top:2px solid #2a6bff;border-radius:22px 22px 0 0;box-shadow:0 -4px 22px rgba(42,107,255,.45);touch-action:manipulation}
#bn29 button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;background:none;border:0;color:#aab8ee;font-size:10px;font-weight:800;letter-spacing:1px;border-radius:12px}
#bn29 button i{font-style:normal;font-size:22px}#bn29 button.on{color:#fff;text-shadow:0 0 10px var(--b)}
#bn29 button.on::after{content:"";width:34px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--a),var(--b));margin-top:2px}
</style>`);
$('nPlay').insertAdjacentHTML('afterend','<div id="pg29"><div class="hx"><small>NIVEL</small><b id="pgL">1</b></div><div class="pr"><h4>TU PROGRESO</h4><div class="st"><div><b id="pgG">0</b><small>PARTIDAS</small></div><div><b id="pgW">0</b><small>VICTORIAS</small></div></div><div class="bar"><i id="pgB"></i></div><small id="pgX">0 XP</small></div></div>');
document.body.insertAdjacentHTML('beforeend','<div id="bn29" class="hide"><button type="button" data-a="h" class="on"><i>🏠</i><span>INICIO</span></button><button type="button" data-a="a"><i>👥</i><span>AMIGOS</span></button><button type="button" data-a="r"><i>🏆</i><span>RANKING</span></button><button type="button" data-a="p"><i>👤</i><span>PERFIL</span></button></div>');
$('bn29').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;try{au();SFX.click()}catch(er){}const a=b.dataset.a;
 if(a==='h')$('menu').scrollTo({top:0,behavior:'smooth'});
 else if(a==='a'){const x=$('tpFr');if(x)x.click()}
 else if(a==='r')$('nRk').click();
 else if(a==='p')$('pf').click()});
function prog(){const vis=!$('menu').classList.contains('hide');$('bn29').classList.toggle('hide',!vis);if(!vis)return;
 const Lv=plv(),xp=prof.xp||0,base=XP_PER_LV*(Lv-1);$('pgL').textContent=Lv;$('pgG').textContent=(prof.w||0)+(prof.l||0);$('pgW').textContent=prof.w||0;
 $('pgB').style.width=(Lv>=100?100:clampN((xp-base)/XP_PER_LV*100,0,100))+'%';$('pgX').textContent=Lv>=100?'MAX':(xp-base)+' / '+XP_PER_LV+' XP'}
setInterval(prog,800);

/* =========================================================
   3) TUTORIAL GUIADO (solo usuario nuevo o invitado)
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style>
#tut29{position:fixed;inset:0;z-index:9500;touch-action:none}
#tut29 .tb{position:absolute;inset:0}
#tut29.w .tb{background:linear-gradient(180deg,rgba(2,3,12,.55),rgba(2,3,12,.9)),url(./lion.png) center/cover no-repeat}
#tut29 .ts{position:fixed;border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,12,.84),0 0 0 3px #37d6ff,0 0 26px #37d6ff;transition:all .3s ease;pointer-events:none}
#tut29.w .ts,#tut29.w .tf{display:none}
#tut29 .tf{position:fixed;font-size:46px;line-height:1;pointer-events:none;filter:drop-shadow(0 0 8px #000);animation:tf29 1s ease-in-out infinite;transition:left .3s,top .3s}
@keyframes tf29{50%{transform:translateY(-10px) scale(1.1)}}
#tut29 .tc{position:fixed;left:12px;right:12px;max-width:440px;margin:0 auto;padding:14px 16px;border-radius:20px;border:2px solid #2a6bff;background:linear-gradient(180deg,rgba(10,20,70,.97),rgba(3,6,26,.98));box-shadow:0 0 30px rgba(42,107,255,.6);display:flex;flex-direction:column;gap:8px}
#tut29.w .tc{top:50%!important;bottom:auto!important;transform:translateY(-50%)}
#tut29 .tc h3{font-size:17px;letter-spacing:1px}#tut29 .tc p{font-size:14px;line-height:1.45;opacity:.95}
#tut29 .tc small{font-size:11px;opacity:.7;letter-spacing:2px}
#tut29 .ac{display:flex;gap:8px;margin-top:4px}
#tut29 .ac button{padding:12px 14px;border-radius:14px;border:2px solid #2a6bff;background:#0a1030;color:#fff;font-size:13px;font-weight:900;letter-spacing:1px}
#tut29 .ac button.go{flex:1;background:linear-gradient(90deg,var(--a),var(--b));border-color:#fff5}
</style>`);
document.body.insertAdjacentHTML('beforeend','<div id="tut29" class="hide"><div class="tb"></div><div class="ts"></div><div class="tf">👆</div><div class="tc"></div></div>');
const TUT={
 wT:{es:'¡BIENVENIDO A D.M.R PING PONG!',en:'WELCOME TO D.M.R PING PONG!'},
 wD:{es:'Te voy a guiar paso a paso para que domines el juego. Te llevará menos de un minuto y solo lo verás una vez.',en:"I'll guide you step by step so you can master the game. It takes less than a minute and you'll only see it once."},
 dT:{es:'¡TUTORIAL COMPLETADO!',en:'TUTORIAL COMPLETE!'},
 dD:{es:'Ya conoces las funciones principales. ¡Es hora de jugar y subir en el ranking!',en:'You now know the main features. Time to play and climb the ranking!'}};
const STEPS=[
 {id:'pf',k:'PERFIL',es:'Aquí cambias tu nombre, tu foto, tu tarjeta y tus efectos.',en:'Change your name, photo, card and effects here.'},
 {id:'pcTop',k:'DOP',es:'Estas son tus monedas DOP. Úsalas en la tienda para comprar artículos.',en:'These are your DOP coins. Spend them in the shop.'},
 {id:'nPlay',k:'JUGAR',es:'Toca JUGAR para empezar tu próxima partida contra el bot.',en:'Tap PLAY to start your next match against the bot.'},
 {id:'n2p',k:'2 JUGADORES',es:'Juega con un amigo en el mismo dispositivo.',en:'Play with a friend on the same device.'},
 {id:'nLv',k:'NIVELES',es:'Supera 100 niveles con retos, puertas y eventos especiales.',en:'Beat 100 levels with challenges, doors and special events.'},
 {id:'nOn',k:'ONLINE',es:'Busca rivales en línea o invita a tus amigos a jugar.',en:'Find online rivals or invite your friends.'},
 {id:'nSh',k:'TIENDA',es:'Compra paletas, pelotas, fondos y más con tus monedas DOP.',en:'Buy paddles, balls, backgrounds and more with DOP.'},
 {id:'nMs',k:'MISIONES',es:'Completa misiones diarias para ganar recompensas.',en:'Complete daily missions to earn rewards.'},
 {id:'nAc',k:'LOGROS',es:'Mira los logros que has conseguido y los que te faltan.',en:'See the achievements you have and the ones left.'},
 {id:'nRk',k:'RANKING',es:'Consulta la clasificación de los mejores jugadores.',en:'Check the leaderboard of the best players.'},
 {id:'lg29',k:'IDIOMA',es:'Cambia el idioma del juego cuando quieras.',en:'Change the game language whenever you want.'}];
const tt=o=>o[L]||o.en||o.es;
let running=false,ti=0,gate=null;
const T=$('tut29');
function tcard(h){T.querySelector('.tc').innerHTML=h;applyLang()}
function tut_welcome(){T.classList.add('w');T.classList.remove('hide');running=true;
 tcard('<h3>'+tt(TUT.wT)+'</h3><p>'+tt(TUT.wD)+'</p><div class="ac"><button class="go" type="button" id="tG"><span>COMENZAR TUTORIAL</span></button><button type="button" id="tS"><span>SALTAR</span></button></div>');
 $('tG').onclick=()=>{try{SFX.click()}catch(e){}ti=0;tut_step(0)};$('tS').onclick=tut_end}
function tut_step(i){
 while(i<STEPS.length){const el=$(STEPS[i].id);if(el&&el.getBoundingClientRect().width>0&&getComputedStyle(el).display!=='none')break;i++}
 if(i>=STEPS.length)return tut_done();ti=i;const s=STEPS[i],el=$(s.id);T.classList.remove('w');
 try{el.scrollIntoView({block:'center'})}catch(e){}
 setTimeout(()=>{const r=el.getBoundingClientRect(),sp=T.querySelector('.ts'),f=T.querySelector('.tf'),c=T.querySelector('.tc'),p=6;
  sp.style.left=(r.left-p)+'px';sp.style.top=(r.top-p)+'px';sp.style.width=(r.width+p*2)+'px';sp.style.height=(r.height+p*2)+'px';
  const up=r.top+r.height/2<innerHeight/2;f.textContent=up?'👆':'👇';f.style.left=clampN(r.left+r.width/2-22,4,innerWidth-52)+'px';f.style.top=(up?r.bottom-2:r.top-52)+'px';
  c.style.top=up?'auto':'calc(14px + env(safe-area-inset-top,0px))';c.style.bottom=up?'calc(16px + env(safe-area-inset-bottom,0px))':'auto';
  const last=i===STEPS.length-1;
  tcard('<small>'+(i+1)+' / '+STEPS.length+'</small><h3>'+(s.k==='DOP'?'DOP':'<span>'+s.k+'</span>')+'</h3><p>'+tt(s)+'</p><div class="ac"><button class="go" type="button" id="tN"><span>SIGUIENTE</span></button><button type="button" id="tS"><span>SALTAR</span></button></div>');
  $('tN').onclick=()=>{try{SFX.click()}catch(e){}tut_step(i+1)};$('tS').onclick=tut_end},300)}
function tut_done(){T.classList.add('w');tcard('<h3>'+tt(TUT.dT)+'</h3><p>'+tt(TUT.dD)+'</p><div class="ac"><button class="go" type="button" id="tG"><span>ENTRAR AL JUEGO</span></button></div>');$('tG').onclick=tut_end}
function tut_end(){LS('dmr_tut29','1');T.classList.add('hide');T.classList.remove('w');running=false;try{$('menu').scrollTo({top:0})}catch(e){}}
function tutStart(force){if(running)return;if(!force&&LS('dmr_tut29'))return;clearInterval(gate);let n=0;
 gate=setInterval(()=>{n++;if(n>150){clearInterval(gate);return}
  if(!$('menu').classList.contains('hide')&&$('acc').classList.contains('hide')&&$('md').classList.contains('hide')&&$('lp29').classList.contains('hide')){clearInterval(gate);tut_welcome()}},400)}
/* cuándo mostrarlo: usuario nuevo o invitado */
let newFlag=false;
$('aGu').addEventListener('click',()=>{newFlag=true});
$('aIn').addEventListener('click',()=>{try{if(acCreate)newFlag=true}catch(e){}});
new MutationObserver(()=>{if($('acc').classList.contains('hide')&&newFlag){const ok=(typeof ME!=='undefined'&&ME)||(typeof guest!=='undefined'&&guest);if(ok){newFlag=false;tutStart(false)}}}).observe($('acc'),{attributes:true,attributeFilter:['class']});
/* oculta el tutorial viejo para que no se mezcle con este */
let kt=0;
new MutationObserver(()=>{clearTimeout(kt);kt=setTimeout(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(!/BIENVENIDO A D\.M\.R PING PONG|COMENZAR TUTORIAL/i.test(n.nodeValue))continue;let e=n.parentElement;if(!e||e.closest('#tut29,#lp29'))continue;
  while(e&&e!==document.body){if(getComputedStyle(e).position==='fixed'){e.style.display='none';break}e=e.parentElement}}},300)}).observe(document.body,{childList:true,subtree:true});

/* =========================================================
   4) FOTO DE PERFIL: ajustar antes de guardar y que no se pierda
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style>
#cr29{position:fixed;inset:0;z-index:9300;background:rgba(0,0,10,.9);display:flex;align-items:center;justify-content:center;padding:12px;touch-action:none}
#cr29 .pn{width:min(100%,340px);display:flex;flex-direction:column;gap:10px;background:rgba(7,11,34,.98);border:2px solid #2a6bff;border-radius:22px;padding:14px;box-shadow:0 0 30px rgba(42,107,255,.5);text-align:center}
#cr29 canvas{width:260px;height:260px;max-width:100%;align-self:center;border-radius:16px;border:2px solid #37d6ff;touch-action:none;background:#070b22}
#cr29 small{font-size:11px;opacity:.8;line-height:1.4}#cr29 input[type=range]{width:100%;touch-action:auto}
#cr29 .ac{display:flex;gap:8px}#cr29 .ac button{flex:1;padding:12px;border-radius:12px;border:2px solid #2a6bff;background:#0a1030;color:#fff;font-weight:800;font-size:13px}
#cr29 .ac button.go{background:linear-gradient(90deg,var(--a),var(--b));border-color:#fff5}
</style>`);
function crop(im){const S=260,iw=im.width,ih=im.height,s0=S/Math.min(iw,ih),smin=S/Math.max(iw,ih),smax=s0*3;let sc=s0,ox=0,oy=0;
 const o=document.createElement('div');o.id='cr29';o.innerHTML='<div class="pn"><b>📷 AJUSTA TU FOTO</b><canvas id="crC" width="260" height="260"></canvas><input id="crR" type="range" min="0" max="100" value="'+Math.round((s0-smin)/(smax-smin)*100)+'"><small>Arrastra para mover y usa la barra para acercar o alejar. Solo foto de tu cara o de ti con ropa. No se permiten desnudos, ropa interior ni contenido sexual o violento. Si la reportan y se revisa, se retira.</small><div class="ac"><button type="button" id="crX">CANCELAR</button><button type="button" class="go" id="crG">GUARDAR FOTO</button></div></div>';
 document.body.appendChild(o);const cv=$('crC'),g=cv.getContext('2d');
 const draw=(g2,size)=>{const k=size/S;g2.fillStyle='#070b22';g2.fillRect(0,0,size,size);g2.save();g2.translate(size/2+ox*k,size/2+oy*k);g2.scale(sc*k,sc*k);g2.drawImage(im,-iw/2,-ih/2);g2.restore()};
 const paint=()=>{draw(g,S);g.save();g.fillStyle='rgba(2,3,12,.62)';g.beginPath();g.rect(0,0,S,S);g.arc(S/2,S/2,S/2-6,0,6.283,true);g.fill();g.strokeStyle='#37d6ff';g.lineWidth=3;g.beginPath();g.arc(S/2,S/2,S/2-6,0,6.283);g.stroke();g.restore()};
 paint();let dr=null;
 cv.onpointerdown=e=>{dr={x:e.clientX,y:e.clientY};try{cv.setPointerCapture(e.pointerId)}catch(er){}};
 cv.onpointermove=e=>{if(!dr)return;ox=clampN(ox+(e.clientX-dr.x)*(S/cv.getBoundingClientRect().width),-S,S);oy=clampN(oy+(e.clientY-dr.y)*(S/cv.getBoundingClientRect().height),-S,S);dr={x:e.clientX,y:e.clientY};paint()};
 cv.onpointerup=cv.onpointercancel=()=>{dr=null};
 $('crR').oninput=e=>{sc=smin+(smax-smin)*(+e.target.value)/100;paint()};
 $('crX').onclick=()=>o.remove();
 $('crG').onclick=()=>{const c=document.createElement('canvas');c.width=c.height=256;draw(c.getContext('2d'),256);let q=.85,u=c.toDataURL('image/jpeg',q);while(u.length>55000&&q>.4){q-=.1;u=c.toDataURL('image/jpeg',q)}
  prof.photo=u;LS('dmr_ph_'+prof.id,u);saveP();try{setAv();buildAv()}catch(e){}o.remove();try{SFX.point()}catch(e){}toast('✔ Foto guardada')}}
$('upF').onchange=function(e){const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>crop(im);im.onerror=()=>toast('No se pudo leer la imagen');im.src=r.result};r.readAsDataURL(f)};
$('upB').insertAdjacentHTML('afterend','<button class="tg" id="upD" type="button">🗑 QUITAR MI FOTO</button>');
$('upD').onclick=()=>{try{SFX.click()}catch(e){}if(!prof.photo){toast('No tienes foto subida');return}LS('dmr_ph_'+prof.id,null);prof.photo='';saveP();try{setAv();buildAv()}catch(e){}toast('Foto quitada')};
/* si se pierde al iniciar sesión, se recupera de la copia guardada */
setInterval(()=>{try{if(!prof.photo){const b=LS('dmr_ph_'+prof.id);if(b&&/^data:image\/jpeg;base64,/.test(b)){prof.photo=b;try{setAv()}catch(e){}saveP()}}else if(LS('dmr_ph_'+prof.id)!==prof.photo)LS('dmr_ph_'+prof.id,prof.photo)}catch(e){}},1200);

/* =========================================================
   5) RANKING: aparece tu fila, con tu foto y tu tarjeta
   ========================================================= */
const EQN={};let eqT=0;
async function loadEq(){if(typeof fb==='undefined'||!fb||!ME||!SY||Date.now()-eqT<10000)return;eqT=Date.now();
 try{const s=await FS.getDocs(FS.query(FS.collection(fb.db,'players'),FS.orderBy('xp','desc'),FS.limit(80)));s.forEach(d=>{const x=d.data();if(x&&x.name)EQN[String(x.name).toLowerCase()]=x.eq||null})}catch(e){}}
const rname=r=>{const b=r.querySelector('.rkt b');if(!b)return'';const n=b.firstChild&&b.firstChild.nodeType===3?b.firstChild.nodeValue:b.textContent;return String(n||'').trim().toLowerCase()};
document.head.insertAdjacentHTML('beforeend','<style>.rk{position:relative;isolation:isolate}canvas.rc29{position:absolute;left:0;top:0;right:auto;bottom:auto;width:100%;height:100%;z-index:-1;pointer-events:none;border-radius:inherit}</style>');
function rankRows(t){const rl=$('rkL');if(!rl||$('rnk').classList.contains('hide'))return;let rows=[...rl.querySelectorAll('.rk')];if(!rows.length)return;
 const me=(prof.name||'').toLowerCase();
 if(!rows.some(r=>rname(r)===me)){const xp=prof.xp||0,r=document.createElement('div');r.className='rk';r.innerHTML='<b class="rkn"></b><div class="av"></div><span class="rkt"><b></b><small></small></span><b class="rkx"></b>';
  r.querySelector('.rkt b').textContent=prof.name||'PLAYER';r.querySelector('.rkt small').textContent='NIVEL '+plv();r.querySelector('.rkx').textContent=(window.fmt?fmt(xp):xp)+' XP';
  r.onclick=()=>{try{SFX.click();openPv(prof.id)}catch(e){}};
  const at=rows.find(z=>{const v=parseInt(String(z.querySelector('.rkx').textContent).replace(/\D/g,''))||0;return v<xp});at?rl.insertBefore(r,at):rl.appendChild(r);
  rows=[...rl.querySelectorAll('.rk')];rows.forEach((z,i)=>{const k=z.querySelector('.rkn');if(k)k.textContent=['🥇','🥈','🥉'][i]||(i+1)})}
 const ownEq=prof.eq||{},X=window.__X;
 rows.forEach(r=>{const n=rname(r),mine=n===me;
  if(mine){const a=r.querySelector('.av');if(a){const s=prof.photo||AVS[effAv()]||AVS[0],k=s.length+s.slice(-12);if(a.dataset.pk!==k){a.dataset.pk=k;a.style.backgroundImage='url("'+s+'")'}}}
  const eq=mine?ownEq:EQN[n],id=eq&&eq.tc,okOwn=!mine||VER||(prof.inv||[]).includes(id);let c=r.querySelector('canvas.rc29');
  if(!id||!okOwn||!X||!X.CD||!X.CD[id]){if(c)c.remove();return}
  const b=r.getBoundingClientRect();if(b.bottom<0||b.top>innerHeight)return;
  if(!c){c=document.createElement('canvas');c.className='rc29';r.insertBefore(c,r.firstChild)}
  const w=Math.max(60,Math.round(r.offsetWidth/2)),h=Math.max(20,Math.round(r.offsetHeight/2));if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);g.save();try{X.CD[id](g,w,h,t,h/70)}catch(e){}g.restore();g.fillStyle='rgba(4,6,22,.45)';g.fillRect(0,0,w,h)})}
let lt=0;
function loop(n){requestAnimationFrame(loop);if(n-lt<(SET.red?200:45))return;lt=n;try{rankRows(n/1000)}catch(e){}}
requestAnimationFrame(loop);
setInterval(()=>{if(!$('rnk').classList.contains('hide'))loadEq()},1500);

applyLang();
})();


/* ===== D.M.R v35: MENÚ NUEVO (perfil, rango, 12 idiomas, tarjetas, tutorial, recompensa diaria) =====
   PEGAR AL FINAL DE TODO TU CÓdigo, justo ANTES de </script>. No borres nada de lo anterior. */
(function(){
if(window.__dmr35)return;window.__dmr35=1;
const g=id=>document.getElementById(id);
const m=g('menu');if(!m)return;
const SRC='fondo.jpg',IW=1024,IH=1536,Y0=295,BH=545;   /* misma imagen y recorte que v34 */
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
const ls={get(k,d){try{const v=localStorage.getItem('dmr35_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('dmr35_'+k,JSON.stringify(v))}catch(e){}}};

/* ---------- IDIOMAS (orden fijo de textos, separados por |) ---------- */
const LANGS=[['es','Español','🇪🇸'],['en','English','🇬🇧'],['fr','Français','🇫🇷'],['pt','Português','🇧🇷'],['ar','العربية','🇸🇦'],['zh','中文简体','🇨🇳'],['ja','日本語','🇯🇵'],['ko','한국어','🇰🇷'],['de','Deutsch','🇩🇪'],['it','Italiano','🇮🇹'],['ru','Русский','🇷🇺'],['hi','हिन्दी','🇮🇳']];
const D={
es:`JUGAR|¡DEMUESTRA TU TALENTO!|CONTRA IA|Juega contra la máquina|2 JUGADORES|En el mismo dispositivo|ONLINE|Juega con el mundo|TORNEO|Compite y gana|TIENDA|Paletas, pelotas y más|MISIONES|Completa y gana|LOGROS|Desbloquea premios|RANKING|Los mejores jugadores|TUTORIAL|Aprende en minutos|RECOMPENSA DIARIA|¡Inicia sesión y recibe tu premio!|NIVELES|Mapa de niveles|NIVEL|RANGO ACTUAL|Siguiente rango|ENVIAR SUGERENCIA|PANEL MAESTRO|Omitir|Siguiente|¡Listo!|RECLAMAR|Vuelve mañana|Próximamente|TUTORIAL|Desliza el dedo para mover tu paleta.|Devuelve la pelota y gana puntos cuando tu rival falle.|Elige un modo: IA, 2 jugadores u online.|Usa la tienda para desbloquear paletas y pelotas.|Esta función estará disponible más adelante.|BRONCE|PLATA|ORO|PLATINO|DIAMANTE|MAESTRO|Recompensa|IDIOMA`,
en:`PLAY|SHOW YOUR TALENT!|VS AI|Play against the machine|2 PLAYERS|On the same device|ONLINE|Play with the world|TOURNAMENT|Compete and win|SHOP|Paddles, balls and more|MISSIONS|Complete and win|ACHIEVEMENTS|Unlock rewards|RANKING|The best players|TUTORIAL|Learn in minutes|DAILY REWARD|Log in and get your prize!|LEVELS|Level map|LEVEL|CURRENT RANK|Next rank|SEND FEEDBACK|MASTER PANEL|Skip|Next|Done!|CLAIM|Come back tomorrow|Coming soon|TUTORIAL|Swipe your finger to move your paddle.|Return the ball and score when your rival misses.|Pick a mode: AI, 2 players or online.|Use the shop to unlock paddles and balls.|This feature will be available later.|BRONZE|SILVER|GOLD|PLATINUM|DIAMOND|MASTER|Reward|LANGUAGE`,
fr:`JOUER|PROUVE TON TALENT !|CONTRE L'IA|Joue contre la machine|2 JOUEURS|Sur le même appareil|EN LIGNE|Joue avec le monde|TOURNOI|Participe et gagne|BOUTIQUE|Raquettes, balles et plus|MISSIONS|Termine et gagne|SUCCÈS|Débloque des récompenses|CLASSEMENT|Les meilleurs joueurs|TUTORIEL|Apprends en quelques minutes|RÉCOMPENSE QUOTIDIENNE|Connecte-toi et reçois ton cadeau !|NIVEAUX|Carte des niveaux|NIVEAU|RANG ACTUEL|Rang suivant|ENVOYER UNE SUGGESTION|PANNEAU MAÎTRE|Passer|Suivant|Terminé !|RÉCLAMER|Reviens demain|Bientôt disponible|TUTORIEL|Glisse le doigt pour déplacer ta raquette.|Renvoie la balle et marque quand ton adversaire rate.|Choisis un mode : IA, 2 joueurs ou en ligne.|Utilise la boutique pour débloquer raquettes et balles.|Cette fonction sera disponible plus tard.|BRONZE|ARGENT|OR|PLATINE|DIAMANT|MAÎTRE|Récompense|LANGUE`,
pt:`JOGAR|MOSTRE SEU TALENTO!|CONTRA A IA|Jogue contra a máquina|2 JOGADORES|No mesmo dispositivo|ONLINE|Jogue com o mundo|TORNEIO|Compita e ganhe|LOJA|Raquetes, bolas e mais|MISSÕES|Complete e ganhe|CONQUISTAS|Desbloqueie prêmios|RANKING|Os melhores jogadores|TUTORIAL|Aprenda em minutos|RECOMPENSA DIÁRIA|Faça login e receba seu prêmio!|NÍVEIS|Mapa de níveis|NÍVEL|RANK ATUAL|Próximo rank|ENVIAR SUGESTÃO|PAINEL MESTRE|Pular|Próximo|Pronto!|RESGATAR|Volte amanhã|Em breve|TUTORIAL|Deslize o dedo para mover sua raquete.|Devolva a bola e marque pontos quando o rival errar.|Escolha um modo: IA, 2 jogadores ou online.|Use a loja para desbloquear raquetes e bolas.|Este recurso estará disponível mais tarde.|BRONZE|PRATA|OURO|PLATINA|DIAMANTE|MESTRE|Recompensa|IDIOMA`,
ar:`العب|أظهر موهبتك!|ضد الذكاء الاصطناعي|العب ضد الآلة|لاعبان|على نفس الجهاز|أونلاين|العب مع العالم|بطولة|نافس واربح|المتجر|مضارب وكرات والمزيد|المهام|أكمل واربح|الإنجازات|افتح الجوائز|الترتيب|أفضل اللاعبين|الشرح|تعلّم في دقائق|المكافأة اليومية|سجّل الدخول واستلم جائزتك!|المستويات|خريطة المستويات|المستوى|الرتبة الحالية|الرتبة التالية|إرسال اقتراح|اللوحة الرئيسية|تخطي|التالي|تم!|استلام|عد غدًا|قريبًا|الشرح|مرّر إصبعك لتحريك مضربك.|أعد الكرة وسجّل نقطة عندما يخطئ خصمك.|اختر وضعًا: ذكاء اصطناعي أو لاعبان أو أونلاين.|استخدم المتجر لفتح المضارب والكرات.|ستتوفر هذه الميزة لاحقًا.|برونزي|فضي|ذهبي|بلاتيني|ألماسي|ماستر|المكافأة|اللغة`,
zh:`开始游戏|展现你的天赋！|对战AI|与电脑对战|双人对战|同一设备|在线|与全世界对战|锦标赛|比赛赢奖励|商店|球拍、乒乓球等|任务|完成任务赢奖励|成就|解锁奖励|排行榜|最强玩家|教程|几分钟学会|每日奖励|登录即可领取奖励！|关卡|关卡地图|等级|当前段位|下一段位|发送建议|管理面板|跳过|下一步|完成！|领取|明天再来|即将推出|教程|滑动手指移动球拍。|回击乒乓球，对手失误时得分。|选择模式：AI、双人或在线。|在商店解锁球拍和乒乓球。|该功能将在稍后开放。|青铜|白银|黄金|铂金|钻石|大师|奖励|语言`,
ja:`プレイ|才能を見せよう！|AIと対戦|コンピューターと対戦|2人対戦|同じ端末で|オンライン|世界と対戦|トーナメント|競って勝とう|ショップ|ラケット、ボールなど|ミッション|達成して報酬を獲得|実績|報酬を解放|ランキング|トッププレイヤー|チュートリアル|数分で学べる|デイリー報酬|ログインして報酬をゲット！|レベル|レベルマップ|レベル|現在のランク|次のランク|提案を送る|マスターパネル|スキップ|次へ|完了！|受け取る|また明日|近日公開|チュートリアル|指をスライドしてラケットを動かします。|ボールを打ち返し、相手がミスしたら得点。|モードを選択：AI、2人、オンライン。|ショップでラケットとボールを解放しよう。|この機能は後日利用できます。|ブロンズ|シルバー|ゴールド|プラチナ|ダイヤモンド|マスター|報酬|言語`,
ko:`플레이|실력을 보여주세요!|AI 대전|컴퓨터와 대결|2인 플레이|같은 기기에서|온라인|전 세계와 대결|토너먼트|경쟁하고 승리하세요|상점|라켓, 공 등|미션|완료하고 보상 받기|업적|보상 잠금 해제|랭킹|최고의 플레이어|튜토리얼|몇 분 만에 배우기|일일 보상|로그인하고 보상을 받으세요!|레벨|레벨 지도|레벨|현재 랭크|다음 랭크|건의 보내기|마스터 패널|건너뛰기|다음|완료!|받기|내일 다시 오세요|곧 출시|튜토리얼|손가락을 밀어 라켓을 움직이세요.|공을 받아치고 상대가 놓치면 득점하세요.|모드를 선택하세요: AI, 2인 또는 온라인.|상점에서 라켓과 공을 잠금 해제하세요.|이 기능은 나중에 제공됩니다.|브론즈|실버|골드|플래티넘|다이아몬드|마스터|보상|언어`,
de:`SPIELEN|ZEIG DEIN KÖNNEN!|GEGEN KI|Spiele gegen die Maschine|2 SPIELER|Auf demselben Gerät|ONLINE|Spiele mit der Welt|TURNIER|Tritt an und gewinne|SHOP|Schläger, Bälle und mehr|MISSIONEN|Erfülle und gewinne|ERFOLGE|Schalte Belohnungen frei|RANGLISTE|Die besten Spieler|TUTORIAL|In Minuten lernen|TÄGLICHE BELOHNUNG|Melde dich an und hol dir deinen Preis!|LEVEL|Levelkarte|LEVEL|AKTUELLER RANG|Nächster Rang|VORSCHLAG SENDEN|MASTER-PANEL|Überspringen|Weiter|Fertig!|ABHOLEN|Komm morgen wieder|Demnächst|TUTORIAL|Wische mit dem Finger, um deinen Schläger zu bewegen.|Schlage den Ball zurück und punkte, wenn dein Gegner verfehlt.|Wähle einen Modus: KI, 2 Spieler oder online.|Im Shop schaltest du Schläger und Bälle frei.|Diese Funktion folgt später.|BRONZE|SILBER|GOLD|PLATIN|DIAMANT|MEISTER|Belohnung|SPRACHE`,
it:`GIOCA|DIMOSTRA IL TUO TALENTO!|CONTRO L'IA|Gioca contro la macchina|2 GIOCATORI|Sullo stesso dispositivo|ONLINE|Gioca con il mondo|TORNEO|Competi e vinci|NEGOZIO|Racchette, palline e altro|MISSIONI|Completa e vinci|TRAGUARDI|Sblocca premi|CLASSIFICA|I migliori giocatori|TUTORIAL|Impara in pochi minuti|PREMIO GIORNALIERO|Accedi e ricevi il tuo premio!|LIVELLI|Mappa dei livelli|LIVELLO|RANGO ATTUALE|Prossimo rango|INVIA SUGGERIMENTO|PANNELLO MASTER|Salta|Avanti|Fatto!|RISCUOTI|Torna domani|In arrivo|TUTORIAL|Scorri il dito per muovere la racchetta.|Rimanda la pallina e segna quando l'avversario sbaglia.|Scegli una modalità: IA, 2 giocatori o online.|Usa il negozio per sbloccare racchette e palline.|Questa funzione sarà disponibile più avanti.|BRONZO|ARGENTO|ORO|PLATINO|DIAMANTE|MAESTRO|Premio|LINGUA`,
ru:`ИГРАТЬ|ПОКАЖИ СВОЙ ТАЛАНТ!|ПРОТИВ ИИ|Играй против машины|2 ИГРОКА|На одном устройстве|ОНЛАЙН|Играй со всем миром|ТУРНИР|Соревнуйся и побеждай|МАГАЗИН|Ракетки, мячи и многое другое|МИССИИ|Выполняй и побеждай|ДОСТИЖЕНИЯ|Открывай награды|РЕЙТИНГ|Лучшие игроки|ОБУЧЕНИЕ|Научись за пару минут|ЕЖЕДНЕВНАЯ НАГРАДА|Войди в игру и получи приз!|УРОВНИ|Карта уровней|УРОВЕНЬ|ТЕКУЩИЙ РАНГ|Следующий ранг|ОТПРАВИТЬ ИДЕЮ|ПАНЕЛЬ МАСТЕРА|Пропустить|Далее|Готово!|ЗАБРАТЬ|Приходи завтра|Скоро|ОБУЧЕНИЕ|Проводи пальцем, чтобы двигать ракетку.|Отбивай мяч и набирай очки, когда соперник промахнётся.|Выбери режим: ИИ, 2 игрока или онлайн.|В магазине открывай ракетки и мячи.|Эта функция появится позже.|БРОНЗА|СЕРЕБРО|ЗОЛОТО|ПЛАТИНА|АЛМАЗ|МАСТЕР|Награда|ЯЗЫК`,
hi:`खेलें|अपनी प्रतिभा दिखाएँ!|AI के खिलाफ|मशीन के खिलाफ खेलें|2 खिलाड़ी|एक ही डिवाइस पर|ऑनलाइन|दुनिया के साथ खेलें|टूर्नामेंट|मुकाबला करें और जीतें|दुकान|पैडल, गेंद और बहुत कुछ|मिशन|पूरा करें और जीतें|उपलब्धियाँ|इनाम अनलॉक करें|रैंकिंग|सर्वश्रेष्ठ खिलाड़ी|ट्यूटोरियल|मिनटों में सीखें|दैनिक इनाम|लॉग इन करें और इनाम पाएँ!|लेवल|लेवल मैप|लेवल|वर्तमान रैंक|अगली रैंक|सुझाव भेजें|मास्टर पैनल|छोड़ें|आगे|हो गया!|पाएँ|कल फिर आएँ|जल्द आ रहा है|ट्यूटोरियल|पैडल हिलाने के लिए उंगली स्लाइड करें।|गेंद लौटाएँ और विरोधी के चूकने पर अंक पाएँ।|मोड चुनें: AI, 2 खिलाड़ी या ऑनलाइन।|दुकान से पैडल और गेंदें अनलॉक करें।|यह सुविधा बाद में उपलब्ध होगी।|कांस्य|रजत|स्वर्ण|प्लैटिनम|डायमंड|मास्टर|इनाम|भाषा`
};
const TX={};for(const k in D)TX[k]=D[k].split('|');
const EXTRA={};
let lang=ls.get('lang','es');if(!TX[lang])lang='es';
const t=i=>(TX[lang]&&TX[lang][i])||TX.es[i]||'';
/* API para traducir el resto del juego: DMR_I18N.add('es',{clave:'texto'}) y DMR_I18N.t('clave') */
window.DMR_I18N={get lang(){return lang},setLang:l=>setLang(l),add(l,o){EXTRA[l]=Object.assign(EXTRA[l]||{},o)},t(k,fb){return (EXTRA[lang]&&EXTRA[lang][k])||(EXTRA.es&&EXTRA.es[k])||fb||k}};

/* ---------- CSS ---------- */
document.head.insertAdjacentHTML('beforeend',`<style id="m35css">
.m35h{position:absolute!important;left:-9999px!important;top:0!important;width:100vw!important;opacity:0!important;pointer-events:none!important}
#bg34,#bg34s,#hero34{display:none!important}
#m35{position:fixed;inset:0;z-index:1;overflow-y:auto;overflow-x:hidden;background:#05061f;color:#fff;font-family:Roboto,'Segoe UI','Noto Sans','Noto Sans Arabic','Noto Sans JP','Noto Sans KR','Noto Sans SC','Noto Sans Devanagari',system-ui,sans-serif;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain}
#m35 *{box-sizing:border-box}
#m35 button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0;touch-action:manipulation;transition:transform .12s,filter .12s}
#m35 [data-a]:active{transform:scale(.95);filter:brightness(1.25)}
#m35 [hidden]{display:none!important}
#m35c{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
#m35s{position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,rgba(3,4,16,.35),rgba(3,4,16,.8))}
#m35w{position:relative;z-index:1;max-width:520px;margin:0 auto;padding:max(10px,env(safe-area-inset-top)) 10px calc(14px + env(safe-area-inset-bottom))}
#m35 .hd{display:flex;align-items:center;gap:6px;position:relative}
#m35 .pf{flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:5px 10px 5px 5px;border:1.5px solid #3b6bff;border-radius:18px;background:linear-gradient(135deg,rgba(24,50,140,.75),rgba(10,16,60,.75));box-shadow:0 0 12px rgba(59,107,255,.35);text-align:start}
#m35 .av{width:44px;height:44px;flex:none;border-radius:50%;border:2px solid #7fa2ff;background:#0a1240 center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-size:24px;overflow:hidden}
#m35 .av img,#m35 .av canvas,#m35 .av svg{width:100%;height:100%;object-fit:cover}
#m35 .pi{min-width:0;flex:1}
#m35 .pi b{display:block;font-size:15px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#m35 .pi small{font-size:10.5px;letter-spacing:.08em;color:#9fb6ff}
#m35 .xp{height:5px;border-radius:5px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:4px}
#m35 .xp i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#8b3dff,#19d3ff);transition:width .5s}
#m35 .ib{width:36px;height:36px;flex:none;border-radius:50%;border:1.5px solid #3b6bff;background:rgba(8,14,50,.85);font-size:17px;position:relative;display:flex;align-items:center;justify-content:center}
#m35 .dot{position:absolute;top:-3px;right:-3px;width:13px;height:13px;border-radius:50%;background:#ff2d4f;border:2px solid #05061f;display:none;pointer-events:none}
#m35 .dot.on{display:block;animation:p35 1.4s infinite}
@keyframes p35{50%{transform:scale(1.3)}}
@keyframes in35{from{opacity:0;transform:translateY(10px)}}
@keyframes fd35{from{opacity:0}}
#m35 .lg{position:absolute;top:calc(100% + 6px);inset-inline-end:0;width:200px;max-height:min(60vh,430px);overflow:auto;background:rgba(6,10,40,.97);border:1px solid #2b8cff;border-radius:12px;padding:4px;display:none;z-index:30;box-shadow:0 8px 28px rgba(0,0,0,.6)}
#m35 .lg.on{display:block;animation:in35 .18s}
#m35 .lg button{display:flex;align-items:center;gap:8px;width:100%;padding:9px 10px;border-radius:8px;font-size:14px;text-align:start}
#m35 .lg button.on{background:rgba(59,107,255,.25)}
#m35 .lg em{margin-inline-start:auto;font-style:normal;color:#19d3ff}
#m35 .r2{display:flex;gap:8px;margin-top:8px;align-items:stretch}
#m35 .rk{flex:1;min-width:0;display:flex;gap:10px;align-items:center;padding:7px 10px;border:1.5px solid #6a4dff;border-radius:14px;background:linear-gradient(135deg,rgba(40,24,110,.7),rgba(10,12,50,.7))}
#m35 .rk .gm{font-size:30px;filter:drop-shadow(0 0 6px #8b3dff)}
#m35 .rk>div{min-width:0;flex:1}
#m35 .rk small{display:block;font-size:9px;letter-spacing:.08em;color:#a9b5e8;text-transform:uppercase;overflow-wrap:anywhere}
#m35 .rk b{display:block;font-size:15px}
#m35 .dop{align-self:center;padding:9px 12px;border:1.5px solid #ffc21a;border-radius:20px;color:#ffc21a;font-weight:800;font-size:14px;background:rgba(40,28,0,.5);white-space:nowrap}
#m35 .hero{position:relative;margin:4px -10px 0;overflow:hidden;background-repeat:no-repeat;-webkit-mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(transparent,#000 14%,#000 86%,transparent)}
#m35 .hero i{position:absolute;right:0;top:0;background:radial-gradient(ellipse at 40% 100%,rgba(40,30,150,.55),#05061f)}
#m35 .hero .fl{display:none;position:absolute;inset:0;align-items:center;justify-content:center;text-align:center;font-weight:900;font-style:italic;font-size:46px;line-height:.95;text-shadow:0 0 18px #3b6bff}
#m35 .hero.noimg{height:150px!important}
#m35 .hero.noimg .fl{display:flex}
#m35 .play{position:relative;width:100%;height:68px;margin:6px 0 10px;display:flex;align-items:center;justify-content:center;gap:12px;filter:drop-shadow(0 0 10px rgba(25,211,255,.6));animation:in35 .45s backwards}
#m35 .play::before,#m35 .play::after{content:'';position:absolute;clip-path:polygon(7% 0,93% 0,100% 50%,93% 100%,7% 100%,0 50%)}
#m35 .play::before{inset:0;background:linear-gradient(90deg,#19d3ff,#3b6bff,#8b3dff)}
#m35 .play::after{inset:3px;background:linear-gradient(180deg,#0c2275,#0a1042)}
#m35 .play>*{position:relative;z-index:1}
#m35 .play .tr{font-size:26px;color:#dff3ff}
#m35 .play b{display:block;font-size:26px;font-style:italic;letter-spacing:.06em;line-height:1}
#m35 .play small{display:block;font-size:10px;letter-spacing:.06em;color:#bcd2ff;margin-top:3px}
#m35 .play em{font-style:normal;font-size:24px;color:#9fc4ff}
#m35 .gr{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
#m35 .cd{position:relative;min-height:84px;padding:8px 4px 7px;border-radius:14px;border:1.5px solid var(--c);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(5,8,35,.82));box-shadow:0 0 10px var(--g);text-align:center;animation:in35 .45s backwards}
#m35 .cd .ic{font-style:normal;font-size:25px;display:block;line-height:1.1}
#m35 .cd b{display:block;font-size:11.5px;margin-top:3px;line-height:1.15;overflow-wrap:anywhere}
#m35 .cd small{display:block;font-size:8.5px;color:#b9c4ee;margin-top:2px;line-height:1.2;overflow-wrap:anywhere}
#m35 .c1{--c:#2f7bff;--g:rgba(47,123,255,.35)}#m35 .c2{--c:#19d3b4;--g:rgba(25,211,180,.3)}#m35 .c3{--c:#a14bff;--g:rgba(161,75,255,.35)}#m35 .c4{--c:#ffb21a;--g:rgba(255,178,26,.3)}#m35 .c5{--c:#d63cff;--g:rgba(214,60,255,.3)}
#m35 .r3{display:grid;grid-template-columns:1.45fr 1fr;gap:8px;margin-top:8px}
#m35 .wide{position:relative;display:flex;align-items:center;gap:8px;padding:8px 10px;min-height:56px;border-radius:14px;border:1.5px solid #3b6bff;background:rgba(8,14,52,.8);text-align:start;animation:in35 .45s backwards}
#m35 .wide.gd{border-color:#ffb21a}
#m35 .wide i.ic{font-style:normal;font-size:26px}
#m35 .wide b{display:block;font-size:11px;line-height:1.15;overflow-wrap:anywhere}
#m35 .wide small{display:block;font-size:9px;color:#b9c4ee;line-height:1.2;overflow-wrap:anywhere}
#m35 .sg,#m35 .ms{display:block;width:100%;margin-top:10px;padding:11px;border-radius:12px;font-weight:800;font-size:12px;letter-spacing:.06em;text-align:center}
#m35 .sg{border:1px dashed #d9a516;color:#ffc21a}
#m35 .ms{border:1.5px solid #ff2d55;color:#ff8aa0;background:rgba(80,10,30,.4)}
#m35 .ft{text-align:center;margin-top:12px;font-size:10px;letter-spacing:.35em;color:#6f86d8}
#m35 .mo{position:fixed;inset:0;z-index:60;background:rgba(2,3,14,.78);display:flex;align-items:center;justify-content:center;padding:18px;animation:fd35 .2s}
#m35 .mb{width:100%;max-width:360px;border:1.5px solid #3b8bff;border-radius:18px;background:linear-gradient(160deg,#0d1850,#070a30);padding:18px;text-align:center;box-shadow:0 0 30px rgba(59,107,255,.45);animation:in35 .25s}
#m35 .mb h3{margin:0 0 6px;font-size:18px;letter-spacing:.06em}
#m35 .mb p{margin:6px 0 14px;font-size:14px;line-height:1.4;color:#d5defc}
#m35 .mb .big{font-size:46px;line-height:1.2}
#m35 .btns{display:flex;gap:8px}
#m35 .btns button{flex:1;padding:11px;border-radius:12px;font-weight:800;font-size:13px}
#m35 .btns .p{background:linear-gradient(90deg,#ff2d55,#3b6bff)}
#m35 .btns .p:disabled{opacity:.45;filter:grayscale(.6)}
#m35 .btns .g{border:1px solid #3b6bff}
#m35 .dots{display:flex;gap:6px;justify-content:center;margin-bottom:10px}
#m35 .dots s{width:8px;height:8px;border-radius:50%;background:#2a3a80}
#m35 .dots s.on{background:#19d3ff}
#m35 .days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:12px 0 14px}
#m35 .days div{border:1px solid #2a3a80;border-radius:8px;padding:6px 0;font-size:10px;line-height:1.3}
#m35 .days .ok{background:rgba(25,211,180,.18);border-color:#19d3b4}
#m35 .days .now{border-color:#ffb21a;background:rgba(255,178,26,.18)}
#m35 .tt{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:rgba(8,14,52,.95);border:1px solid #3b8bff;padding:10px 16px;border-radius:20px;font-size:13px;z-index:70;animation:fd35 .2s;max-width:90%;text-align:center}
@media(prefers-reduced-motion:reduce){#m35 *{animation:none!important;transition:none!important}}
</style>`);

/* ---------- ESTRUCTURA ---------- */
const root=document.createElement('div');root.id='m35';
const CARDS=[['ai','🤖',2,3,'c1'],['two','👥',4,5,'c2'],['on','🌐',6,7,'c3'],['to','🏆',8,9,'c4'],['sh','🛒',10,11,'c5'],['mi','📋',12,13,'c4'],['ac','🏅',14,15,'c2'],['rk','📊',16,17,'c5'],['tu','📖',18,19,'c1']];
root.innerHTML=`<canvas id="m35c" width="48" height="72"></canvas><div id="m35s"></div>
<div id="m35w">
 <div class="hd">
  <button class="pf" data-a="pf"><span class="av" id="m35av">🙂</span><span class="pi"><b id="m35nm">PLAYER</b><small><span data-t="24"></span> <span id="m35lv">1</span></small><div class="xp"><i id="m35xp"></i></div></span></button>
  <button class="ib" data-a="fr">👥</button>
  <button class="ib" data-a="ml">✉️</button>
  <button class="ib" data-a="st">⚙️</button>
  <button class="ib" data-a="lg" id="m35gb">🌐</button>
  <div class="lg" id="m35lg"></div>
 </div>
 <div class="r2">
  <div class="rk"><span class="gm" id="m35ri">💎</span><div><small data-t="25"></small><b id="m35rk">—</b><div class="xp"><i id="m35rx"></i></div><small id="m35nr"></small></div></div>
  <div class="dop" id="m35dop" hidden></div>
 </div>
 <div class="hero" id="m35h"><i></i><div class="fl">D.M.R<br>PING PONG</div></div>
 <button class="play" data-a="play"><span class="tr">▶</span><span><b data-t="0"></b><small data-t="1"></small></span><em>›</em></button>
 <div class="gr">${CARDS.map((c,k)=>`<button class="cd ${c[4]}" data-a="${c[0]}" style="animation-delay:${80+k*40}ms"><i class="ic">${c[1]}</i><b data-t="${c[2]}"></b><small data-t="${c[3]}"></small></button>`).join('')}</div>
 <div class="r3">
  <button class="wide" data-a="da" style="animation-delay:480ms"><i class="ic">🎁</i><span><b data-t="20"></b><small id="m35ds"></small></span><u class="dot" id="m35dd"></u></button>
  <button class="wide gd" data-a="lv" style="animation-delay:520ms"><i class="ic">🗺️</i><span><b data-t="22"></b><small data-t="23"></small></span></button>
 </div>
 <button class="ms" data-a="ma" id="m35ms" hidden>🛡️ <span data-t="28"></span></button>
 <button class="sg" data-a="sg">💡 <span data-t="27"></span></button>
 <div class="ft">D.M.R PING PONG</div>
</div>`;
m.appendChild(root);
if(getComputedStyle(m).position==='static')m.style.position='relative';

/* ---------- BUSCAR LOS BOTONES ORIGINALES (se siguen usando para que todo funcione igual) ---------- */
const MAP={play:/(^|[^A-Z0-9])JUGAR($|[^A-Z])/,two:/2 JUGADORES/,on:/ONLINE/,sh:/TIENDA/,mi:/MISIONES/,ac:/LOGROS/,rk:/RANKING/,lv:/NIVELES/,sg:/SUGERENCIA/,ma:/PANEL MAESTRO|MAESTRO/,to:/TORNEO/};
MAP.ai=MAP.play;
function find(re){let best=null,bl=1e9;
 m.querySelectorAll('*').forEach(e=>{if(root.contains(e)||e.tagName==='STYLE'||e.tagName==='SCRIPT'||e.tagName==='CANVAS')return;
  const x=norm(e.textContent);if(x&&x.length<bl&&re.test(x)){best=e;bl=x.length}});
 return best}
function smallBtns(){const pc=g('pcard');if(!pc||!pc.parentElement)return[];
 return [...pc.parentElement.querySelectorAll('button,[onclick],[role=button]')].filter(e=>!pc.contains(e)&&!root.contains(e)&&!/DOP/.test(norm(e.textContent)))}
function icon(re,idx){
 let r=null,bl=1e9;
 m.querySelectorAll('*').forEach(e=>{if(root.contains(e))return;const x=e.textContent.trim();if(x&&x.length<=4&&x.length<bl&&re.test(x)){r=e;bl=x.length}});
 return r||smallBtns()[idx]||null}
const IC={fr:[/👥/,0],ml:[/[✉📩📨📧📬📥]/,1],st:[/⚙/,2]};
function topOf(e){while(e&&e.parentElement&&e.parentElement!==m)e=e.parentElement;return e&&e.parentElement===m?e:null}
function mark(e){const tp=e&&topOf(e);if(tp&&tp!==root&&!tp.classList.contains('m35h'))tp.classList.add('m35h')}
function markAll(){
 mark(g('pcard'));
 for(const k in MAP){if(k==='ai'||k==='to'||k==='ma')continue;mark(find(MAP[k]))}
 for(const k in IC)mark(icon(IC[k][0],IC[k][1]));
 mark(find(/^\W*DOP/))}

/* ---------- TOASTS Y VENTANAS ---------- */
function toast(s){const e=document.createElement('div');e.className='tt';e.textContent=s;root.appendChild(e);setTimeout(()=>e.remove(),2300)}
function modal(html){const o=document.createElement('div');o.className='mo';o.innerHTML='<div class="mb">'+html+'</div>';root.appendChild(o);o.addEventListener('click',e=>{if(e.target===o)o.remove()});return o}
function soon(){const o=modal(`<div class="big">⏳</div><h3>${t(34)}</h3><p>${t(40)}</p><div class="btns"><button class="p" data-x="ok">${t(31)}</button></div>`);o.querySelector('[data-x]').onclick=()=>o.remove()}

/* ---------- TUTORIAL ---------- */
let tutEl=null;
function tutorial(i){
 i=i||0;if(tutEl)tutEl.remove();
 const E=['👆','🏓','🎮','🛒'];
 tutEl=modal(`<div class="dots">${[0,1,2,3].map(k=>`<s class="${k===i?'on':''}"></s>`).join('')}</div><div class="big">${E[i]}</div><h3>${t(35)}</h3><p>${t(36+i)}</p><div class="btns"><button class="g" data-x="s">${t(29)}</button><button class="p" data-x="n">${i<3?t(30):t(31)}</button></div>`);
 tutEl.querySelector('[data-x=s]').onclick=()=>{ls.set('tutDone',1);tutEl.remove();tutEl=null};
 tutEl.querySelector('[data-x=n]').onclick=()=>{if(i<3)tutorial(i+1);else{ls.set('tutDone',1);tutEl.remove();tutEl=null}}}

/* ---------- RECOMPENSA DIARIA ---------- */
const DR=[50,75,100,150,200,300,500];   /* DOP por día de racha (cámbialos si quieres) */
const ymd=o=>{const x=new Date();x.setDate(x.getDate()+o);return x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate()};
function dstate(){const d=ls.get('daily',{last:'',streak:0});const can=d.last!==ymd(0);const next=can?(d.last===ymd(-1)?(d.streak%7)+1:1):d.streak;return{d,can,next}}
/* Suma DOP a tu juego. Si tu función de monedas se llama distinto, dime el nombre y lo conecto. */
function giveDOP(n){
 for(const k of ['DMR_ADD_DOP','addDop','addDOP','addCoins','addMonedas','sumarDop','giveDop']){try{if(typeof window[k]==='function'){window[k](n);return true}}catch(e){}}
 return false}
function dailyUI(){const s=dstate();g('m35dd').classList.toggle('on',s.can);setT(g('m35ds'),s.can?21:33)}
function daily(){
 const s=dstate();
 const o=modal(`<div class="big">🎁</div><h3>${t(20)}</h3><div class="days">${DR.map((v,k)=>`<div class="${k+1<(s.can?s.next:s.next+1)?'ok':''} ${k+1===(s.can?s.next:0)?'now':''}">${k+1}<br><b>${v}</b></div>`).join('')}</div><div class="btns"><button class="g" data-x="c">✕</button><button class="p" data-x="r" ${s.can?'':'disabled'}>${s.can?t(32)+' +'+DR[s.next-1]:t(33)}</button></div>`);
 o.querySelector('[data-x=c]').onclick=()=>o.remove();
 o.querySelector('[data-x=r]').onclick=()=>{const z=dstate();if(!z.can)return;
  if(!giveDOP(DR[z.next-1])){toast('DOP: función de monedas sin conectar');return}
  ls.set('daily',{last:ymd(0),streak:z.next});o.remove();toast('+'+DR[z.next-1]+' DOP');dailyUI()}}

/* ---------- CLICS ---------- */
const getAv=()=>g('m35av');
function act(a){
 if(a==='tu')return tutorial(0);
 if(a==='da')return daily();
 if(a==='lg'){g('m35lg').classList.toggle('on');return}
 if(a==='pf'){const e=g('pcard');if(e)e.click();return}
 if(IC[a]){const e=icon(IC[a][0],IC[a][1]);if(e)e.click();else soon();return}
 const re=MAP[a];const el=re&&find(re);
 if(el)el.click();else soon()}
root.addEventListener('click',e=>{
 const l=e.target.closest('[data-l]');if(l){setLang(l.dataset.l);g('m35lg').classList.remove('on');return}
 const b=e.target.closest('[data-a]');
 if(!e.target.closest('#m35lg')&&!(b&&b.dataset.a==='lg'))g('m35lg').classList.remove('on');
 if(!b)return;
 try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}
 act(b.dataset.a)});

/* ---------- IDIOMA ---------- */
function setT(el,i){el.dataset.t=i;el.textContent=t(i)}
let curLv=1;
function setLang(l){if(!TX[l])return;lang=l;ls.set('lang',l);apply()}
function apply(){
 root.dir=lang==='ar'?'rtl':'ltr';root.lang=lang;
 root.querySelectorAll('[data-t]').forEach(e=>e.textContent=t(+e.dataset.t));
 g('m35lg').innerHTML=LANGS.map(x=>`<button data-l="${x[0]}" class="${x[0]===lang?'on':''}"><span>${x[2]}</span>${x[1]}<em>${x[0]===lang?'✓':''}</em></button>`).join('');
 setRank(curLv);dailyUI();
 try{window.dispatchEvent(new CustomEvent('dmr-lang',{detail:lang}))}catch(e){}}

/* ---------- RANGO (según el nivel de jugador 1-100) ---------- */
const RI=['🥉','🥈','🥇','🛡️','💎','👑'];
function setRank(L){
 L=Math.max(1,Math.min(100,(L|0)||1));curLv=L;
 const T=[1,15,35,55,75,95,101];let i=0;for(let k=0;k<6;k++)if(L>=T[k])i=k;
 const p=(L-T[i])/(T[i+1]-T[i]);let sub='',bar=p,nx='';
 if(i<5){const s=Math.min(2,Math.floor(p*3));sub=' '+['III','II','I'][s];bar=p*3-s;
  nx=s<2?t(41+i)+' '+['II','I'][s]:t(42+i)+(i+1<5?' III':'')}
 g('m35ri').textContent=RI[i];g('m35rk').textContent=t(41+i)+sub;
 g('m35rx').style.width=Math.round(bar*100)+'%';
 g('m35nr').textContent=nx?t(26)+': '+nx:''}

/* ---------- COPIAR DATOS REALES DEL JUEGO (nombre, nivel, avatar, XP, DOP) ---------- */
let avSig='',cvc=null;
const isEmo=s=>/^[^\p{L}\p{N}]+$/u.test(s);
function sync(){
 const pc=g('pcard');
 if(pc){
  const all=pc.textContent;const mm=/NIVEL\s*(\d+)/i.exec(all);const lv=mm?+mm[1]:1;
  let nm='';for(const e of pc.querySelectorAll('*')){if(e.children.length)continue;const x=e.textContent.trim();if(x&&!/NIVEL/i.test(x)&&!isEmo(x)&&!/^\d+$/.test(x)){nm=x;break}}
  if(nm)g('m35nm').textContent=nm;
  g('m35lv').textContent=lv;if(lv!==curLv)setRank(lv);
  let xp=0;for(const e of pc.querySelectorAll('[style*="width"]')){const w=e.style.width;if(/%$/.test(w)){xp=parseFloat(w)||0;break}}
  g('m35xp').style.width=Math.max(0,Math.min(100,xp))+'%';
  const box=getAv();const im=pc.querySelector('img'),cv=pc.querySelector('canvas'),sv=pc.querySelector('svg');
  if(im&&im.src){const s='i'+im.src;if(s!==avSig){avSig=s;box.style.backgroundImage='';box.innerHTML='';const x=new Image();x.src=im.src;x.alt='';box.appendChild(x)}}
  else if(cv){if(avSig!=='c'||!cvc){avSig='c';box.innerHTML='';cvc=document.createElement('canvas');box.appendChild(cvc)}
   try{cvc.width=cv.width;cvc.height=cv.height;cvc.getContext('2d').drawImage(cv,0,0)}catch(e){}}
  else if(sv){const s='s'+sv.outerHTML.length;if(s!==avSig){avSig=s;box.innerHTML=sv.outerHTML}}
  else{let bg='',em='';
   for(const e of pc.querySelectorAll('*')){const b=getComputedStyle(e).backgroundImage;if(b&&b.indexOf('url(')>=0){bg=b;break}}
   if(!bg)for(const e of pc.querySelectorAll('*')){if(e.children.length)continue;const x=e.textContent.trim();if(x&&isEmo(x)){em=x;break}}
   const s='b'+bg+em;if(s!==avSig){avSig=s;box.innerHTML=em;box.style.backgroundImage=bg||''}}
 }
 const dp=find(/^\W*DOP/);const dd=g('m35dop');
 if(dp){dd.textContent=dp.textContent.trim().replace(/\s+/g,' ');dd.hidden=false}else dd.hidden=true;
 const mp=find(MAP.ma);g('m35ms').hidden=!(mp&&mp.getClientRects().length>0)}

/* ---------- FONDO Y HÉROE ---------- */
const hero=g('m35h');
function lay(){const w=hero.clientWidth;if(!w)return;
 if(hero.classList.contains('noimg'))return;
 hero.style.height=(w*BH/IW)+'px';
 hero.style.backgroundSize=w+'px '+(w*IH/IW)+'px';
 hero.style.backgroundPosition='0 '+(-Y0/IW*w)+'px';
 const p=hero.firstChild;p.style.width='23.5%';p.style.height=(65/IW*w)+'px'}
const im=new Image();
im.onload=()=>{try{g('m35c').getContext('2d').drawImage(im,0,0,48,72)}catch(e){}
 hero.style.backgroundImage='url("'+SRC+'")';lay()};
im.onerror=()=>{hero.classList.add('noimg')};
im.src=SRC;
addEventListener('resize',lay);

/* ---------- BUCLE (solo trabaja cuando el menú se ve) ---------- */
let vt=0;
function vis(){const c=getComputedStyle(m);return c.display!=='none'&&c.visibility!=='hidden'&&m.getBoundingClientRect().height>0}
function tick(){
 try{
  if(!vis()){vt=0;return}
  markAll();sync();lay();dailyUI();
  if(++vt>=3&&!ls.get('tutDone',0)&&!tutEl&&g('pcard')){ls.set('tutDone',0);tutorial(0);vt=-9999}
 }catch(e){}}
apply();tick();
setInterval(tick,700);
})();


/* ===== D.M.R v36: RANGOS ANIMADOS + PERFIL NUEVO + ENTRENAR + RANKING POR RANGO + GEMAS =====
   PEGAR AL FINAL DE TODO TU CÓDIGO (debajo de v35), justo ANTES de </script>. No borres nada. */
(function(){
if(window.__dmr36)return;window.__dmr36=1;
const g=id=>document.getElementById(id);
const root=g('m35');
if(!root){console.warn('v36: falta el menú v35');return}
const LSg=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const lg=()=>(window.DMR_I18N&&DMR_I18N.lang)||'es';
const T=(a,b)=>lg()==='es'?a:b;
const click=()=>{try{SFX.click()}catch(e){}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function tst(s){const e=document.createElement('div');e.className='t36';e.textContent=s;document.body.appendChild(e);setTimeout(()=>e.remove(),2400)}

/* ================= RANGOS ================= */
const ROM=['I','II','III','IV'];
const TI=[
{n:['BRONCE','BRONZE'],c:['#ffd0a0','#e07a2b','#5e2a08'],gl:'#ff8a2b',cost:100,d:['La base de grandes jugadores. Aquí comienzas tu camino.','The base of great players. Your journey starts here.']},
{n:['PLATA','SILVER'],c:['#ffffff','#b8c6d8','#4a5a70'],gl:'#d8e6ff',cost:120,d:['Mejora tu técnica y demuestra tu constancia.','Improve your technique and show consistency.']},
{n:['ORO','GOLD'],c:['#fff1a8','#f2b41c','#7a4a05'],gl:'#ffc933',cost:150,d:['Tienes más experiencia y control en cada partida.','More experience and control in every match.']},
{n:['PLATINO','PLATINUM'],c:['#d6fbff','#37c8e6','#0b4f78'],gl:'#37e0ff',cost:180,d:['Jugadores con gran habilidad y mentalidad competitiva.','Highly skilled players with a competitive mind.']},
{n:['DIAMANTE','DIAMOND'],c:['#e4e0ff','#6a7cff','#2a1a8a'],gl:'#8a7cff',cost:220,d:['Solo los mejores llegan aquí. Tu dedicación se nota.','Only the best get here. Your dedication shows.']},
{n:['MAESTRO','MASTER'],c:['#ffc2f0','#e0309c','#5a0a50'],gl:'#ff3fc0',cost:260,d:['Eres un verdadero estratega. Cada punto cuenta.','A true strategist. Every point counts.']},
{n:['ÉLITE','ELITE'],c:['#ffb0a8','#e0243a','#560812'],gl:'#ff3a3a',cost:320,d:['Rara vez se ve tu nivel. Eres parte de la élite.','Your level is rare. You are part of the elite.']},
{n:['LEYENDA','LEGEND'],c:['#fffbd0','#ffd21f','#8a5a00'],gl:'#ffd21f',cost:0,d:['No es solo un rango… es una leyenda.','Not just a rank… a legend.']}];
const CUM=[];let LEG=0;TI.slice(0,7).forEach(t=>{CUM.push(LEG);LEG+=t.cost*4});
const tn=t=>TI[t].n[lg()==='es'?0:1];
function rankOf(rp){
 if(rp>=LEG)return{t:7,d:0,i:28,lo:LEG,hi:null,tierLo:LEG};
 let t=6;while(t>0&&rp<CUM[t])t--;
 const c=TI[t].cost,d=Math.min(3,Math.floor((rp-CUM[t])/c)),lo=CUM[t]+d*c;
 return{t,d,i:t*4+d,lo,hi:lo+c,tierLo:CUM[t]}}
const nameOf=r=>r.t===7?tn(7):tn(r.t)+' '+ROM[r.d];
const nextOf=r=>{if(r.t===7)return null;const i=r.i+1;return i>=28?{t:7,d:0}:{t:i>>2,d:i&3}};
const rankLvl=()=>clamp(Math.round(2+rankOf(S.rp).i*3.45),1,100);

/* ---------- insignias SVG (cada rango con forma y emblema propios) ---------- */
const SH=['M50 6L88 20V52C88 74 70 88 50 96C30 88 12 74 12 52V20Z',
'M50 4L90 24L82 70L50 96L18 70L10 24Z',
'M14 22L32 32L50 8L68 32L86 22V54C86 76 68 88 50 96C32 88 14 76 14 54Z',
'M50 4L90 27V73L50 96L10 73V27Z',
'M50 4L92 38L50 96L8 38Z',
'M50 3L61 30L92 32L68 52L77 84L50 66L23 84L32 52L8 32L39 30Z',
'M50 4C64 22 88 24 88 50C88 76 68 90 50 97C32 90 12 76 12 50C12 24 36 22 50 4Z',
'M8 80L4 26L30 48L50 10L70 48L96 26L92 80Z'];
const EM=[
(l,k)=>`<circle cx="50" cy="45" r="15" fill="${l}" stroke="${k}" stroke-width="3"/><rect x="45.5" y="58" width="9" height="17" rx="3" fill="${l}" stroke="${k}" stroke-width="3"/>`,
(l,k)=>`<path d="M32 52L50 36L68 52M32 68L50 52L68 68" fill="none" stroke="${l}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
(l,k)=>`<path d="M50 28l6.5 14 15 1.5-11.3 10 3.4 15L50 61l-13.6 7.5 3.4-15-11.3-10 15-1.5z" fill="${l}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>`,
(l,k)=>`<path d="M57 26L36 54H49L42 78L67 46H52Z" fill="${l}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>`,
(l,k)=>`<path d="M50 30L70 48L50 74L30 48Z M30 48H70 M50 30L42 48L50 74L58 48Z" fill="none" stroke="${l}" stroke-width="4" stroke-linejoin="round"/>`,
(l,k)=>`<circle cx="50" cy="52" r="18" fill="none" stroke="${l}" stroke-width="6"/><circle cx="50" cy="52" r="6" fill="${l}"/>`,
(l,k)=>`<path d="M50 26C58 40 67 44 64 58C62 70 56 76 50 76C44 76 38 70 36 58C35 48 44 44 50 26Z" fill="${l}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>`,
(l,k)=>`<circle cx="50" cy="60" r="9" fill="#37e0ff" stroke="${l}" stroke-width="3"/><circle cx="26" cy="46" r="3.5" fill="${l}"/><circle cx="74" cy="46" r="3.5" fill="${l}"/><circle cx="50" cy="26" r="3.5" fill="${l}"/>`];
const SP='<i style="--x:.1;--d:2.6s;--dl:0s"></i><i style="--x:.5;--d:3.1s;--dl:.9s"></i><i style="--x:.85;--d:2.8s;--dl:1.7s"></i>';
let uid=0;
function badge(t,d,sz){
 const x=TI[t],l=x.c[0],m=x.c[1],k=x.c[2],u='b'+(++uid),P=SH[t],sm=d>=0&&t<7,big=sz>=56;
 const em=sm?`<text x="50" y="61" text-anchor="middle" font-size="34" font-weight="900" font-style="italic" fill="#fff" stroke="${k}" stroke-width="3" paint-order="stroke" font-family="Roboto,Arial,sans-serif">${ROM[d]}</text>`:EM[t](l,k);
 return `<span class="bg36 t${t}${sm?' sm36':''}" style="width:${sz}px;height:${sz}px;--gc:${x.gl}"><svg viewBox="0 0 100 100"><defs><linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${l}"/><stop offset=".45" stop-color="${m}"/><stop offset="1" stop-color="${k}"/></linearGradient><linearGradient id="${u}i" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${k}"/><stop offset="1" stop-color="${m}"/></linearGradient><clipPath id="${u}c"><path d="${P}"/></clipPath></defs><path d="${P}" fill="url(#${u}g)" stroke="${l}" stroke-width="2.5" stroke-linejoin="round"/><path d="${P}" transform="translate(50 52) scale(.76) translate(-50 -50)" fill="url(#${u}i)" stroke="${l}" stroke-opacity=".6" stroke-width="1.5"/>${em}<g clip-path="url(#${u}c)"><path d="M0 0H100V40Q50 52 0 40Z" fill="#fff" opacity=".16"/>${sm?'':'<g class="shg"><rect x="-30" y="-10" width="16" height="130" fill="#fff" opacity=".38" transform="skewX(-20)"/></g>'}</g></svg>${big?SP:''}${big&&(t===5||t===7)?'<u class="rg"></u><u class="rg r2"></u>':''}</span>`}

/* ================= ESTADO (se guarda por cuenta) ================= */
const DEF=()=>({rp:0,gems:0,streak:0,bestStreak:0,rwins:0,rlosses:0,hardWins:0,shut:0,games:0,shield:0,boost:0,inv:{},eqF:'',eqT:'',cl:{}});
const acct=()=>{try{return(prof&&prof.id)||'guest'}catch(e){return'guest'}};
let KEY='dmr36_'+acct(),S=Object.assign(DEF(),LSg(KEY,{}));
function save(){LSs(KEY,S);try{prof.rp=S.rp}catch(e){}push()}
let lastPush='';
function push(){try{if(ME&&fb&&SY&&prof.id){const k=S.rp+'|'+(prof.name||'');if(k===lastPush)return;lastPush=k;
 FS.setDoc(FS.doc(fb.db,'players',prof.id),{rp:S.rp,rk:nameOf(rankOf(S.rp)),rt:rankOf(S.rp).t},{merge:true}).catch(()=>{lastPush=''})}}catch(e){}}

/* ================= CSS ================= */
document.head.insertAdjacentHTML('beforeend',`<style id="s36">
#m35 .hd,#m35 .r2{display:none!important}
#h36{margin-bottom:6px}
#h36 .r1{display:flex;gap:6px;align-items:stretch}
#h36 .pf6{flex:1;min-width:0;display:flex;gap:9px;align-items:center;padding:6px 10px 6px 6px;border:1.5px solid #3b6bff;border-radius:18px;background:linear-gradient(135deg,rgba(24,50,140,.8),rgba(10,16,60,.8));box-shadow:0 0 14px rgba(59,107,255,.4);text-align:start}
#h36 .pf6 .av{width:52px;height:52px}
#h36 .pi b{font-size:16px}
#h36 .pi u{text-decoration:none;display:block;font-size:10px;color:#ffd21f;letter-spacing:.06em;min-height:0}
#h36 .xb{height:6px;border-radius:5px;background:rgba(255,255,255,.14);overflow:hidden;margin-top:4px}
#h36 .xb i{display:block;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#19d3ff,#3b6bff);transition:width .5s}
#h36 .ic6{display:flex;flex-direction:column;gap:4px;justify-content:space-between}
#h36 .ic6 button{width:36px;height:36px;border-radius:50%;border:1.5px solid #3b6bff;background:rgba(8,14,50,.85);font-size:16px;display:flex;align-items:center;justify-content:center}
#h36 .r2b{display:flex;gap:6px;margin-top:6px;align-items:center;position:relative}
#h36 .chip{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 8px;border-radius:20px;border:1.5px solid #ffc21a;background:rgba(40,28,0,.55);font-size:14px;font-weight:800;position:relative}
#h36 .chip.gm{border-color:#37d6ff;background:rgba(0,40,70,.55);color:#bff4ff}
#h36 .chip em{font-style:normal;display:inline-flex;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.2);align-items:center;justify-content:center;font-size:14px}
#h36 .dt6{position:absolute;top:-3px;right:-2px;width:12px;height:12px;border-radius:50%;background:#ff2d4f;border:2px solid #05061f;display:none}
#h36 .dt6.on{display:block}
#h36 .lgb{padding:7px 10px;border-radius:20px;border:1.5px solid #3b6bff;background:rgba(8,14,50,.85);font-size:12px;font-weight:800;white-space:nowrap}
#lgd36{position:absolute;top:calc(100% + 4px);inset-inline-end:0;width:190px;max-height:50vh;overflow:auto;background:rgba(6,10,40,.98);border:1px solid #2b8cff;border-radius:12px;padding:4px;display:none;z-index:40}
#lgd36.on{display:block}
#lgd36 button{display:flex;gap:8px;align-items:center;width:100%;padding:9px;border-radius:8px;font-size:14px;text-align:start}
#lgd36 button.on{background:rgba(59,107,255,.28)}
#h36 .r3b{display:grid;grid-template-columns:1.25fr 1fr;gap:6px;margin-top:6px}
#h36 .rp{display:flex;gap:8px;align-items:center;padding:8px;border-radius:14px;border:1.5px solid var(--gc,#e07a2b);background:linear-gradient(135deg,rgba(40,24,60,.7),rgba(8,10,40,.8));text-align:start;min-width:0}
#h36 .rp>div{min-width:0;flex:1}
#h36 small{display:block;font-size:9px;letter-spacing:.07em;color:#a9b5e8}
#h36 .rp b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#h36 .nx{display:flex;align-items:center;gap:4px;margin-top:3px;font-size:9px;color:#c5d0f5}
#h36 .stp{padding:8px 10px;border-radius:14px;border:1.5px solid #3b6bff;background:rgba(8,14,52,.8);display:flex;flex-direction:column;justify-content:center;gap:3px;font-size:11px}
#h36 .stp div{display:flex;justify-content:space-between;gap:6px}
#h36 .stp b{color:#fff}
/* insignias animadas */
.bg36{position:relative;display:inline-block;flex:none;animation:fl36 4.5s ease-in-out infinite;filter:drop-shadow(0 0 5px var(--gc))}
.bg36 svg{display:block;width:100%;height:100%;overflow:visible}
.bg36.sm36{animation:none}
.bg36 .shg{animation:sh36 4.2s ease-in-out infinite}
.bg36 i{position:absolute;bottom:22%;left:calc(14% + var(--x)*60%);width:4px;height:4px;border-radius:50%;background:var(--gc);box-shadow:0 0 6px var(--gc);opacity:0;animation:sp36 var(--d) ease-out var(--dl) infinite;pointer-events:none}
.bg36 .rg{position:absolute;inset:-9%;border-radius:50%;border:2px dashed var(--gc);opacity:.6;animation:rg36 9s linear infinite;pointer-events:none}
.bg36 .rg.r2{inset:-18%;border-style:dotted;animation-duration:14s;animation-direction:reverse;opacity:.4}
.bg36.t0{animation:fl36 4.5s ease-in-out infinite,gB36 3.2s ease-in-out infinite}
.bg36.t1{animation:fl36 4.5s ease-in-out infinite,sw36 5.5s ease-in-out infinite alternate}
.bg36.t2{animation:fl36 4.5s ease-in-out infinite,gG36 6s ease-in-out infinite}
.bg36.t3{animation:fl36 4.5s ease-in-out infinite,zp36 2.6s ease-in-out infinite}
.bg36.t4{animation:fl36 4.5s ease-in-out infinite,hu36 7s ease-in-out infinite}
.bg36.t5{animation:fl36 4.5s ease-in-out infinite,gM36 4s ease-in-out infinite}
.bg36.t6{animation:fl36 4s ease-in-out infinite,gE36 2.2s ease-in-out infinite}
.bg36.t7{animation:fl36 4.5s ease-in-out infinite,gL36 7s ease-in-out infinite}
.bg36.sm36{animation:none!important;filter:drop-shadow(0 0 3px var(--gc))}
@keyframes fl36{50%{transform:translateY(-3px)}}
@keyframes sh36{0%{transform:translateX(-60px)}55%,100%{transform:translateX(160px)}}
@keyframes sp36{0%{opacity:0;transform:translateY(0)}20%{opacity:.9}100%{opacity:0;transform:translateY(-34px) scale(.4)}}
@keyframes rg36{to{transform:rotate(360deg)}}
@keyframes gB36{50%{filter:drop-shadow(0 0 13px var(--gc))}}
@keyframes sw36{from{transform:perspective(260px) rotateY(-14deg)}to{transform:perspective(260px) rotateY(14deg)}}
@keyframes gG36{50%{filter:drop-shadow(0 0 20px var(--gc)) brightness(1.15)}}
@keyframes zp36{40%{filter:drop-shadow(0 0 16px var(--gc)) brightness(1.2)}55%{filter:drop-shadow(0 0 5px var(--gc))}}
@keyframes hu36{50%{filter:drop-shadow(0 0 14px var(--gc)) hue-rotate(40deg)}}
@keyframes gM36{50%{filter:drop-shadow(0 0 18px var(--gc)) drop-shadow(0 0 6px #8b3dff)}}
@keyframes gE36{40%{filter:drop-shadow(0 0 16px var(--gc))}60%{filter:drop-shadow(0 0 8px var(--gc))}}
@keyframes gL36{45%,60%{filter:drop-shadow(0 0 24px var(--gc)) drop-shadow(0 0 10px #37e0ff) brightness(1.12)}}
.fx0 .bg36,.fx0 .bg36 *{animation:none!important}
.hid36 .bg36,.hid36 .bg36 *,.hid36 .up36 *{animation-play-state:paused!important}
@media(prefers-reduced-motion:reduce){.bg36,.bg36 *{animation:none!important}}
/* pantallas */
.o36{position:fixed;inset:0;z-index:9100;overflow-y:auto;color:#fff;font-family:Roboto,'Segoe UI',system-ui,sans-serif;background:radial-gradient(70% 35% at 0% 0%,rgba(40,80,255,.4),transparent),radial-gradient(70% 35% at 100% 100%,rgba(255,40,70,.34),transparent),#05061f;animation:in36 .25s;-webkit-tap-highlight-color:transparent}
.o36 *{box-sizing:border-box}
.o36 button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;touch-action:manipulation}
@keyframes in36{from{opacity:0;transform:translateY(10px)}}
.o36 .w{max-width:520px;margin:0 auto;padding:max(12px,env(safe-area-inset-top)) 12px calc(18px + env(safe-area-inset-bottom))}
.o36 .hh{display:flex;align-items:center;gap:8px}
.o36 .hh h2{flex:1;text-align:center;font-size:18px;font-style:italic;letter-spacing:.1em;text-shadow:0 0 14px #3b6bff}
.o36 .rd{width:38px;height:38px;border-radius:50%;border:1.5px solid #3b6bff;background:rgba(8,14,50,.9);font-size:18px;display:flex;align-items:center;justify-content:center}
.o36 .sub{text-align:center;font-size:10px;letter-spacing:.14em;color:#9fb6ff;margin:4px 0 10px}
.o36 .cur{display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;border:1.5px solid var(--gc);background:rgba(10,14,50,.8);box-shadow:0 0 16px -4px var(--gc)}
.o36 .cur>div{flex:1;min-width:0}
.o36 small{display:block;font-size:9px;letter-spacing:.08em;color:#a9b5e8}
.o36 .cur b{font-size:19px;display:block}
.o36 .bar{height:8px;border-radius:6px;background:rgba(255,255,255,.14);overflow:hidden;margin:6px 0 3px}
.o36 .bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--gc),#fff)}
.o36 .g8{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}
.o36 .rc{position:relative;padding:10px 6px 9px;text-align:center;border-radius:16px;border:1.5px solid var(--gc);background:linear-gradient(170deg,rgba(255,255,255,.07),rgba(5,8,35,.88));box-shadow:0 0 12px -3px var(--gc);transition:transform .25s ease,box-shadow .25s}
.o36 .rc:active{transform:scale(1.045)}
.o36 .rc .bg{display:flex;justify-content:center;margin-bottom:4px}
.o36 .rc>b{display:block;font-size:14px;letter-spacing:.1em;margin:2px 0 6px}
.o36 .rc .dv{display:flex;justify-content:center;gap:3px;margin-bottom:6px}
.o36 .rc .dv .off{opacity:.3;filter:grayscale(.9)}
.o36 .rc small{font-size:8.5px;line-height:1.3;letter-spacing:0;padding:0 4px}
.o36 .rc .st{position:absolute;top:5px;inset-inline-end:6px;font-size:8px;font-weight:800;letter-spacing:.06em;padding:2px 6px;border-radius:8px;background:rgba(0,0,0,.45)}
.o36 .rc.cur{box-shadow:0 0 18px 1px var(--gc)}
.o36 .rc.cur .st{background:var(--gc);color:#000}
.o36 .rc.lk{border-color:#3a4268;box-shadow:none}
.o36 .rc.lk .bg,.o36 .rc.lk>b{filter:grayscale(.85) brightness(.7)}
.o36 .rc.sel{outline:2px solid #fff;outline-offset:2px}
.o36 .rc.leg{grid-column:1/-1}
.o36 .info{margin-top:10px;padding:12px;border-radius:14px;border:1.5px solid #3a4268;background:rgba(8,12,44,.9);font-size:13px;line-height:1.45;min-height:84px}
.o36 .info.glow{border-color:var(--gc);box-shadow:0 0 18px -2px var(--gc)}
.o36 .info h4{font-size:15px;letter-spacing:.08em;margin-bottom:4px;color:var(--gc)}
.o36 .info .stt{display:block;margin-top:6px;font-size:11px;letter-spacing:.06em}
.o36 .tips{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;font-size:10px;color:#c5d0f5}
.o36 .tips div{padding:8px;border-radius:12px;border:1px solid #2a3a80;background:rgba(8,14,50,.7)}
.o36 .tips b{display:block;color:#fff;font-size:11px;margin-bottom:2px}
/* ascenso */
.up36{position:fixed;inset:0;z-index:9600;background:rgba(2,3,14,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;font-family:Roboto,system-ui,sans-serif;text-align:center;padding:20px;animation:fd36 .5s}
@keyframes fd36{from{opacity:0}}
.up36 .stg{position:relative;width:240px;height:240px}
.up36 .ob,.up36 .nb{position:absolute;left:50%;top:50%;display:flex}
.up36 .ob{transform:translate(-50%,-50%);animation:ob36 1.3s ease-in forwards}
.up36 .nb{transform:translate(-50%,-50%) scale(0);animation:nb36 1.4s .9s cubic-bezier(.2,1.4,.4,1) forwards}
@keyframes ob36{to{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-90deg)}}
@keyframes nb36{from{transform:translate(-50%,-50%) scale(0) rotate(180deg)}to{transform:translate(-50%,-50%) scale(1) rotate(0)}}
.up36 .wv{position:absolute;left:50%;top:50%;width:60px;height:60px;margin:-30px;border-radius:50%;border:3px solid var(--gc);opacity:0;animation:wv36 1.6s 1s ease-out forwards}
.up36 .wv.w2{animation-delay:1.35s}
@keyframes wv36{from{opacity:.9;transform:scale(.5)}to{opacity:0;transform:scale(4.2)}}
.up36 .px s{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);opacity:0;animation:pb36 1.5s var(--dl) ease-out forwards}
.up36 .px.cv s{animation-name:pc36}
@keyframes pb36{from{opacity:1;transform:translate(0,0)}to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
@keyframes pc36{from{opacity:0;transform:translate(var(--dx),var(--dy))}35%{opacity:1}to{opacity:1;transform:translate(0,0) scale(.5)}}
.up36 h2{font-size:24px;font-style:italic;letter-spacing:.08em;text-shadow:0 0 18px var(--gc);animation:tx36 .7s 1.7s backwards}
.up36 p{font-size:15px;animation:tx36 .7s 2s backwards}
.up36 p b{color:var(--gc)}
.up36 button{margin-top:6px;padding:12px 34px;border-radius:14px;font-weight:900;letter-spacing:.08em;background:linear-gradient(90deg,#ff2d55,#3b6bff);color:#fff;border:0;animation:tx36 .7s 2.3s backwards}
.up36 .cr{position:absolute;left:50%;top:-6px;font-size:44px;margin-left:-22px;animation:cr36 1.2s 1.2s cubic-bezier(.2,1.3,.4,1) backwards}
@keyframes tx36{from{opacity:0;transform:translateY(12px)}}
@keyframes cr36{from{opacity:0;transform:translateY(-60px) scale(.4)}}
.fx0 .up36 *{animation-duration:.01s!important;animation-delay:0s!important}
/* ventanas pequeñas */
.mo36{position:fixed;inset:0;z-index:9200;background:rgba(2,3,14,.8);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Roboto,system-ui,sans-serif;color:#fff;animation:fd36 .2s}
.mo36 *{box-sizing:border-box}
.mo36 button{font:inherit;color:inherit;border:0;background:none;padding:0;cursor:pointer;touch-action:manipulation}
.mo36 .mb{width:100%;max-width:380px;max-height:88vh;overflow:auto;border:1.5px solid #3b8bff;border-radius:18px;background:linear-gradient(160deg,#0d1850,#070a30);padding:16px;box-shadow:0 0 30px rgba(59,107,255,.45);animation:in36 .25s}
.mo36 h3{text-align:center;font-size:17px;letter-spacing:.08em;margin-bottom:4px}
.mo36 .ds{text-align:center;font-size:12px;color:#c5d0f5;margin-bottom:10px}
.mo36 .big{display:flex;align-items:center;gap:12px;width:100%;padding:12px;margin-top:8px;border-radius:14px;border:1.5px solid var(--c,#3b6bff);background:rgba(10,20,70,.7);text-align:start}
.mo36 .big i{font-style:normal;font-size:26px}
.mo36 .big b{display:block;font-size:14px;letter-spacing:.06em}
.mo36 .big small{display:block;font-size:11px;color:#b9c4ee;margin-top:2px}
.mo36 .x{width:100%;margin-top:10px;padding:11px;border-radius:12px;border:1px solid #3b6bff;font-weight:800;font-size:12px}
.mo36 .tabs{display:flex;gap:6px;margin:8px 0}
.mo36 .tabs button{flex:1;padding:9px;border-radius:10px;border:1px solid #2a3a80;font-size:12px;font-weight:800}
.mo36 .tabs button.on{background:rgba(59,107,255,.35);border-color:#37d6ff}
.mo36 .it{display:flex;gap:10px;align-items:center;padding:10px;margin-top:7px;border-radius:12px;border:1px solid #2a3a80;background:rgba(8,14,52,.7)}
.mo36 .it>span{font-size:24px}
.mo36 .it>div{flex:1;min-width:0}
.mo36 .it b{display:block;font-size:13px}
.mo36 .it small{display:block;font-size:10.5px;color:#b9c4ee;line-height:1.3}
.mo36 .it button{padding:8px 11px;border-radius:10px;background:linear-gradient(90deg,#0b86c9,#3b6bff);font-size:12px;font-weight:800;white-space:nowrap}
.mo36 .it button:disabled{opacity:.4}
.mo36 .it button.eq{background:#19a36b}
.mo36 .pg{height:6px;border-radius:4px;background:rgba(255,255,255,.14);margin-top:4px;overflow:hidden}
.mo36 .pg i{display:block;height:100%;background:#37d6ff}
.mo36 .rkr{display:flex;align-items:center;gap:8px;padding:8px;margin-top:6px;border-radius:12px;border:1px solid #2a3a80;background:rgba(8,14,52,.7)}
.mo36 .rkr.me{border-color:#ffd21f;background:rgba(80,60,0,.4)}
.mo36 .rkr .p{width:26px;text-align:center;font-weight:900;font-size:15px}
.mo36 .rkr>div{flex:1;min-width:0}
.mo36 .rkr b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mo36 .rkr small{font-size:10px;color:#b9c4ee}
.mo36 .rkr em{font-style:normal;font-weight:800;font-size:13px;color:#ffd21f}
.mo36 .pd1{border-color:#ffd21f}.mo36 .pd2{border-color:#cfd8e8}.mo36 .pd3{border-color:#e07a2b}
.t36{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:9800;background:rgba(8,14,52,.96);border:1px solid #3b8bff;color:#fff;padding:10px 16px;border-radius:20px;font:13px Roboto,system-ui,sans-serif;max-width:90%;text-align:center;animation:fd36 .2s}
</style>`);

/* ================= CABECERA NUEVA (perfil + rango + estadísticas) ================= */
const w=g('m35w'),LANGS=[['es','Español','🇪🇸'],['en','English','🇬🇧'],['fr','Français','🇫🇷'],['pt','Português','🇧🇷'],['ar','العربية','🇸🇦'],['zh','中文简体','🇨🇳'],['ja','日本語','🇯🇵'],['ko','한국어','🇰🇷'],['de','Deutsch','🇩🇪'],['it','Italiano','🇮🇹'],['ru','Русский','🇷🇺'],['hi','हिन्दी','🇮🇳']];
const H=document.createElement('div');H.id='h36';
H.innerHTML=`<div class="r1"><button class="pf6" data-a="pf"><span id="av36"></span><span class="pi"><b id="nm36">PLAYER</b><u id="tt36"></u><small><span id="lvt36"></span> <span id="lv36">1</span></small><div class="xb"><i id="xb36"></i></div><small id="xt36"></small></span></button><div class="ic6"><button data-a="fr">👥</button><button data-a="ml">✉️</button><button data-a="st">⚙️</button></div></div>
<div class="r2b"><button class="chip" data-a="sh">🪙 <b id="dp36">0</b><em>+</em></button><button class="chip gm" data-a="gem">💎 <b id="gm36">0</b><em>+</em><u class="dt6" id="gd36"></u></button><button class="lgb" data-a="lg36">🌐 <span id="lc36">ES</span> ▾</button><div id="lgd36">${LANGS.map(x=>`<button data-lg="${x[0]}"><span>${x[2]}</span>${x[1]}</button>`).join('')}</div></div>
<div class="r3b"><button class="rp" data-a="rs" id="rp36"><span id="rb36"></span><div><small id="rl36"></small><b id="rn36"></b><div class="xb"><i id="rx36" style="background:linear-gradient(90deg,var(--gc),#fff)"></i></div><small id="rpt36"></small><div class="nx" id="rnx36"></div></div></button>
<div class="stp"><small id="stt36"></small><div><span id="sw36"></span><b id="swv36">0</b></div><div><span id="sl36"></span><b id="slv36">0</b></div><div><span id="sp36"></span><b id="spv36">0%</b></div><div><span id="ss36"></span><b id="ssv36">0</b></div></div></div>`;
w.insertBefore(H,w.firstChild);
const av=g('m35av');if(av)g('av36').appendChild(av);

/* ================= TARJETAS DEL MENÚ ================= */
function setCard(a,ic,b,s){const e=root.querySelector('[data-a="'+a+'"]');if(!e)return;
 const I=e.querySelector('.ic'),B=e.querySelector('b'),Sm=e.querySelector('small');
 if(I)I.textContent=ic;[B,Sm].forEach(x=>x&&x.removeAttribute('data-t'));if(B)B.textContent=b;if(Sm)Sm.textContent=s}
function relabel(){
 setCard('ai','🎯',T('ENTRENAR','TRAINING'),T('Bot fácil, medio o difícil','Easy, medium or hard bot'));
 setCard('to','💎',T('DESAFÍOS','CHALLENGES'),T('Gana gemas difíciles','Earn hard gems'));
 setCard('lv','🏅',T('RANGOS','RANKS'),T('Divisiones y progreso','Divisions & progress'));
 const ps=root.querySelector('.play small');if(ps){ps.removeAttribute('data-t');ps.textContent=T('Partida clasificatoria · sube de rango','Ranked match · climb the ranks')}
 g('lvt36').textContent=T('NIVEL','LEVEL');g('stt36').textContent=T('ESTADÍSTICAS','STATS');
 g('sw36').textContent='🏆 '+T('Victorias','Wins');g('sl36').textContent='✖ '+T('Derrotas','Losses');
 g('sp36').textContent='% '+T('Victorias','Win rate');g('ss36').textContent='★ '+T('Puntuación','Score');
 g('rl36').textContent=T('RANGO ACTUAL','CURRENT RANK');g('lc36').textContent=lg().toUpperCase();
 rkey=''}
addEventListener('dmr-lang',()=>{relabel();ui()});

/* ================= ACTUALIZAR CABECERA ================= */
let rkey='';
function xpInfo(){try{const Lv=plv(),xp=prof.xp||0,base=XP_PER_LV*(Lv-1);return{Lv,cur:xp-base,need:XP_PER_LV,pc:Lv>=100?100:clamp((xp-base)/XP_PER_LV*100,0,100)}}catch(e){return{Lv:1,cur:0,need:1,pc:0}}}
const ITEMS=[
{id:'shield',k:'c',e:'🛡️',p:3,n:['Escudo de rango','Rank shield'],d:['Evita perder puntos en tu próxima derrota clasificatoria.','Prevents losing points on your next ranked loss.']},
{id:'boost',k:'c',e:'⚡',p:5,n:['Impulso x1.5','Boost x1.5'],d:['+50% de puntos en tus próximas 3 victorias clasificatorias.','+50% points on your next 3 ranked wins.']},
{id:'dop',k:'d',e:'🪙',p:4,v:500,n:['Paquete 500 DOP','500 DOP pack'],d:['Recibes 500 monedas DOP.','You get 500 DOP coins.']},
{id:'fr1',k:'f',e:'🔵',p:12,col:'#37e0ff',n:['Marco Neón','Neon frame'],d:['Marco cian para tu avatar.','Cyan frame for your avatar.']},
{id:'fr2',k:'f',e:'🔴',p:20,col:'#ff3a3a',n:['Marco Fuego','Fire frame'],d:['Marco rojo ardiente para tu avatar.','Blazing red frame for your avatar.']},
{id:'fr3',k:'f',e:'🟡',p:35,col:'#ffd21f',n:['Marco Real','Royal frame'],d:['Marco dorado exclusivo.','Exclusive golden frame.']},
{id:'tt1',k:'t',e:'🏷️',p:15,t:['«Cazador»','“Hunter”'],n:['Título Cazador','Hunter title'],d:['Se muestra bajo tu nombre.','Shown under your name.']},
{id:'tt2',k:'t',e:'🏷️',p:25,t:['«Imparable»','“Unstoppable”'],n:['Título Imparable','Unstoppable title'],d:['Se muestra bajo tu nombre.','Shown under your name.']},
{id:'tt3',k:'t',e:'🏷️',p:45,t:['«Leyenda del Ping Pong»','“Ping Pong Legend”'],n:['Título Leyenda','Legend title'],d:['El título más raro del juego.','The rarest title in the game.']}];
function ui(){try{
 const r=rankOf(S.rp),X=xpInfo(),x=TI[r.t];
 g('nm36').textContent=(prof&&prof.name)||'PLAYER';
 g('lv36').textContent=X.Lv;g('xb36').style.width=X.pc+'%';g('xt36').textContent=X.Lv>=100?'MAX':Math.max(0,Math.floor(X.cur))+' / '+X.need+' XP';
 const it=ITEMS.find(z=>z.id===S.eqT);g('tt36').textContent=it?it.t[lg()==='es'?0:1]:'';
 const fr=ITEMS.find(z=>z.id===S.eqF),a=g('m35av');if(a){a.style.borderColor=fr?fr.col:'';a.style.boxShadow=fr?'0 0 12px '+fr.col:''}
 const dtx=(g('m35dop')||{}).textContent||'';g('dp36').textContent=(dtx.replace(/[^\d.,]/g,'')||'0');
 g('gm36').textContent=S.gems;g('gd36').classList.toggle('on',MS.some(m=>!S.cl[m.id]&&m.p()>=m.g));
 const k=r.i+'|'+lg();
 if(k!==rkey){rkey=k;const n=nextOf(r);
  g('rp36').style.setProperty('--gc',x.gl);
  g('rb36').innerHTML=badge(r.t,-1,54);g('rn36').textContent=nameOf(r);
  g('rnx36').innerHTML=n?T('SIGUIENTE','NEXT')+' '+badge(n.t,n.d>=0&&n.t<7?n.d:-1,24)+'<span>'+(n.t===7?tn(7):tn(n.t)+' '+ROM[n.d])+'</span>':'MAX'}
 g('rx36').style.width=(r.hi?clamp((S.rp-r.lo)/(r.hi-r.lo)*100,0,100):100)+'%';
 g('rpt36').textContent=r.hi?S.rp+' / '+r.hi+' '+T('PTS','PTS'):S.rp+' PTS · MAX';
 const W=prof.w||0,Lo=prof.l||0;g('swv36').textContent=W;g('slv36').textContent=Lo;g('spv36').textContent=(W+Lo?Math.round(W/(W+Lo)*100):0)+'%';g('ssv36').textContent=S.rp;
}catch(e){}}

/* ================= EFECTOS: reducir, pausar si no se ve ================= */
let FX=LSg('dmr36fx',null);if(FX==null)FX=!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const applyFx=()=>document.documentElement.classList.toggle('fx0',!FX);applyFx();
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('hid36',document.hidden));

/* ================= PANTALLA SISTEMA DE RANGOS ================= */
function rankScreen(){
 const old=g('rs36');if(old)old.remove();
 const r=rankOf(S.rp),n=nextOf(r),o=document.createElement('div');o.id='rs36';o.className='o36';
 const cards=TI.map((x,t)=>{const un=S.rp>=(t<7?CUM[t]:LEG),st=un?(r.t===t?'cur':'un'):'lk';
  const dv=t<7?[0,1,2,3].map(d=>`<span class="${S.rp>=CUM[t]+d*x.cost?'':'off'}">${badge(t,d,30)}</span>`).join(''):`<span class="${un?'':'off'}">${badge(7,-1,34)}</span>`;
  return `<button class="rc ${st}${t===7?' leg':''}" data-t="${t}" style="--gc:${x.gl}"><span class="st">${st==='cur'?T('ACTUAL','CURRENT'):st==='un'?T('DESBLOQUEADO','UNLOCKED'):'🔒 '+T('BLOQUEADO','LOCKED')}</span><div class="bg">${badge(t,-1,72)}</div><b>${tn(t)}</b><div class="dv">${dv}</div><small>${x.d[lg()==='es'?0:1]}</small></button>`}).join('');
 o.innerHTML=`<div class="w"><div class="hh"><button class="rd" data-x="b">‹</button><h2>${T('SISTEMA DE RANGOS','RANK SYSTEM')}</h2><button class="rd" data-x="fx">${FX?'✨':'🚫'}</button></div>
 <div class="sub">${T('DEMUESTRA TU TALENTO, ALCANZA LA CIMA','SHOW YOUR TALENT, REACH THE TOP')}</div>
 <div class="cur" style="--gc:${TI[r.t].gl}">${badge(r.t,-1,64)}<div><small>${T('TU RANGO ACTUAL','YOUR CURRENT RANK')}</small><b>${nameOf(r)}</b><div class="bar"><i style="width:${r.hi?clamp((S.rp-r.lo)/(r.hi-r.lo)*100,0,100):100}%"></i></div><small>${r.hi?S.rp+' / '+r.hi+' PTS':S.rp+' PTS · MAX'}${n?' · '+T('SIGUIENTE','NEXT')+': '+(n.t===7?tn(7):tn(n.t)+' '+ROM[n.d]):''}</small></div></div>
 <div class="g8">${cards}</div><div class="info" id="ri36">${T('Toca un rango para ver su información.','Tap a rank to see its info.')}</div>
 <div class="tips"><div><b>${T('GANA PUNTOS','EARN POINTS')}</b>${T('Cada victoria clasificatoria suma puntos.','Each ranked win earns points.')}</div><div><b>${T('SUBE DE RANGO','RANK UP')}</b>${T('Completa los puntos de cada división.','Fill the points of each division.')}</div><div><b>${T('DIVISIONES','DIVISIONS')}</b>${T('4 por rango, de I a IV.','4 per rank, I to IV.')}</div><div><b>${T('RANGO ESPECIAL','SPECIAL RANK')}</b>${T('Leyenda es el más alto.','Legend is the highest.')}</div></div></div>`;
 document.body.appendChild(o);
 o.addEventListener('click',e=>{click();
  const b=e.target.closest('[data-x]');
  if(b){if(b.dataset.x==='b')o.remove();else{FX=!FX;LSs('dmr36fx',FX);applyFx();b.textContent=FX?'✨':'🚫';tst(FX?T('Efectos activados','Effects on'):T('Efectos reducidos','Effects reduced'))}return}
  const c=e.target.closest('.rc');if(!c)return;const t=+c.dataset.t,x=TI[t],un=S.rp>=(t<7?CUM[t]:LEG),inf=g('ri36');
  o.querySelectorAll('.rc').forEach(z=>z.classList.remove('sel'));c.classList.add('sel');
  inf.style.setProperty('--gc',x.gl);inf.classList.toggle('glow',un);
  const need=(t<7?CUM[t]:LEG);
  inf.innerHTML=`<h4>${tn(t)}</h4>${x.d[lg()==='es'?0:1]}<small style="margin-top:6px;font-size:11px">${t===7?T('Requisito','Requirement')+': '+LEG+' PTS':T('Desde','From')+' '+CUM[t]+' PTS · '+x.cost+' PTS '+T('por división','per division')}</small><b class="stt">${un?(r.t===t?'✅ '+T('RANGO ACTUAL','CURRENT RANK'):'✔ '+T('DESBLOQUEADO','UNLOCKED')):'🔒 '+T('BLOQUEADO','LOCKED')+' · '+T('te faltan','you need')+' '+(need-S.rp)+' PTS'}</b>`})}

/* ================= ASCENSO ================= */
function promo(a,b){
 const leg=b.t===7,x=TI[b.t],o=document.createElement('div');o.className='up36';o.style.setProperty('--gc',x.gl);
 const N=!FX?4:[14,10,22,12,16,12,16,26][b.t],conv=b.t===4;let ps='';
 for(let i=0;i<N;i++){const an=(i/N)*6.283+Math.random()*.4,d=conv?120:70+Math.random()*60,dx=Math.cos(an)*d,dy=(b.t===6?-Math.abs(Math.sin(an)):Math.sin(an))*d;
  ps+=`<s style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--c:${i%3===0&&b.t===7?'#37e0ff':x.c[i%2?0:1]};--dl:${(1+i*.03).toFixed(2)}s"></s>`}
 o.innerHTML=`<div class="stg"><div class="wv"></div><div class="wv w2"></div><div class="ob">${badge(a.t,-1,120)}</div><div class="nb">${badge(b.t,-1,160)}</div>${leg?'<div class="cr">👑</div>':''}<div class="px${conv?' cv':''}">${ps}</div></div>
 <h2>${leg?T('¡HAS ALCANZADO LEYENDA!','YOU REACHED LEGEND!'):T('¡ASCENSO DE RANGO!','RANK UP!')}</h2><p>${nameOf(a)} → <b>${nameOf(b)}</b></p><button>${T('CONTINUAR','CONTINUE')}</button>`;
 document.body.appendChild(o);try{SFX.win&&SFX.win()}catch(e){}
 o.querySelector('button').onclick=()=>{click();o.remove()}}

/* ================= PARTIDAS: clasificatoria y entrenamiento ================= */
let pend=null,cur=null,pm=null;
const _ng=newGame;
newGame=function(t){
 if(t){pend=null;cur=null}else if(pend){cur=pend;pend=null}
 if(cur){cur.done=0;try{lvl=cur.lvl}catch(e){}}
 return _ng.apply(this,arguments)};
function award(win,a,b){
 const before=rankOf(S.rp);let pts=0,msg='';S.games++;
 if(cur.type==='rank'){
  if(win){S.streak++;S.bestStreak=Math.max(S.bestStreak,S.streak);S.rwins++;pts=22+Math.min(9,(S.streak-1)*3);if(b===0)S.shut++;
   if(S.boost>0){pts=Math.round(pts*1.5);S.boost--}}
  else{S.streak=0;S.rlosses++;if(S.shield>0){S.shield--;msg=T('🛡️ Escudo usado: no pierdes puntos','🛡️ Shield used: no points lost')}else pts=-12}
  let n=S.rp+pts;if(pts<0)n=Math.max(before.tierLo,n);S.rp=Math.max(0,n);
  if(!msg)msg=(pts>=0?'+':'')+pts+' '+T('PUNTOS DE RANGO','RANK POINTS')}
 else if(win&&cur.diff==='h'){S.hardWins++;if(b===0)S.shut++;msg=T('Entrenamiento: sin puntos de rango','Training: no rank points')}
 else msg=T('Entrenamiento: sin puntos de rango','Training: no rank points');
 save();ui();setTimeout(()=>tst(msg),500);
 const after=rankOf(S.rp);if(after.i>before.i)setTimeout(()=>promo(before,after),1100)}
setInterval(()=>{try{
 const m=mode;
 if(pm==='play'&&m==='over'&&cur&&!two&&!cur.done&&sc[0]!==sc[1]){cur.done=1;award(sc[0]>sc[1],sc[0],sc[1])}
 pm=m;
 const mn=g('menu');if(cur&&mn&&!mn.classList.contains('hide')&&mn.offsetParent!==null&&m!=='play'&&m!=='over')cur=null;
 if(KEY!=='dmr36_'+acct()){KEY='dmr36_'+acct();S=Object.assign(DEF(),LSg(KEY,{}));lastPush='';rkey=''}
 push();
}catch(e){}},150);
function startOrig(){const b=g('nPlay');if(b){b.click();return}
 const mn=g('menu'),el=[...mn.querySelectorAll('button,[onclick],div')].find(e=>!root.contains(e)&&/^\W*JUGAR\W*$/i.test(e.textContent.trim()));if(el)el.click()}
function modal(html){const o=document.createElement('div');o.className='mo36';o.innerHTML='<div class="mb">'+html+'</div>';document.body.appendChild(o);o.addEventListener('click',e=>{if(e.target===o)o.remove()});return o}
function trainModal(){
 const o=modal(`<h3>🎯 ${T('ENTRENAR','TRAINING')}</h3><div class="ds">${T('Elige la dificultad. No cambia tu rango.','Pick a difficulty. Your rank is not affected.')}</div>
 <button class="big" data-d="e" style="--c:#19d3b4"><i>🟢</i><span><b>${T('FÁCIL','EASY')}</b><small>${T('El bot falla bastante. Para practicar.','The bot misses often. Great to practice.')}</small></span></button>
 <button class="big" data-d="m" style="--c:#ffb21a"><i>🟡</i><span><b>${T('MEDIO','MEDIUM')}</b><small>${T('Un rival equilibrado.','A balanced opponent.')}</small></span></button>
 <button class="big" data-d="h" style="--c:#ff3a3a"><i>🔴</i><span><b>${T('DIFÍCIL','HARD')}</b><small>${T('Devuelve casi todo. Cuenta para desafíos.','Returns almost everything. Counts for challenges.')}</small></span></button>
 <button class="x" data-d="x">${T('VOLVER','BACK')}</button>`);
 o.addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(!b)return;const d=b.dataset.d;o.remove();if(d==='x')return;
  pend={type:'train',diff:d,lvl:{e:6,m:38,h:72}[d]};setTimeout(()=>{if(pend&&pend.type==='train')pend=null},4000);startOrig()})}

/* ================= TIENDA: DOP + GEMAS ================= */
function shopChooser(){
 const o=modal(`<h3>🛒 ${T('TIENDA','SHOP')}</h3><div class="ds">${T('Elige la moneda','Choose the currency')}</div>
 <button class="big" data-s="d" style="--c:#ffc21a"><i>🪙</i><span><b>${T('TIENDA DOP','DOP SHOP')}</b><small>${T('Paletas, pelotas, fondos y más','Paddles, balls, backgrounds & more')}</small></span></button>
 <button class="big" data-s="g" style="--c:#37d6ff"><i>💎</i><span><b>${T('TIENDA DE GEMAS','GEM SHOP')}</b><small>${T('Objetos raros y exclusivos','Rare and exclusive items')}</small></span></button>
 <button class="x" data-s="x">${T('VOLVER','BACK')}</button>`);
 o.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;o.remove();const s=b.dataset.s;
  if(s==='d'){const el=g('nSh')||[...g('menu').querySelectorAll('button,div')].find(z=>!root.contains(z)&&/TIENDA|SHOP/i.test(z.textContent.trim())&&z.textContent.length<20);if(el)el.click()}
  else if(s==='g')shopGems('i')})}
const MS=[
{id:'m1',e:'🏓',n:['Gana 10 partidas clasificatorias','Win 10 ranked matches'],g:10,r:2,p:()=>S.rwins},
{id:'m2',e:'🔥',n:['Racha de 5 victorias seguidas','5-win ranked streak'],g:5,r:3,p:()=>S.bestStreak},
{id:'m3',e:'🔴',n:['Gana 15 partidas en Entrenar Difícil','Win 15 Hard training matches'],g:15,r:3,p:()=>S.hardWins},
{id:'m4',e:'🧱',n:['Gana 3 partidas sin que anoten (11-0)','Win 3 shutout matches'],g:3,r:4,p:()=>S.shut},
{id:'m5',e:'🎮',n:['Juega 100 partidas','Play 100 matches'],g:100,r:4,p:()=>S.games},
{id:'m6',e:'🥇',n:['Gana 50 partidas clasificatorias','Win 50 ranked matches'],g:50,r:6,p:()=>S.rwins},
{id:'r1',e:'🥈',n:['Llega a Plata','Reach Silver'],g:CUM[1],r:3,p:()=>S.rp},
{id:'r2',e:'🥇',n:['Llega a Oro','Reach Gold'],g:CUM[2],r:5,p:()=>S.rp},
{id:'r3',e:'💠',n:['Llega a Platino','Reach Platinum'],g:CUM[3],r:8,p:()=>S.rp},
{id:'r4',e:'💎',n:['Llega a Diamante','Reach Diamond'],g:CUM[4],r:12,p:()=>S.rp},
{id:'r5',e:'🔮',n:['Llega a Maestro','Reach Master'],g:CUM[5],r:20,p:()=>S.rp},
{id:'r6',e:'🔥',n:['Llega a Élite','Reach Elite'],g:CUM[6],r:30,p:()=>S.rp},
{id:'r7',e:'👑',n:['Alcanza Leyenda','Reach Legend'],g:LEG,r:50,p:()=>S.rp}];
window.DMR_ADD_DOP=function(n){try{
 const shown=parseInt(((g('m35dop')||{}).textContent||'').replace(/\D/g,''))||0;
 const names=['dop','DOP','coins','monedas','money'];
 let ks=Object.keys(prof).filter(k=>typeof prof[k]==='number'&&prof[k]===shown&&(shown>0||names.includes(k)));
 if(ks.length>1)ks=ks.filter(k=>names.includes(k));
 if(ks.length!==1)return false;
 prof[ks[0]]+=n;try{saveP()}catch(e){}return true}catch(e){return false}};
function shopGems(tab){
 const o=modal('');const B=o.querySelector('.mb');let cur2=tab==='q'?'q':'i';
 function draw(){const L=lg()==='es'?0:1;
  let body='';
  if(cur2==='i')body=ITEMS.map(it=>{const own=it.k==='f'||it.k==='t'?S.inv[it.id]:0,eq=S.eqF===it.id||S.eqT===it.id,q=it.k==='c'?(S[it.id]||0):0;
   return `<div class="it"><span>${it.e}</span><div><b>${it.n[L]}${q?' ×'+q:''}</b><small>${it.d[L]}</small></div><button data-b="${it.id}" class="${own&&eq?'eq':''}">${own?(eq?'✔ '+T('EQUIPADO','EQUIPPED'):T('EQUIPAR','EQUIP')):'💎 '+it.p}</button></div>`}).join('');
  else body=MS.map(m=>{const p=m.p(),ok=p>=m.g,cl=S.cl[m.id];
   return `<div class="it"><span>${m.e}</span><div><b>${m.n[L]}</b><small>${Math.min(p,m.g)} / ${m.g} · 💎 ${m.r}</small><div class="pg"><i style="width:${clamp(p/m.g*100,0,100)}%"></i></div></div><button data-m="${m.id}" ${cl||!ok?'disabled':''}>${cl?'✔':ok?T('RECLAMAR','CLAIM'):'🔒'}</button></div>`}).join('');
  B.innerHTML=`<h3>💎 ${S.gems}</h3><div class="ds">${T('Las gemas son difíciles de conseguir','Gems are hard to earn')}</div><div class="tabs"><button data-tab="i" class="${cur2==='i'?'on':''}">${T('OBJETOS','ITEMS')}</button><button data-tab="q" class="${cur2==='q'?'on':''}">${T('DESAFÍOS','CHALLENGES')}</button></div>${body}<button class="x" data-tab="x">${T('CERRAR','CLOSE')}</button>`}
 draw();let busy=false;
 B.addEventListener('click',e=>{if(busy)return;
  const t=e.target.closest('[data-tab]');if(t){click();if(t.dataset.tab==='x'){o.remove();return}cur2=t.dataset.tab;draw();return}
  const b=e.target.closest('[data-b]');
  if(b){busy=true;buy(b.dataset.b);ui();draw();setTimeout(()=>busy=false,250);return}
  const m=e.target.closest('[data-m]');
  if(m){const q=MS.find(z=>z.id===m.dataset.m);if(!q||S.cl[q.id]||q.p()<q.g)return;busy=true;S.cl[q.id]=1;S.gems+=q.r;save();ui();tst('+'+q.r+' 💎');draw();setTimeout(()=>busy=false,250)}})}
function buy(id){
 const it=ITEMS.find(z=>z.id===id);if(!it)return;
 if(it.k==='f'||it.k==='t'){const key=it.k==='f'?'eqF':'eqT';
  if(S.inv[id]){S[key]=S[key]===id?'':id;save();return}}
 if(S.gems<it.p){tst(T('No tienes suficientes gemas','Not enough gems'));return}
 if(it.k==='d'&&!window.DMR_ADD_DOP(it.v)){tst(T('No se pudo conectar con tus monedas DOP','Could not reach your DOP coins'));return}
 S.gems-=it.p;
 if(it.k==='c')S[id]=(S[id]||0)+(id==='boost'?3:1);
 else if(it.k==='f'||it.k==='t'){S.inv[id]=1;S[it.k==='f'?'eqF':'eqT']=id}
 save();tst('✔ '+it.n[lg()==='es'?0:1])}

/* ================= RANKING POR RANGO ================= */
async function rankingModal(){
 const o=modal(`<h3>🏆 ${T('CLASIFICACIÓN POR RANGO','RANK LEADERBOARD')}</h3><div class="ds" id="rkd">${T('Cargando…','Loading…')}</div><div id="rkl"></div><button class="x" data-c="1">${T('VOLVER','BACK')}</button>`);
 o.addEventListener('click',e=>{if(e.target.closest('[data-c]')){click();o.remove()}});
 const me=((prof&&prof.name)||'PLAYER'),mine=S.rp;let rows=[],online=false;
 try{if(navigator.onLine&&ME&&fb&&SY){const s=await FS.getDocs(FS.query(FS.collection(fb.db,'players'),FS.orderBy('rp','desc'),FS.limit(50)));
  s.forEach(d=>{const x=d.data();if(x&&x.name&&typeof x.rp==='number')rows.push({n:x.name,p:x.rp,id:d.id})});online=rows.length>0}}catch(e){}
 const meId=(prof&&prof.id)||'';let found=false;
 rows=rows.map(r=>{if(r.id===meId||r.n===me){found=true;return{n:me,p:mine,me:1}}return r});
 if(!found)rows.push({n:me,p:mine,me:1});
 rows.sort((a,b)=>b.p-a.p);
 if(!g('rkl'))return;
 g('rkd').textContent=online?T('Clasificación en línea','Online leaderboard'):T('Clasificación LOCAL (sin conexión o sin datos en línea)','LOCAL leaderboard (offline or no online data)');
 g('rkl').innerHTML=rows.slice(0,50).map((r,i)=>{const k=rankOf(r.p);
  return `<div class="rkr${r.me?' me':''}${i<3?' pd'+(i+1):''}"><span class="p">${['🥇','🥈','🥉'][i]||i+1}</span>${badge(k.t,k.t<7?k.d:-1,34)}<div><b>${String(r.n).replace(/[<>&]/g,'')}</b><small>${nameOf(k)}</small></div><em>${r.p}</em></div>`}).join('')}

/* ================= CLICS (se interceptan antes que el menú v35) ================= */
root.addEventListener('click',e=>{
 const lb=e.target.closest('[data-lg]');
 if(lb){e.stopImmediatePropagation();click();try{DMR_I18N.setLang(lb.dataset.lg)}catch(x){}g('lgd36').classList.remove('on');return}
 const b=e.target.closest('[data-a]');
 if(!e.target.closest('#h36 .r2b'))g('lgd36').classList.remove('on');
 if(!b)return;const a=b.dataset.a;
 if(a==='play'){pend={type:'rank',diff:'r',lvl:rankLvl()};setTimeout(()=>{if(pend&&pend.type==='rank')pend=null},4000);return}
 const Hh={ai:trainModal,to:()=>shopGems('q'),lv:rankScreen,rs:rankScreen,rk:rankingModal,sh:shopChooser,gem:()=>shopGems('i'),lg36:()=>g('lgd36').classList.toggle('on')};
 if(Hh[a]){e.stopImmediatePropagation();e.preventDefault();click();Hh[a]()}
},true);

relabel();ui();setInterval(ui,700);
})();

