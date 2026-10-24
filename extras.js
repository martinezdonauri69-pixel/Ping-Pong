/* AUTO-CALIDAD: si el juego va lento, baja la calidad solo */
(function(){
 let last=performance.now(),acc=0,n=0,cool=0;
 function tick(now){
  const dt=now-last;last=now;
  if(mode==='play'&&!paused&&dt<500){
   acc+=dt;n++;
   if(acc>=3000){
    const fps=n*1000/acc;acc=0;n=0;
    if(fps<42&&Date.now()>cool){
     if(SET.q>0){SET.q--;applyQ();saveS();toast('⚙ Calidad ajustada para que corra más fluido')}
     else if(!SET.red){SET.red=true;saveS();toast('⚙ Efectos reducidos para que corra más fluido')}
     cool=Date.now()+8000;
    }
   }
  }else{acc=0;n=0}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();


/* CONTADOR DE FPS: abajo a la derecha, discreto */
(function(){
 const el=document.createElement('div');
 el.style.cssText='position:fixed;right:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2;display:none;pointer-events:none;background:#000b;border:1px solid #ffffff33;border-radius:10px;padding:3px 9px;font:800 12px system-ui,Arial;letter-spacing:1px;box-shadow:0 0 10px rgba(0,0,0,.6)';
 document.body.appendChild(el);
 let last=performance.now(),n=0,acc=0;
 function tick(now){
  const dt=now-last;last=now;
  if(mode==='play'&&!paused&&dt<500){
   n++;acc+=dt;
   if(acc>=500){
    const f=Math.round(n*1000/acc),c=f>=50?'#4dff9a':f>=30?'#ffd400':'#ff4d5e';
    n=0;acc=0;
    el.innerHTML='<span style="opacity:.55;font-size:10px;letter-spacing:2px">FPS</span> <b style="color:'+c+';text-shadow:0 0 8px '+c+'">'+f+'</b>';
    el.style.display='block';
   }
  }else if(mode!=='play'){n=0;acc=0;el.style.display='none'}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();

/* ===== TIENDA V2 · PASO 1: estructura ===== */
(function(){
 if(window.__shopV2)return;window.__shopV2=1;

 const CATS=[['pad','🏓','PALETAS','Elige la paleta que usarás en la cancha.'],
  ['bl','⚪','PELOTAS','Elige el estilo que hará tu juego único.'],
  ['tb','🏞','FONDOS','Cambia el fondo de tu cancha.'],
  ['fx','✨','EFECTOS','Chispas y destellos cuando golpeas.'],
  ['th','🖥','TEMAS','Cambia los colores de todo el juego.'],
  ['win','🏆','VICTORIAS','Animaciones cuando ganas una partida.']];
 const S={cat:'bl',q:''};

 document.head.insertAdjacentHTML('beforeend',`<style>
 #sv{position:fixed;inset:0;z-index:19;display:flex;flex-direction:column;gap:10px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px calc(10px + env(safe-area-inset-bottom,0px));color:#fff;overflow:hidden;
  background:
   radial-gradient(1.5px 1.5px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 28% 72%,#9cf,transparent),
   radial-gradient(1.5px 1.5px at 47% 34%,#fff,transparent),radial-gradient(1px 1px at 63% 83%,#fff,transparent),
   radial-gradient(1.5px 1.5px at 78% 22%,#9cf,transparent),radial-gradient(1px 1px at 91% 61%,#fff,transparent),
   radial-gradient(1px 1px at 8% 90%,#fff,transparent),radial-gradient(1.5px 1.5px at 55% 8%,#9cf,transparent),
   radial-gradient(ellipse at 15% 0%,rgba(60,40,200,.35),transparent 55%),
   radial-gradient(ellipse at 90% 100%,rgba(0,160,255,.25),transparent 55%),#02030c}
 #sv,#sv *{touch-action:manipulation}
 #sv input{user-select:text;-webkit-user-select:text}
 .svH{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;border:2px solid #2a6bff;border-radius:16px;background:rgba(5,10,40,.75);box-shadow:0 0 18px rgba(42,107,255,.55),inset 0 0 14px rgba(0,200,255,.15)}
 .svT{display:flex;align-items:center;gap:10px;margin-right:auto}
 .svT svg{width:38px;height:38px;filter:drop-shadow(0 0 6px #00c8ff)}
 .svT b{display:block;font-size:24px;letter-spacing:4px;line-height:1;text-shadow:0 0 12px #2a6bff}
 .svT small{display:block;font-size:10px;letter-spacing:3px;color:#37d6ff;margin-top:2px}
 .svC{border:2px solid #ffd400;border-radius:14px;padding:7px 14px;font-weight:900;font-size:15px;color:#ffd400;background:rgba(40,30,0,.5);box-shadow:0 0 12px rgba(255,212,0,.4);white-space:nowrap}
 #svQ{flex:1 1 180px;min-width:0;padding:9px 12px;font-size:14px;border-radius:12px;border:2px solid #2a6bff;background:rgba(5,10,40,.9);color:#fff}
 .svB{width:42px;height:42px;border-radius:12px;border:2px solid #2a6bff;background:rgba(5,10,40,.9);color:#fff;font-size:19px;box-shadow:0 0 10px rgba(42,107,255,.5);flex:none}
 .svB.x{border-color:#37d6ff;font-size:20px;font-weight:900}
 .svB:active{transform:scale(.94)}
 .svM{flex:1;min-height:0;display:grid;grid-template-columns:190px minmax(0,1fr) 330px;gap:10px}
 .svL{display:flex;flex-direction:column;gap:8px;overflow-y:auto}
 .svL button{display:flex;align-items:center;gap:10px;padding:14px 12px;border-radius:12px;border:2px solid #1d4fc4;background:rgba(5,10,40,.8);color:#fff;font-size:14px;font-weight:800;letter-spacing:1px;text-align:left;transition:.15s}
 .svL button span{font-size:22px;width:28px;text-align:center}
 .svL button.on{border-color:#37d6ff;background:rgba(0,90,200,.35);box-shadow:0 0 16px #00c8ff,inset 0 0 12px rgba(0,200,255,.35);text-shadow:0 0 8px #fff}
 .svC2,.svR{border:2px solid #2a6bff;border-radius:16px;background:rgba(5,10,40,.7);box-shadow:0 0 16px rgba(42,107,255,.4);min-height:0;overflow-y:auto;padding:12px}
 #svT{display:flex;align-items:center;gap:10px;padding-bottom:10px;border-bottom:1px solid #2a6bff55;margin-bottom:10px}
 #svT span{font-size:28px}#svT b{display:block;font-size:22px;letter-spacing:2px}#svT small{opacity:.8;font-size:12px}
 #svG{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;align-content:start}
 .svE{grid-column:1/-1;text-align:center;padding:30px 10px;opacity:.75;font-size:13px;line-height:1.6}
 @media(max-width:900px){
  .svM{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
  .svL{flex-direction:row;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}.svL::-webkit-scrollbar{display:none}
  .svL button{flex:none;padding:10px 12px;font-size:12px}.svL button span{font-size:17px;width:auto}
  .svR{display:none}
  .svT b{font-size:19px}
 }
 </style>`);

 document.body.insertAdjacentHTML('beforeend',`
 <div id="sv" class="hide">
  <div class="svH">
   <div class="svT"><svg viewBox="0 0 48 48" fill="none" stroke="#37d6ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h7l5 24h22l5-17H13"/><circle cx="19" cy="40" r="3"/><circle cx="34" cy="40" r="3"/></svg><div><b>TIENDA</b><small>PERSONALIZA TU JUEGO</small></div></div>
   <div class="svC" id="svCoin">DOP 0</div>
   <input id="svQ" class="in" placeholder="🔍 Buscar artículos..." maxlength="24" autocomplete="off">
   <button class="svB" id="svFr" type="button" aria-label="Amigos">👥</button>
   <button class="svB" id="svIb" type="button" aria-label="Mensajes">✉</button>
   <button class="svB" id="svSt" type="button" aria-label="Ajustes">⚙</button>
   <button class="svB x" id="svX" type="button" aria-label="Cerrar">✕</button>
  </div>
  <div class="svM">
   <div class="svL" id="svL"></div>
   <div class="svC2"><div id="svT"></div><div id="svG"></div></div>
   <div class="svR" id="svR"><div class="svE">Aquí aparecerán los detalles del artículo que selecciones.</div></div>
  </div>
 </div>`);

 function paintCoin(){$('svCoin').textContent='DOP '+fmt(prof.pc||0)}
 function render(){
  const L=$('svL');L.innerHTML='';
  CATS.forEach(([k,ic,nm])=>{const b=document.createElement('button');b.type='button';b.className=k===S.cat?'on':'';
   b.innerHTML='<span>'+ic+'</span>'+nm;
   b.onclick=()=>{SFX.click();S.cat=k;S.q='';$('svQ').value='';render()};L.appendChild(b)});
  const c=CATS.find(z=>z[0]===S.cat);
  $('svT').innerHTML='<span>'+c[1]+'</span><div><b>'+c[2]+'</b><small>'+c[3]+'</small></div>';
  $('svG').innerHTML='<div class="svE">'+(S.q?'Buscando: <b>'+esc(S.q)+'</b><br>':'')+'Aquí irán las tarjetas de <b>'+c[2]+'</b> (Paso 2).</div>';
  paintCoin()}

 function open(){au();SFX.click();S.q='';$('svQ').value='';$('sv').classList.remove('hide');render()}
 function close(){$('sv').classList.add('hide')}

 /* conectar con tu juego: el botón TIENDA del menú abre la nueva tienda */
 $('nSh').onclick=open;
 $('svX').onclick=()=>{SFX.click();close()};
 $('svQ').oninput=e=>{S.q=e.target.value;render()};
 /* accesos que ya existen en tu juego (se abren encima de la tienda) */
 $('svFr').onclick=()=>{SFX.click();const b=$('tpFr');if(b)b.click()};
 $('svIb').onclick=()=>{SFX.click();const b=$('tpIb');if(b)b.click()};
 $('svSt').onclick=()=>{SFX.click();$('gear').click()};
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('sv').classList.contains('hide'))close()});

 /* el saldo se actualiza solo (es el mismo saldo de tu juego: prof.pc) */
 const _u=updPC;updPC=function(){_u.apply(this,arguments);if(!$('sv').classList.contains('hide'))paintCoin()};
})();