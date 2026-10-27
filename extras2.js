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

