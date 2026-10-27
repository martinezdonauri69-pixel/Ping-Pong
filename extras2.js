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

