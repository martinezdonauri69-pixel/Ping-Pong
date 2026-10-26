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


/* ===== TIENDA V3 · COMPLETA (pelotas + victorias) ===== */
(function(){
 if(window.__shopV3)return;window.__shopV3=1;
 const old=document.getElementById('sv');if(old)old.remove();
 const TAU=6.283185,rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
 const RAR={c:['COMÚN','#9aa7c7',0],r:['RARA','#4da6ff',1],e:['ÉPICA','#c06bff',2],l:['LEGENDARIA','#ffd400',3],m:['MÍTICA','#ff3df2',4]};
 const CATS=[['pad','🏓','PALETAS','Elige la paleta que usarás en la cancha.'],['bl','⚪','PELOTAS','Elige el estilo que hará tu juego único.'],['tb','🏞','FONDOS','Cambia el fondo de tu cancha.'],['fx','✨','EFECTOS','Chispas cuando golpeas la pelota.'],['th','🖥','TEMAS','Cambia los colores de todo el juego.'],['win','🏆','VICTORIAS','Una celebración cada vez que ganas.']];
 const CNAME={pad:'Paletas',bl:'Pelotas',tb:'Fondos',fx:'Efectos',th:'Temas',win:'Victorias'};

 /* ---------- ayudas de dibujo ---------- */
 function star4(g,R,w){g.beginPath();for(let k=0;k<8;k++){const q=k%2?R*w:R,a=k*.7854;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}
 function star5(g,R){g.beginPath();for(let k=0;k<10;k++){const q=k%2?R*.45:R,a=k*.6283-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}
 function heart(g,s){g.beginPath();g.moveTo(0,s*.7);g.bezierCurveTo(-s*1.3,-s*.1,-s*.6,-s,0,-s*.35);g.bezierCurveTo(s*.6,-s,s*1.3,-s*.1,0,s*.7);g.closePath()}
 function tend(g,r,t,col,n){const q=Math.floor(t*10);g.strokeStyle=col;g.lineWidth=Math.max(1,r*.07);g.beginPath();for(let k=0;k<n;k++){const a=rd(q+k*3)*TAU;g.moveTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(a+.18)*r*1.3,Math.sin(a+.18)*r*1.3);g.lineTo(Math.cos(a-.05)*r*1.6,Math.sin(a-.05)*r*1.6)}g.stroke()}
 function bhRing(g,r,c,a0,a1){g.save();g.rotate(-.35);const gr=g.createLinearGradient(-r*1.7,0,r*1.7,0);gr.addColorStop(0,'rgba(255,120,20,0)');gr.addColorStop(.25,c[1]);gr.addColorStop(.5,c[2]);gr.addColorStop(.75,c[1]);gr.addColorStop(1,'rgba(255,120,20,0)');g.strokeStyle=gr;g.lineWidth=r*.3;g.shadowColor=c[1];g.shadowBlur=r*.9;g.beginPath();g.ellipse(0,0,r*1.7,r*.5,0,a0,a1);g.stroke();g.shadowBlur=0;g.lineWidth=r*.06;g.strokeStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(0,0,r*1.7,r*.5,0,a0,a1);g.stroke();g.restore()}
 function rr(g,x,y,w,h,r){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)}

 /* ---------- DISEÑOS DE PELOTAS (cada estilo es distinto) ---------- */
 const ST={
 blanca:{body(g,r,t,c){g.strokeStyle=c[1];g.lineWidth=r*.09;g.beginPath();g.arc(r*.18,r*.05,r*.24,0,TAU);g.stroke()}},
 azul:{body(g,r,t,c){g.rotate(-.5+Math.sin(t)*.1);g.fillStyle=c[1];g.fillRect(-r,-r*.13,2*r,r*.26);g.fillStyle='#fff';g.fillRect(-r,-r*.34,2*r,r*.05);g.fillRect(-r,r*.29,2*r,r*.05)}},
 roja:{body(g,r,t,c){g.rotate(t*.8);g.fillStyle=c[1];for(let k=0;k<6;k++){const a=k*1.0472;g.beginPath();g.arc(Math.cos(a)*r*.6,Math.sin(a)*r*.6,r*.13,0,TAU);g.fill()}g.beginPath();g.arc(0,0,r*.18,0,TAU);g.fill()}},
 verde:{body(g,r,t,c){g.rotate(t*.9);g.strokeStyle=c[1];g.lineWidth=r*.12;g.lineCap='round';g.beginPath();g.arc(-r*1.15,0,r*.95,-1.05,1.05);g.stroke();g.beginPath();g.arc(r*1.15,0,r*.95,Math.PI-1.05,Math.PI+1.05);g.stroke()}},
 amarilla:{body(g,r,t,c){g.fillStyle=c[1];g.beginPath();g.ellipse(-r*.32,-r*.2,r*.1,r*.17,0,0,TAU);g.fill();g.beginPath();g.ellipse(r*.32,-r*.2,r*.1,r*.17,0,0,TAU);g.fill();g.strokeStyle=c[1];g.lineWidth=r*.1;g.lineCap='round';g.beginPath();g.arc(0,r*.05,r*.5,.3,Math.PI-.3);g.stroke()}},
 naranja:{body(g,r,t,c){g.rotate(t*.7);g.strokeStyle=c[1];g.lineWidth=r*.09;g.beginPath();g.moveTo(-r,0);g.lineTo(r,0);g.moveTo(0,-r);g.lineTo(0,r);g.stroke();g.beginPath();g.arc(-r*1.2,0,r*.85,-1,1);g.stroke();g.beginPath();g.arc(r*1.2,0,r*.85,Math.PI-1,Math.PI+1);g.stroke()}},
 electrica:{ext:1.6,gl:'#4da6ff',gb:1.8,body(g,r,t,c){const q=Math.floor(t*12);g.lineCap='round';g.lineJoin='round';for(let k=0;k<3;k++){const a0=k*2.094+rd(q+k)*1.5;g.beginPath();g.moveTo(0,0);for(let s=1;s<=5;s++){const a=a0+(rd(q*7+k*5+s)-.5)*1.3,d=r*s/5;g.lineTo(Math.cos(a)*d,Math.sin(a)*d)}g.strokeStyle=c[1];g.lineWidth=r*.12;g.shadowColor='#fff';g.shadowBlur=r*.4;g.stroke()}g.shadowBlur=0;const gl=g.createRadialGradient(0,0,0,0,0,r*.5);gl.addColorStop(0,'rgba(255,255,255,.9)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(-r,-r,2*r,2*r)},out(g,r,t,c){tend(g,r,t,c[1],3)}},
 hielo:{ext:1.4,body(g,r,t,c){const q=g.createRadialGradient(0,0,0,0,0,r);q.addColorStop(0,'rgba(255,255,255,.55)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r);g.rotate(t*.3);g.strokeStyle=c[1];g.lineWidth=r*.09;g.lineCap='round';for(let k=0;k<6;k++){g.rotate(1.0472);g.beginPath();g.moveTo(0,0);g.lineTo(r*.9,0);g.moveTo(r*.5,0);g.lineTo(r*.72,r*.2);g.moveTo(r*.5,0);g.lineTo(r*.72,-r*.2);g.stroke()}},out(g,r,t,c){g.fillStyle=c[1];for(let k=0;k<4;k++){const a=k*1.5708+t*.5;g.save();g.translate(Math.cos(a)*r*1.25,Math.sin(a)*r*1.25);g.globalAlpha=.6+.4*Math.sin(t*4+k);star4(g,r*.2,.3);g.fill();g.restore()}}},
 neon:{ext:1.3,gl:'#00ffd0',gb:2,hi:.12,ed:.15,body(g,r,t,c){const p=.5+.5*Math.sin(t*3);g.lineWidth=r*.1;g.strokeStyle=c[1];g.shadowColor=c[1];g.shadowBlur=r*.6;g.beginPath();g.arc(0,0,r*.72,0,TAU);g.stroke();g.strokeStyle=c[2];g.shadowColor=c[2];g.beginPath();g.arc(0,0,r*(.32+.12*p),0,TAU);g.stroke();g.strokeStyle=c[1];g.shadowColor=c[1];g.beginPath();g.moveTo(-r*.72,0);g.lineTo(r*.72,0);g.stroke();g.shadowBlur=0}},
 mono:{body(g,r,t,c){g.rotate(t*.7);g.fillStyle=c[1];for(let k=-5;k<5;k++)g.fillRect(-r*1.5,k*r*.36,3*r,r*.18)}},
 venenosa:{ext:1.4,gl:'#b6ff3a',body(g,r,t,c){g.strokeStyle=c[2];g.lineWidth=r*.14;g.globalAlpha=.5;g.beginPath();g.arc(0,0,r*.55,t*2,t*2+3.5);g.stroke();g.globalAlpha=1;for(let k=0;k<7;k++){const p=(t*.25+k/7)%1,x=(rd(k)-.5)*r*1.4,y=r*(1-2*p),q=r*(.1+.12*rd(k+9));g.fillStyle='rgba(182,255,58,.55)';g.beginPath();g.arc(x,y,q,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=r*.03;g.stroke()}},out(g,r,t,c){g.fillStyle=c[1];for(let k=0;k<5;k++){const p=(t*.5+k/5)%1;g.globalAlpha=1-p;g.beginPath();g.arc((rd(k+20)-.5)*r*1.8,-r*(1+p*.6),r*.08,0,TAU);g.fill()}g.globalAlpha=1}},
 magnetica:{ext:1.5,body(g,r,t,c){g.rotate(t*1.2);g.fillStyle=c[1];g.fillRect(0,-r,r,2*r);g.fillStyle='#e8ecf5';g.fillRect(-r*.1,-r,r*.2,2*r)},out(g,r,t,c){g.save();g.rotate(t*1.2);g.strokeStyle='rgba(220,230,255,'+(.4+.3*Math.sin(t*4))+')';g.lineWidth=Math.max(1,r*.05);for(let k=0;k<2;k++){g.beginPath();g.arc(0,0,r*(1.2+.2*k),-.8,.8);g.stroke();g.beginPath();g.arc(0,0,r*(1.2+.2*k),Math.PI-.8,Math.PI+.8);g.stroke()}g.restore()}},
 fuego:{ext:1.7,gl:'#ff5a1f',gb:2,body(g,r,t,c){const gr=g.createRadialGradient(0,r*.2,0,0,r*.2,r);gr.addColorStop(0,'#fff6a0');gr.addColorStop(.4,c[1]);gr.addColorStop(1,c[0]);g.fillStyle=gr;g.fillRect(-r,-r,2*r,2*r);for(let k=0;k<5;k++){const x=(k-2)*r*.4,h=r*(.9+.5*Math.sin(t*9+k*2));g.fillStyle='rgba(255,230,120,.55)';g.beginPath();g.moveTo(x-r*.2,r);g.quadraticCurveTo(x-r*.05,r-h*.5,x,r-h);g.quadraticCurveTo(x+r*.05,r-h*.5,x+r*.2,r);g.fill()}},out(g,r,t,c){for(let k=0;k<9;k++){const a=-1.5708+(k-4)*.4,L=r*(.5+.35*Math.sin(t*10+k*1.7));g.fillStyle=k%2?'rgba(255,140,0,.85)':'rgba(255,220,60,.8)';g.beginPath();g.moveTo(Math.cos(a-.22)*r*.95,Math.sin(a-.22)*r*.95);g.lineTo(Math.cos(a+Math.sin(t*8+k)*.15)*(r+L),Math.sin(a+Math.sin(t*8+k)*.15)*(r+L));g.lineTo(Math.cos(a+.22)*r*.95,Math.sin(a+.22)*r*.95);g.fill()}}},
 plasma:{ext:1.55,gl:'#c06bff',gb:2,body(g,r,t,c){g.lineCap='round';for(let k=0;k<4;k++){g.strokeStyle=k%2?c[1]:c[2];g.lineWidth=r*.15;g.globalAlpha=.8;g.beginPath();for(let s=0;s<=24;s++){const u=s/24,a=u*9.4+k*1.57+t*2;s?g.lineTo(Math.cos(a)*u*r,Math.sin(a)*u*r):g.moveTo(0,0)}g.stroke()}g.globalAlpha=1;const q=g.createRadialGradient(0,0,0,0,0,r*.5);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(1,'rgba(224,139,255,0)');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r)},out(g,r,t,c){tend(g,r,t,c[1],4)}},
 cristal:{ext:1.25,gl:'#9fe9ff',body(g,r,t,c){g.rotate(t*.3);for(let k=0;k<8;k++){const a0=k*.7854,a1=a0+.7854;g.fillStyle=k%2?'rgba(255,255,255,'+(.2+.2*Math.sin(t*2+k))+')':'rgba(77,166,255,'+(.25+.2*Math.sin(t*2+k))+')';g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a0)*r,Math.sin(a0)*r);g.lineTo(Math.cos(a1)*r,Math.sin(a1)*r);g.fill()}g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=r*.04;g.beginPath();for(let k=0;k<8;k++){g.moveTo(0,0);g.lineTo(Math.cos(k*.7854)*r,Math.sin(k*.7854)*r)}g.stroke();g.beginPath();for(let k=0;k<8;k++){const a=k*.7854;k?g.lineTo(Math.cos(a)*r*.55,Math.sin(a)*r*.55):g.moveTo(Math.cos(a)*r*.55,Math.sin(a)*r*.55)}g.closePath();g.stroke()},out(g,r,t,c){g.save();g.translate(-r*.5,-r*.5);g.globalAlpha=.5+.5*Math.sin(t*4);g.fillStyle='#fff';star4(g,r*.35,.2);g.fill();g.restore()}},
 galactica:{ext:1.4,gl:'#b86bff',body(g,r,t,c){for(let i=0;i<110;i++){const u=i/110,a=u*9+t*.8+(i%2)*3.1416,d=u*r;g.globalAlpha=.4+.6*rd(i+1);g.fillStyle=i%3?c[1]:c[2];g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,r*(.03+.05*rd(i)),0,TAU);g.fill()}g.globalAlpha=1;const q=g.createRadialGradient(0,0,0,0,0,r*.4);q.addColorStop(0,'rgba(255,255,255,.9)');q.addColorStop(1,'rgba(184,107,255,0)');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r)},out(g,r,t,c){g.fillStyle='#fff';for(let k=0;k<3;k++){const a=t*.9+k*2.09;g.beginPath();g.arc(Math.cos(a)*r*1.25,Math.sin(a)*r*1.25,r*.07,0,TAU);g.fill()}}},
 tormenta:{ext:1.3,gl:'#9fb4ff',body(g,r,t,c){for(let k=0;k<5;k++){const x=((t*.15+k/5)%1)*2.4*r-1.2*r,y=(rd(k)-.5)*r*1.2;g.fillStyle='rgba(120,135,170,.55)';g.beginPath();g.arc(x,y,r*.5,0,TAU);g.fill()}g.strokeStyle='rgba(159,180,255,.7)';g.lineWidth=r*.04;g.beginPath();for(let k=0;k<7;k++){const x=(rd(k+3)-.5)*2*r,y=((t*2+rd(k))%1)*2*r-r;g.moveTo(x,y);g.lineTo(x-r*.1,y+r*.25)}g.stroke();const f=t%1.4;if(f<.14){g.fillStyle='rgba(255,246,160,'+(.55*(1-f/.14))+')';g.fillRect(-r,-r,2*r,2*r);const sd=Math.floor(t/1.4);g.strokeStyle=c[2];g.lineWidth=r*.14;g.shadowColor=c[2];g.shadowBlur=r*.6;g.beginPath();g.moveTo(r*.1,-r);for(let s=1;s<=5;s++)g.lineTo((rd(sd*9+s)-.5)*r*.8,-r+s*r*.4);g.stroke()}}},
 espectral:{ext:1.5,al:.82,gl:'#9fd8ff',body(g,r,t,c){g.fillStyle=c[1];g.beginPath();g.ellipse(-r*.3,-r*.1,r*.14,r*.22,0,0,TAU);g.fill();g.beginPath();g.ellipse(r*.3,-r*.1,r*.14,r*.22,0,0,TAU);g.fill();g.beginPath();g.ellipse(0,r*.35,r*.12,r*.18,0,0,TAU);g.fill()},out(g,r,t,c){g.strokeStyle='rgba(200,230,255,.5)';g.lineWidth=r*.18;g.lineCap='round';for(let k=0;k<3;k++){g.beginPath();for(let s=0;s<=8;s++){const x=(k-1)*r*.5+Math.sin(t*4+s*.8+k)*r*.12,y=r*.9+s*r*.13;s?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}},
 dorada:{ext:1.55,gl:'#ffc800',gb:1.8,body(g,r,t,c){const q=g.createLinearGradient(-r,-r,r,r);q.addColorStop(0,'#fff3a0');q.addColorStop(.35,'#ffc800');q.addColorStop(.7,'#b87a00');q.addColorStop(1,'#ffd84d');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r);const sx=((t*.6)%2-1)*r*1.6;g.save();g.rotate(.7);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(sx-r*.12,-r*1.5,r*.24,r*3);g.restore();g.fillStyle='#fff';g.globalAlpha=.5+.5*Math.sin(t*5);g.save();g.translate(r*.25,-r*.3);star4(g,r*.3,.2);g.fill();g.restore();g.globalAlpha=1},out(g,r,t,c){for(let k=0;k<12;k++){const a=k*.5236+t*.6,d=r*(1.15+.35*Math.sin(t*3+k));g.save();g.translate(Math.cos(a)*d,Math.sin(a)*d);g.globalAlpha=.5+.5*Math.sin(t*5+k);g.fillStyle=k%2?c[1]:c[0];if(k%3===0){star4(g,r*.18,.25);g.fill()}else{g.beginPath();g.arc(0,0,r*.06,0,TAU);g.fill()}g.restore()}}},
 arcoiris:{gl:'#ffffff',gb:1.4,body(g,r,t,c){g.rotate(t*.8);for(let k=0;k<8;k++){g.fillStyle='hsl('+((k*45+t*120)%360)+',95%,58%)';g.fillRect(-r*1.5,(k-4)*r*.4,3*r,r*.41)}}},
 lava:{ext:1.35,gl:'#ff5a00',gb:1.8,hi:.15,body(g,r,t,c){const q=g.createRadialGradient(0,0,0,0,0,r);q.addColorStop(0,'rgba(255,90,0,.45)');q.addColorStop(1,'rgba(255,90,0,0)');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r);g.rotate(t*.3);g.lineCap='round';g.lineJoin='round';for(let k=0;k<7;k++){const a=k*.897+.3,pu=.7+.3*Math.sin(t*3+k);g.beginPath();g.moveTo(0,0);for(let s=1;s<=3;s++){const an=a+(rd(k*5+s)-.5)*.8,d=r*s/3*1.05;g.lineTo(Math.cos(an)*d,Math.sin(an)*d)}g.strokeStyle=c[1];g.globalAlpha=pu;g.lineWidth=r*.11;g.shadowColor=c[1];g.shadowBlur=r*.5;g.stroke();g.shadowBlur=0;g.strokeStyle=c[2];g.lineWidth=r*.04;g.stroke()}g.globalAlpha=1},out(g,r,t,c){g.fillStyle=c[2];for(let k=0;k<5;k++){const p=(t*.4+k/5)%1;g.globalAlpha=1-p;g.beginPath();g.arc((rd(k)-.5)*r*1.6,-r*(.9+p*.9),r*.07,0,TAU);g.fill()}g.globalAlpha=1}},
 nebulosa:{ext:1.5,gl:'#ff4fd8',gb:1.8,body(g,r,t,c){g.globalCompositeOperation='lighter';for(let k=0;k<4;k++){const cx=Math.cos(t*.4+k*1.6)*r*.45,cy=Math.sin(t*.35+k*2.1)*r*.45,q=g.createRadialGradient(cx,cy,0,cx,cy,r*.8);q.addColorStop(0,k%2?'rgba(255,79,216,.6)':'rgba(79,200,255,.6)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r)}g.globalCompositeOperation='source-over';g.fillStyle='#fff';for(let k=0;k<14;k++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*2+k));g.fillRect((rd(k)-.5)*r*1.8,(rd(k+7)-.5)*r*1.8,r*.05,r*.05)}g.globalAlpha=1},out(g,r,t,c){for(let k=0;k<8;k++){const a=t*.8+k*.785,d=r*(1.2+.3*Math.sin(t*2+k));g.globalAlpha=.5+.5*Math.sin(t*3+k);g.fillStyle=k%2?c[1]:c[2];g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,r*.07,0,TAU);g.fill()}g.globalAlpha=1}},
 solar:{ext:1.6,gl:'#ffb300',gb:2.2,hi:.2,ed:.25,body(g,r,t,c){const q=g.createRadialGradient(0,0,0,0,0,r);q.addColorStop(0,'#fffbe0');q.addColorStop(.3,c[1]);q.addColorStop(.7,c[0]);q.addColorStop(1,c[2]);g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r);g.fillStyle='rgba(120,50,0,.45)';for(let k=0;k<4;k++){const a=t*.4+k*1.9,d=r*(.3+.3*rd(k));g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,r*(.08+.05*rd(k+4)),0,TAU);g.fill()}},out(g,r,t,c,lt){const m=lt?.5:1;for(let k=0;k<14;k++){const a=k*.4488+t*.3,L=r*(.3+.25*Math.abs(Math.sin(t*3+k*2)))*m;g.fillStyle=k%2?'rgba(255,200,60,.85)':'rgba(255,120,20,.8)';g.beginPath();g.moveTo(Math.cos(a-.12)*r*.95,Math.sin(a-.12)*r*.95);g.lineTo(Math.cos(a)*(r+L),Math.sin(a)*(r+L));g.lineTo(Math.cos(a+.12)*r*.95,Math.sin(a+.12)*r*.95);g.fill()}}},
 cosmica:{ext:1.9,gl:'#7a5bff',gb:1.8,body(g,r,t,c){for(let k=0;k<6;k++){g.fillStyle=k%2?c[1]:c[0];g.fillRect(-r,-r+k*r/3,2*r,r/3+1)}g.fillStyle='#fff';for(let k=0;k<5;k++){g.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+k));g.fillRect((rd(k)-.5)*r*1.6,(rd(k+8)-.5)*r*1.6,r*.06,r*.06)}g.globalAlpha=1},out(g,r,t,c){g.save();g.rotate(-.35);g.strokeStyle=c[2];g.lineWidth=r*.16;g.globalAlpha=.9;g.shadowColor=c[2];g.shadowBlur=r*.4;g.beginPath();g.ellipse(0,0,r*1.7,r*.45,0,0,TAU);g.stroke();g.lineWidth=r*.06;g.beginPath();g.ellipse(0,0,r*1.45,r*.36,0,0,TAU);g.stroke();g.shadowBlur=0;g.globalAlpha=1;const a=t*1.4;g.fillStyle='#fff';g.beginPath();g.arc(Math.cos(a)*r*1.7,Math.sin(a)*r*.45,r*.1,0,TAU);g.fill();g.restore()}},
 pixel:{nc:1,body(g,r,t,c){g.shadowColor=c[1];g.shadowBlur=r*.8;g.fillStyle=c[0];g.beginPath();g.arc(0,0,r*.85,0,TAU);g.fill();g.shadowBlur=0;const n=8,s=2*r/n,q=Math.floor(t*3);for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-r+i*s+s/2,y=-r+j*s+s/2;if(Math.hypot(x,y)>r*1.02)continue;const v=rd(i*13+j*7+(rd(i+j*3)>.7?q:0));g.fillStyle=(x+y<-r*.5)?(v>.5?c[2]:c[1]):(x+y>r*.5)?(v>.5?c[0]:'#052a6a'):(v>.66?c[2]:v>.33?c[1]:c[0]);g.fillRect(x-s/2,y-s/2,s+.5,s+.5)}}},
 agujero:{ext:1.8,gl:'#ff9a2a',gb:2.5,hi:0,ed:0,pre(g,r,t,c){bhRing(g,r,c,Math.PI,TAU)},body(g,r,t,c){g.strokeStyle='rgba(140,80,220,.35)';g.lineWidth=r*.05;for(let k=0;k<3;k++){g.beginPath();g.arc(0,0,r*(.3+.2*k),t*(k+1),t*(k+1)+3);g.stroke()}},out(g,r,t,c){bhRing(g,r,c,0,Math.PI);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=Math.max(1,r*.05);g.beginPath();g.arc(0,0,r*1.04,0,TAU);g.stroke()}},
 supernova:{ext:2.3,gl:'#ffd45a',gb:2.6,hi:.25,ed:.2,body(g,r,t,c){const q=g.createRadialGradient(0,0,0,0,0,r);q.addColorStop(0,c[0]);q.addColorStop(.35,c[1]);q.addColorStop(1,c[2]);g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r);const p=(t*.8)%1;g.strokeStyle='rgba(255,255,255,'+(1-p)+')';g.lineWidth=r*.1;g.beginPath();g.arc(0,0,r*p,0,TAU);g.stroke()},out(g,r,t,c,lt){const m=lt?.55:1;g.save();g.globalCompositeOperation='lighter';for(let k=0;k<12;k++){const a=k*.5236+t*.5,L=r*(.6+.5*Math.abs(Math.sin(t*4+k*1.3)))*m;g.fillStyle='rgba(255,225,150,.85)';g.beginPath();g.moveTo(Math.cos(a-.09)*r*.9,Math.sin(a-.09)*r*.9);g.lineTo(Math.cos(a)*(r+L),Math.sin(a)*(r+L));g.lineTo(Math.cos(a+.09)*r*.9,Math.sin(a+.09)*r*.9);g.fill()}g.save();g.rotate(t*.4);g.fillStyle='rgba(255,255,255,.9)';star4(g,r*2.2*m,.07);g.fill();g.rotate(.785);star4(g,r*1.6*m,.07);g.fill();g.restore();for(let k=0;k<8;k++){const p=(t*1.2+k/8)%1,a=rd(k)*TAU,d=r*(1+p*1.2);g.globalAlpha=1-p;g.fillStyle='#fff';g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,r*.06,0,TAU);g.fill()}g.restore()}},
 dimensional:{ext:1.6,gl:'#00ffd0',gb:2,body(g,r,t,c){g.lineWidth=r*.09;for(let k=0;k<5;k++){g.strokeStyle='hsl('+((k*50+t*80)%360)+',100%,60%)';g.setLineDash([r*.4,r*.25]);g.lineDashOffset=-t*r*(k%2?1:-1)*1.2;g.beginPath();g.arc(0,0,r*(.2+.16*k),0,TAU);g.stroke()}g.setLineDash([]);g.fillStyle='#000';g.beginPath();g.arc(0,0,r*.12,0,TAU);g.fill();const q=Math.floor(t*10);g.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<3;k++)g.fillRect(-r,(rd(q+k*5)-.5)*2*r,2*r,Math.max(1,r*.04))},out(g,r,t,c){g.save();g.rotate(t);g.setLineDash([r*.3,r*.2]);g.strokeStyle=c[2];g.lineWidth=Math.max(1,r*.08);g.beginPath();g.ellipse(0,0,r*1.5,r*.5,0,0,TAU);g.stroke();g.setLineDash([]);g.restore()}},
 infinita:{ext:1.35,gl:'#ffffff',gb:1.6,body(g,r,t,c){g.rotate(Math.sin(t)*.3);g.lineCap='round';g.lineWidth=r*.16;let px=0,py=0;for(let s=0;s<=36;s++){const u=s/36*TAU,d=1+Math.pow(Math.sin(u),2),x=r*.8*Math.cos(u)/d,y=r*.8*Math.sin(u)*Math.cos(u)/d;if(s){g.strokeStyle='hsl('+((s*10+t*100)%360)+',100%,62%)';g.beginPath();g.moveTo(px,py);g.lineTo(x,y);g.stroke()}px=x;py=y}},out(g,r,t,c){g.strokeStyle='rgba(255,255,255,'+(.35+.25*Math.sin(t*3))+')';g.lineWidth=Math.max(1,r*.06);g.beginPath();g.arc(0,0,r*(1.12+.05*Math.sin(t*3)),0,TAU);g.stroke()}},
 dios:{ext:2.9,gl:'#ffc800',gb:2.6,hi:.3,
  pre(g,r,t,c,lt){if(lt)return;g.save();g.globalCompositeOperation='lighter';for(let k=0;k<16;k++){const a=k*.3927+t*.2,L=r*(2.2+.4*Math.sin(t*2+k));g.fillStyle='rgba(255,215,90,.22)';g.beginPath();g.moveTo(Math.cos(a-.07)*r,Math.sin(a-.07)*r);g.lineTo(Math.cos(a)*L,Math.sin(a)*L);g.lineTo(Math.cos(a+.07)*r,Math.sin(a+.07)*r);g.fill()}g.restore();for(const sd of [-1,1]){g.save();g.translate(sd*r*.7,-r*.1);g.scale(sd,1);for(let f=0;f<5;f++){g.save();g.rotate(-.95+f*.34+Math.sin(t*3)*.07);g.fillStyle=f%2?'rgba(255,248,205,.9)':'rgba(255,214,90,.9)';g.beginPath();g.ellipse(r*1.15,0,r*1.05,r*.2,0,0,TAU);g.fill();g.restore()}g.restore()}},
  body(g,r,t,c){const q=g.createRadialGradient(0,0,0,0,0,r);q.addColorStop(0,'#fff');q.addColorStop(.4,c[0]);q.addColorStop(.8,c[1]);q.addColorStop(1,'#b87a00');g.fillStyle=q;g.fillRect(-r,-r,2*r,2*r);g.save();g.rotate(t*.8);g.fillStyle='rgba(255,255,255,.35)';for(let k=0;k<12;k++){g.rotate(.5236);g.beginPath();g.moveTo(0,0);g.lineTo(r,-r*.12);g.lineTo(r,r*.12);g.fill()}g.restore();g.lineWidth=r*.1;for(let s=0;s<36;s++){g.strokeStyle='hsl('+((s*10+t*120)%360)+',100%,62%)';g.beginPath();g.arc(0,0,r*.62,s*.1745+t,s*.1745+t+.19);g.stroke()}const cg=g.createRadialGradient(0,0,0,0,0,r*.4);cg.addColorStop(0,'#fff');cg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=cg;g.fillRect(-r,-r,2*r,2*r)},
  out(g,r,t,c,lt){g.strokeStyle='#ffd45a';g.lineWidth=Math.max(1,r*.1);g.shadowColor='#ffc800';g.shadowBlur=r*.6;g.beginPath();g.ellipse(0,-r*1.35,r*.75,r*.2,0,0,TAU);g.stroke();g.shadowBlur=0;g.save();g.rotate(t);g.setLineDash([r*.3,r*.2]);g.strokeStyle='rgba(255,215,90,.8)';g.beginPath();g.arc(0,0,r*(lt?1.35:1.55),0,TAU);g.stroke();g.rotate(-2*t);g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(0,0,r*(lt?1.55:1.8),0,TAU);g.stroke();g.setLineDash([]);g.restore();for(let k=0;k<5;k++){const a=t*1.5+k*1.2566,d=r*((lt?1.55:1.7)+.15*Math.sin(t*2+k));g.save();g.translate(Math.cos(a)*d,Math.sin(a)*d);g.rotate(t*3);g.fillStyle=k%2?'#fff':'#ffd45a';g.shadowColor='#ffc800';g.shadowBlur=r*.4;star5(g,r*.22);g.fill();g.restore()}}}
 };

 /* ---------- CATÁLOGO: 30 PELOTAS (id, nombre, rareza, precio, diseño, colores, estela, rebote, descripción, apariencia, color, estela, rebote) ---------- */
 const ROWS=[
 ['sb01','Pelota Blanca','c',500,'blanca',['#f6f8ff','#c9d3ee'],'dot:#99ccff',['#ffffff','#cfe0ff'],'La clásica pelota blanca de ping pong, limpia y con un suave brillo.','Esfera blanca lisa con un pequeño logo','Blanco perla','Estela celeste suave','Chispas blancas'],
 ['sb02','Pelota Azul','c',600,'azul',['#2a6bff','#bcd6ff'],'dot:#2a6bff',['#2a6bff','#bcd6ff'],'Azul intenso con una franja plateada que se mueve mientras vuela.','Esfera azul con franja plateada','Azul eléctrico','Estela azul','Chispas azules'],
 ['sb03','Pelota Roja','c',700,'roja',['#ff2233','#ffc2c8'],'dot:#ff2233',['#ff2233','#ffc2c8'],'Roja con lunares claros que giran. Muy fácil de seguir en la cancha.','Esfera roja con lunares giratorios','Rojo','Estela roja','Chispas rojas'],
 ['sb04','Pelota Verde','c',800,'verde',['#19c85a','#d6ffe4'],'dot:#19c85a',['#19c85a','#d6ffe4'],'Verde brillante con costuras curvas, como una pelota de tenis.','Esfera verde con costuras curvas','Verde','Estela verde','Chispas verdes'],
 ['sb05','Pelota Amarilla','c',900,'amarilla',['#ffd400','#6a4a00'],'dot:#ffd400',['#ffd400','#fff3a0'],'Una carita feliz amarilla que sonríe en cada golpe.','Esfera amarilla con carita sonriente','Amarillo','Estela amarilla','Chispas amarillas'],
 ['sb06','Pelota Naranja','c',1000,'naranja',['#ff7a1a','#4a1f00'],'dot:#ff7a1a',['#ff7a1a','#ffd0a0'],'Naranja con líneas negras que giran, como una pelota de baloncesto.','Esfera naranja con líneas negras','Naranja','Estela naranja','Chispas naranjas'],
 ['sb07','Pelota Eléctrica','r',1200,'electrica',['#1e6bff','#cfeeff'],'elec:#4da6ff',['#1e6bff','#cfeeff','#ffffff'],'Cargada de energía: rayos azules saltan por toda su superficie.','Esfera azul con rayos eléctricos','Azul eléctrico','Zigzags de electricidad','Chispas eléctricas azules'],
 ['sb08','Pelota de Hielo','r',1300,'hielo',['#6fe3ff','#ffffff'],'ice',['#6fe3ff','#ffffff'],'Un copo de nieve cristalino con un brillo cian helado.','Esfera helada con copo de nieve','Cian','Cristales de hielo','Esquirlas de hielo'],
 ['sb09','Pelota Neón','r',1500,'neon',['#0a0f2e','#00ffd0','#ff3df2'],'dot:#00ffd0',['#00ffd0','#ff3df2'],'Anillos de neón que pulsan sobre un núcleo oscuro.','Esfera oscura con anillos de neón','Turquesa y rosa neón','Estela turquesa','Destellos de neón'],
 ['sb10','Pelota Monocromática','r',1600,'mono',['#ffffff','#111111'],'dot:#ffffff',['#ffffff','#888888'],'Rayas blancas y negras que giran creando un efecto hipnótico.','Esfera con rayas blanco y negro','Blanco y negro','Estela blanca','Chispas blancas y grises'],
 ['sb11','Pelota Venenosa','r',1800,'venenosa',['#38d13a','#b6ff3a','#0d5a14'],'dot:#b6ff3a',['#38d13a','#b6ff3a'],'Burbujas tóxicas suben dentro de su líquido verde.','Esfera verde con burbujas tóxicas','Verde tóxico','Estela verde lima','Gotas verdes'],
 ['sb12','Pelota Magnética','r',2200,'magnetica',['#ff2233','#2a6bff'],'dot:#c8d0ff',['#ff2233','#2a6bff'],'Polo rojo y azul con un campo magnético que la rodea.','Esfera mitad roja y mitad azul','Rojo y azul','Estela plateada','Chispas rojas y azules'],
 ['sb13','Pelota de Fuego','e',3000,'fuego',['#ff3b00','#ffd400'],'fire',['#ff5a1f','#ffd400'],'Una bola de fuego con llamas naranjas que lamen el aire.','Esfera ardiente con llamas','Naranja y amarillo','Estela de llamas','Chispas de fuego'],
 ['sb14','Pelota de Plasma','e',3500,'plasma',['#3a0a7a','#e08bff','#8a5bff'],'dot:#e08bff',['#c06bff','#e08bff','#ffffff'],'Energía morada que gira en espiral dentro de la esfera.','Esfera con energía morada en espiral','Morado y rosa','Estela de energía morada','Descargas de plasma'],
 ['sb15','Pelota Cristal','e',4500,'cristal',['#9fe9ff','#ffffff','#4da6ff'],'ice',['#9fe9ff','#ffffff'],'Un cristal facetado que refleja la luz en cada giro.','Esfera de cristal con facetas','Celeste cristalino','Estela de cristales','Esquirlas de cristal'],
 ['sb16','Pelota Galáctica','e',5000,'galactica',['#160a45','#b86bff','#6fd8ff'],'star',['#b86bff','#6fd8ff','#ffffff'],'Una pequeña galaxia en espiral con estrellas brillantes.','Esfera con galaxia en espiral','Violeta y celeste','Estela de estrellas','Polvo de estrellas'],
 ['sb17','Pelota Tormenta','e',5500,'tormenta',['#2a3350','#9fb4ff','#fff6a0'],'elec:#fff6a0',['#9fb4ff','#fff6a0'],'Nubes oscuras, lluvia y relámpagos dentro de una esfera.','Esfera de tormenta con relámpagos','Gris azulado y amarillo','Rayos amarillos','Relámpagos'],
 ['sb18','Pelota Espectral','e',6500,'espectral',['#dff0ff','#101830'],'smoke:#cfe9ff',['#dff0ff','#9fd8ff'],'Un fantasma translúcido que deja una estela de niebla.','Esfera fantasma con ojos y cola','Blanco azulado','Estela de niebla','Humo espectral'],
 ['sb19','Pelota Dorada','l',12000,'dorada',['#ffc800','#fff3a0'],'spark',['#ffc800','#fff3a0'],'Una pelota dorada con un brillo intenso y una estela de partículas luminosas.','Esfera dorada brillante','Oro','Partículas doradas','Efecto visual dorado'],
 ['sb20','Pelota Arcoíris','l',14000,'arcoiris',['#ffffff'],'rain',['#ff2233','#ffd400','#19e68c','#2a6bff','#ff3df2'],'Sus franjas cambian de color sin parar.','Esfera con franjas que cambian de color','Todos los colores','Estela arcoíris','Chispas de colores'],
 ['sb21','Pelota Lava','l',9000,'lava',['#1c0905','#ff7a00','#ffd400'],'ember',['#ff7a00','#ffd400'],'Roca volcánica con grietas naranjas que brillan al rojo vivo.','Esfera oscura con grietas de lava','Negro y naranja','Brasas que caen','Chispas de lava'],
 ['sb22','Pelota Nebulosa','l',12500,'nebulosa',['#1a0a40','#ff4fd8','#4fc8ff'],'star',['#ff4fd8','#4fc8ff','#ffffff'],'Nubes cósmicas de colores y partículas que flotan alrededor.','Esfera con nebulosa y partículas cósmicas','Rosa, celeste y violeta','Estela de estrellas','Partículas cósmicas'],
 ['sb23','Pelota Solar','l',16000,'solar',['#ffb300','#fff3b0','#ff6a00'],'fire',['#ffb300','#ff6a00'],'Un mini sol con manchas solares y una corona de rayos.','Esfera solar con corona de rayos','Amarillo y naranja','Estela de fuego solar','Destellos solares'],
 ['sb24','Pelota Cósmica','l',20000,'cosmica',['#4a2bd0','#7a5bff','#ffd9a0'],'ring:#ffd9a0',['#7a5bff','#ffd9a0'],'Un planeta con anillos dorados y estrellas que lo rodean.','Esfera planeta con anillos','Violeta y dorado','Anillos expansivos','Ondas cósmicas'],
 ['sb25','Pelota Pixel','m',25000,'pixel',['#0a3a8a','#00c8ff','#bff6ff'],'pix',['#00c8ff','#bff6ff'],'Hecha de píxeles que cambian como en un videojuego retro.','Esfera de píxeles cuadrados','Azul y cian','Estela de píxeles','Píxeles que saltan'],
 ['sb26','Pelota Agujero Negro','m',30000,'agujero',['#000000','#ffb347','#ffffff'],'ring:#ffb347',['#ffb347','#ffffff'],'Un centro oscuro rodeado por un anillo de luz ardiente.','Esfera negra con anillo luminoso','Negro y naranja','Anillos gravitacionales','Destellos del anillo'],
 ['sb27','Pelota Supernova','m',35000,'supernova',['#ffffff','#ffd45a','#ff5a2a'],'star',['#ffffff','#ffd45a','#ff5a2a'],'El estallido de una estrella: destellos de energía en todas direcciones.','Esfera blanca incandescente con destellos','Blanco, dorado y rojo','Estrellas brillantes','Explosión de energía'],
 ['sb28','Pelota Dimensional','m',40000,'dimensional',['#0a0030','#00ffd0','#ff3df2'],'glitch',['#00ffd0','#ff3df2'],'Un portal con anillos que giran y se distorsionan.','Esfera portal con anillos giratorios','Turquesa y magenta','Estela con distorsión','Fallas dimensionales'],
 ['sb29','Pelota Infinita','m',45000,'infinita',['#0d0a2a','#ffffff'],'rain',['#ff3df2','#00ffd0','#ffd400','#ffffff'],'El símbolo del infinito brilla en todos los colores dentro de ella.','Esfera con símbolo infinito de colores','Arcoíris sobre azul noche','Estela arcoíris','Destellos infinitos'],
 ['sb30','Pelota Dios Estelar','m',50000,'dios',['#fff3b0','#ffc800','#ffffff'],'star',['#fff3b0','#ffc800','#ffffff','#ff3df2'],'La pelota definitiva: alas, halo, rayos divinos y estrellas que la rodean.','Esfera divina con alas, halo y estrellas','Oro y blanco','Estela de estrellas doradas','Explosión divina']
 ];
 const BALLS=ROWS.map(r=>({id:r[0],name:r[1],rar:r[2],price:r[3],st:r[4],c:r[5],tr:r[6],rb:r[7],d:r[8],ap:r[9],co:r[10],es:r[11],re:r[12]}));
 const DEF={id:'',name:'Estándar',rar:'c',price:0,st:'blanca',c:['#ffffff','#cfd8ee'],tr:'dot:#99ccff',rb:['#ffffff','#99ccff'],d:'La pelota blanca original del juego. Viene gratis.',ap:'Esfera blanca clásica',co:'Blanco',es:'Estela celeste',re:'Chispas blancas'};
 const BM={};BALLS.forEach(b=>BM[b.id]=b);

 /* ---------- estelas ---------- */
 function trail(g,tr,r,b,t){const n=tr.length;if(!n)return;const p=b.tr.split(':'),k=p[0],col=p[1]||b.c[0],c=b.c,qq=Math.floor(t*20);g.save();
  for(let i=0;i<n;i++){const u=i/n,q=tr[i];g.globalAlpha=u*.7;
   if(k==='fire'){g.fillStyle=u>.6?c[1]:c[0];g.beginPath();g.arc(q.x+Math.sin(t*25+i)*r*.2,q.y-(1-u)*r*.7,r*u*.8,0,TAU);g.fill()}
   else if(k==='ember'){g.fillStyle=i%3?c[1]:c[2];const s=r*u*.55;g.fillRect(q.x+Math.sin(i*5+t*9)*r*.4,q.y+(1-u)*r*.9,s,s)}
   else if(k==='spark'){g.globalAlpha=u*.3;g.fillStyle=c[0];g.beginPath();g.arc(q.x,q.y,r*u*.7,0,TAU);g.fill();if(i%2){g.globalAlpha=u;g.fillStyle=i%4?c[1]:'#fff';const s=r*.24;g.fillRect(q.x+(rd(i+qq)-.5)*r*1.6,q.y+(rd(i*3+qq)-.5)*r*1.6,s,s)}}
   else if(k==='rain'){g.fillStyle='hsl('+((i*28+t*300)%360)+',100%,60%)';g.beginPath();g.arc(q.x,q.y,r*u*.85,0,TAU);g.fill()}
   else if(k==='pix'){const s=Math.max(2,r*u*.9);g.fillStyle=i%3?c[1]:c[2];g.fillRect(Math.round(q.x/3)*3-s/2,Math.round(q.y/3)*3-s/2,s,s)}
   else if(k==='ice'){g.fillStyle=i%2?c[1]:c[0];g.beginPath();g.moveTo(q.x,q.y-r*u);g.lineTo(q.x+r*u*.6,q.y);g.lineTo(q.x,q.y+r*u);g.lineTo(q.x-r*u*.6,q.y);g.fill()}
   else if(k==='elec'){if(i>0){const a=tr[i-1];g.strokeStyle=i%2?'#fff':col;g.lineWidth=Math.max(1,r*.18*u);g.beginPath();g.moveTo(a.x,a.y);g.lineTo((a.x+q.x)/2+(rd(i+qq)-.5)*r*1.2,(a.y+q.y)/2+(rd(i*5+qq)-.5)*r*1.2);g.lineTo(q.x,q.y);g.stroke()}}
   else if(k==='smoke'){g.globalAlpha=u*.35;g.fillStyle=col;g.beginPath();g.arc(q.x,q.y,r*(.5+(1-u)*.5),0,TAU);g.fill()}
   else if(k==='star'){if(i%2){g.save();g.translate(q.x,q.y);g.rotate(i+t*3);g.fillStyle=i%4?c[1]:c[2];star4(g,r*u*1.1,.3);g.fill();g.restore()}}
   else if(k==='ring'){if(i%3===0){g.strokeStyle=col;g.lineWidth=Math.max(1,r*.1);g.beginPath();g.arc(q.x,q.y,r*(1.8-u),0,TAU);g.stroke()}}
   else if(k==='glitch'){g.fillStyle=i%2?c[1]:c[2];g.fillRect(q.x-r*u/2+(rd(i+qq)-.5)*r,q.y-r*u/2+(rd(i*7+qq)-.5)*r,r*u,r*u*.4)}
   else{g.fillStyle=col;g.beginPath();g.arc(q.x,q.y,r*u*.9,0,TAU);g.fill()}}
  g.restore()}

 /* ---------- dibujar una pelota (lt = versión ligera dentro de la partida) ---------- */
 function drawBall(g,X,Y,r,b,t,lt){const c=b.c,S=ST[b.st]||ST.blanca;g.save();g.translate(X,Y);if(S.al)g.globalAlpha=S.al;
  if(S.pre)S.pre(g,r,t,c,lt);
  if(S.nc){S.body(g,r,t,c)}
  else{
   g.save();g.shadowColor=S.gl||c[0];g.shadowBlur=r*(S.gb||1);g.fillStyle=c[0];g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.restore();
   g.save();g.beginPath();g.arc(0,0,r,0,TAU);g.clip();
   S.body&&S.body(g,r,t,c);
   const hi=g.createRadialGradient(-r*.35,-r*.4,0,-r*.35,-r*.4,r*.9);hi.addColorStop(0,'rgba(255,255,255,'+(S.hi==null?.6:S.hi)+')');hi.addColorStop(.5,'rgba(255,255,255,0)');g.fillStyle=hi;g.fillRect(-r,-r,2*r,2*r);
   const ed=g.createRadialGradient(0,0,r*.45,0,0,r);ed.addColorStop(0,'rgba(0,0,0,0)');ed.addColorStop(1,'rgba(0,0,0,'+(S.ed==null?.45:S.ed)+')');g.fillStyle=ed;g.fillRect(-r,-r,2*r,2*r);
   g.restore()}
  if(S.out)S.out(g,r,t,c,lt);
  g.restore()}

 /* ---------- VICTORIAS (animaciones al ganar) ---------- */
 const WD=4.2;
 function crownLike(g,t,w,h,em){const A=g.globalAlpha,e=t<.6?(1-Math.pow(1-t/.6,3))*1.15:1+.03*Math.sin(t*6),m=Math.min(w,h);g.save();g.translate(w/2,h*.45);g.save();g.rotate(t*.5);g.globalCompositeOperation='lighter';for(let k=0;k<14;k++){g.rotate(.4488);g.fillStyle='rgba(255,215,90,'+(.2*A)+')';g.beginPath();g.moveTo(0,0);g.lineTo(m*.8,-m*.05);g.lineTo(m*.8,m*.05);g.fill()}g.restore();g.scale(e,e);g.font=Math.floor(m*.42)+'px serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='#ffc800';g.shadowBlur=30;g.fillText(em,0,0);g.restore();
  for(let k=0;k<12;k++){const a=k*.5236+t,d=m*(.3+.12*Math.sin(t*3+k));g.save();g.translate(w/2+Math.cos(a)*d*1.6,h*.45+Math.sin(a)*d);g.globalAlpha=A*(.4+.6*Math.abs(Math.sin(t*4+k)));g.fillStyle='#fff';star4(g,6,.25);g.fill();g.restore()}}
 const WF={
  confeti(g,t,w,h){for(let i=0;i<130;i++){const x=rd(i)*w+Math.sin(t*2+i)*18,y=-30-rd(i+5)*h*.5+t*(140+rd(i+3)*230);if(y>h+20)continue;g.save();g.translate(x,y);g.rotate(t*4+i);g.fillStyle='hsl('+Math.floor(rd(i+7)*360)+',95%,60%)';g.fillRect(-4,-2,8,4);g.restore()}},
  estrellas(g,t,w,h){for(let i=0;i<50;i++){const x=rd(i)*w,y=-30-rd(i+5)*h*.6+t*(120+rd(i+3)*200);if(y>h+20)continue;g.save();g.translate(x,y);g.rotate(t*2+i);g.fillStyle=i%3?'#ffd400':'#fff';g.shadowColor='#ffd400';g.shadowBlur=10;star5(g,6+rd(i+9)*9);g.fill();g.restore()}},
  corazones(g,t,w,h){for(let i=0;i<36;i++){const x=rd(i)*w+Math.sin(t*3+i)*14,y=h+30+rd(i+5)*h*.5-t*(110+rd(i+3)*190);if(y<-30)continue;g.save();g.translate(x,y);g.fillStyle=i%2?'#ff3d7a':'#ff8fb8';heart(g,8+rd(i+9)*10);g.fill();g.restore()}},
  fuegos(g,t,w,h){const A=g.globalAlpha;for(let b=0;b<7;b++){const tt=t-(b*.5+.1);if(tt<0||tt>1.6)continue;const cx=w*(.15+rd(b)*.7),cy=h*(.18+rd(b+9)*.35),hu=Math.floor(rd(b+3)*360);if(tt<.12){g.globalAlpha=A*(1-tt/.12);g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,30*(tt/.12)+6,0,TAU);g.fill()}g.globalAlpha=A*Math.max(0,1-tt/1.6);for(let s=0;s<46;s++){const a=s/46*TAU+rd(b*9+s)*.3,v=110+rd(s+b)*150;g.fillStyle='hsl('+(hu+(s%2)*40)+',100%,62%)';g.fillRect(cx+Math.cos(a)*v*tt,cy+Math.sin(a)*v*tt+140*tt*tt,3,3)}g.globalAlpha=A}},
  rayos(g,t,w,h){const A=g.globalAlpha;for(let k=0;k<9;k++){const tt=t-k*.4;if(tt<0||tt>.3)continue;const f=1-tt/.3;g.fillStyle='rgba(180,220,255,'+(.3*f*A)+')';g.fillRect(0,0,w,h);g.strokeStyle='#fff';g.lineWidth=4;g.shadowColor='#6fd8ff';g.shadowBlur=18;g.globalAlpha=A*f;g.beginPath();let x=w*(.1+rd(k)*.8),y=0;g.moveTo(x,y);while(y<h*.8){x+=(rd(k*13+y)-.5)*70;y+=h/8;g.lineTo(x,y)}g.stroke();g.shadowBlur=0;g.globalAlpha=A}},
  corona(g,t,w,h){crownLike(g,t,w,h,'👑')},
  trofeo(g,t,w,h){crownLike(g,t,w,h,'🏆')},
  galaxia(g,t,w,h){const A=g.globalAlpha,m=Math.max(w,h);for(let k=0;k<5;k++){const tt=t-k*.35;if(tt<0)continue;g.globalAlpha=A*Math.max(0,1-tt/2.6);g.strokeStyle='hsl('+((k*60+t*80)%360)+',100%,65%)';g.lineWidth=4;g.beginPath();g.arc(w/2,h/2,tt*m*.38,0,TAU);g.stroke()}for(let i=0;i<160;i++){const a=i*.4+t*2.2,d=(i*6.7%70)+t*m*.14;if(d>m*.7)continue;g.globalAlpha=A*Math.max(0,1-d/(m*.7));g.fillStyle=i%2?'#b86bff':'#6fd8ff';g.fillRect(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,3,3)}g.globalAlpha=A;g.save();g.translate(w/2,h/2);g.rotate(t*2);g.fillStyle='#fff';g.shadowColor='#b86bff';g.shadowBlur=20;star4(g,Math.min(60,t*80),.25);g.fill();g.restore()}
 };
 const WINS=[
  ['w_confeti','Confeti','c',600,'Una lluvia de confeti de colores cae por toda la pantalla.','Confeti multicolor cayendo'],
  ['w_estrellas','Lluvia de Estrellas','c',800,'Estrellas doradas caen del cielo para celebrar tu victoria.','Estrellas doradas cayendo'],
  ['w_corazones','Corazones','r',1500,'Corazones rosados suben flotando por la pantalla.','Corazones que suben'],
  ['w_fuegos','Fuegos Artificiales','r',2200,'Explosiones de colores iluminan toda la pantalla.','Fuegos artificiales de colores'],
  ['w_rayos','Tormenta de Rayos','e',4000,'Relámpagos y destellos azules sacuden la pantalla.','Rayos y destellos'],
  ['w_corona','Corona Dorada','l',10000,'Una corona gigante aparece con rayos de luz y destellos.','Corona dorada con rayos de luz'],
  ['w_trofeo','Trofeo Épico','l',15000,'Un trofeo enorme brilla en el centro como campeón.','Trofeo dorado con destellos'],
  ['w_galaxia','Explosión Galáctica','m',30000,'Ondas de colores y polvo de estrellas estallan desde el centro.','Ondas y polvo de estrellas']];
 function winDraw(g,id,t,w,h){const f=WF[id.replace('w_','')];if(!f||t>WD)return;g.save();g.globalAlpha=Math.max(0,Math.min(1,(WD-t)/.7));f(g,t,w,h);g.restore()}

 /* animación real al ganar la partida */
 let ovT=0;
 function playOverlay(id){let cv=document.getElementById('svWin');
  if(!cv){cv=document.createElement('canvas');cv.id='svWin';cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:12;pointer-events:none';document.body.appendChild(cv)}
  const my=++ovT,d=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;cv.width=w*d;cv.height=h*d;cv.style.display='block';
  const g=cv.getContext('2d'),t0=performance.now();
  (function f(n){if(my!==ovT)return;const t=(n-t0)/1000;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);if(t>WD){cv.style.display='none';return}winDraw(g,id,t,w,h);requestAnimationFrame(f)})(t0)}
 let prevM=mode;
 setInterval(()=>{
  try{
   if(mode==='over'&&prevM!=='over'){const id=(prof.eq||{}).win;if(id&&WF[id.replace('w_','')]&&(two||sc[0]>sc[1]))playOverlay(id)}
   if(mode!=='over'&&prevM==='over'){ovT++;const cv=document.getElementById('svWin');if(cv)cv.style.display='none'}
   prevM=mode}catch(e){}},150);

 /* ---------- EN LA PARTIDA: la pelota equipada se ve de verdad ---------- */
 const dark=()=>{try{if(evOn('apagon')){const ph=evT%4;return ph>2.3&&ph<3.7}}catch(e){}return false};
 const _hit=hit;
 hit=function(i){_hit(i);try{const m=BM[(prof.eq||{}).bl];if(m&&B)burst(gp,B.x,B.y,14,m.rb,230)}catch(e){}};
 const _dg=drawGame;
 drawGame=function(dt){const e=prof.eq||(prof.eq={}),sb=e.bl,mine=BM[sb];
  if(mine)e.bl='';
  try{_dg(dt)}finally{e.bl=sb}
  if(!mine)return;
  try{if(B&&!(B.gh>0)&&fogA(B.x)>.5&&!dark()){const t=performance.now()/1000;x.save();trail(x,B.tr||[],9,mine,t);drawBall(x,B.x,B.y,10,mine,t,true);x.restore()}}catch(er){}};

 /* ---------- artículos que ya tenías (paletas, fondos, efectos, temas) ---------- */
 const rp=p=>p>=1500?'m':p>=800?'l':p>=500?'e':p>=300?'r':'c';
 const STDC={pad:['#ff2233'],tb:['#0a1a6a','#2a6bff'],fx:['#ffffff','#99ccff'],th:['#ff2233','#2a6bff']};
 const adm=()=>document.body.dataset.adm2==='1';
 const own=i=>i.price===0||!!VER||adm()||(prof.inv||[]).includes(i.id);
 const eqd=i=>((prof.eq||{})[i.cat]||'')===i.id;
 function items(){const L=[],seen=new Set();
  const add=o=>{if(seen.has(o.key))return;seen.add(o.key);L.push(o)};
  add({key:'bl:',cat:'bl',kind:'ball',id:'',name:'Estándar',rar:'c',price:0,b:DEF});
  BALLS.forEach(b=>add({key:'bl:'+b.id,cat:'bl',kind:'ball',id:b.id,name:b.name,rar:b.rar,price:b.price,b}));
  ['pad','tb','fx','th'].forEach(k=>add({key:k+':',cat:k,kind:'gen',id:'',name:'Estándar',rar:'c',price:0,c:STDC[k]}));
  IT.forEach(z=>{if(!STDC[z[0]]||!z[1]||z[1][0]==='x'||z[3]>=99999999)return;add({key:z[0]+':'+z[1],cat:z[0],kind:'gen',id:z[1],name:z[2],rar:rp(z[3]),price:z[3],c:z[4]||['#888']})});
  add({key:'win:',cat:'win',kind:'win',id:'',name:'Sin animación',rar:'c',price:0});
  WINS.forEach(w=>add({key:'win:'+w[0],cat:'win',kind:'win',id:w[0],name:w[1],rar:w[2],price:w[3],d:w[4],ap:w[5]}));
  return L}
 function info(it){const R=RAR[it.rar][0].toLowerCase(),NV=['Ventaja competitiva','ninguna; es un objeto cosmético'];
  if(it.kind==='ball'){const b=it.b;return{d:b.d,f:[['Apariencia',b.ap],['Color',b.co],['Estela',b.es],['Rebote',b.re],['Rareza',R],NV],no:['No aumenta la velocidad de la pelota','No cambia las reglas del juego','No mejora el alcance de las paletas','No garantiza ganar una partida']}}
  if(it.kind==='win')return{d:it.id?it.d:'No se muestra ninguna animación cuando ganas.',f:[['Animación',it.id?it.ap:'ninguna'],['Se activa','al ganar una partida'],['Duración','unos 4 segundos'],['Rareza',R],NV],no:['No da puntos ni monedas extra','No cambia las reglas del juego','No aparece si pierdes','No afecta la partida: solo se ve al terminar']};
  const T={pad:['tu paleta durante la partida',['No cambia su tamaño','No aumenta su velocidad','No mejora tu alcance']],tb:['el fondo de la cancha (al empezar la partida)',['No cambia la velocidad','No cambia el tamaño de la cancha','No da ventaja']],fx:['las chispas cuando la pelota golpea',['No cambia la física de la pelota','No da puntos','No da ventaja']],th:['los colores de los menús y botones',['No cambia la jugabilidad','No da puntos','No da ventaja']]}[it.cat];
  return{d:it.id?'Objeto cosmético para personalizar tu juego.':'El diseño original del juego. Viene gratis.',f:[['Cambia',T[0]],['Colores',it.c.join(' + ')],['Rareza',R],NV],no:T[1]}}

 /* ---------- ARTE de los objetos que no son pelota ---------- */
 function genArt(g,it,t,cx,cy,s){const c=it.c||['#888'],c1=c[1]||c[0];g.save();
  if(it.cat==='pad'){g.fillStyle=c[0];g.shadowColor=c[0];g.shadowBlur=s*.4;rr(g,cx-s*.14,cy-s*.6,s*.28,s*1.2,s*.14);g.fill()}
  else if(it.cat==='tb'){const q=g.createLinearGradient(cx-s,cy-s*.7,cx+s,cy+s*.7);q.addColorStop(0,c[0]);q.addColorStop(1,c1);g.fillStyle=q;rr(g,cx-s*.85,cy-s*.6,s*1.7,s*1.2,s*.12);g.fill();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.stroke()}
  else if(it.cat==='fx'){const tt=(t*1.1)%1;for(let k=0;k<16;k++){const a=k*.3927,d=tt*s;g.globalAlpha=1-tt;g.fillStyle=c[k%c.length];g.fillRect(cx+Math.cos(a)*d-2,cy+Math.sin(a)*d-2,4,4)}}
  else{g.fillStyle=c[0];g.beginPath();g.arc(cx,cy,s*.6,Math.PI/2,Math.PI*1.5);g.fill();g.fillStyle=c1;g.beginPath();g.arc(cx,cy,s*.6,-Math.PI/2,Math.PI/2);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(cx,cy,s*.6,0,TAU);g.stroke()}
  g.restore()}

 /* ---------- ESTILOS Y PANTALLA ---------- */
 document.head.insertAdjacentHTML('beforeend',`<style>
 #sv{position:fixed;inset:0;z-index:19;display:flex;flex-direction:column;gap:10px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px calc(10px + env(safe-area-inset-bottom,0px));color:#fff;overflow:hidden;
  background:radial-gradient(1.5px 1.5px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 28% 72%,#9cf,transparent),radial-gradient(1.5px 1.5px at 47% 34%,#fff,transparent),radial-gradient(1px 1px at 63% 83%,#fff,transparent),radial-gradient(1.5px 1.5px at 78% 22%,#9cf,transparent),radial-gradient(1px 1px at 91% 61%,#fff,transparent),radial-gradient(1px 1px at 8% 90%,#fff,transparent),radial-gradient(1.5px 1.5px at 55% 8%,#9cf,transparent),radial-gradient(ellipse at 15% 0%,rgba(60,40,200,.35),transparent 55%),radial-gradient(ellipse at 90% 100%,rgba(0,160,255,.25),transparent 55%),#02030c}
 #sv,#sv *{touch-action:manipulation}#sv input{user-select:text;-webkit-user-select:text}
 #sv canvas{position:static!important;inset:auto!important}
 .svH{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;border:2px solid #2a6bff;border-radius:16px;background:rgba(5,10,40,.75);box-shadow:0 0 18px rgba(42,107,255,.55),inset 0 0 14px rgba(0,200,255,.15)}
 .svT{display:flex;align-items:center;gap:10px;margin-right:auto}.svT svg{width:38px;height:38px;filter:drop-shadow(0 0 6px #00c8ff)}
 .svT b{display:block;font-size:24px;letter-spacing:4px;line-height:1;text-shadow:0 0 12px #2a6bff}.svT small{display:block;font-size:10px;letter-spacing:3px;color:#37d6ff;margin-top:2px}
 .svC{border:2px solid #ffd400;border-radius:14px;padding:7px 14px;font-weight:900;font-size:15px;color:#ffd400;background:rgba(40,30,0,.5);box-shadow:0 0 12px rgba(255,212,0,.4);white-space:nowrap}
 #svQ{flex:1 1 180px;min-width:0;padding:9px 12px;font-size:14px;border-radius:12px;border:2px solid #2a6bff;background:rgba(5,10,40,.9);color:#fff}
 .svB{width:42px;height:42px;border-radius:12px;border:2px solid #2a6bff;background:rgba(5,10,40,.9);color:#fff;font-size:19px;box-shadow:0 0 10px rgba(42,107,255,.5);flex:none}.svB.x{border-color:#37d6ff;font-size:20px;font-weight:900}.svB:active{transform:scale(.94)}
 .svM{flex:1;min-height:0;display:grid;grid-template-columns:190px minmax(0,1fr) 340px;gap:10px}
 .svL{display:flex;flex-direction:column;gap:8px;overflow-y:auto;scrollbar-width:none}.svL::-webkit-scrollbar{display:none}
 .svL button{display:flex;align-items:center;gap:10px;padding:14px 12px;border-radius:12px;border:2px solid #1d4fc4;background:rgba(5,10,40,.8);color:#fff;font-size:14px;font-weight:800;letter-spacing:1px;text-align:left;transition:.15s;flex:none}
 .svL button span{font-size:22px;width:28px;text-align:center}
 .svL button.on{border-color:#37d6ff;background:rgba(0,90,200,.35);box-shadow:0 0 16px #00c8ff,inset 0 0 12px rgba(0,200,255,.35);text-shadow:0 0 8px #fff}
 .svL button.inv{margin-top:auto;border-color:#ffd400;color:#ffd400}.svL button.inv.on{background:rgba(120,90,0,.4);box-shadow:0 0 16px #ffd400}
 .svC2,.svR{border:2px solid #2a6bff;border-radius:16px;background:rgba(5,10,40,.7);box-shadow:0 0 16px rgba(42,107,255,.4);min-height:0;overflow-y:auto;padding:12px;scrollbar-width:thin;scrollbar-color:#2a6bff transparent}
 #svT{display:flex;align-items:center;gap:10px;margin-bottom:8px}#svT span{font-size:28px}#svT b{display:block;font-size:22px;letter-spacing:2px}#svT small{opacity:.8;font-size:12px}
 .svTb{display:flex;gap:8px;flex-wrap:wrap;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid #2a6bff55}
 .svS{flex:1 1 110px;min-width:0;padding:8px 10px;border-radius:10px;border:2px solid #2a6bff;background:#050a28;color:#fff;font-size:12px;font-weight:700}
 .svBk{padding:8px 12px;border-radius:10px;border:2px solid #ffd400;background:#2a2000;color:#ffd400;font-size:12px;font-weight:800}
 #svG{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px;align-content:start}
 .svE{grid-column:1/-1;text-align:center;padding:30px 10px;opacity:.75;font-size:13px;line-height:1.6}
 .svK{position:relative;border:2px solid rgba(42,107,255,.7);border-radius:14px;padding:8px 6px;background:linear-gradient(180deg,rgba(20,40,120,.35),rgba(5,10,40,.9));display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;cursor:pointer;min-width:0;box-shadow:0 0 10px rgba(42,107,255,.3);transition:.15s}
 .svK:hover{transform:translateY(-2px)}.svK.on{border-color:var(--rc);box-shadow:0 0 18px var(--rc)}
 .svK canvas{width:84px!important;height:84px!important}.svK b{font-size:13px;line-height:1.15}
 .svRt{font-size:9px;font-weight:900;letter-spacing:1px;padding:2px 8px;border-radius:10px;color:#000;background:var(--rc)}
 .svPr{font-size:12px;font-weight:800;color:#ffd400;display:flex;align-items:center;gap:5px}.svPr.big{font-size:17px}
 .svCn{width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a0,#ffb800);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#7a4a00;font-style:normal}
 .svA{width:100%;padding:9px 4px;border-radius:8px;border:0;color:#fff;font-size:12px;font-weight:900;letter-spacing:1px;background:linear-gradient(180deg,#2a8bff,#1255d8);box-shadow:0 0 10px rgba(42,139,255,.5)}
 .svA.g{background:linear-gradient(180deg,#27d968,#0c9a42);box-shadow:0 0 12px rgba(39,217,104,.6)}.svA.d{background:#1b2a55;color:#7fe3a0;box-shadow:none}
 .svR{display:flex;flex-direction:column;gap:9px;border-color:var(--rc,#2a6bff)}
 .svRx{display:none;align-self:flex-end;padding:8px 14px;border-radius:10px;border:2px solid #37d6ff;background:#0a1030;color:#fff;font-weight:800;font-size:12px}
 .svBW{position:relative}.svBW canvas{width:100%!important;height:auto!important;border-radius:14px;border:2px solid var(--rc);box-shadow:0 0 16px var(--rc);display:block}
 .svTag{position:absolute;top:8px;right:8px;z-index:2;font-size:10px;font-weight:900;letter-spacing:1px;padding:3px 10px;border-radius:10px;color:#000}
 .svNm{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.svNm b{font-size:20px}.svNm span{font-size:12px;font-weight:900}
 .svD{font-size:13px;line-height:1.45;opacity:.92}
 .svR h4{font-size:11px;letter-spacing:2px;color:#37d6ff;margin-top:2px}
 .svR ul{list-style:none;padding:0;font-size:12px;line-height:1.7}.svR li b{color:#8fe8ff}.svR ul.no li::before{content:"✖ ";color:#ff6b7a}
 #svCt{width:100%!important;height:auto!important;border-radius:12px;border:2px solid #2a6bff;display:block}
 .svBuy{position:sticky;bottom:-12px;display:flex;align-items:center;gap:10px;padding:10px 0 2px;background:linear-gradient(0deg,rgba(5,10,40,.98) 70%,transparent)}.svBuy .svA{flex:1;padding:13px;font-size:14px}
 @media(max-width:900px){
  .svM{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
  .svL{flex-direction:row;overflow-x:auto;overflow-y:hidden}.svL button{padding:10px 12px;font-size:12px}.svL button span{font-size:17px;width:auto}.svL button.inv{margin-top:0}
  .svR{display:none}.svR.open{display:flex;position:fixed;inset:0;z-index:30;border-radius:0;background:rgba(2,3,12,.98);padding:calc(10px + env(safe-area-inset-top,0px)) 12px 12px}
  .svRx{display:block}.svT b{font-size:19px}
  #svG{grid-template-columns:repeat(2,minmax(0,1fr))}
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
   <div class="svC2"><div id="svT"></div>
    <div class="svTb"><select id="svOf" class="svS"><option value="all">Todos</option><option value="own">Comprados</option><option value="new">Sin comprar</option></select><select id="svRf" class="svS"><option value="all">Toda rareza</option><option value="c">Común</option><option value="r">Rara</option><option value="e">Épica</option><option value="l">Legendaria</option><option value="m">Mítica</option></select><select id="svSo" class="svS"><option value="pop">Ordenar: Predeterminado</option><option value="pa">Precio: menor a mayor</option><option value="pd">Precio: mayor a menor</option><option value="rar">Rareza: mayor a menor</option><option value="nom">Nombre A-Z</option></select></div>
    <div id="svG"></div></div>
   <div class="svR" id="svR"></div>
  </div>
 </div>`);

 const S={cat:'bl',q:'',rf:'all',of:'all',so:'pop',sel:'',pan:false};
 const mob=()=>matchMedia('(max-width:900px)').matches;
 let cards=[],CST=null,run=false,lastC=0;
 const paintCoin=()=>{$('svCoin').textContent='DOP '+fmt(prof.pc||0)};
 const curItem=()=>items().find(i=>i.key===S.sel);
 function view(){let L=items();const q=S.q.trim().toLowerCase();
  if(q)L=L.filter(i=>i.id&&(i.name.toLowerCase().includes(q)||RAR[i.rar][0].toLowerCase().includes(q)||CNAME[i.cat].toLowerCase().includes(q)));
  else if(S.cat==='inv')L=L.filter(i=>i.id&&own(i));
  else L=L.filter(i=>i.cat===S.cat);
  if(S.rf!=='all')L=L.filter(i=>i.rar===S.rf);
  if(S.of==='own')L=L.filter(own);else if(S.of==='new')L=L.filter(i=>!own(i));
  if(S.so==='pa')L.sort((a,b)=>a.price-b.price);else if(S.so==='pd')L.sort((a,b)=>b.price-a.price);
  else if(S.so==='rar')L.sort((a,b)=>RAR[b.rar][2]-RAR[a.rar][2]||a.price-b.price);else if(S.so==='nom')L.sort((a,b)=>a.name.localeCompare(b.name));
  return L}

 /* ---------- compra y equipamiento reales ---------- */
 function buy(it){const pc=prof.pc||0;
  if(pc<it.price){SFX.deny();toast('Saldo insuficiente: te faltan DOP '+fmt(it.price-pc));return}
  const go=()=>{if(own(it))return;if((prof.pc||0)<it.price){SFX.deny();toast('Saldo insuficiente');return}
   prof.pc-=it.price;prof.inv=prof.inv||[];if(!prof.inv.includes(it.id))prof.inv.push(it.id);
   try{chkAch()}catch(e){}saveP();updPC();SFX.point();toast('✔ Compraste '+it.name+' · −DOP '+fmt(it.price));render()};
  if(it.price>=3000)modal('CONFIRMAR COMPRA','¿Comprar <b>'+esc(it.name)+'</b> por <b>DOP '+fmt(it.price)+'</b>?<br><small>Te quedarán DOP '+fmt(pc-it.price)+'</small>',[['COMPRAR',go],['CANCELAR',null,'tg']]);else go()}
 function equip(it){prof.eq=prof.eq||{};prof.eq[it.cat]=it.id;if(it.cat==='th'){try{applyTheme()}catch(e){}}saveP();SFX.point();toast('✔ Equipado: '+it.name);render()}
 function act(it){if(!own(it)){buy(it);return}if(eqd(it))return;equip(it)}

 /* ---------- pintar tienda ---------- */
 function ensure(){const v=view();if(!v.some(i=>i.key===S.sel)){const e=v.find(eqd);S.sel=(e||v[0]||{}).key||''}}
 function render(){
  paintCoin();ensure();
  const L=$('svL');L.innerHTML='';
  CATS.forEach(([k,ic,nm])=>{const b=document.createElement('button');b.type='button';b.className=(k===S.cat&&!S.q)?'on':'';b.innerHTML='<span>'+ic+'</span>'+nm;
   b.onclick=()=>{SFX.click();S.cat=k;S.q='';$('svQ').value='';S.sel='';S.pan=false;render()};L.appendChild(b)});
  const ib=document.createElement('button');ib.type='button';ib.className='inv'+(S.cat==='inv'&&!S.q?' on':'');ib.innerHTML='<span>🎒</span>INVENTARIO';
  ib.onclick=()=>{SFX.click();S.cat='inv';S.q='';$('svQ').value='';S.sel='';S.pan=false;render()};L.appendChild(ib);
  const c=CATS.find(z=>z[0]===S.cat);
  if(S.q)$('svT').innerHTML='<span>🔍</span><div><b>RESULTADOS</b><small>Buscando: '+esc(S.q)+'</small></div>';
  else if(S.cat==='inv')$('svT').innerHTML='<span>🎒</span><div><b>INVENTARIO</b><small>Tus artículos comprados. Equípalos o vuelve a la tienda.</small></div><button class="svBk" id="svBk" type="button" style="margin-left:auto">← TIENDA</button>';
  else $('svT').innerHTML='<span>'+c[1]+'</span><div><b>'+c[2]+'</b><small>'+c[3]+'</small></div>';
  const bk=document.getElementById('svBk');if(bk)bk.onclick=()=>{SFX.click();S.cat='bl';S.sel='';render()};
  const G=$('svG'),v=view();G.innerHTML='';cards=[];
  v.forEach(it=>{const r=RAR[it.rar],o=own(it),e=eqd(it),d=document.createElement('div');
   d.className='svK'+(it.key===S.sel?' on':'');d.style.setProperty('--rc',r[1]);
   d.innerHTML='<span class="svRt">'+r[0]+((S.cat==='inv'||S.q)?' · '+CNAME[it.cat]:'')+'</span><canvas width="128" height="128"></canvas><b>'+esc(it.name)+'</b><div class="svPr">'+(o?(e?'EN USO':'✔ TUYO'):'<i class="svCn">$</i>'+(it.price?fmt(it.price):'GRATIS'))+'</div><button type="button" class="svA '+(e?'d':o?'g':'')+'">'+(e?'EQUIPADO':o?'EQUIPAR':'COMPRAR')+'</button>';
   d.querySelector('button').onclick=ev=>{ev.stopPropagation();act(it)};
   d.onclick=()=>{SFX.click();S.sel=it.key;if(mob())S.pan=true;render()};
   G.appendChild(d);const cv=d.querySelector('canvas');cards.push({g:cv.getContext('2d'),it})});
  if(!v.length)G.innerHTML='<div class="svE">'+(S.q?'No se encontró ningún artículo.':S.cat==='inv'?'Todavía no has comprado nada.':'No hay artículos con estos filtros.')+'</div>';
  panel();
  if(!run){run=true;requestAnimationFrame(loop)}}

 function panel(){const R=$('svR'),it=curItem();CST=null;
  if(!it){R.innerHTML='<div class="svE">Selecciona un artículo para ver sus detalles.</div>';R.classList.remove('open');return}
  const r=RAR[it.rar],o=own(it),e=eqd(it),inf=info(it);R.style.setProperty('--rc',r[1]);
  R.innerHTML='<button class="svRx" id="svRx" type="button">✕ CERRAR</button>'
   +'<div class="svBW"><span class="svTag" style="background:'+r[1]+'">'+(it.rar==='l'||it.rar==='m'?'♛ ':'')+r[0]+'</span><canvas id="svBig" width="600" height="400"></canvas></div>'
   +'<div class="svNm"><b>'+esc(it.name)+'</b><span style="color:'+r[1]+'">'+r[0]+'</span></div>'
   +'<p class="svD">'+esc(inf.d)+'</p>'
   +'<h4>CARACTERÍSTICAS</h4><ul>'+inf.f.map(z=>'<li><b>'+z[0]+':</b> '+esc(z[1])+'</li>').join('')+'</ul>'
   +'<h4>LO QUE NO HACE</h4><ul class="no">'+inf.no.map(z=>'<li>'+esc(z)+'</li>').join('')+'</ul>'
   +'<h4>VISTA PREVIA EN LA CANCHA</h4><canvas id="svCt" width="600" height="340"></canvas>'
   +'<div class="svBuy"><div class="svPr big">'+(o?(e?'EN USO':'✔ TUYO'):'<i class="svCn">$</i>DOP '+(it.price?fmt(it.price):'GRATIS'))+'</div><button id="svAct" type="button" class="svA '+(e?'d':o?'g':'')+'">'+(e?'EQUIPADO':o?'EQUIPAR':'COMPRAR')+'</button></div>';
  $('svRx').onclick=()=>{SFX.click();S.pan=false;R.classList.remove('open')};
  $('svAct').onclick=()=>act(it);
  R.classList.toggle('open',S.pan&&mob())}

 /* ---------- animación de tarjetas y vista previa ---------- */
 function drawThumb(c,t){const g=c.g,it=c.it;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,128,128);
  if(it.kind==='ball'){const b=it.b;drawBall(g,64,64,56/((ST[b.st]||{}).ext||1.3),b,t)}
  else if(it.kind==='win'){if(it.id)winDraw(g,it.id,t%5,128,128);else{g.font='44px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🚫',64,64)}}
  else genArt(g,it,t,64,64,44)}
 function stars(g,t,W,H,n){g.fillStyle='#fff';for(let i=0;i<n;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t+i));g.fillRect(rd(i)*W,rd(i+40)*H,1.4,1.4)}g.globalAlpha=1}
 function drawBig(now){const cv=document.getElementById('svBig'),it=curItem();if(!cv||!it)return;
  const g=cv.getContext('2d'),t=now/1000,W=300,H=200,rc=RAR[it.rar][1];g.setTransform(2,0,0,2,0,0);g.globalAlpha=1;
  g.fillStyle='#03040f';g.fillRect(0,0,W,H);const hg=g.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.55);hg.addColorStop(0,rc+'55');hg.addColorStop(1,'#0000');g.fillStyle=hg;g.fillRect(0,0,W,H);stars(g,t,W,H,40);
  if(it.kind==='ball'){const b=it.b;drawBall(g,W/2,H/2+Math.sin(t*2)*4,84/((ST[b.st]||{}).ext||1.3),b,t)}
  else if(it.kind==='win'){if(it.id)winDraw(g,it.id,t%5,W,H);else{g.font='50px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🚫',W/2,H/2)}}
  else genArt(g,it,t,W/2,H/2,74)}
 function drawCt(now){const cv=document.getElementById('svCt'),it=curItem();if(!cv||!it)return;
  if(!CST||CST.cv!==cv)CST={cv,g:cv.getContext('2d'),bx:44,bd:1,tr:[],P:[],py:85,l:now};
  const g=CST.g,dt=Math.min(.05,(now-CST.l)/1000),t=now/1000,W=300,H=170;CST.l=now;
  g.setTransform(2,0,0,2,0,0);g.globalAlpha=1;
  const th=TH[SET.th||0]||TH[0];let A=th.a,Bc=th.b,pc=null,tb=null,fxc=null,ball=BM[(prof.eq||{}).bl]||DEF;
  if(it.kind==='ball')ball=it.b;
  else if(it.kind==='gen'){if(it.cat==='pad')pc=it.c[0];else if(it.cat==='tb')tb=it.c;else if(it.cat==='fx')fxc=it.c;else if(it.cat==='th'){A=it.c[0];Bc=it.c[1]||A}}
  g.fillStyle='#02020a';g.fillRect(0,0,W,H);
  if(tb){const q=g.createLinearGradient(0,0,W,H);q.addColorStop(0,tb[0]);q.addColorStop(1,tb[1]||tb[0]);g.fillStyle=q;g.fillRect(0,0,W,H)}
  else{stars(g,t,W,H,30);g.fillStyle='rgba(20,70,200,.18)';g.fillRect(8,8,W-16,H-16)}
  g.save();g.strokeStyle='#fff';g.globalAlpha=.85;g.lineWidth=2;g.shadowColor=Bc;g.shadowBlur=8;g.strokeRect(8,8,W-16,H-16);g.restore();
  g.save();g.globalAlpha=.4;g.strokeStyle=Bc;g.lineWidth=2;g.setLineDash([6,8]);g.beginPath();g.moveTo(W/2,8);g.lineTo(W/2,H-8);g.stroke();g.restore();
  const by=H/2+Math.sin(t*2.4)*38;CST.bx+=CST.bd*140*dt;
  if(CST.bx>=W-36||CST.bx<=36){CST.bx=Math.max(36,Math.min(W-36,CST.bx));CST.bd=-CST.bd;const cs=fxc||ball.rb;for(let i=0;i<(fxc?28:14);i++){const a=Math.random()*TAU,v=40+Math.random()*140;CST.P.push({x:CST.bx,y:by,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.7,c:cs[i%cs.length]})}}
  CST.py+=(by-CST.py)*Math.min(1,dt*8);
  [[14,pc||A],[W-26,Bc]].forEach(([px,col])=>{g.save();g.fillStyle=col;g.shadowColor=col;g.shadowBlur=14;rr(g,px,CST.py-26,12,52,6);g.fill();g.restore()});
  CST.tr.push({x:CST.bx,y:by});if(CST.tr.length>14)CST.tr.shift();
  trail(g,CST.tr,8,ball,t);drawBall(g,CST.bx,by,9,ball,t);
  CST.P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;g.globalAlpha=Math.max(0,p.l);g.fillStyle=p.c;g.fillRect(p.x,p.y,3,3)});g.globalAlpha=1;CST.P=CST.P.filter(p=>p.l>0);
  if(it.kind==='gen'&&it.cat==='th'){g.save();g.strokeStyle=Bc;g.lineWidth=2;rr(g,16,14,70,22,11);g.stroke();g.fillStyle='#fff';g.font='bold 12px system-ui,Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('3 - 2',51,25);const q=g.createLinearGradient(90,0,210,0);q.addColorStop(0,A);q.addColorStop(1,Bc);g.fillStyle=q;rr(g,90,H-34,120,24,12);g.fill();g.restore()}}
 function loop(now){
  if($('sv').classList.contains('hide')){run=false;return}
  if(now-lastC>66){lastC=now;const t=now/1000;for(const c of cards)drawThumb(c,t)}
  try{drawBig(now);drawCt(now)}catch(e){}
  requestAnimationFrame(loop)}

 /* ---------- abrir y cerrar ---------- */
 function open(){au();SFX.click();S.q='';$('svQ').value='';S.pan=false;S.sel='';$('sv').classList.remove('hide');render()}
 function close(){$('sv').classList.add('hide');S.pan=false}
 $('nSh').onclick=open;
 $('svX').onclick=()=>{SFX.click();close()};
 $('svQ').oninput=e=>{S.q=e.target.value;S.sel='';render()};
 $('svOf').onchange=e=>{S.of=e.target.value;S.sel='';render()};
 $('svRf').onchange=e=>{S.rf=e.target.value;S.sel='';render()};
 $('svSo').onchange=e=>{S.so=e.target.value;render()};
 $('svFr').onclick=()=>{SFX.click();const b=$('tpFr');if(b)b.click()};
 $('svIb').onclick=()=>{SFX.click();const b=$('tpIb');if(b)b.click()};
 $('svSt').onclick=()=>{SFX.click();$('gear').click()};
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('sv').classList.contains('hide')){if(S.pan){S.pan=false;$('svR').classList.remove('open')}else close()}});
 const _u=updPC;updPC=function(){_u.apply(this,arguments);try{if(!$('sv').classList.contains('hide'))paintCoin()}catch(e){}};
})();


/* ===== TIENDA · AJUSTE PARA TELÉFONO (pegar al FINAL de tu segundo archivo, después del bloque TIENDA V3) ===== */
(function(){
 if(window.__shopPhone)return;window.__shopPhone=1;
 const st=document.createElement('style');st.id='shopPhone';
 st.textContent=`
 /* ARREGLO PARA PC Y TELÉFONO: la clase "big" de tu juego pintaba el precio como un botón rojo gigante */
 #sv .svPr.big{width:auto;padding:0;border:0;border-radius:0;background:none;box-shadow:none;font-size:17px;letter-spacing:0;line-height:1.2;font-weight:800;display:flex;align-items:center;gap:6px}
 #sv .svBuy{background:#050a28}

 @media(max-width:900px){
  #sv{gap:8px;padding:calc(8px + env(safe-area-inset-top,0px)) 8px calc(8px + env(safe-area-inset-bottom,0px))}

  /* cabecera en 2 filas ordenadas: título + saldo + cerrar / buscador + 3 botones */
  #sv .svH{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;grid-template-areas:"t c c x" "q f i s";gap:8px;padding:8px 10px;align-items:center}
  #sv .svT{grid-area:t;margin:0;gap:8px;min-width:0}
  #sv .svT svg{width:30px;height:30px}
  #sv .svT b{font-size:18px;letter-spacing:3px}
  #sv .svT small{font-size:7px;letter-spacing:1.5px;white-space:nowrap}
  #sv .svC{grid-area:c;justify-self:end;padding:6px 10px;font-size:13px}
  #sv .svB{width:38px;height:38px;font-size:16px;border-radius:10px}
  #sv .svB.x{grid-area:x}
  #sv #svQ{grid-area:q;flex:none;width:100%;min-width:0;padding:8px 10px;font-size:13px}
  #sv #svFr{grid-area:f}#sv #svIb{grid-area:i}#sv #svSt{grid-area:s}

  /* igual que la PC: menú de categorías a la izquierda (angosto) y artículos a la derecha */
  #sv .svM{grid-template-columns:62px minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:8px}
  #sv .svL{flex-direction:column;overflow-x:hidden;overflow-y:auto;gap:6px}
  #sv .svL button{flex-direction:column;justify-content:center;gap:2px;padding:9px 2px;font-size:8.5px;letter-spacing:0;text-align:center;border-radius:12px;min-height:58px}
  #sv .svL button span{font-size:22px;width:auto;line-height:1}
  #sv .svL button.inv{margin-top:auto}

  /* zona de artículos compacta */
  #sv .svC2{padding:8px}
  #sv #svT{gap:8px;margin-bottom:6px}
  #sv #svT span{font-size:22px}
  #sv #svT b{font-size:16px;letter-spacing:1px}
  #sv #svT small{font-size:10px;line-height:1.2}
  #sv .svTb{flex-wrap:nowrap;gap:5px;padding-bottom:8px;margin-bottom:8px}
  #sv .svS{flex:1 1 0;min-width:0;padding:6px 3px;font-size:10px}
  #sv #svG{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  #sv .svK{padding:6px 4px;gap:3px;border-radius:12px}
  #sv .svK canvas{width:76px!important;height:76px!important;-webkit-mask-image:radial-gradient(closest-side,#000 70%,transparent 100%);mask-image:radial-gradient(closest-side,#000 70%,transparent 100%)}
  #sv .svK b{font-size:12px}
  #sv .svRt{font-size:8px;padding:2px 6px}
  #sv .svPr{font-size:11px}
  #sv .svA{padding:7px 2px;font-size:11px}

  /* detalles: ventana que sube desde abajo (como el panel derecho de la PC) */
  #sv .svR.open{position:fixed;left:0;right:0;bottom:0;top:auto;height:88vh;height:88dvh;border-radius:20px 20px 0 0;background:#050a28;padding:12px 12px 0;box-shadow:0 0 0 100vmax rgba(0,0,10,.78),0 0 24px var(--rc,#2a6bff);z-index:30}
  #sv .svRx{align-self:stretch;padding:9px;font-size:12px}
  #sv .svBW canvas{height:26vh!important;width:100%!important;object-fit:contain;background:#03040f}
  #sv #svCt{max-height:24vh;object-fit:contain;background:#02020a}
  #sv .svNm b{font-size:18px}
  #sv .svD{font-size:12.5px}
  #sv .svBuy{bottom:0;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}
 }`;
 document.head.appendChild(st);
})();

/* ===== D.M.R v22b: MAPA DE NIVELES (fondos arreglados + puertas en el nivel 10, 20, 30...) ===== */
(function(){
if(window.__dmr22)return;window.__dmr22=1;
const rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BEST=()=>VER?100:(prof.best||0);
const zi=L=>Math.min(9,Math.floor((L-1)/10));
const ZN=[['ZONA VOLCÁNICA','#ff3b1f','#ffa000'],['ZONA ELÉCTRICA','#b6ff00','#ffe600'],['BOSQUE MISTERIOSO','#19e65a','#d8ff5a'],['CIUDAD NEÓN','#2a6bff','#c040ff'],['OCÉANO PROFUNDO','#0a7aff','#00d0ff'],['DESIERTO DORADO','#ff9a1f','#ffd24a'],['REINO DE HIELO','#7fe3ff','#d8f6ff'],['SELVA SALVAJE','#4dff3a','#b8ff3a'],['DIMENSIÓN CÓSMICA','#a64dff','#ff4dff'],['FORTALEZA SUPREMA','#ff2233','#ffd24a']];
const STEP=104,DOOR=110,TOP=520,BOT=190;

/* ---------- RETOS (uno por nivel) ---------- */
const CHS=[
 {k:'veloz',ic:'⚡',n:'PELOTA RÁPIDA',d:'La pelota va más rápida de lo normal.'},
 {k:'muro',ic:'🧱',n:'MURO MÓVIL',d:'Un muro se mueve en el centro y rebota la pelota.',ev:['muro']},
 {k:'grav',ic:'🌌',n:'GRAVEDAD LOCA',d:'La gravedad empuja la pelota hacia arriba y hacia abajo.'},
 {k:'pala',ic:'🎯',n:'PRECISIÓN',d:'Tu paleta es más pequeña. Apunta bien.'},
 {k:'niebla',ic:'🌫',n:'NIEBLA',d:'La pelota se esconde en la niebla del centro.',ev:['niebla']},
 {k:'remon',ic:'🔥',n:'REMONTADA',d:'Empiezas perdiendo. ¡Dale la vuelta!'},
 {k:'fant',ic:'👻',n:'PELOTA FANTASMA',d:'La pelota desaparece por momentos.'},
 {k:'elast',ic:'🎈',n:'PALETAS ELÁSTICAS',d:'Las paletas se estiran y se encogen solas.',ev:['elastica']},
 {k:'temb',ic:'🌋',n:'TEMBLOR',d:'La pelota salta sin control.',ev:['temblor']},
 {k:'hielo',ic:'🧊',n:'ZONA DE HIELO',d:'Tu paleta se congela de vez en cuando.'},
 {k:'loco',ic:'🎉',n:'PODER LOCO',d:'Los poderes aparecen sin parar.',ev:['fiesta']},
 {k:'serp',ic:'🐍',n:'ZIGZAG',d:'La pelota viaja en zigzag.',ev:['serpiente']}];
function chOf(L){
 if(L%10===0){const e=EVS[L/10-1];return{k:'evt',ic:e.ic,n:e.n,d:e.d,boss:1,off:0,mul:1}}
 let i=L<=2?0:(L*5+Math.floor(L/10)*3)%12;if(CHS[i].k==='serp'&&L<30)i=0;
 const c=Object.assign({},CHS[i]);c.off=c.k==='remon'?Math.min(5,2+Math.floor(L/25)):0;c.mul=c.k==='veloz'?1.05+L*.002:1;return c}
const rewardOf=L=>L===100?5000:L%10===0?150+L*5:20+L*2;

/* ---------- ESCENARIOS ANIMADOS ---------- */
function scene(z,g,w,h,t){
 const a=ZN[z][1],b=ZN[z][2];
 const vg=(c0,c1)=>{const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,c0);q.addColorStop(1,c1);g.fillStyle=q;g.fillRect(0,0,w,h)};
 const dot=(x,y,r,c,al)=>{g.globalAlpha=Math.max(0,al);g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.globalAlpha=1};
 const tri=(x,y,bw,bh,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x-bw/2,y);g.lineTo(x,y-bh);g.lineTo(x+bw/2,y);g.closePath();g.fill()};
 const rise=(n,sp,fn)=>{for(let i=0;i<n;i++){const p=(t*sp*(.5+rd(i+3))+rd(i)*h)%h;fn(i,rd(i+9)*w,h-p,p/h)}};
 const fall=(n,sp,fn)=>{for(let i=0;i<n;i++){const p=(t*sp*(.5+rd(i+3))+rd(i)*h)%h;fn(i,rd(i+9)*w,p,p/h)}};
 const rad=(x,y,r,c,al)=>{g.globalAlpha=al;const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);g.globalAlpha=1};
 switch(z){
 case 0:
  vg('#0d0105','#3a0600');rad(w/2,h,h*.75,'#ff5a00',.4+.1*Math.sin(t*2));
  for(let k=0;k<3;k++)tri(w*(.2+k*.3),h*.6+k*18,w*.6,h*.32,'#140205');
  tri(w*.5,h*.62,w*.5,h*.3,'#1c0306');rad(w*.5,h*.33,26,'#ffb000',.6+.3*Math.sin(t*3));
  rise(40,42,(i,x,y,p)=>dot(x+Math.sin(t+i)*9,y,1+rd(i)*1.8,i%2?b:a,1-p));break;
 case 1:
  vg('#010a02','#1e2a00');g.strokeStyle=a;g.globalAlpha=.15;g.lineWidth=1;
  for(let i=0;i<=w;i+=18){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke()}g.globalAlpha=1;
  for(let k=0;k<4;k++){const f=(t*.7+k*.31)%1;if(f<.4){const sd=Math.floor(t*.7+k*.31);g.strokeStyle=f<.15?'#fff':b;g.globalAlpha=1-f*2;g.lineWidth=2;g.shadowColor=b;g.shadowBlur=8;g.beginPath();let x0=w*(.1+rd(k+sd)*.8),y0=h*k/4;g.moveTo(x0,y0);for(let s=0;s<8;s++){x0+=(rd(s+k*7+Math.floor(t*12))-.5)*26;y0+=h/32;g.lineTo(x0,y0)}g.stroke();g.shadowBlur=0;g.globalAlpha=1}}
  rise(24,60,(i,x,y,p)=>dot(x,y,1.2,i%2?b:'#fff',1-p));break;
 case 2:
  vg('#010a05','#06280f');
  for(let r=0;r<3;r++)for(let k=0;k<9;k++)tri((k*w/8+r*17)%w,h*(.35+r*.28),44+r*14,90+r*30,'rgba(2,'+(24+r*8)+',10,'+(.9-r*.15)+')');
  g.fillStyle='rgba(120,255,160,.05)';for(let k=0;k<3;k++)g.fillRect(((t*8+k*140)%(w+200))-100,h*(.3+k*.25),200,26);
  rise(26,18,(i,x,y)=>dot(x+Math.sin(t*1.2+i)*14,y,1.8,i%3?b:'#ffffaa',.5+.5*Math.sin(t*3+i)));break;
 case 3:
  vg('#04031c','#210a3e');
  for(let r=0;r<4;r++){const base=h*(.28+r*.22);for(let k=0;k<7;k++){const bw=w/7,bx=k*bw,bh=40+rd(k+r*9)*70;
   g.fillStyle='#070620';g.fillRect(bx+2,base-bh,bw-4,bh);g.fillStyle=(k+r)%2?a:b;g.globalAlpha=.9;g.fillRect(bx+2,base-bh,bw-4,2);g.globalAlpha=1;
   for(let q=0;q<6;q++){if(Math.sin(t*.7+q*3+k+r*5)>-.2){g.fillStyle=q%2?'#ffe9a0':b;g.globalAlpha=.7;g.fillRect(bx+6+(q%3)*((bw-12)/3),base-bh+8+Math.floor(q/3)*12,4,5);g.globalAlpha=1}}}}
  g.strokeStyle='#bfe0ff';g.globalAlpha=.25;g.lineWidth=1;fall(26,220,(i,x,y)=>{g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+12);g.stroke()});g.globalAlpha=1;break;
 case 4:
  vg('#012046','#00061a');g.globalCompositeOperation='lighter';
  for(let k=0;k<5;k++){const x0=w*(.1+k*.2)+Math.sin(t*.4+k)*16;g.fillStyle='rgba(0,170,255,.06)';g.beginPath();g.moveTo(x0,0);g.lineTo(x0+16,0);g.lineTo(x0+70+k*5,h);g.lineTo(x0-40,h);g.closePath();g.fill()}
  g.globalCompositeOperation='source-over';g.strokeStyle='rgba(180,240,255,.5)';g.lineWidth=1;
  rise(30,26,(i,x,y)=>{g.beginPath();g.arc(x+Math.sin(t+i)*6,y,2+rd(i)*3,0,6.283);g.stroke()});
  for(let k=0;k<5;k++){const x=((t*(18+k*7)+k*80)%(w+60))-30,y=h*(.15+k*.18)+Math.sin(t+k)*8;g.fillStyle=k%2?a:b;g.globalAlpha=.55;g.beginPath();g.ellipse(x,y,9,3.5,0,0,6.283);g.fill();g.beginPath();g.moveTo(x-8,y);g.lineTo(x-14,y-4);g.lineTo(x-14,y+4);g.fill();g.globalAlpha=1}break;
 case 5:
  vg('#2a0d00','#80400a');rad(w*.72,h*.1,70,'#ffd24a',.85);dot(w*.72,h*.1,22,'#fff1b0',.95);
  for(let r=0;r<3;r++){g.fillStyle='rgba('+(60+r*25)+',28,0,.85)';g.beginPath();g.moveTo(0,h);for(let X=0;X<=w;X+=8)g.lineTo(X,h*(.45+r*.17)+Math.sin(X/40+r*2)*14);g.lineTo(w,h);g.closePath();g.fill()}
  for(let i=0;i<30;i++){const x=((t*(30+rd(i)*40)+rd(i+2)*w)%(w+20))-10;dot(x,h*rd(i+5),1.3,b,.45)}break;
 case 6:
  vg('#0b2d50','#02101f');g.lineWidth=12;
  for(let k=0;k<3;k++){g.strokeStyle=k%2?a:'#7affc8';g.globalAlpha=.1;g.beginPath();for(let X=0;X<=w;X+=10){const Y=h*(.08+k*.07)+Math.sin(X/50+t*.6+k)*12;X?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}g.globalAlpha=1;
  for(let k=0;k<5;k++)tri(w*(.1+k*.22),h*.7,w*.45,h*.22,'#12405f');
  fall(70,34,(i,x,y)=>dot(x+Math.sin(t+i)*8,y,1+rd(i)*1.8,'#fff',.8));break;
 case 7:
  vg('#032a05','#0b5c12');g.strokeStyle='rgba(70,160,40,.35)';g.lineWidth=2;
  for(let k=0;k<6;k++){g.beginPath();for(let Y=0;Y<=h;Y+=14){const X=w*(k+.5)/6+Math.sin(Y/30+t*.8+k)*8;Y?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}
  for(let k=0;k<12;k++){g.save();g.translate(k%2?w:0,h*(k+.5)/12);g.rotate((k%2?Math.PI-.5:.5)+Math.sin(t*.8+k)*.12);g.fillStyle='rgba(8,'+(90+(k*9)%60)+',22,.8)';g.beginPath();g.ellipse(36,0,48,10,0,0,6.283);g.fill();g.restore()}
  rise(30,16,(i,x,y)=>dot(x+Math.sin(t+i)*10,y,1.6,i%2?b:'#fff7a0',.5+.4*Math.sin(t*2+i)));break;
 case 8:
  vg('#06021a','#17053a');g.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++)rad(w*(.3+k*.25)+Math.sin(t*.2+k)*20,h*(.2+k*.3),w*.7,k%2?a:b,.22);
  g.globalCompositeOperation='source-over';g.fillStyle='#fff';
  for(let i=0;i<80;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*.9+i));g.fillRect(rd(i)*w,rd(i+60)*h,1.4,1.4)}g.globalAlpha=1;
  dot(w*.75,h*.3,30,'#3a1a7a',1);g.strokeStyle=b;g.lineWidth=3;g.globalAlpha=.7;g.beginPath();g.ellipse(w*.75,h*.3,52,13,-.4,0,6.283);g.stroke();g.globalAlpha=1;
  {const f=(t*.25)%1;if(f<.3){g.strokeStyle='#fff';g.globalAlpha=1-f/.3;g.lineWidth=2;g.beginPath();g.moveTo(w*f*3,h*.55*f*3);g.lineTo(w*f*3-40,h*.55*f*3-22);g.stroke();g.globalAlpha=1}}break;
 default:
  vg('#050102','#2b0409');rad(w/2,h,h*.6,'#ff2233',.25+.08*Math.sin(t*2));
  g.fillStyle='#0a0204';g.fillRect(w*.2,70,w*.6,80);
  [.14,.3,.5,.7,.86].forEach((fx,k)=>{const tw=22,th=60+(k%2)*28;g.fillStyle='#0a0204';g.fillRect(w*fx-tw/2,150-th-20,tw,th+20);tri(w*fx,150-th-20,tw+10,26,'#0a0204')});
  for(let k=0;k<12;k++){g.fillStyle='#ffc040';g.globalAlpha=.5+.5*Math.sin(t*3+k);g.fillRect(w*.22+(k%6)*w*.1,86+Math.floor(k/6)*22,4,8)}g.globalAlpha=1;
  if(t%5<.1||(t%5>.22&&t%5<.3)){g.fillStyle='rgba(255,40,50,.22)';g.fillRect(0,0,w,h)}
  rise(46,50,(i,x,y,p)=>dot(x+Math.sin(t+i)*9,y,1+rd(i)*1.6,i%2?b:a,1-p))}}

/* ---------- ESTILOS + PANTALLA ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
#lm{position:fixed;inset:0;z-index:21;background:#02030c;color:#fff}
#lm,#lm *{touch-action:pan-y}
#lmSc{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none}
#lmSc::-webkit-scrollbar{display:none}
#lmIn{position:relative;margin:0 auto}
#lmIn canvas.zc{position:absolute!important;left:0!important;right:auto!important;bottom:auto!important;max-width:none!important;z-index:0}
#lmIn svg{position:absolute;left:0;top:0;pointer-events:none;z-index:2}
.lmH{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top,0px)) 10px 16px;background:linear-gradient(180deg,rgba(2,3,12,.94),rgba(2,3,12,0))}
.lmH .btn{min-width:0;padding:9px 14px;font-size:14px;flex:none}
.lmT{flex:1;text-align:center;min-width:0}
.lmT b{display:block;font-size:14px;letter-spacing:3px;text-shadow:0 0 12px currentColor;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lmT small{font-size:10px;letter-spacing:1px;opacity:.9}
#lmF{position:absolute;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:5;display:flex;flex-direction:column;gap:8px}
#lmF button{width:46px;height:46px;border-radius:50%;border:2px solid var(--b);background:rgba(7,11,34,.92);color:#fff;font-size:20px;box-shadow:0 0 14px rgba(var(--bb),.6)}
.mn{position:absolute;transform:translate(-50%,-50%);width:62px;height:62px;border-radius:50%;border:3px solid var(--nc);background:radial-gradient(circle at 35% 30%,#16204a,#050816);color:#fff;font-weight:900;font-size:20px;padding:0;box-shadow:0 0 14px var(--nc),inset 0 0 10px rgba(255,255,255,.08);z-index:4;text-shadow:0 0 8px var(--nc)}
.mn.dn{background:radial-gradient(circle at 35% 30%,#0f4a35,#050816)}
.mn.cu{border-color:#fff;animation:lmP 1.3s ease-in-out infinite}
@keyframes lmP{50%{transform:translate(-50%,-50%) scale(1.14);box-shadow:0 0 30px var(--nc),0 0 10px #fff}}
.mn.lk{background:#03040c;color:#4a4f66;border-color:#242842;box-shadow:none;text-shadow:none}
.mn.bs{width:104px;height:104px;font-size:36px;border-color:#ffd24a;box-shadow:0 0 34px #ff2233,0 0 14px #ffd24a}
.mn.bs.lk{border-color:#4a2a22;box-shadow:none}
.mst{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:2px;font-size:13px;letter-spacing:1px;white-space:nowrap;pointer-events:none}
.mst i{font-style:normal;color:#3a3f5a}.mst i.on{color:#ffd400;text-shadow:0 0 8px #ffd400}
.mbd{position:absolute;left:50%;top:-22px;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #ffd400);pointer-events:none}
.mlk{position:absolute;right:-4px;bottom:-4px;font-size:14px}
.lmSt{position:absolute;transform:translate(-50%,-50%);z-index:3;text-align:center;font-size:11px;font-weight:900;letter-spacing:3px;color:#8fe8ff;text-shadow:0 0 10px #00c8ff}
.lmSt span{display:block;font-size:42px;filter:drop-shadow(0 0 12px #00c8ff)}
.dr{position:absolute;transform:translate(-50%,-50%) scale(.85);width:170px;height:128px;z-index:4;cursor:pointer}
.dr.big{transform:translate(-50%,-50%) scale(1.5)}
.dr.fut{opacity:.55}
.drA{position:absolute;left:14px;right:14px;top:0;bottom:30px;border:3px solid var(--c);border-bottom:0;border-radius:72px 72px 0 0;overflow:hidden;background:#010208;box-shadow:0 0 20px var(--c),inset 0 0 16px var(--c)}
.dr.op .drA,.dr.cu .drA{animation:lmGl 1.6s ease-in-out infinite}
@keyframes lmGl{50%{box-shadow:0 0 38px var(--c),inset 0 0 26px var(--c)}}
.drG{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#fff,var(--c) 40%,transparent 75%);opacity:0;transition:opacity 1s .3s}
.drL,.drR{position:absolute;top:0;bottom:0;width:50.5%;background:repeating-linear-gradient(90deg,#1b2038 0 6px,#10142a 6px 12px);transition:transform 1.5s cubic-bezier(.65,0,.25,1)}
.drL{left:0;border-right:2px solid var(--c)}.drR{right:0;border-left:2px solid var(--c)}
.dr.op .drL{transform:translateX(-102%)}.dr.op .drR{transform:translateX(102%)}.dr.op .drG{opacity:.9}
.drK{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:30px;z-index:2;transition:all .9s;filter:drop-shadow(0 0 8px var(--c))}
.dr.op .drK{opacity:0;transform:translate(-50%,-160%) scale(1.8)}
.drT{position:absolute;left:0;right:0;bottom:0;text-align:center;font-size:12px;font-weight:900;letter-spacing:1px;background:rgba(5,8,28,.94);border:1px solid var(--c);border-radius:8px;padding:3px 2px;line-height:1.3;box-shadow:0 0 10px var(--c)}
.drT small{display:block;font-size:10.5px;letter-spacing:0;opacity:.9}
.drT em{font-style:normal;color:#3a3f5a}.drT em.on{color:#ffd400}
#lmSp{position:fixed;left:0;right:0;top:36%;z-index:45;text-align:center;font-size:clamp(26px,9vw,44px);font-weight:900;letter-spacing:4px;pointer-events:none;text-shadow:0 0 24px currentColor;opacity:0}
#lmSp small{display:block;font-size:12px;letter-spacing:6px;color:#fff;margin-top:6px}
@keyframes lmSp{0%{opacity:0;transform:scale(.7)}25%{opacity:1;transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:scale(1.15)}}
#lmFl{position:fixed;inset:0;z-index:46;background:#fff;pointer-events:none;opacity:0}
@keyframes lmFl{0%{opacity:.9}100%{opacity:0}}
#lmBoss{position:fixed;inset:0;z-index:60;background:#000;display:flex;align-items:center;justify-content:center}
#lmBoss .bgt{position:relative;width:min(80vw,320px);height:min(60vh,420px);border:4px solid #ffd24a;border-radius:160px 160px 0 0;overflow:hidden;box-shadow:0 0 50px #ff2233,inset 0 0 40px #ff2233;background:#000}
#lmBoss .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#fff,#ffd24a 30%,#ff2233 60%,transparent 80%);opacity:0;transition:opacity 1.4s .6s}
#lmBoss .bl,#lmBoss .br{position:absolute;top:0;bottom:0;width:50.5%;background:repeating-linear-gradient(90deg,#1a0408 0 8px,#0a0204 8px 16px);transition:transform 2s cubic-bezier(.65,0,.25,1)}
#lmBoss .bl{left:0;border-right:3px solid #ffd24a}#lmBoss .br{right:0;border-left:3px solid #ffd24a}
#lmBoss.op .bl{transform:translateX(-102%)}#lmBoss.op .br{transform:translateX(102%)}#lmBoss.op .bg{opacity:1}
#lmBoss .bt{position:absolute;bottom:12%;left:0;right:0;text-align:center;font-size:clamp(34px,11vw,56px);font-weight:900;letter-spacing:5px;color:#ffd24a;text-shadow:0 0 26px #ff2233;opacity:0;transition:opacity 1s 1.2s}
#lmBoss.op .bt{opacity:1}#lmBoss .bt small{display:block;font-size:12px;letter-spacing:4px;color:#fff;margin-top:8px}
</style>`);
document.body.insertAdjacentHTML('beforeend','<div id="lm" class="hide"><div id="lmSc"><div id="lmIn"></div></div><div class="lmH"><button class="btn" id="lmB" type="button">↩ VOLVER</button><div class="lmT"><b id="lmZ">NIVELES</b><small id="lmS"></small></div><div class="coin" id="lmCo">DOP 0</div></div><div id="lmF"><button id="lmCur" type="button" aria-label="Mi nivel">📍</button><button id="lmBot" type="button" aria-label="Inicio">🏁</button></div></div><div id="lmSp"></div><div id="lmFl"></div>');
$('bnext').insertAdjacentHTML('afterend','<button class="btn" id="bmap" type="button">🗺 MAPA DE NIVELES</button>');

/* ---------- construcción del mapa ---------- */
let W=0,H=0,zb=[],Y=[],DYv=[],io=null,raf=0,run=0,curZ=-1,last=0,tick=0;const ST={stop:0};
function build(){
 const In=$('lmIn');W=Math.min(480,innerWidth);H=TOP+99*STEP+9*DOOR+BOT;
 const best=BEST(),cur=Math.min(100,best+1),cx=W/2,amp=W*.3;
 prof.dseen=prof.dseen||{};prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const P=i=>({x:cx+Math.sin(i*.62)*amp,y:H-BOT-((i-1)*STEP+Math.floor((i-1)/10)*DOOR)});
 const dY=k=>(P(10*k).y+P(10*k+1).y)/2;
 In.style.width=W+'px';In.style.height=H+'px';In.innerHTML='';
 Y=[];for(let i=1;i<=100;i++)Y[i]=P(i).y;
 DYv=[];for(let k=1;k<=9;k++)DYv[k]=Y[10*k];DYv[10]=Y[100]-230;
 /* zonas con escenarios animados */
 zb=[];const cz=zi(cur);
 for(let z=0;z<10;z++){
  const top=z===9?0:dY(z+1),bot=z===0?H:dY(z);zb.push([top,bot]);
  const c=document.createElement('canvas');c.className='zc';c.dataset.z=z;c.width=Math.ceil(W/2);c.height=Math.max(2,Math.ceil((bot-top)/2));
  c.style.cssText='top:'+top+'px!important;width:'+W+'px!important;height:'+(bot-top)+'px!important';
  c.style.filter=best<10*z?'brightness('+Math.max(.1,.42-(z-cz)*.05)+') saturate(.55)':'';
  c.__g=c.getContext('2d');c.__bk=bake(c,z,top);In.appendChild(c)}
 /* camino (pasa por las puertas) */
 const pts=[];
 for(let i=1;i<=100;i++){const p=P(i);pts.push({x:p.x,y:p.y,lo:i})}
 pts.push({x:cx,y:DYv[10],lo:100});
 const f=n=>n.toFixed(1);let base='',dim='',dash='';const lit=Array.from({length:10},()=>'');
 for(let j=0;j<pts.length-1;j++){
  const p0=pts[Math.max(j-1,0)],p1=pts[j],p2=pts[j+1],p3=pts[Math.min(j+2,pts.length-1)];
  const d='M'+f(p1.x)+' '+f(p1.y)+'C'+f(p1.x+(p2.x-p0.x)/6)+' '+f(p1.y+(p2.y-p0.y)/6)+' '+f(p2.x-(p3.x-p1.x)/6)+' '+f(p2.y-(p3.y-p1.y)/6)+' '+f(p2.x)+' '+f(p2.y);
  base+='<path d="'+d+'"/>';
  if(best>=p1.lo){lit[zi(p1.lo)]+='<path d="'+d+'"/>';dash+='<path class="'+(p1.lo>best-8?'rda':'rds')+'" d="'+d+'"/>'}
  else dim+='<path d="'+d+'"/>'}
 let svg='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><style>.rda,.rds{stroke-dasharray:3 22;stroke-linecap:round}.rda{animation:rdf 1s linear infinite}@keyframes rdf{to{stroke-dashoffset:-25}}</style>'
  +'<g fill="none" stroke="#10142e" stroke-width="32" stroke-linecap="round">'+base+'</g><g fill="none" stroke="#04050e" stroke-width="26" stroke-linecap="round">'+base+'</g>'
  +'<g fill="none" stroke="#1c2244" stroke-width="3" stroke-linecap="round" opacity=".8">'+dim+'</g>';
 for(let z=0;z<10;z++)if(lit[z])svg+='<g fill="none" stroke="'+ZN[z][1]+'" stroke-width="7" stroke-linecap="round" style="filter:drop-shadow(0 0 7px '+ZN[z][1]+')">'+lit[z]+'</g>';
 svg+='<g fill="none" stroke="#fff" stroke-width="2" opacity=".85">'+dash+'</g></svg>';
 In.insertAdjacentHTML('beforeend',svg);
 /* plataforma de inicio */
 In.insertAdjacentHTML('beforeend','<div class="lmSt" style="left:'+P(1).x+'px;top:'+(P(1).y+82)+'px"><span>🏓</span>INICIO</div>');
 /* PUERTAS: en el lugar del nivel 10, 20, 30... y la puerta final arriba */
 for(let k=1;k<=10;k++){
  const e=EVS[k-1],open=best>=10*k&&prof.dseen[k],col=k===10?'#ffd24a':ZN[k-1][1],lv=10*k;
  const px=k===10?cx:P(lv).x,py=DYv[k],st=prof.lst[lv]||0;
  const d=document.createElement('div');d.id='dr'+k;
  d.className='dr'+(k===10?' big':'')+(open?' op':'')+(k<10&&lv===cur?' cu':'')+(k<10&&lv>cur?' fut':'');
  d.style.cssText='left:'+px+'px;top:'+py+'px;--c:'+col;
  d.innerHTML='<div class="drA"><div class="drG"></div><div class="drL"></div><div class="drR"></div></div><div class="drK">🔒</div><div class="drT">'+(k===10?'PUERTA FINAL':'PUERTA '+lv)+'<small>'+e.ic+' '+e.n+'</small>'+(k<10&&best>=lv?'<span>'+[1,2,3].map(q=>'<em'+(q<=st?' class="on"':'')+'>★</em>').join('')+'</span>':'')+'</div>';
  d.onclick=()=>k===10?doorTap(10):tap(lv);In.appendChild(d)}
 /* niveles (los 10, 20, 30... son puertas; el 100 es el jefe) */
 for(let i=1;i<=100;i++){
  if(i%10===0&&i<100)continue;
  const p=P(i),b=document.createElement('button'),st=prof.lst[i]||0,z=ZN[zi(i)];
  b.type='button';b.className='mn'+(i<=best?' dn':i===cur?' cu':' lk')+(i===100?' bs':'');
  b.style.cssText='left:'+p.x+'px;top:'+p.y+'px;--nc:'+z[1]+(i>cur?';opacity:'+Math.max(.14,.62-(i-cur)*.03):'');
  b.innerHTML=(i===100?'<b class="mbd">👑</b>':'')+'<span>'+i+'</span>'+(i>cur?'<i class="mlk">🔒</i>':'<span class="mst">'+[1,2,3].map(k=>'<i'+(k<=st?' class="on"':'')+'>★</i>').join('')+'</span>');
  b.onclick=()=>tap(i);In.appendChild(b)}
 upd()}

/* ---------- animación de fondos ---------- */
function loop(n){raf=requestAnimationFrame(loop);if(n-last<(SET.red?60:33))return;last=n;const t=n/1000,st=$('lmSc').scrollTop,vh=innerHeight;
 document.querySelectorAll('#lmIn canvas.zc').forEach(c=>{const z=+c.dataset.z,b=zb[z];if(!b||b[1]<st-300||b[0]>st+vh+300)return;
  try{const g=c.__g;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';scene(z,g,c.width,c.height,t);g.globalAlpha=1;g.globalCompositeOperation='source-over';if(c.__bk)g.drawImage(c.__bk,0,0)}
  catch(e){if(!loop.e){loop.e=1;showErr('mapa: '+e.message)}}})}

/* diseño propio de cada nivel pintado de fondo */
function pat(g,name,x0,y0,w,h,col,sd){
 g.save();g.beginPath();g.rect(x0,y0,w,h);g.clip();g.strokeStyle=col;g.fillStyle=col;g.lineWidth=1.2;g.globalAlpha=.4;
 const ln=(a,b,c,d)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke()};
 switch(name){
  case 'grid':for(let x=0;x<=w;x+=16)ln(x0+x,y0,x0+x,y0+h);for(let y=0;y<=h;y+=16)ln(x0,y0+y,x0+w,y0+y);break;
  case 'circles':for(let r=14;r<w*1.2;r+=14){g.beginPath();g.arc(x0+w/2,y0+h/2,r,0,6.283);g.stroke()}break;
  case 'diag':for(let i=-h;i<w;i+=16)ln(x0+i,y0,x0+i+h,y0+h);break;
  case 'stars':for(let k=0;k<22;k++){const px=x0+rd(sd+k)*w,py=y0+rd(sd+k+40)*h,s=2+rd(sd+k+80)*5;g.globalAlpha=.25+rd(k+sd)*.4;g.beginPath();g.moveTo(px,py-s);g.lineTo(px+s*.3,py-s*.3);g.lineTo(px+s,py);g.lineTo(px+s*.3,py+s*.3);g.lineTo(px,py+s);g.lineTo(px-s*.3,py+s*.3);g.lineTo(px-s,py);g.lineTo(px-s*.3,py-s*.3);g.closePath();g.fill()}break;
  case 'waves':for(let y=6;y<h;y+=14){g.beginPath();for(let x=0;x<=w;x+=6){const yy=y0+y+Math.sin(x/18+y)*5;x?g.lineTo(x0+x,yy):g.moveTo(x0+x,yy)}g.stroke()}break;
  case 'hex':{const R=14,dx=R*1.732,dy=R*1.5;for(let row=-1;row<h/dy+1;row++)for(let cc=-1;cc<w/dx+1;cc++){const cx=x0+cc*dx+(row&1?dx/2:0),cy=y0+row*dy;g.beginPath();for(let k=0;k<6;k++){const an=Math.PI/3*k+Math.PI/6,px=cx+R*Math.cos(an),py=cy+R*Math.sin(an);k?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.stroke()}break}
  case 'dots':for(let x=8;x<w;x+=14)for(let y=8;y<h;y+=14){g.beginPath();g.arc(x0+x,y0+y,1.4,0,6.283);g.fill()}break;
  default:for(let y=0;y<=h;y+=18)ln(x0,y0+y,x0+w,y0+y);for(let i=-h;i<w;i+=36){ln(x0+i,y0,x0+i+h,y0+h);ln(x0+i+h,y0,x0+i,y0+h)}}
 g.restore()}
function bake(c,z,top){
 const bk=document.createElement('canvas');bk.width=c.width;bk.height=c.height;const g=bk.getContext('2d'),a=10*z+1,e=10*z+10;
 for(let i=a;i<=e;i++){
  const cf=LV(i),y0=i===e?0:((Y[i]+Y[i+1])/2-top)/2,y1=i===a?c.height:((Y[i]+Y[i-1])/2-top)/2;
  g.globalAlpha=.16;g.fillStyle=cf.c1;g.fillRect(0,y0,c.width,y1-y0);g.globalAlpha=1;
  pat(g,cf.pat,0,y0,c.width,y1-y0,cf.c1,i*31);
  g.globalAlpha=.55;g.fillStyle=cf.c1;g.fillRect(0,y0,c.width,1);g.globalAlpha=1}
 return bk}
function startLoop(){cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function stop(){run++;cancelAnimationFrame(raf);raf=0}

/* ---------- cámara ---------- */
function flyTo(y,ms){return new Promise(res=>{const s=$('lmSc'),a=s.scrollTop,b=clamp(y-innerHeight*.55,0,Math.max(0,H-innerHeight)),t0=performance.now();ST.stop=0;
 (function f(n){if(ST.stop){res();return}const u=Math.min(1,(n-t0)/ms),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;s.scrollTop=a+(b-a)*e;if(u<1)requestAnimationFrame(f);else res()})(t0)})}
function upd(){
 const s=$('lmSc'),mid=s.scrollTop+innerHeight*.5;let z=zb.findIndex(b=>mid>=b[0]&&mid<b[1]);if(z<0)z=mid<(zb[9]?zb[9][0]:0)?9:0;
 if(z===curZ)return;curZ=z;
 const zs=ZN[z],lk=BEST()<10*z;let n=0;for(let i=10*z+1;i<=10*z+10;i++)n+=(prof.lst||{})[i]||0;
 $('lmZ').style.color=zs[1];$('lmZ').textContent=(lk?'🔒 ':'')+zs[0];
 $('lmS').textContent='NIVELES '+(10*z+1)+'–'+(10*z+10)+' · ★ '+n+'/30'}
$('lmSc').addEventListener('scroll',()=>{if(!tick){tick=1;requestAnimationFrame(()=>{tick=0;upd()})}},{passive:true});
$('lmSc').addEventListener('touchstart',()=>{ST.stop=1},{passive:true});
$('lmSc').addEventListener('wheel',()=>{ST.stop=1},{passive:true});
$('lmCur').onclick=()=>{SFX.click();flyTo(Y[Math.min(100,BEST()+1)],1000)};
$('lmBot').onclick=()=>{SFX.click();flyTo(Y[1],1400)};
$('lmB').onclick=()=>{SFX.click();closeLevels()};

/* ---------- efectos de pantalla ---------- */
function flash(){const e=$('lmFl');e.style.animation='none';void e.offsetWidth;e.style.animation='lmFl .9s ease-out forwards'}
function splash(z){const e=$('lmSp');e.style.color=z[1];e.innerHTML=z[0]+'<small>NUEVA ZONA</small>';e.style.animation='none';void e.offsetWidth;e.style.animation='lmSp 2.4s ease forwards'}

/* ---------- entrada: la cámara viaja hasta tu nivel y abre puertas nuevas ---------- */
async function intro(){
 const my=++run,s=$('lmSc'),best=BEST(),cur=Math.min(100,best+1);let pend=0;
 for(let k=1;k<=10;k++)if(best>=10*k&&!prof.dseen[k]){pend=k;prof.dseen[k]=1}
 if(pend)saveP();
 s.scrollTop=H;upd();await sleep(250);if(my!==run)return;
 if(pend){
  await flyTo(DYv[pend]+40,1900);if(my!==run||ST.stop)return;
  await sleep(350);const e=$('dr'+pend);if(e)e.classList.add('op');
  SFX.impact();flash();toast('🚪 ¡PUERTA '+(pend*10)+' ABIERTA!');
  await sleep(1700);if(my!==run)return;
  if(pend<10){splash(ZN[pend]);await sleep(900);if(my!==run)return;await flyTo(Y[cur],2200)}
 }else await flyTo(Y[cur],2200)}

/* ---------- toques ---------- */
function doorTap(k){SFX.click();const e=EVS[k-1],open=BEST()>=10*k;
 if(open){toast('🚪 Puerta abierta · '+(k<10?ZN[k][0]:'¡Fortaleza conquistada!'));return}
 modal('🔒 PUERTA '+(k===10?'FINAL':k*10),'Supera el nivel <b>'+(k*10)+'</b> y su evento <b>'+e.ic+' '+e.n+'</b> para abrirla.<br><small>'+e.d+'</small>',[['ENTENDIDO',null]])}
function tap(i){SFX.click();const best=BEST();
 if(i>best+1){modal('🔒 NIVEL '+i,'Completa primero el nivel <b>'+(i-1)+'</b>.',[['ENTENDIDO',null]]);return}
 prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const c=chOf(i),z=ZN[zi(i)],st=prof.lst[i]||0,col=c.boss?'#ffd400':z[1];
 const row=[1,2,3].map(k=>'<span style="font-size:26px;color:'+(k<=st?'#ffd400':'#3a3f5a')+';text-shadow:'+(k<=st?'0 0 10px #ffd400':'none')+'">★</span>').join('');
 const chips=LV(i).ab.map(k=>'<span class="chip" style="border-color:'+ABIL[k].col+'">'+ABIL[k].ic+' '+ABIL[k].nm+'</span>').join('');
 modal((i%10===0&&i<100?'🚪 PUERTA ':'NIVEL ')+i+(i===100?' · JEFE FINAL':''),
  '<div class="mt" style="color:'+z[1]+'">'+z[0]+(i<=best?' · ✔ COMPLETADO':'')+'</div><div>'+row+'</div>'
  +'<div style="margin:10px 0;padding:10px;border:2px solid '+col+';border-radius:14px;background:#0a1030"><b>'+c.ic+' '+(c.boss?'EVENTO':'RETO')+': '+c.n+'</b><br><small>'+c.d+(c.off?' ('+c.off+' puntos de desventaja)':'')+'</small></div>'
  +'<small>★ Gana · ★★ ≥62% de los puntos · ★★★ ≥75%</small><br><small>🎁 Recompensa: <b style="color:#ffd400">DOP '+fmt(rewardOf(i))+'</b>'+(prof.lrw[i]?' (ya cobrada)':'')+' · +DOP '+(c.boss?25:10)+' por estrella nueva</small>'
  +'<div class="chips" style="margin-top:8px">'+chips+'</div>',
  [['▶ JUGAR',()=>{au();i===100?bossIntro(i):start(i)}],['CERRAR',null,'tg']])}
function start(i){stop();selLv=i;paintGrid();sh('lm',0);newGame(false)}
function bossIntro(i){
 const o=document.createElement('div');o.id='lmBoss';o.innerHTML='<div class="bgt"><div class="bg"></div><div class="bl"></div><div class="br"></div></div><div class="bt">NIVEL 100<small>JEFE FINAL · FORTALEZA SUPREMA</small></div>';
 document.body.appendChild(o);let done=0;
 [196,196,262,330,392,523,659].forEach((f,k)=>setTimeout(()=>{try{tone(f,.55,'sawtooth',.7,f*1.01);tone(f/2,.8,'triangle',.9)}catch(e){}},k*330));
 const fin=()=>{if(done)return;done=1;o.remove();start(i)};
 setTimeout(()=>o.classList.add('op'),700);setTimeout(()=>{try{SFX.impact()}catch(e){}},2200);setTimeout(fin,4200);o.onclick=fin}

/* ---------- abrir / cerrar el mapa ---------- */
openLevels=function(){$('menu').classList.add('hide');$('lvs').classList.add('hide');build();sh('lm',1);$('lmCo').textContent='DOP '+fmt(prof.pc||0);curZ=-1;startLoop();intro()};
closeLevels=function(){stop();sh('lm',0);$('menu').classList.remove('hide')};
$('bmap').onclick=()=>{SFX.click();toMenu();openLevels()};

/* ---------- retos reales dentro de la partida ---------- */
let CHc=null,chT=0,gT=3,iT=5;
const _LP=LP;LP=function(L){const r=_LP(L);return(CHc&&CHc.mul>1)?{base:r.base*CHc.mul,boost:r.boost}:r};
const _ng=newGame;
newGame=function(t){
 stop();sh('lm',0);$('bmap').classList.toggle('hide',!!t);
 CHc=t?null:chOf(selLv);chT=0;gT=3;iT=5;
 _ng(t);
 if(!CHc)return;
 try{
  if(CHc.ev&&!EVT){EVT={k:CHc.ev,ic:CHc.ic,n:CHc.n,d:CHc.d};evT=0;QK=1}
  if(!CHc.boss)gtx.push({s:CHc.ic+' '+CHc.n+'!',l:2,c:'#ffd400'});
  if(CHc.off){sc=[0,CHc.off];updScore()}
 }catch(e){showErr(e.message)}};
const _up=update;
update=function(dt){
 const c=CHc;
 if(c&&!two&&B&&P&&mode==='play'&&!paused&&CDT<=0){
  chT+=dt;
  if(c.k==='grav'&&serveT<=0&&B.vx){B.vy+=Math.sin(chT*.9)*420*dt;nrm(.35)}
  if(c.k==='fant'){gT-=dt;if(gT<=0){gT=4+Math.random()*2;B.gh=1.1}}
  if(c.k==='hielo'){iT-=dt;if(iT<=0){iT=6+Math.random()*3;P[0].slow=1.3;gtx.push({s:'🧊 CONGELADO',l:.8,c:'#7fe3ff'})}}}
 _up(dt);
 if(c&&c.k==='pala'&&P&&!two&&P[0].big<=0)P[0].h=Math.min(P[0].h,66)};

/* ---------- estrellas y recompensas al ganar ---------- */
function result(){
 const L=lvl;if(sc[0]<=sc[1])return;
 const c=chOf(L),me=sc[0],op=Math.max(0,sc[1]-c.off),r=me/Math.max(1,me+op),s=r>=.75?3:r>=.62?2:1;
 prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const old=prof.lst[L]||0;let pc=0;
 if(!prof.lrw[L]){prof.lrw[L]=1;pc+=rewardOf(L)}
 if(s>old){prof.lst[L]=s;pc+=(s-old)*(c.boss?25:10)}
 let extra='';
 if(L===100&&!prof.legend){prof.legend=1;prof.inv=prof.inv||[];if(!prof.inv.includes('pa6'))prof.inv.push('pa6');extra=' · 👑 RECOMPENSA LEGENDARIA: paleta Especial';setTimeout(()=>{try{SFX.hard();toast('👑 ¡LEYENDA D.M.R! Venciste a la Fortaleza Suprema')}catch(e){}},900)}
 if(pc){prof.pc=(prof.pc||0)+pc;updPC()}
 saveP();
 $('exp').textContent+=' · '+'★'.repeat(s)+'☆'.repeat(3-s)+(pc?' · +DOP '+fmt(pc):'')+extra}
let prevM=mode;
setInterval(()=>{if(prevM==='play'&&mode==='over'&&!two){try{result()}catch(e){showErr(e.message)}}prevM=mode},150);

/* ---------- guardado en el teléfono y en la cuenta ---------- */
const _sp=saveP;
saveP=function(){_sp();clearTimeout(saveP.t22);saveP.t22=setTimeout(()=>{if(ME&&fb&&SY)FS.setDoc(FS.doc(fb.db,'players',prof.id),{lst:prof.lst||{},lrw:prof.lrw||{},dseen:prof.dseen||{}},{merge:true}).catch(()=>{})},1500)};
const _lm=loadMe;
loadMe=async function(){await _lm();
 try{if(ME&&fb&&SY){const s=await FS.getDoc(FS.doc(fb.db,'players',prof.id));if(s.exists()){const d=s.data(),a=d.lst||{};prof.lst=prof.lst||{};for(const k in a)prof.lst[k]=Math.max(prof.lst[k]||0,a[k]);prof.lrw=Object.assign({},prof.lrw||{},d.lrw||{});prof.dseen=Object.assign({},prof.dseen||{},d.dseen||{});_sv()}}}catch(e){}};
const _fo=$('frOut').onclick;
$('frOut').onclick=async function(){await _fo.apply(this,arguments);prof.lst={};prof.lrw={};prof.dseen={};_sv()};

/* ---------- ARREGLO: "Unsupported field value: undefined (eq.fx)" ---------- */
const clean=()=>{const e=prof.eq;if(e)for(const k in e)if(e[k]===undefined)delete e[k]};
const _dgE=drawGame;drawGame=function(dt){try{_dgE(dt)}finally{clean()}};
const _spE=saveP;saveP=function(){clean();_spE()};
clean();
})();


/* ===== D.M.R v23: EFECTOS DE IMPACTO (se conservan todos los anteriores) ===== */
(function(){
if(window.__dmr23)return;window.__dmr23=1;
const TAU=6.283185,rnd=Math.random;
const rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)}
function star4(g,R,w){g.beginPath();for(let k=0;k<8;k++){const q=k%2?R*w:R,a=k*.7854-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}
function star5(g,R){g.beginPath();for(let k=0;k<10;k++){const q=k%2?R*.45:R,a=k*.6283-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}

/* ---------- efectos NUEVOS (se agregan al catálogo; los anteriores no se tocan) ---------- */
const NEWFX=['ef1','ef2','ef3'];
[['fx','ef1','Chispas Eléctricas',350,['#4da6ff','#bfe4ff','#ffffff']],
 ['fx','ef2','Impacto Estelar',750,['#ffd400','#fff3a0','#ffffff']],
 ['fx','ef3','Explosión Cósmica',1800,['#8a5bff','#ff3df2','#7ff3ff']]
].forEach(r=>{if(!IT.some(i=>i[1]===r[1]))IT.push(r)});

/* parámetros de los efectos que ya existían (solo para dibujarlos en la tienda) */
const LEG={
 '':[['#ffffff','#99ccff'],'q',10,220,4,.5,0],
 fx1:[['#ffd400','#ffffff'],'s',18,280,6,.7,0],
 fx2:[['#ff5a1f','#ffd400','#ff2233'],'c',24,260,6,.8,-160],
 fx3:[['#7fe3ff','#ffffff','#4da6ff'],'d',18,240,6,.8,0],
 fx11:[['#ffe94d','#ffffff'],'l',16,420,14,.35,0],
 fx4:[['#ff5a8a','#ffd400','#19e68c','#4da6ff','#ff3df2'],'q',30,320,6,.8,0],
 fx6:[['#ff3df2','#ff2f6a','#ffffff'],'h',14,200,9,1,-80],
 fx7:[['#ffd400','#7ff3ff','#ffffff'],'s',22,300,8,.9,0],
 fx8:[['#00ffd0','#ffffff'],'o',6,160,4,.6,0],
 fx9:[['#ff5a8a','#ffd400','#19e68c','#4da6ff','#ff3df2'],'q',40,380,7,1.1,300],
 fx10:[['#8a5bff','#ff3df2','#ffffff'],'c',28,220,4,1.2,0]};

/* textos de cada efecto para el panel de detalles */
const INFO={
 '':{d:'Chispas blancas y celestes. Viene gratis.',f:'Chispas cuadradas',c:'Blanco y celeste',t:'0,5 s'},
 fx1:{d:'Estrellitas doradas que salen disparadas al golpear.',f:'Estrellas pequeñas',c:'Oro y blanco',t:'0,7 s'},
 fx2:{d:'Impacto de fuego: llamas que suben desde el golpe.',f:'Llamas que ascienden',c:'Naranja, amarillo y rojo',t:'0,8 s'},
 fx3:{d:'Impacto de hielo: cristales que salen volando.',f:'Cristales de hielo',c:'Celeste y blanco',t:'0,8 s'},
 fx11:{d:'Rayitos eléctricos muy rápidos en cada golpe.',f:'Rayitos veloces',c:'Amarillo y blanco',t:'0,35 s'},
 fx4:{d:'Explosión arcoíris: cuadritos de cinco colores.',f:'Cuadritos de colores',c:'Cinco colores',t:'0,8 s'},
 fx6:{d:'Corazones que flotan hacia arriba al golpear.',f:'Corazones que suben',c:'Rosa, rojo y blanco',t:'1 s'},
 fx7:{d:'Lluvia de estrellas de colores.',f:'Estrellas de colores',c:'Oro, celeste y blanco',t:'0,9 s'},
 fx8:{d:'Onda de energía: ondas de choque como en el espacio.',f:'Ondas expansivas',c:'Turquesa y blanco',t:'0,6 s'},
 fx9:{d:'Una fiesta de confeti en cada golpe.',f:'Confeti que cae',c:'Cinco colores',t:'1,1 s'},
 fx10:{d:'Polvo de estrellas morado y rosa.',f:'Polvo estelar',c:'Morado, rosa y blanco',t:'1,2 s'},
 ef1:{d:'Una descarga de chispas azules cada vez que la pelota golpea la paleta.',f:'Rayos zigzag y chispas',c:'Azul eléctrico, celeste y blanco',t:'0,4 s'},
 ef2:{d:'Un destello de estrella dorada con un anillo de luz y estrellitas que giran.',f:'Estrella de 4 puntas, anillo y estrellitas',c:'Oro y blanco',t:'0,9 s'},
 ef3:{d:'Una explosión de nebulosa con ondas expansivas y polvo estelar.',f:'Nebulosa, ondas y polvo estelar',c:'Morado, rosa y celeste',t:'1,2 s'}};
const NOHACE=['No cambia la velocidad ni la trayectoria de la pelota','No da puntos ni ventaja en la partida','No cambia el tamaño ni el alcance de las paletas','Solo se ve cuando la pelota golpea'];

/* ---------- motor de partículas ---------- */
function lspawn(a,px,py,f,k){const[cols,sh,n,sp,sz,life,gr]=f;
 for(let i=0;i<n;i++){const an=rnd()*TAU,v=sp*(.3+rnd()*.7)*k;a.push({x:px,y:py,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:life,L:life,c:cols[i%cols.length],sh,sz:sz*(.6+rnd()*.8)*k,g:(gr||0)*k,rot:rnd()*TAU})}
 for(let q=0;q<(sh==='o'?3:1);q++)a.push({ring:1,x:px,y:py,l:.45+q*.12,L:.45+q*.12,c:cols[q%cols.length],r:(4+q*5)*k,rs:340*k})}
function ld(g,p,dt,u){
 if(p.ring){p.r+=p.rs*dt;g.strokeStyle=p.c;g.lineWidth=3;g.beginPath();g.arc(p.x,p.y,p.r,0,TAU);g.stroke();return}
 p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.vx*=.985;
 g.save();g.translate(p.x,p.y);g.rotate(p.rot+p.l*3);g.fillStyle=g.strokeStyle=p.c;const s=p.sz*(.4+u*.6);
 switch(p.sh){
  case 'c':case 'o':g.beginPath();g.arc(0,0,s,0,TAU);g.fill();break;
  case 'l':g.lineWidth=2;g.beginPath();g.moveTo(-s,0);g.lineTo(s,0);g.stroke();break;
  case 'd':g.beginPath();g.moveTo(0,-s*1.3);g.lineTo(s,0);g.lineTo(0,s*1.3);g.lineTo(-s,0);g.fill();break;
  case 's':g.beginPath();for(let k=0;k<10;k++){const q=k%2?s*.4:s*1.2,an=k*.628;g[k?'lineTo':'moveTo'](Math.sin(an)*q,-Math.cos(an)*q)}g.fill();break;
  case 'h':g.beginPath();g.moveTo(0,s*.7);g.bezierCurveTo(-s*1.3,-s*.1,-s*.6,-s,0,-s*.35);g.bezierCurveTo(s*.6,-s,s*1.3,-s*.1,0,s*.7);g.fill();break;
  default:g.fillRect(-s/2,-s/2,s,s)}
 g.restore()}

function nspawn(a,id,px,py,k){
 const P=o=>a.push(o);
 if(id==='ef1'){
  P({T:'flash',x:px,y:py,l:.25,L:.25,r:80*k,c:'#bfe4ff'});
  for(let b=0;b<9;b++){const an=b/9*TAU+rnd()*.5,len=(60+rnd()*70)*k,pts=[[px,py]];let cx=px,cy=py;
   for(let s=1;s<=5;s++){const aa=an+(rnd()-.5)*.9,d=len/5;cx+=Math.cos(aa)*d;cy+=Math.sin(aa)*d;pts.push([cx,cy])}
   P({T:'bolt',pts,l:.3+rnd()*.12,L:.42,c:b%2?'#ffffff':'#4da6ff',w:(b%2?1.6:2.8)*k})}
  for(let i=0;i<18;i++){const an=rnd()*TAU,v=(150+rnd()*230)*k;P({T:'sp',x:px,y:py,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.4,L:.4,c:i%3?'#7fc4ff':'#ffffff',z:Math.max(.8,1.8*k)})}
 }else if(id==='ef2'){
  P({T:'flash',x:px,y:py,l:.3,L:.3,r:70*k,c:'#fff3a0'});
  P({T:'star',x:px,y:py,l:.5,L:.5,r:80*k,c:'#ffd400',rot:.2});
  P({T:'star',x:px,y:py,l:.42,L:.42,r:50*k,c:'#ffffff',rot:.785});
  P({T:'ring',x:px,y:py,l:.55,L:.55,r:4*k,rs:260*k,c:'#ffd400',w:3*k});
  const cs=['#ffd400','#fff3a0','#ffffff'];
  for(let i=0;i<18;i++){const an=rnd()*TAU,v=(100+rnd()*200)*k;P({T:'ps',x:px,y:py,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:.9,L:.9,c:cs[i%3],z:(4+rnd()*5)*k,rot:rnd()*TAU,vr:(rnd()-.5)*10})}
 }else if(id==='ef3'){
  P({T:'flash',x:px,y:py,l:.4,L:.4,r:90*k,c:'#c9a8ff'});
  P({T:'neb',x:px,y:py,l:1,L:1,r:80*k,c:'#ff3df2',vx:0});
  P({T:'neb',x:px,y:py,l:.9,L:.9,r:60*k,c:'#8a5bff',vx:(rnd()-.5)*30*k});
  const rc=['#8a5bff','#ff3df2','#7ff3ff'];
  for(let q=0;q<3;q++)P({T:'ring',x:px,y:py,l:.7+q*.1,L:.7+q*.1,r:(4+q*8)*k,rs:(380-q*70)*k,c:rc[q],w:3*k});
  const cs=['#8a5bff','#ff3df2','#7ff3ff','#ffffff'];
  for(let i=0;i<34;i++){const an=rnd()*TAU,v=(80+rnd()*260)*k;P({T:'dust',x:px,y:py,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:1+rnd()*.3,L:1.3,c:cs[i%4],z:(1.5+rnd()*2.5)*k})}
  for(let i=0;i<10;i++){const an=rnd()*TAU,v=(60+rnd()*170)*k;P({T:'ps',x:px,y:py,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:1,L:1,c:cs[i%4],z:(4+rnd()*4)*k,rot:rnd()*TAU,vr:(rnd()-.5)*8})}
 }
 if(a.length>300)a.splice(0,a.length-300)}
function nd(g,p,dt,u){
 switch(p.T){
  case 'flash':{g.globalCompositeOperation='lighter';const r=p.r*(1.25-.5*u),q=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);q.addColorStop(0,p.c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.fill();g.globalCompositeOperation='source-over';break}
  case 'neb':{p.x+=(p.vx||0)*dt;g.globalCompositeOperation='lighter';g.globalAlpha=u*.7;const r=p.r*(1+(1-u)*.9),q=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r);q.addColorStop(0,p.c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.fill();g.globalCompositeOperation='source-over';break}
  case 'bolt':{const pts=p.pts,al=u*(.6+.4*rnd());g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)g.lineTo(pts[k][0],pts[k][1]);g.strokeStyle=p.c;g.globalAlpha=al*.3;g.lineWidth=p.w*3.2;g.stroke();g.globalAlpha=al;g.lineWidth=p.w;g.stroke();break}
  case 'sp':{p.vx*=.96;p.vy*=.96;p.x+=p.vx*dt;p.y+=p.vy*dt;g.strokeStyle=p.c;g.lineWidth=p.z;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);g.stroke();break}
  case 'star':{const e=1-u,s=p.r*Math.min(1,e*4+.25)*(1-e*.35);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.c;g.shadowColor=p.c;g.shadowBlur=14;star4(g,s,.16);g.fill();g.restore();break}
  case 'ring':{p.r+=p.rs*dt;g.strokeStyle=p.c;g.lineWidth=Math.max(.5,p.w*u+.5);g.beginPath();g.arc(p.x,p.y,p.r,0,TAU);g.stroke();break}
  case 'ps':{p.vx*=.97;p.vy*=.97;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.c;star5(g,p.z*(.5+.5*u));g.fill();g.restore();break}
  case 'dust':{p.vx*=.96;p.vy*=.96;p.x+=p.vx*dt;p.y+=p.vy*dt;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.z*(.4+.6*u),0,TAU);g.fill();break}}}
function drawP(g,a,dt){
 for(let i=a.length-1;i>=0;i--){const p=a[i];p.l-=dt;if(p.l<=0){a.splice(i,1);continue}
  const u=p.l/p.L;g.globalAlpha=u;if(p.T)nd(g,p,dt,u);else ld(g,p,dt,u)}
 g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function spawnEn(list,en,x,y,k){if(en.nw)nspawn(list,en.id,x,y,k);else lspawn(list,x,y,en.leg||LEG[''],k)}

/* ---------- EN LA PARTIDA: los efectos nuevos se activan en cada golpe ---------- */
/* propiedad invisible que usa el efecto anterior para "no dibujar nada" mientras corre uno nuevo */
try{Object.defineProperty(Object.prototype,'dmrNoFx',{value:[['rgba(0,0,0,0)'],'c',0,1,1,.05,0],enumerable:false,configurable:true,writable:true})}catch(e){}
const GL=[];
const dark=()=>{try{if(evOn('apagon')){const ph=evT%4;return ph>2.3&&ph<3.7}}catch(e){}return false};
const _hit=hit;
hit=function(i){const e=prof.eq||(prof.eq={}),f=e.fx,mine=NEWFX.includes(f);
 if(mine)e.fx='dmrNoFx';
 try{_hit(i)}finally{if(mine)e.fx=f}
 try{if(mine&&B)nspawn(GL,f,B.x,B.y,1)}catch(er){}};
const _dg=drawGame;
drawGame=function(dt){const e=prof.eq||(prof.eq={}),f=e.fx,mine=NEWFX.includes(f);
 if(mine)e.fx='dmrNoFx';
 try{_dg(dt)}finally{if(mine)e.fx=f}
 try{x.save();if(!dark())drawP(x,GL,dt);else GL.length=0;x.restore()}catch(er){}};
const _ng=newGame;
newGame=function(){GL.length=0;return _ng.apply(this,arguments)};

/* ---------- TIENDA: miniaturas y vista previa animadas ---------- */
function fxEntries(){const m={};
 IT.forEach(z=>{if(z[0]!=='fx'||!z[1]||z[1][0]==='x'||z[3]>=99999999)return;
  m[z[2]]={id:z[1],name:z[2],cols:z[4]||['#ffffff'],leg:LEG[z[1]]||null,nw:NEWFX.includes(z[1])}});
 m['Estándar']={id:'',name:'Estándar',cols:LEG[''][0],leg:LEG[''],nw:false};
 return m}
function demo(g,W,H,vw,kk,st,en,dt){
 const s=W/vw,vh=H/s;st.t+=dt;const t=st.t,cyc=1.5,c=Math.floor(t/cyc),ph=t-c*cyc;
 g.setTransform(s,0,0,s,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
 g.fillStyle='#04061a';g.fillRect(0,0,vw,vh);
 const gl=g.createRadialGradient(vw*.4,vh*.5,0,vw*.4,vh*.5,vw*.6);gl.addColorStop(0,(en.cols[0]||'#ffffff')+'33');gl.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gl;g.fillRect(0,0,vw,vh);
 g.fillStyle='#fff';for(let i=0;i<8;i++){g.globalAlpha=.25+.5*Math.abs(Math.sin(t*1.5+i));g.fillRect(rd(i)*vw,rd(i+9)*vh,1.2,1.2)}g.globalAlpha=1;
 const hx=vw*.34,hy=vh*.5;
 g.fillStyle='#ff2233';g.shadowColor='#ff2233';g.shadowBlur=8;rr(g,hx-14,hy-vh*.2,7,vh*.4,3.5);g.fill();g.shadowBlur=0;
 let bx,show=1;
 if(ph<.26)bx=hx+vw*.5*(1-ph/.26)+4;else{bx=hx+4+(ph-.26)*vw*.9;show=Math.max(0,1-(ph-.26)/.7)}
 if(ph>=.26&&st.hc!==c){st.hc=c;spawnEn(st.list,en,hx,hy,kk)}
 g.globalAlpha=show;g.fillStyle='#fff';g.shadowColor='#99ccff';g.shadowBlur=8;g.beginPath();g.arc(bx,hy,4,0,TAU);g.fill();g.shadowBlur=0;g.globalAlpha=1;
 drawP(g,st.list,dt)}
function court(g,W,H,st,en,dt){
 const vw=300,s=W/vw,vh=H/s;
 if(!st.i){st.i=1;st.bx=60;st.bd=1;st.t=0;st.p0=vh/2;st.p1=vh/2}
 st.t+=dt;const t=st.t,by=vh/2+Math.sin(t*2.2)*vh*.26;st.bx+=st.bd*150*dt;
 let hh=0;if(st.bx>=vw-34){st.bx=vw-34;st.bd=-1;hh=1}else if(st.bx<=34){st.bx=34;st.bd=1;hh=1}
 if(hh)spawnEn(st.list,en,st.bd>0?28:vw-28,by,.42);
 st.p0+=(by-st.p0)*Math.min(1,dt*8);st.p1+=(by-st.p1)*Math.min(1,dt*8);
 g.setTransform(s,0,0,s,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
 g.fillStyle='#02030c';g.fillRect(0,0,vw,vh);g.fillStyle='rgba(20,70,200,.2)';g.fillRect(8,8,vw-16,vh-16);
 g.save();g.strokeStyle='#fff';g.globalAlpha=.85;g.lineWidth=2;g.shadowColor='#2a6bff';g.shadowBlur=8;g.strokeRect(8,8,vw-16,vh-16);g.restore();
 g.save();g.globalAlpha=.4;g.strokeStyle='#2a6bff';g.lineWidth=2;g.setLineDash([6,8]);g.beginPath();g.moveTo(vw/2,8);g.lineTo(vw/2,vh-8);g.stroke();g.restore();
 [[14,'#ff2233',st.p0],[vw-26,'#2a6bff',st.p1]].forEach(([px,col,py])=>{g.save();g.fillStyle=col;g.shadowColor=col;g.shadowBlur=12;rr(g,px,py-26,12,52,6);g.fill();g.restore()});
 g.save();g.fillStyle='#fff';g.shadowColor='#99ccff';g.shadowBlur=12;g.beginPath();g.arc(st.bx,by,7,0,TAU);g.fill();g.restore();
 drawP(g,st.list,dt)}

const regs=[];let on=false,last=0;
function loop(n){
 const sv=$('sv');
 if(!sv||sv.classList.contains('hide')){on=false;regs.length=0;return}
 requestAnimationFrame(loop);
 if(n-last<(SET.red?60:33))return;
 const dt=Math.min(.05,(n-last)/1000);last=n;
 for(let i=regs.length-1;i>=0;i--){const r=regs[i];if(!r.cv.isConnected){regs.splice(i,1);continue}demo(r.g,128,128,200,.3,r.st,r.en,dt)}
 const b=$('fxBig');if(b&&b.__en)demo(b.getContext('2d'),600,400,300,.5,b.__st,b.__en,dt);
 const c=$('fxCt');if(c&&c.__en)court(c.getContext('2d'),600,340,c.__st,c.__en,dt)}
function ensure(){if(on)return;on=true;last=performance.now();requestAnimationFrame(loop)}

function scan(){
 const sv=$('sv');if(!sv||sv.classList.contains('hide'))return;
 const E=fxEntries(),T=($('svT')||{}).textContent||'',fxTab=/EFECTOS/.test(T)&&!/RESULTADOS|INVENTARIO/.test(T);
 document.querySelectorAll('#svG .svK').forEach(d=>{
  if(d.dataset.fx)return;d.dataset.fx='1';
  const nm=(d.querySelector('b')||{}).textContent,rt=(d.querySelector('.svRt')||{}).textContent||'';
  if(!(fxTab||/Efectos/.test(rt)))return;
  const en=E[nm],old=d.querySelector('canvas');if(!en||!old)return;
  const cv=document.createElement('canvas');cv.width=128;cv.height=128;cv.style.borderRadius='12px';
  old.replaceWith(cv);regs.push({cv,g:cv.getContext('2d'),en,st:{list:[],t:0}})})}
function fixPanel(){
 const R=$('svR');if(!R||R.querySelector('.fxp'))return;
 const nmE=R.querySelector('.svNm b');if(!nmE||!/las chispas cuando la pelota golpea/.test(R.textContent))return;
 const en=fxEntries()[nmE.textContent];if(!en)return;
 const inf=INFO[en.id],rar=((R.querySelector('.svNm span')||{}).textContent||'').toLowerCase();
 const big=R.querySelector('#svBig');
 if(big){const cv=document.createElement('canvas');cv.width=600;cv.height=400;cv.id='fxBig';cv.className='fxp';cv.__en=en;cv.__st={list:[],t:0};big.style.display='none';big.after(cv)}
 const ct=R.querySelector('#svCt');
 if(ct){const cv=document.createElement('canvas');cv.width=600;cv.height=340;cv.id='fxCt';cv.className='fxp';cv.style.cssText='width:100%;height:auto;border-radius:12px;border:2px solid #2a6bff;display:block';cv.__en=en;cv.__st={list:[],t:0};ct.style.display='none';ct.after(cv)}
 if(inf){
  const d=R.querySelector('.svD');if(d)d.textContent=inf.d;
  const uls=R.querySelectorAll('ul');
  if(uls[0])uls[0].innerHTML=[['Se activa','cuando la pelota golpea una paleta'],['Qué produce',inf.f],['Colores',inf.c],['Duración',inf.t],['Rareza',rar],['Ventaja competitiva','ninguna; es un objeto cosmético']].map(z=>'<li><b>'+z[0]+':</b> '+z[1]+'</li>').join('');
  if(uls[1])uls[1].innerHTML=NOHACE.map(z=>'<li>'+z+'</li>').join('')}}
const svG=$('svG'),svR=$('svR');
if(svG)new MutationObserver(()=>{scan();ensure()}).observe(svG,{childList:true});
if(svR)new MutationObserver(()=>{fixPanel();ensure()}).observe(svR,{childList:true});
})();


/* ===== D.M.R v22c: MAPA DE NIVELES BONITO (zonas fundidas, camino con brillo, puertas portal) ===== */
(function(){
if(window.__dmr22)return;window.__dmr22=1;
const rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BEST=()=>VER?100:(prof.best||0);
const zi=L=>Math.min(9,Math.floor((L-1)/10));
const ZN=[['ZONA VOLCÁNICA','#ff3b1f','#ffa000'],['ZONA ELÉCTRICA','#b6ff00','#ffe600'],['BOSQUE MISTERIOSO','#19e65a','#d8ff5a'],['CIUDAD NEÓN','#2a6bff','#c040ff'],['OCÉANO PROFUNDO','#0a7aff','#00d0ff'],['DESIERTO DORADO','#ff9a1f','#ffd24a'],['REINO DE HIELO','#7fe3ff','#d8f6ff'],['SELVA SALVAJE','#4dff3a','#b8ff3a'],['DIMENSIÓN CÓSMICA','#a64dff','#ff4dff'],['FORTALEZA SUPREMA','#ff2233','#ffd24a']];
const STEP=104,DOOR=124,TOP=520,BOT=190,OV=80;

/* ---------- RETOS (uno por nivel) ---------- */
const CHS=[
 {k:'veloz',ic:'⚡',n:'PELOTA RÁPIDA',d:'La pelota va más rápida de lo normal.'},
 {k:'muro',ic:'🧱',n:'MURO MÓVIL',d:'Un muro se mueve en el centro y rebota la pelota.',ev:['muro']},
 {k:'grav',ic:'🌌',n:'GRAVEDAD LOCA',d:'La gravedad empuja la pelota hacia arriba y hacia abajo.'},
 {k:'pala',ic:'🎯',n:'PRECISIÓN',d:'Tu paleta es más pequeña. Apunta bien.'},
 {k:'niebla',ic:'🌫',n:'NIEBLA',d:'La pelota se esconde en la niebla del centro.',ev:['niebla']},
 {k:'remon',ic:'🔥',n:'REMONTADA',d:'Empiezas perdiendo. ¡Dale la vuelta!'},
 {k:'fant',ic:'👻',n:'PELOTA FANTASMA',d:'La pelota desaparece por momentos.'},
 {k:'elast',ic:'🎈',n:'PALETAS ELÁSTICAS',d:'Las paletas se estiran y se encogen solas.',ev:['elastica']},
 {k:'temb',ic:'🌋',n:'TEMBLOR',d:'La pelota salta sin control.',ev:['temblor']},
 {k:'hielo',ic:'🧊',n:'ZONA DE HIELO',d:'Tu paleta se congela de vez en cuando.'},
 {k:'loco',ic:'🎉',n:'PODER LOCO',d:'Los poderes aparecen sin parar.',ev:['fiesta']},
 {k:'serp',ic:'🐍',n:'ZIGZAG',d:'La pelota viaja en zigzag.',ev:['serpiente']}];
function chOf(L){
 if(L%10===0){const e=EVS[L/10-1];return{k:'evt',ic:e.ic,n:e.n,d:e.d,boss:1,off:0,mul:1}}
 let i=L<=2?0:(L*5+Math.floor(L/10)*3)%12;if(CHS[i].k==='serp'&&L<30)i=0;
 const c=Object.assign({},CHS[i]);c.off=c.k==='remon'?Math.min(5,2+Math.floor(L/25)):0;c.mul=c.k==='veloz'?1.05+L*.002:1;return c}
const rewardOf=L=>L===100?5000:L%10===0?150+L*5:20+L*2;

/* ---------- ESCENARIOS ANIMADOS ---------- */
function scene(z,g,w,h,t){
 const a=ZN[z][1],b=ZN[z][2];
 const vg=(c0,c1)=>{const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,c0);q.addColorStop(1,c1);g.fillStyle=q;g.fillRect(0,0,w,h)};
 const dot=(x,y,r,c,al)=>{g.globalAlpha=Math.max(0,al);g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.globalAlpha=1};
 const tri=(x,y,bw,bh,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x-bw/2,y);g.lineTo(x,y-bh);g.lineTo(x+bw/2,y);g.closePath();g.fill()};
 const rise=(n,sp,fn)=>{for(let i=0;i<n;i++){const p=(t*sp*(.5+rd(i+3))+rd(i)*h)%h;fn(i,rd(i+9)*w,h-p,p/h)}};
 const fall=(n,sp,fn)=>{for(let i=0;i<n;i++){const p=(t*sp*(.5+rd(i+3))+rd(i)*h)%h;fn(i,rd(i+9)*w,p,p/h)}};
 const rad=(x,y,r,c,al)=>{g.globalAlpha=al;const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);g.globalAlpha=1};
 switch(z){
 case 0:
  vg('#0d0105','#3a0600');rad(w/2,h,h*.75,'#ff5a00',.4+.1*Math.sin(t*2));
  for(let k=0;k<3;k++)tri(w*(.2+k*.3),h*.6+k*18,w*.6,h*.32,'#140205');
  tri(w*.5,h*.62,w*.5,h*.3,'#1c0306');rad(w*.5,h*.33,26,'#ffb000',.6+.3*Math.sin(t*3));
  rise(40,42,(i,x,y,p)=>dot(x+Math.sin(t+i)*9,y,1+rd(i)*1.8,i%2?b:a,1-p));break;
 case 1:
  vg('#010a02','#1e2a00');g.strokeStyle=a;g.globalAlpha=.15;g.lineWidth=1;
  for(let i=0;i<=w;i+=18){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke()}g.globalAlpha=1;
  for(let k=0;k<4;k++){const f=(t*.7+k*.31)%1;if(f<.4){const sd=Math.floor(t*.7+k*.31);g.strokeStyle=f<.15?'#fff':b;g.globalAlpha=1-f*2;g.lineWidth=2;g.shadowColor=b;g.shadowBlur=8;g.beginPath();let x0=w*(.1+rd(k+sd)*.8),y0=h*k/4;g.moveTo(x0,y0);for(let s=0;s<8;s++){x0+=(rd(s+k*7+Math.floor(t*12))-.5)*26;y0+=h/32;g.lineTo(x0,y0)}g.stroke();g.shadowBlur=0;g.globalAlpha=1}}
  rise(24,60,(i,x,y,p)=>dot(x,y,1.2,i%2?b:'#fff',1-p));break;
 case 2:
  vg('#010a05','#06280f');
  for(let r=0;r<3;r++)for(let k=0;k<9;k++)tri((k*w/8+r*17)%w,h*(.35+r*.28),44+r*14,90+r*30,'rgba(2,'+(24+r*8)+',10,'+(.9-r*.15)+')');
  g.fillStyle='rgba(120,255,160,.05)';for(let k=0;k<3;k++)g.fillRect(((t*8+k*140)%(w+200))-100,h*(.3+k*.25),200,26);
  rise(26,18,(i,x,y)=>dot(x+Math.sin(t*1.2+i)*14,y,1.8,i%3?b:'#ffffaa',.5+.5*Math.sin(t*3+i)));break;
 case 3:
  vg('#04031c','#210a3e');
  for(let r=0;r<4;r++){const base=h*(.28+r*.22);for(let k=0;k<7;k++){const bw=w/7,bx=k*bw,bh=40+rd(k+r*9)*70;
   g.fillStyle='#070620';g.fillRect(bx+2,base-bh,bw-4,bh);g.fillStyle=(k+r)%2?a:b;g.globalAlpha=.9;g.fillRect(bx+2,base-bh,bw-4,2);g.globalAlpha=1;
   for(let q=0;q<6;q++){if(Math.sin(t*.7+q*3+k+r*5)>-.2){g.fillStyle=q%2?'#ffe9a0':b;g.globalAlpha=.7;g.fillRect(bx+6+(q%3)*((bw-12)/3),base-bh+8+Math.floor(q/3)*12,4,5);g.globalAlpha=1}}}}
  g.strokeStyle='#bfe0ff';g.globalAlpha=.25;g.lineWidth=1;fall(26,220,(i,x,y)=>{g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+12);g.stroke()});g.globalAlpha=1;break;
 case 4:
  vg('#012046','#00061a');g.globalCompositeOperation='lighter';
  for(let k=0;k<5;k++){const x0=w*(.1+k*.2)+Math.sin(t*.4+k)*16;g.fillStyle='rgba(0,170,255,.06)';g.beginPath();g.moveTo(x0,0);g.lineTo(x0+16,0);g.lineTo(x0+70+k*5,h);g.lineTo(x0-40,h);g.closePath();g.fill()}
  g.globalCompositeOperation='source-over';g.strokeStyle='rgba(180,240,255,.5)';g.lineWidth=1;
  rise(30,26,(i,x,y)=>{g.beginPath();g.arc(x+Math.sin(t+i)*6,y,2+rd(i)*3,0,6.283);g.stroke()});
  for(let k=0;k<5;k++){const x=((t*(18+k*7)+k*80)%(w+60))-30,y=h*(.15+k*.18)+Math.sin(t+k)*8;g.fillStyle=k%2?a:b;g.globalAlpha=.55;g.beginPath();g.ellipse(x,y,9,3.5,0,0,6.283);g.fill();g.beginPath();g.moveTo(x-8,y);g.lineTo(x-14,y-4);g.lineTo(x-14,y+4);g.fill();g.globalAlpha=1}break;
 case 5:
  vg('#2a0d00','#80400a');rad(w*.72,h*.1,70,'#ffd24a',.85);dot(w*.72,h*.1,22,'#fff1b0',.95);
  for(let r=0;r<3;r++){g.fillStyle='rgba('+(60+r*25)+',28,0,.85)';g.beginPath();g.moveTo(0,h);for(let X=0;X<=w;X+=8)g.lineTo(X,h*(.45+r*.17)+Math.sin(X/40+r*2)*14);g.lineTo(w,h);g.closePath();g.fill()}
  for(let i=0;i<30;i++){const x=((t*(30+rd(i)*40)+rd(i+2)*w)%(w+20))-10;dot(x,h*rd(i+5),1.3,b,.45)}break;
 case 6:
  vg('#0b2d50','#02101f');g.lineWidth=12;
  for(let k=0;k<3;k++){g.strokeStyle=k%2?a:'#7affc8';g.globalAlpha=.1;g.beginPath();for(let X=0;X<=w;X+=10){const Y=h*(.08+k*.07)+Math.sin(X/50+t*.6+k)*12;X?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}g.globalAlpha=1;
  for(let k=0;k<5;k++)tri(w*(.1+k*.22),h*.7,w*.45,h*.22,'#12405f');
  fall(70,34,(i,x,y)=>dot(x+Math.sin(t+i)*8,y,1+rd(i)*1.8,'#fff',.8));break;
 case 7:
  vg('#032a05','#0b5c12');g.strokeStyle='rgba(70,160,40,.35)';g.lineWidth=2;
  for(let k=0;k<6;k++){g.beginPath();for(let Y=0;Y<=h;Y+=14){const X=w*(k+.5)/6+Math.sin(Y/30+t*.8+k)*8;Y?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}
  for(let k=0;k<12;k++){g.save();g.translate(k%2?w:0,h*(k+.5)/12);g.rotate((k%2?Math.PI-.5:.5)+Math.sin(t*.8+k)*.12);g.fillStyle='rgba(8,'+(90+(k*9)%60)+',22,.8)';g.beginPath();g.ellipse(36,0,48,10,0,0,6.283);g.fill();g.restore()}
  rise(30,16,(i,x,y)=>dot(x+Math.sin(t+i)*10,y,1.6,i%2?b:'#fff7a0',.5+.4*Math.sin(t*2+i)));break;
 case 8:
  vg('#06021a','#17053a');g.globalCompositeOperation='lighter';
  for(let k=0;k<3;k++)rad(w*(.3+k*.25)+Math.sin(t*.2+k)*20,h*(.2+k*.3),w*.7,k%2?a:b,.22);
  g.globalCompositeOperation='source-over';g.fillStyle='#fff';
  for(let i=0;i<80;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*.9+i));g.fillRect(rd(i)*w,rd(i+60)*h,1.4,1.4)}g.globalAlpha=1;
  dot(w*.75,h*.3,30,'#3a1a7a',1);g.strokeStyle=b;g.lineWidth=3;g.globalAlpha=.7;g.beginPath();g.ellipse(w*.75,h*.3,52,13,-.4,0,6.283);g.stroke();g.globalAlpha=1;
  {const f=(t*.25)%1;if(f<.3){g.strokeStyle='#fff';g.globalAlpha=1-f/.3;g.lineWidth=2;g.beginPath();g.moveTo(w*f*3,h*.55*f*3);g.lineTo(w*f*3-40,h*.55*f*3-22);g.stroke();g.globalAlpha=1}}break;
 default:
  vg('#050102','#2b0409');rad(w/2,h,h*.6,'#ff2233',.25+.08*Math.sin(t*2));
  g.fillStyle='#0a0204';g.fillRect(w*.2,70,w*.6,80);
  [.14,.3,.5,.7,.86].forEach((fx,k)=>{const tw=22,th=60+(k%2)*28;g.fillStyle='#0a0204';g.fillRect(w*fx-tw/2,150-th-20,tw,th+20);tri(w*fx,150-th-20,tw+10,26,'#0a0204')});
  for(let k=0;k<12;k++){g.fillStyle='#ffc040';g.globalAlpha=.5+.5*Math.sin(t*3+k);g.fillRect(w*.22+(k%6)*w*.1,86+Math.floor(k/6)*22,4,8)}g.globalAlpha=1;
  if(t%5<.1||(t%5>.22&&t%5<.3)){g.fillStyle='rgba(255,40,50,.22)';g.fillRect(0,0,w,h)}
  rise(46,50,(i,x,y,p)=>dot(x+Math.sin(t+i)*9,y,1+rd(i)*1.6,i%2?b:a,1-p))}}

/* ---------- ESTILOS + PANTALLA ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
#lm{position:fixed;inset:0;z-index:21;background:#02030c;color:#fff}
#lm,#lm *{touch-action:pan-y}
#lmSc{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 104px);mask-image:linear-gradient(180deg,transparent 0,#000 104px)}
#lmSc::-webkit-scrollbar{display:none}
#lmIn{position:relative;margin:0 auto}
#lmIn canvas.zc{position:absolute!important;left:0!important;right:auto!important;bottom:auto!important;max-width:none!important;z-index:0}
#lmIn svg{position:absolute;left:0;top:0;pointer-events:none;z-index:2}
.lmH{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top,0px)) 10px 26px;background:linear-gradient(180deg,rgba(2,3,12,.97) 55%,rgba(2,3,12,0))}
.lmH .btn{min-width:0;padding:9px 14px;font-size:14px;flex:none}
.lmT{flex:1;text-align:center;min-width:0}
.lmT b{display:block;font-size:14px;letter-spacing:3px;text-shadow:0 0 12px currentColor;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lmT small{font-size:10px;letter-spacing:1px;opacity:.9}
#lmF{position:absolute;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:5;display:flex;flex-direction:column;gap:8px}
#lmF button{width:46px;height:46px;border-radius:50%;border:2px solid var(--b);background:rgba(7,11,34,.92);color:#fff;font-size:20px;box-shadow:0 0 14px rgba(var(--bb),.6)}
/* niveles */
.mn{position:absolute;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;border:3px solid var(--nc);background:radial-gradient(circle at 35% 28%,#1c2a5a,#060a1e 72%);color:#fff;font-weight:900;font-size:20px;padding:0;box-shadow:0 0 16px var(--nc),0 7px 12px rgba(0,0,0,.65),inset 0 0 12px rgba(255,255,255,.12);z-index:4;text-shadow:0 0 8px var(--nc),0 2px 2px #000}
.mn::before{content:"";position:absolute;inset:4px;border-radius:50%;border:1px solid rgba(255,255,255,.18);pointer-events:none}
.mn.dn{background:radial-gradient(circle at 35% 28%,#1a6a4a,#05160f 74%)}
.mn.dn::after{content:"✔";position:absolute;right:-6px;top:-6px;width:20px;height:20px;border-radius:50%;background:#19c85a;color:#fff;font-size:12px;line-height:20px;text-align:center;box-shadow:0 0 8px #19c85a;border:2px solid #04120a}
.mn.cu{border-color:#fff;box-shadow:0 0 26px var(--nc),0 0 8px #fff,0 7px 12px rgba(0,0,0,.65)}
.mn.cu::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid var(--nc);animation:lmR 1.6s ease-out infinite;pointer-events:none}
@keyframes lmR{from{transform:scale(.85);opacity:.95}to{transform:scale(1.5);opacity:0}}
.mn.lk{background:#03040c;color:#4a4f66;border-color:#242842;box-shadow:0 5px 10px rgba(0,0,0,.6);text-shadow:none}
.mn.bs{width:104px;height:104px;font-size:36px;border-color:#ffd24a;box-shadow:0 0 38px #ff2233,0 0 14px #ffd24a,0 8px 14px rgba(0,0,0,.7)}
.mn.bs.lk{border-color:#4a2a22;box-shadow:none}
.mst{position:absolute;left:50%;top:calc(100% + 3px);transform:translateX(-50%);font-size:12px;letter-spacing:1px;white-space:nowrap;pointer-events:none;background:rgba(3,5,20,.82);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:0 7px;line-height:17px;text-shadow:none}
.mst i{font-style:normal;color:#3a3f5a}.mst i.on{color:#ffd400;text-shadow:0 0 8px #ffd400}
.mbd{position:absolute;left:50%;top:-24px;transform:translateX(-50%);font-size:24px;filter:drop-shadow(0 0 6px #ffd400);pointer-events:none}
.mlk{position:absolute;right:-4px;bottom:-4px;font-size:14px}
.lmSt{position:absolute;transform:translate(-50%,-50%);z-index:3;text-align:center;font-size:11px;font-weight:900;letter-spacing:3px;color:#8fe8ff;text-shadow:0 0 10px #00c8ff}
.lmSt span{display:block;font-size:42px;filter:drop-shadow(0 0 12px #00c8ff)}
/* puertas portal */
.dr{position:absolute;transform:translate(-50%,-72%) scale(.9);width:150px;height:150px;z-index:4;cursor:pointer}
.dr.big{transform:translate(-50%,-72%) scale(1.55)}
.dr.fut{opacity:.6}
.drA{position:absolute;left:14px;right:14px;top:0;height:108px;border:4px solid var(--c);border-radius:70px 70px 6px 6px;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,var(--c) 0,#0a0e2c 78%);box-shadow:0 0 24px var(--c),inset 0 0 20px rgba(0,0,0,.65),0 8px 14px rgba(0,0,0,.6)}
.dr.cu .drA,.dr.op .drA{animation:lmGl 1.6s ease-in-out infinite}
@keyframes lmGl{50%{box-shadow:0 0 44px var(--c),inset 0 0 20px rgba(0,0,0,.4),0 8px 14px rgba(0,0,0,.6)}}
.drG{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#fff,var(--c) 45%,transparent 80%);opacity:.25;transition:opacity 1s .3s}
.dr.op .drG{opacity:1}
.drL,.drR{position:absolute;top:0;bottom:0;width:50.5%;background:linear-gradient(90deg,#2a3260,#171d40 55%,#242b58),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 5px,transparent 5px 11px);background-blend-mode:overlay;transition:transform 1.5s cubic-bezier(.65,0,.25,1)}
.drL{left:0;border-right:2px solid var(--c)}.drR{right:0;border-left:2px solid var(--c)}
.drL::after,.drR::after{content:"";position:absolute;top:46%;width:7px;height:7px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c)}
.drL::after{right:6px}.drR::after{left:6px}
.dr.op .drL{transform:translateX(-102%)}.dr.op .drR{transform:translateX(102%)}
.drK{position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);font-size:28px;z-index:2;transition:all .9s;filter:drop-shadow(0 0 8px var(--c))}
.dr.op .drK{opacity:0;transform:translate(-50%,-160%) scale(1.8)}
.drT{position:absolute;left:4px;right:4px;top:112px;text-align:center;font-size:11px;font-weight:900;letter-spacing:1px;background:rgba(4,6,24,.94);border:1px solid var(--c);border-radius:10px;padding:3px 2px;line-height:1.3;box-shadow:0 0 12px var(--c)}
.drT small{display:block;font-size:10px;letter-spacing:0;opacity:.92}
.drT em{font-style:normal;color:#3a3f5a}.drT em.on{color:#ffd400}
#lmSp{position:fixed;left:0;right:0;top:36%;z-index:45;text-align:center;font-size:clamp(26px,9vw,44px);font-weight:900;letter-spacing:4px;pointer-events:none;text-shadow:0 0 24px currentColor;opacity:0}
#lmSp small{display:block;font-size:12px;letter-spacing:6px;color:#fff;margin-top:6px}
@keyframes lmSp{0%{opacity:0;transform:scale(.7)}25%{opacity:1;transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:scale(1.15)}}
#lmFl{position:fixed;inset:0;z-index:46;background:#fff;pointer-events:none;opacity:0}
@keyframes lmFl{0%{opacity:.9}100%{opacity:0}}
#lmBoss{position:fixed;inset:0;z-index:60;background:#000;display:flex;align-items:center;justify-content:center}
#lmBoss .bgt{position:relative;width:min(80vw,320px);height:min(60vh,420px);border:4px solid #ffd24a;border-radius:160px 160px 0 0;overflow:hidden;box-shadow:0 0 50px #ff2233,inset 0 0 40px #ff2233;background:#000}
#lmBoss .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#fff,#ffd24a 30%,#ff2233 60%,transparent 80%);opacity:0;transition:opacity 1.4s .6s}
#lmBoss .bl,#lmBoss .br{position:absolute;top:0;bottom:0;width:50.5%;background:repeating-linear-gradient(90deg,#1a0408 0 8px,#0a0204 8px 16px);transition:transform 2s cubic-bezier(.65,0,.25,1)}
#lmBoss .bl{left:0;border-right:3px solid #ffd24a}#lmBoss .br{right:0;border-left:3px solid #ffd24a}
#lmBoss.op .bl{transform:translateX(-102%)}#lmBoss.op .br{transform:translateX(102%)}#lmBoss.op .bg{opacity:1}
#lmBoss .bt{position:absolute;bottom:12%;left:0;right:0;text-align:center;font-size:clamp(34px,11vw,56px);font-weight:900;letter-spacing:5px;color:#ffd24a;text-shadow:0 0 26px #ff2233;opacity:0;transition:opacity 1s 1.2s}
#lmBoss.op .bt{opacity:1}#lmBoss .bt small{display:block;font-size:12px;letter-spacing:4px;color:#fff;margin-top:8px}
</style>`);
document.body.insertAdjacentHTML('beforeend','<div id="lm" class="hide"><div id="lmSc"><div id="lmIn"></div></div><div class="lmH"><button class="btn" id="lmB" type="button">↩ VOLVER</button><div class="lmT"><b id="lmZ">NIVELES</b><small id="lmS"></small></div><div class="coin" id="lmCo">DOP 0</div></div><div id="lmF"><button id="lmCur" type="button" aria-label="Mi nivel">📍</button><button id="lmBot" type="button" aria-label="Inicio">🏁</button></div></div><div id="lmSp"></div><div id="lmFl"></div>');
$('bnext').insertAdjacentHTML('afterend','<button class="btn" id="bmap" type="button">🗺 MAPA DE NIVELES</button>');

/* ---------- construcción del mapa ---------- */
let W=0,H=0,zb=[],Y=[],DYv=[],raf=0,run=0,curZ=-1,last=0,tick=0;const ST={stop:0};
function build(){
 const In=$('lmIn');W=Math.min(480,innerWidth);H=TOP+99*STEP+9*DOOR+BOT;
 const best=BEST(),cur=Math.min(100,best+1),cx=W/2,amp=W*.3;
 prof.dseen=prof.dseen||{};prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const P=i=>({x:cx+Math.sin(i*.62)*amp,y:H-BOT-((i-1)*STEP+Math.floor((i-1)/10)*DOOR)});
 const dY=k=>(P(10*k).y+P(10*k+1).y)/2;
 In.style.width=W+'px';In.style.height=H+'px';In.innerHTML='';
 Y=[];for(let i=1;i<=100;i++)Y[i]=P(i).y;
 DYv=[];for(let k=1;k<=9;k++)DYv[k]=Y[10*k];DYv[10]=Y[100]-230;
 /* zonas: un escenario por zona, con los bordes fundidos para que no se corten */
 zb=[];const cz=zi(cur);
 for(let z=0;z<10;z++){
  const top=z===9?0:dY(z+1),bot=z===0?H:dY(z);zb.push([top,bot]);
  const ct=z===9?0:Math.max(0,top-OV),cb=z===0?H:Math.min(H,bot+OV);
  const c=document.createElement('canvas');c.className='zc';c.dataset.z=z;c.width=Math.ceil(W/2);c.height=Math.max(2,Math.ceil((cb-ct)/2));
  c.style.cssText='top:'+ct+'px!important;width:'+W+'px!important;height:'+(cb-ct)+'px!important';
  const fT=z<9?Math.round(OV/(cb-ct)*100):0,fB=z>0?Math.round(OV/(cb-ct)*100):0,mk='linear-gradient(180deg,'+(z<9?'transparent 0,#000 '+fT+'%':'#000 0')+','+(z>0?'#000 '+(100-fB)+'%,transparent 100%':'#000 100%')+')';
  c.style.webkitMaskImage=mk;c.style.maskImage=mk;
  c.style.filter=best<10*z?'brightness('+Math.max(.2,.55-(z-cz)*.05)+') saturate(.6)':'';
  c.__g=c.getContext('2d');c.__bk=bake(c,z);In.appendChild(c)}
 /* camino */
 const pts=[];
 for(let i=1;i<=100;i++){const p=P(i);pts.push({x:p.x,y:p.y,lo:i})}
 pts.push({x:cx,y:DYv[10],lo:100});
 const f=n=>n.toFixed(1);let base='',dim='',dash='';const lit=Array.from({length:10},()=>'');
 for(let j=0;j<pts.length-1;j++){
  const p0=pts[Math.max(j-1,0)],p1=pts[j],p2=pts[j+1],p3=pts[Math.min(j+2,pts.length-1)];
  const d='M'+f(p1.x)+' '+f(p1.y)+'C'+f(p1.x+(p2.x-p0.x)/6)+' '+f(p1.y+(p2.y-p0.y)/6)+' '+f(p2.x-(p3.x-p1.x)/6)+' '+f(p2.y-(p3.y-p1.y)/6)+' '+f(p2.x)+' '+f(p2.y);
  base+='<path d="'+d+'"/>';
  if(best>=p1.lo){lit[zi(p1.lo)]+='<path d="'+d+'"/>';dash+='<path class="'+(p1.lo>best-8?'rda':'rds')+'" d="'+d+'"/>'}
  else dim+='<path d="'+d+'"/>'}
 let svg='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><style>.rda,.rds{stroke-dasharray:3 22;stroke-linecap:round}.rda{animation:rdf 1s linear infinite}@keyframes rdf{to{stroke-dashoffset:-25}}</style>'
  +'<g fill="none" stroke="rgba(0,0,0,.55)" stroke-width="44" stroke-linecap="round" transform="translate(0 4)">'+base+'</g>'
  +'<g fill="none" stroke="#1a2250" stroke-width="40" stroke-linecap="round">'+base+'</g>'
  +'<g fill="none" stroke="#070a20" stroke-width="32" stroke-linecap="round">'+base+'</g>'
  +'<g fill="none" stroke="#3a4488" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 13" opacity=".8">'+dim+'</g>';
 for(let z=0;z<10;z++)if(lit[z])svg+='<g fill="none" stroke="'+ZN[z][1]+'" stroke-width="38" stroke-linecap="round" opacity=".16">'+lit[z]+'</g><g fill="none" stroke="'+ZN[z][1]+'" stroke-width="30" stroke-linecap="round" opacity=".22">'+lit[z]+'</g><g fill="none" stroke="'+ZN[z][1]+'" stroke-width="5" stroke-linecap="round" style="filter:drop-shadow(0 0 8px '+ZN[z][1]+')">'+lit[z]+'</g>';
 svg+='<g fill="none" stroke="#fff" stroke-width="2" opacity=".9">'+dash+'</g></svg>';
 In.insertAdjacentHTML('beforeend',svg);
 /* plataforma de inicio */
 In.insertAdjacentHTML('beforeend','<div class="lmSt" style="left:'+P(1).x+'px;top:'+(P(1).y+82)+'px"><span>🏓</span>INICIO</div>');
 /* PUERTAS: en el lugar del nivel 10, 20, 30... y la puerta final arriba */
 for(let k=1;k<=10;k++){
  const e=EVS[k-1],open=best>=10*k&&prof.dseen[k],col=k===10?'#ffd24a':ZN[k-1][1],lv=10*k;
  const px=k===10?cx:P(lv).x,py=DYv[k],st=prof.lst[lv]||0;
  const d=document.createElement('div');d.id='dr'+k;
  d.className='dr'+(k===10?' big':'')+(open?' op':'')+(k<10&&lv===cur?' cu':'')+(k<10&&lv>cur?' fut':'');
  d.style.cssText='left:'+px+'px;top:'+py+'px;--c:'+col;
  d.innerHTML='<div class="drA"><div class="drG"></div><div class="drL"></div><div class="drR"></div></div><div class="drK">🔒</div><div class="drT">'+(k===10?'PUERTA FINAL':'PUERTA '+lv)+'<small>'+e.ic+' '+e.n+'</small>'+(k<10&&best>=lv?'<span>'+[1,2,3].map(q=>'<em'+(q<=st?' class="on"':'')+'>★</em>').join('')+'</span>':'')+'</div>';
  d.onclick=()=>k===10?doorTap(10):tap(lv);In.appendChild(d)}
 /* niveles (los 10, 20, 30... son puertas; el 100 es el jefe) */
 for(let i=1;i<=100;i++){
  if(i%10===0&&i<100)continue;
  const p=P(i),b=document.createElement('button'),st=prof.lst[i]||0,z=ZN[zi(i)];
  b.type='button';b.className='mn'+(i<=best?' dn':i===cur?' cu':' lk')+(i===100?' bs':'');
  b.style.cssText='left:'+p.x+'px;top:'+p.y+'px;--nc:'+z[1]+(i>cur?';opacity:'+Math.max(.22,.7-(i-cur)*.03):'');
  b.innerHTML=(i===100?'<b class="mbd">👑</b>':'')+'<span>'+i+'</span>'+(i>cur?'<i class="mlk">🔒</i>':'<span class="mst">'+[1,2,3].map(k=>'<i'+(k<=st?' class="on"':'')+'>★</i>').join('')+'</span>');
  b.onclick=()=>tap(i);In.appendChild(b)}
 upd()}

/* ---------- animación de fondos ---------- */
function loop(n){raf=requestAnimationFrame(loop);if(n-last<(SET.red?60:33))return;last=n;const t=n/1000,st=$('lmSc').scrollTop,vh=innerHeight;
 document.querySelectorAll('#lmIn canvas.zc').forEach(c=>{const z=+c.dataset.z,b=zb[z];if(!b||b[1]<st-300||b[0]>st+vh+300)return;
  try{const g=c.__g;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';scene(z,g,c.width,c.height,t);g.globalAlpha=1;g.globalCompositeOperation='source-over';if(c.__bk)g.drawImage(c.__bk,0,0)}
  catch(e){if(!loop.e){loop.e=1;showErr('mapa: '+e.message)}}})}

/* capa suave encima del escenario: oscurece los bordes y escribe el nombre de la zona */
function bake(c,z){
 const bk=document.createElement('canvas');bk.width=c.width;bk.height=c.height;const g=bk.getContext('2d'),w=c.width,h=c.height;
 const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.8);v.addColorStop(0,'rgba(2,3,12,0)');v.addColorStop(1,'rgba(2,3,12,.62)');g.fillStyle=v;g.fillRect(0,0,w,h);
 g.fillStyle='rgba(2,3,12,.22)';g.fillRect(0,0,w,h);
 g.save();g.translate(14,h/2);g.rotate(-Math.PI/2);g.font='900 17px system-ui,Arial';g.textAlign='center';g.fillStyle=ZN[z][1];g.globalAlpha=.2;g.fillText(ZN[z][0].split('').join(' '),0,0);g.restore();
 return bk}
function startLoop(){cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function stop(){run++;cancelAnimationFrame(raf);raf=0}

/* ---------- cámara ---------- */
function flyTo(y,ms){return new Promise(res=>{const s=$('lmSc'),a=s.scrollTop,b=clamp(y-innerHeight*.55,0,Math.max(0,H-innerHeight)),t0=performance.now();ST.stop=0;
 (function f(n){if(ST.stop){res();return}const u=Math.min(1,(n-t0)/ms),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;s.scrollTop=a+(b-a)*e;if(u<1)requestAnimationFrame(f);else res()})(t0)})}
function upd(){
 const s=$('lmSc'),mid=s.scrollTop+innerHeight*.5;let z=zb.findIndex(b=>mid>=b[0]&&mid<b[1]);if(z<0)z=mid<(zb[9]?zb[9][0]:0)?9:0;
 if(z===curZ)return;curZ=z;
 const zs=ZN[z],lk=BEST()<10*z;let n=0;for(let i=10*z+1;i<=10*z+10;i++)n+=(prof.lst||{})[i]||0;
 $('lmZ').style.color=zs[1];$('lmZ').textContent=(lk?'🔒 ':'')+zs[0];
 $('lmS').textContent='NIVELES '+(10*z+1)+'–'+(10*z+10)+' · ★ '+n+'/30'}
$('lmSc').addEventListener('scroll',()=>{if(!tick){tick=1;requestAnimationFrame(()=>{tick=0;upd()})}},{passive:true});
$('lmSc').addEventListener('touchstart',()=>{ST.stop=1},{passive:true});
$('lmSc').addEventListener('wheel',()=>{ST.stop=1},{passive:true});
$('lmCur').onclick=()=>{SFX.click();flyTo(Y[Math.min(100,BEST()+1)],1000)};
$('lmBot').onclick=()=>{SFX.click();flyTo(Y[1],1400)};
$('lmB').onclick=()=>{SFX.click();closeLevels()};

/* ---------- efectos de pantalla ---------- */
function flash(){const e=$('lmFl');e.style.animation='none';void e.offsetWidth;e.style.animation='lmFl .9s ease-out forwards'}
function splash(z){const e=$('lmSp');e.style.color=z[1];e.innerHTML=z[0]+'<small>NUEVA ZONA</small>';e.style.animation='none';void e.offsetWidth;e.style.animation='lmSp 2.4s ease forwards'}

/* ---------- entrada: la cámara viaja hasta tu nivel y abre puertas nuevas ---------- */
async function intro(){
 const my=++run,s=$('lmSc'),best=BEST(),cur=Math.min(100,best+1);let pend=0;
 for(let k=1;k<=10;k++)if(best>=10*k&&!prof.dseen[k]){pend=k;prof.dseen[k]=1}
 if(pend)saveP();
 s.scrollTop=H;upd();await sleep(250);if(my!==run)return;
 if(pend){
  await flyTo(DYv[pend]+40,1900);if(my!==run||ST.stop)return;
  await sleep(350);const e=$('dr'+pend);if(e)e.classList.add('op');
  SFX.impact();flash();toast('🚪 ¡PUERTA '+(pend*10)+' ABIERTA!');
  await sleep(1700);if(my!==run)return;
  if(pend<10){splash(ZN[pend]);await sleep(900);if(my!==run)return;await flyTo(Y[cur],2200)}
 }else await flyTo(Y[cur],2200)}

/* ---------- toques ---------- */
function doorTap(k){SFX.click();const e=EVS[k-1],open=BEST()>=10*k;
 if(open){toast('🚪 Puerta abierta · '+(k<10?ZN[k][0]:'¡Fortaleza conquistada!'));return}
 modal('🔒 PUERTA '+(k===10?'FINAL':k*10),'Supera el nivel <b>'+(k*10)+'</b> y su evento <b>'+e.ic+' '+e.n+'</b> para abrirla.<br><small>'+e.d+'</small>',[['ENTENDIDO',null]])}
function tap(i){SFX.click();const best=BEST();
 if(i>best+1){modal('🔒 NIVEL '+i,'Completa primero el nivel <b>'+(i-1)+'</b>.',[['ENTENDIDO',null]]);return}
 prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const c=chOf(i),z=ZN[zi(i)],st=prof.lst[i]||0,col=c.boss?'#ffd400':z[1];
 const row=[1,2,3].map(k=>'<span style="font-size:26px;color:'+(k<=st?'#ffd400':'#3a3f5a')+';text-shadow:'+(k<=st?'0 0 10px #ffd400':'none')+'">★</span>').join('');
 const chips=LV(i).ab.map(k=>'<span class="chip" style="border-color:'+ABIL[k].col+'">'+ABIL[k].ic+' '+ABIL[k].nm+'</span>').join('');
 modal((i%10===0&&i<100?'🚪 PUERTA ':'NIVEL ')+i+(i===100?' · JEFE FINAL':''),
  '<div class="mt" style="color:'+z[1]+'">'+z[0]+(i<=best?' · ✔ COMPLETADO':'')+'</div><div>'+row+'</div>'
  +'<div style="margin:10px 0;padding:10px;border:2px solid '+col+';border-radius:14px;background:#0a1030"><b>'+c.ic+' '+(c.boss?'EVENTO':'RETO')+': '+c.n+'</b><br><small>'+c.d+(c.off?' ('+c.off+' puntos de desventaja)':'')+'</small></div>'
  +'<small>★ Gana · ★★ ≥62% de los puntos · ★★★ ≥75%</small><br><small>🎁 Recompensa: <b style="color:#ffd400">DOP '+fmt(rewardOf(i))+'</b>'+(prof.lrw[i]?' (ya cobrada)':'')+' · +DOP '+(c.boss?25:10)+' por estrella nueva</small>'
  +'<div class="chips" style="margin-top:8px">'+chips+'</div>',
  [['▶ JUGAR',()=>{au();i===100?bossIntro(i):start(i)}],['CERRAR',null,'tg']])}
function start(i){stop();selLv=i;paintGrid();sh('lm',0);newGame(false)}
function bossIntro(i){
 const o=document.createElement('div');o.id='lmBoss';o.innerHTML='<div class="bgt"><div class="bg"></div><div class="bl"></div><div class="br"></div></div><div class="bt">NIVEL 100<small>JEFE FINAL · FORTALEZA SUPREMA</small></div>';
 document.body.appendChild(o);let done=0;
 [196,196,262,330,392,523,659].forEach((f,k)=>setTimeout(()=>{try{tone(f,.55,'sawtooth',.7,f*1.01);tone(f/2,.8,'triangle',.9)}catch(e){}},k*330));
 const fin=()=>{if(done)return;done=1;o.remove();start(i)};
 setTimeout(()=>o.classList.add('op'),700);setTimeout(()=>{try{SFX.impact()}catch(e){}},2200);setTimeout(fin,4200);o.onclick=fin}

/* ---------- abrir / cerrar el mapa ---------- */
openLevels=function(){$('menu').classList.add('hide');$('lvs').classList.add('hide');build();sh('lm',1);$('lmCo').textContent='DOP '+fmt(prof.pc||0);curZ=-1;startLoop();intro()};
closeLevels=function(){stop();sh('lm',0);$('menu').classList.remove('hide')};
$('bmap').onclick=()=>{SFX.click();toMenu();openLevels()};

/* ---------- retos reales dentro de la partida ---------- */
let CHc=null,chT=0,gT=3,iT=5;
const _LP=LP;LP=function(L){const r=_LP(L);return(CHc&&CHc.mul>1)?{base:r.base*CHc.mul,boost:r.boost}:r};
const _ng=newGame;
newGame=function(t){
 stop();sh('lm',0);$('bmap').classList.toggle('hide',!!t);
 CHc=t?null:chOf(selLv);chT=0;gT=3;iT=5;
 _ng(t);
 if(!CHc)return;
 try{
  if(CHc.ev&&!EVT){EVT={k:CHc.ev,ic:CHc.ic,n:CHc.n,d:CHc.d};evT=0;QK=1}
  if(!CHc.boss)gtx.push({s:CHc.ic+' '+CHc.n+'!',l:2,c:'#ffd400'});
  if(CHc.off){sc=[0,CHc.off];updScore()}
 }catch(e){showErr(e.message)}};
const _up=update;
update=function(dt){
 const c=CHc;
 if(c&&!two&&B&&P&&mode==='play'&&!paused&&CDT<=0){
  chT+=dt;
  if(c.k==='grav'&&serveT<=0&&B.vx){B.vy+=Math.sin(chT*.9)*420*dt;nrm(.35)}
  if(c.k==='fant'){gT-=dt;if(gT<=0){gT=4+Math.random()*2;B.gh=1.1}}
  if(c.k==='hielo'){iT-=dt;if(iT<=0){iT=6+Math.random()*3;P[0].slow=1.3;gtx.push({s:'🧊 CONGELADO',l:.8,c:'#7fe3ff'})}}}
 _up(dt);
 if(c&&c.k==='pala'&&P&&!two&&P[0].big<=0)P[0].h=Math.min(P[0].h,66)};

/* ---------- estrellas y recompensas al ganar ---------- */
function result(){
 const L=lvl;if(sc[0]<=sc[1])return;
 const c=chOf(L),me=sc[0],op=Math.max(0,sc[1]-c.off),r=me/Math.max(1,me+op),s=r>=.75?3:r>=.62?2:1;
 prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const old=prof.lst[L]||0;let pc=0;
 if(!prof.lrw[L]){prof.lrw[L]=1;pc+=rewardOf(L)}
 if(s>old){prof.lst[L]=s;pc+=(s-old)*(c.boss?25:10)}
 let extra='';
 if(L===100&&!prof.legend){prof.legend=1;prof.inv=prof.inv||[];if(!prof.inv.includes('pa6'))prof.inv.push('pa6');extra=' · 👑 RECOMPENSA LEGENDARIA: paleta Especial';setTimeout(()=>{try{SFX.hard();toast('👑 ¡LEYENDA D.M.R! Venciste a la Fortaleza Suprema')}catch(e){}},900)}
 if(pc){prof.pc=(prof.pc||0)+pc;updPC()}
 saveP();
 $('exp').textContent+=' · '+'★'.repeat(s)+'☆'.repeat(3-s)+(pc?' · +DOP '+fmt(pc):'')+extra}
let prevM=mode;
setInterval(()=>{if(prevM==='play'&&mode==='over'&&!two){try{result()}catch(e){showErr(e.message)}}prevM=mode},150);

/* ---------- guardado en el teléfono y en la cuenta ---------- */
const _sp=saveP;
saveP=function(){_sp();clearTimeout(saveP.t22);saveP.t22=setTimeout(()=>{if(ME&&fb&&SY)FS.setDoc(FS.doc(fb.db,'players',prof.id),{lst:prof.lst||{},lrw:prof.lrw||{},dseen:prof.dseen||{}},{merge:true}).catch(()=>{})},1500)};
const _lm=loadMe;
loadMe=async function(){await _lm();
 try{if(ME&&fb&&SY){const s=await FS.getDoc(FS.doc(fb.db,'players',prof.id));if(s.exists()){const d=s.data(),a=d.lst||{};prof.lst=prof.lst||{};for(const k in a)prof.lst[k]=Math.max(prof.lst[k]||0,a[k]);prof.lrw=Object.assign({},prof.lrw||{},d.lrw||{});prof.dseen=Object.assign({},prof.dseen||{},d.dseen||{});_sv()}}}catch(e){}};
const _fo=$('frOut').onclick;
$('frOut').onclick=async function(){await _fo.apply(this,arguments);prof.lst={};prof.lrw={};prof.dseen={};_sv()};

/* ---------- ARREGLO: "Unsupported field value: undefined (eq.fx)" ---------- */
const clean=()=>{const e=prof.eq;if(e)for(const k in e)if(e[k]===undefined)delete e[k]};
const _dgE=drawGame;drawGame=function(dt){try{_dgE(dt)}finally{clean()}};
const _spE=saveP;saveP=function(){clean();_spE()};
clean();
})();


/* ===== D.M.R v24: FONDOS ANIMADOS (tienda + partida) ===== */
(function(){
if(window.__dmr24)return;window.__dmr24=1;
const TAU=6.283185;
const rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)}
function grad(g,w,h,st){const q=g.createLinearGradient(0,0,0,h);st.forEach(s=>q.addColorStop(s[0],s[1]));g.fillStyle=q;g.fillRect(0,0,w,h)}
function rad(g,x,y,r,c,al){g.save();g.globalAlpha=al;g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);g.restore()}
function stars(g,w,h,t,n,y1){g.fillStyle='#fff';for(let i=0;i<n;i++){g.globalAlpha=.25+.75*Math.abs(Math.sin(t*(.6+rd(i)*1.2)+i));const s=1+rd(i+30)*1.4;g.fillRect(rd(i)*w,rd(i+50)*(y1||h),s,s)}g.globalAlpha=1}
function tri(g,x,y,bw,bh,c){g.fillStyle=c;g.beginPath();g.moveTo(x-bw/2,y);g.lineTo(x,y-bh);g.lineTo(x+bw/2,y);g.closePath();g.fill()}

/* ---------- escenarios (cada fondo tiene el suyo) ---------- */
const SC={
tb1(g,w,h,t,c0,c1){const u=w/300,hy=h*.56;
 grad(g,w,h,[[0,c0],[.55,'#2a0a4a'],[1,'#06010f']]);stars(g,w,h,t,26,hy*.8);
 g.save();g.beginPath();g.rect(0,0,w,hy);g.clip();
 const sx=w/2,sy=hy-h*.02,sr=h*.24,q=g.createLinearGradient(0,sy-sr,0,sy+sr);q.addColorStop(0,'#ffe36a');q.addColorStop(1,c1);
 g.fillStyle=q;g.shadowColor=c1;g.shadowBlur=30*u;g.beginPath();g.arc(sx,sy,sr,0,TAU);g.fill();g.shadowBlur=0;
 g.fillStyle='#2a0a4a';for(let i=0;i<5;i++){g.fillRect(sx-sr,sy+sr*(.05+i*.17),sr*2,sr*.035*(1+i*.6))}
 g.restore();
 g.fillStyle='rgba(6,1,15,.92)';g.fillRect(0,hy,w,h-hy);
 g.strokeStyle=c1;g.lineWidth=Math.max(1,u*1.2);g.shadowColor=c1;g.shadowBlur=6*u;
 for(let i=0;i<9;i++){const p=((i+t*.7)%9)/9,y=hy+(h-hy)*p*p;g.globalAlpha=.25+.6*p;g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
 g.globalAlpha=.6;for(let k=-8;k<=8;k++){g.beginPath();g.moveTo(w/2+k*w*.03,hy);g.lineTo(w/2+k*w*.26,h);g.stroke()}
 g.shadowBlur=0;g.globalAlpha=.9;g.fillStyle=c1;g.fillRect(0,hy-1,w,Math.max(1,u*1.5));g.globalAlpha=1},
tb2(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,'#0d0100'],[.6,c0],[1,'#2a0600']]);
 rad(g,w/2,h,h*.9,c1,.35+.12*Math.sin(t*2));
 for(let k=0;k<3;k++)tri(g,w*(.15+k*.35),h*.72,w*.7,h*.42,'#140203');
 tri(g,w*.5,h*.74,w*.55,h*.4,'#1c0304');rad(g,w*.5,h*.36,22*u,c1,.7+.3*Math.sin(t*3));
 for(let L=0;L<2;L++){const y0=h*(.82+L*.07);g.beginPath();g.moveTo(0,h);for(let X=0;X<=w;X+=6)g.lineTo(X,y0+Math.sin(X/(28*u)+t*(1.4+L*.6)+L*2)*h*.025);g.lineTo(w,h);g.closePath();
  const q=g.createLinearGradient(0,y0,0,h);q.addColorStop(0,L?'#ffb000':c1);q.addColorStop(1,'#ff2200');g.fillStyle=q;g.globalAlpha=L?.95:.8;g.fill()}
 g.globalAlpha=1;
 for(let i=0;i<26;i++){const p=(t*(.12+rd(i)*.22)+rd(i+3))%1,x=rd(i+9)*w+Math.sin(t*2+i)*8*u,y=h*(.95-p*.9);g.globalAlpha=1-p;g.fillStyle=i%2?'#ffd060':c1;g.beginPath();g.arc(x,y,(1+rd(i+5)*1.6)*u,0,TAU);g.fill()}
 g.globalAlpha=1},
tb3(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,'#02010a'],[1,c0]]);
 rad(g,w*(.3+.08*Math.sin(t*.3)),h*(.35+.06*Math.cos(t*.25)),w*.55,c1,.45);
 rad(g,w*(.7+.08*Math.cos(t*.27)),h*(.65+.06*Math.sin(t*.3)),w*.5,'#ff3df2',.3);
 rad(g,w*.5,h*.5,w*.35,'#5a3bff',.2);
 g.save();g.translate(w/2,h/2);g.rotate(t*.15);g.scale(1,.55);
 for(let i=0;i<90;i++){const r=2+i*w*.0052,q=i*.35+Math.floor(i/45)*3.14;g.globalAlpha=.9-i/110;g.fillStyle=i%3?'#fff':c1;g.beginPath();g.arc(Math.cos(q)*r,Math.sin(q)*r,(.6+i/60)*u,0,TAU);g.fill()}
 g.restore();stars(g,w,h,t,40)},
tb4(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,'#0a7ab0'],[.35,c0],[1,'#00101f']]);
 g.save();g.globalCompositeOperation='lighter';
 for(let k=0;k<5;k++){const x0=w*(.05+k*.22)+Math.sin(t*.5+k)*14*u;g.fillStyle=c1;g.globalAlpha=.1;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+22*u,0);g.lineTo(x0+90*u,h);g.lineTo(x0-30*u,h);g.closePath();g.fill()}
 g.restore();
 g.strokeStyle='#fff';g.lineWidth=Math.max(1,u);
 for(let k=0;k<3;k++){g.globalAlpha=.18-k*.04;g.beginPath();for(let X=0;X<=w;X+=6){const Y=h*(.1+k*.06)+Math.sin(X/(30*u)+t*1.4+k)*h*.015;X?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}
 g.globalAlpha=.5;g.strokeStyle='#cfefff';
 for(let i=0;i<20;i++){const p=(t*(.06+rd(i)*.1)+rd(i+2))%1,x=rd(i+7)*w+Math.sin(t*1.5+i)*5*u,y=h*(1-p);g.beginPath();g.arc(x,y,(1.5+rd(i+4)*3)*u,0,TAU);g.stroke()}
 for(let k=0;k<4;k++){const x=((t*(14+k*5)*u+k*w*.3)%(w+60*u))-30*u,y=h*(.3+k*.15)+Math.sin(t+k)*6*u;g.fillStyle=k%2?c1:'#9fe9ff';g.globalAlpha=.45;g.beginPath();g.ellipse(x,y,9*u,3.5*u,0,0,TAU);g.fill();g.beginPath();g.moveTo(x-8*u,y);g.lineTo(x-15*u,y-4*u);g.lineTo(x-15*u,y+4*u);g.fill()}
 g.globalAlpha=1},
tb5(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,'#021008'],[1,c0]]);rad(g,w*.5,h*.1,w*.6,c1,.15);
 for(let r=0;r<3;r++){const off=(t*(3+r*3)*u)%(w/6),col='rgba(2,'+(26+r*10)+',10,'+(.92-r*.18)+')';
  for(let k=-1;k<8;k++)tri(g,k*w/6+off-w/12+r*9*u,h*(.7+r*.14),40*u+r*14*u,h*(.5-r*.07),col);
  g.fillStyle=col;g.fillRect(0,h*(.7+r*.14),w,h)}
 g.fillStyle='#b8ffd0';for(let k=0;k<3;k++){g.globalAlpha=.05;g.fillRect(((t*10*u+k*w*.4)%(w*1.4))-w*.2,h*(.3+k*.22),w*.5,h*.1)}
 for(let i=0;i<22;i++){const x=rd(i)*w+Math.sin(t*.8+i)*14*u,y=rd(i+3)*h+Math.cos(t*.6+i)*10*u;g.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.6+i*2));g.fillStyle=i%3?c1:'#ffffaa';g.shadowColor=c1;g.shadowBlur=8*u;g.beginPath();g.arc(x,y,1.8*u,0,TAU);g.fill()}
 g.shadowBlur=0;g.globalAlpha=1},
tb6(g,w,h,t,c0,c1){const u=w/300,hy=h*.62;
 grad(g,w,h,[[0,'#1a0636'],[.35,c0],[.75,c1],[1,'#ffc27a']]);stars(g,w,h,t,22,h*.3);
 rad(g,w*.5,hy,w*.5,'#ffd08a',.6);g.fillStyle='#fff2c0';g.shadowColor='#ffb060';g.shadowBlur=26*u;g.beginPath();g.arc(w*.5,hy,h*.12,0,TAU);g.fill();g.shadowBlur=0;
 for(let k=0;k<4;k++){const x=((t*(4+k*2)*u+k*w*.35)%(w+120*u))-60*u,y=h*(.2+k*.1);g.fillStyle='rgba(60,10,70,.5)';g.beginPath();g.ellipse(x,y,50*u,8*u,0,0,TAU);g.fill();g.beginPath();g.ellipse(x+22*u,y-5*u,30*u,7*u,0,0,TAU);g.fill()}
 for(let r=0;r<2;r++){g.fillStyle=r?'#1a0a2a':'#2a1240';g.beginPath();g.moveTo(0,h);for(let X=0;X<=w;X+=6)g.lineTo(X,h*(.8+r*.08)+Math.sin(X/(55*u)+r*2)*h*.04);g.lineTo(w,h);g.closePath();g.fill()}},
tb7(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,'#02051a'],[1,c0]]);stars(g,w,h,t,26,h*.6);
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
 for(let k=0;k<3;k++){g.strokeStyle=k%2?'#7affc8':c1;g.globalAlpha=.22;g.lineWidth=h*.1;g.beginPath();for(let X=0;X<=w;X+=8){const Y=h*(.22+k*.1)+Math.sin(X/(60*u)+t*.7+k*2)*h*.07;X?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}
 g.restore();
 for(let k=0;k<5;k++)tri(g,w*(.06+k*.22),h,w*.4,h*(.3+(k%2)*.1),'rgba(160,210,255,.28)');
 g.fillStyle='#fff';
 for(let i=0;i<50;i++){const x=(rd(i)*w+Math.sin(t+i)*10*u+w)%w,y=((t*(.1+rd(i+8)*.18)+rd(i+2))%1)*h;g.globalAlpha=.5+rd(i+4)*.5;g.beginPath();g.arc(x,y,(1+rd(i+6)*1.8)*u,0,TAU);g.fill()}
 g.globalAlpha=1},
tb8(g,w,h,t,c0,c1){const u=w/300,b=Math.pow(Math.max(0,Math.sin(t*2.2)),6);
 grad(g,w,h,[[0,'#0a0002'],[1,c0]]);
 rad(g,w/2,h/2,w*.6,c1,.2+.25*b);
 for(let k=0;k<4;k++)rad(g,w*((rd(k)+t*.03*(k+1))%1),h*(.3+rd(k+4)*.5),w*.35,'#8a0010',.22);
 g.strokeStyle=c1;g.lineWidth=Math.max(1,1.5*u);
 for(let k=0;k<3;k++){const p=((t*.45+k/3)%1);g.globalAlpha=(1-p)*.4;g.beginPath();g.arc(w/2,h/2,p*w*.6,0,TAU);g.stroke()}
 g.fillStyle='#b00014';
 for(let i=0;i<12;i++){const x=rd(i)*w,p=((t*(.1+rd(i+3)*.15)+rd(i+7))%1);g.globalAlpha=.7*(1-p);g.fillRect(x,h*p*1.1-14*u,1.6*u,10*u+rd(i)*10*u)}
 g.globalAlpha=1},
tb10(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,'#000'],[1,c0]]);
 g.strokeStyle=c1;g.lineWidth=Math.max(1,u);g.globalAlpha=.12;
 for(let i=-8;i<18;i++){g.beginPath();g.moveTo(i*30*u,0);g.lineTo(i*30*u+h,h);g.stroke()}
 g.globalAlpha=1;g.save();g.globalCompositeOperation='lighter';
 for(let k=0;k<2;k++){const X=((t*(70+k*30)*u+k*w*.5)%(w+260*u))-130*u,q=g.createLinearGradient(X,0,X+90*u,h);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.5,c1);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.globalAlpha=.28;g.fillRect(0,0,w,h)}
 g.restore();g.fillStyle=c1;
 for(let i=0;i<30;i++){const p=(t*(.06+rd(i)*.1)+rd(i+3))%1,z=(1+rd(i+5)*1.5)*u;g.globalAlpha=Math.sin(p*3.14)*(.4+.6*Math.abs(Math.sin(t*3+i)));g.fillRect(rd(i+9)*w,h*(1-p),z,z)}
 g.globalAlpha=1},
def(g,w,h,t,c0,c1){const u=w/300;
 grad(g,w,h,[[0,c0],[1,c1]]);
 rad(g,w*(.3+.15*Math.sin(t*.4)),h*.4,w*.45,'#ffffff',.12);rad(g,w*(.7+.15*Math.cos(t*.35)),h*.7,w*.45,c1,.3);
 g.strokeStyle='#fff';g.lineWidth=Math.max(1,1.5*u);
 for(let k=0;k<4;k++){g.globalAlpha=.1;g.beginPath();for(let X=0;X<=w;X+=6){const Y=h*(.2+k*.2)+Math.sin(X/(45*u)+t*1.1+k*1.7)*h*.05;X?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke()}
 stars(g,w,h,t,24)}
};
function paint(g,w,h,t,en){g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
 g.save();(SC[en.id]||SC.def)(g,w,h,t,en.c0,en.c1);g.restore();g.globalAlpha=1;g.globalCompositeOperation='source-over'}

/* ---------- textos de cada fondo ---------- */
const INFO={
 '':{d:'El fondo azul espacial original, con estrellas suaves y olas de luz.',f:'Degradado azul con olas y estrellas',c:'Azul oscuro y azul eléctrico'},
 tb1:{d:'Una ciudad synthwave: sol retro, cuadrícula que avanza hacia ti y estrellas.',f:'Sol retro y cuadrícula en movimiento',c:'Azul noche y rosa neón'},
 tb2:{d:'Montañas en erupción con lava que ondea y brasas que suben sin parar.',f:'Volcán, lava y brasas',c:'Rojo volcán y naranja'},
 tb3:{d:'Una galaxia viva: nebulosas que flotan, una espiral que gira y estrellas que titilan.',f:'Nebulosas, espiral y estrellas',c:'Violeta, rosa y morado'},
 tb4:{d:'El fondo del mar con rayos de luz, olas, burbujas y peces que pasan.',f:'Rayos de luz, burbujas y peces',c:'Azul marino y cian'},
 tb5:{d:'Un bosque de noche con árboles, neblina y luciérnagas que brillan.',f:'Árboles, neblina y luciérnagas',c:'Verde oscuro y esmeralda'},
 tb6:{d:'Un atardecer con sol en el horizonte, nubes que pasan y colinas.',f:'Sol, nubes y colinas',c:'Morado y naranja'},
 tb7:{d:'Montañas de hielo bajo una aurora, con nieve que cae suave.',f:'Aurora, nieve y hielo',c:'Azul profundo y hielo claro'},
 tb8:{d:'Un fondo serio: late como un corazón, con ondas y gotas rojas.',f:'Latido, ondas y gotas',c:'Negro y rojo sangre'},
 tb10:{d:'Negro elegante con destellos dorados que lo cruzan y polvo de oro.',f:'Destellos y polvo dorado',c:'Negro y oro'}};
const NOHACE=['No cambia la velocidad ni la trayectoria de la pelota','No cambia el tamaño de la cancha ni de las paletas','No da puntos ni ventaja en la partida','La pelota y las paletas se siguen viendo claras'];

function fondos(){const m={};
 IT.forEach(z=>{if(z[0]!=='tb'||!z[1])return;const c=z[4]||[];m[z[2]]={id:z[1],name:z[2],c0:c[0]||'#0a1a6a',c1:c[1]||c[0]||'#2a6bff'}});
 m['Estándar']={id:'',name:'Estándar',c0:'#0a1a6a',c1:'#2a6bff'};return m}

/* ---------- animación de la tienda ---------- */
const regs=[];let on=0,last=0;
function court(cv,dt,t){const g=cv.getContext('2d'),W=cv.width,H=cv.height,vw=300,s=W/vw,vh=H/s,en=cv.__en,st=cv.__st;
 if(!st.i){st.i=1;st.bx=60;st.bd=1;st.p0=vh/2;st.p1=vh/2;st.tr=[]}
 const by=vh/2+Math.sin(t*2.2)*vh*.26;st.bx+=st.bd*150*dt;
 if(st.bx>=vw-34){st.bx=vw-34;st.bd=-1}else if(st.bx<=34){st.bx=34;st.bd=1}
 st.p0+=(by-st.p0)*Math.min(1,dt*8);st.p1+=(by-st.p1)*Math.min(1,dt*8);
 paint(g,W,H,t,en);
 g.setTransform(s,0,0,s,0,0);
 g.fillStyle='rgba(2,3,12,.22)';g.fillRect(0,0,vw,vh);
 g.save();g.strokeStyle='#fff';g.globalAlpha=.85;g.lineWidth=2;g.shadowColor=en.c1;g.shadowBlur=8;g.strokeRect(8,8,vw-16,vh-16);g.restore();
 g.save();g.globalAlpha=.45;g.strokeStyle='#fff';g.lineWidth=2;g.setLineDash([6,8]);g.beginPath();g.moveTo(vw/2,8);g.lineTo(vw/2,vh-8);g.stroke();g.restore();
 [[14,'#ff2233',st.p0],[vw-26,'#2a6bff',st.p1]].forEach(([px,col,py])=>{g.save();g.fillStyle=col;g.shadowColor=col;g.shadowBlur=12;rr(g,px,py-26,12,52,6);g.fill();g.restore()});
 st.tr.push({x:st.bx,y:by});if(st.tr.length>12)st.tr.shift();
 st.tr.forEach((q,i)=>{g.globalAlpha=i/st.tr.length*.5;g.fillStyle='#99ccff';g.beginPath();g.arc(q.x,q.y,7*i/st.tr.length,0,TAU);g.fill()});
 g.globalAlpha=1;g.save();g.fillStyle='#fff';g.shadowColor='#99ccff';g.shadowBlur=12;g.beginPath();g.arc(st.bx,by,7,0,TAU);g.fill();g.restore()}
function loop(n){
 const sv=$('sv');
 if(!sv||sv.classList.contains('hide')){on=0;regs.length=0;return}
 requestAnimationFrame(loop);
 if(n-last<(SET.red?80:40))return;
 const dt=Math.min(.1,(n-last)/1000),t=n/1000;last=n;
 for(let i=regs.length-1;i>=0;i--){const r=regs[i];if(!r.cv.isConnected){regs.splice(i,1);continue}
  const b=r.cv.getBoundingClientRect();if(b.bottom<0||b.top>innerHeight)continue;
  paint(r.g,r.cv.width,r.cv.height,t,r.en)}
 const B=$('bgBig');if(B&&B.__en)paint(B.getContext('2d'),B.width,B.height,t,B.__en);
 const C=$('bgCt');if(C&&C.__en)court(C,dt,t)}
function ensure(){if(on)return;on=1;last=0;requestAnimationFrame(loop)}

/* miniaturas de las tarjetas */
function scan(){
 const sv=$('sv');if(!sv||sv.classList.contains('hide'))return;
 const E=fondos(),T=($('svT')||{}).textContent||'',tab=/FONDOS/.test(T)&&!/RESULTADOS|INVENTARIO/.test(T);
 document.querySelectorAll('#svG .svK').forEach(d=>{
  if(d.dataset.bg)return;d.dataset.bg='1';
  const nm=(d.querySelector('b')||{}).textContent,rt=(d.querySelector('.svRt')||{}).textContent||'';
  if(!(tab||/Fondos/.test(rt)))return;
  const en=E[nm],old=d.querySelector('canvas');if(!en||!old)return;
  const cv=document.createElement('canvas');cv.width=168;cv.height=114;
  const sy=cv.style;sy.setProperty('width','112px','important');sy.setProperty('height','76px','important');
  sy.borderRadius='12px';sy.border='2px solid rgba(255,255,255,.55)';sy.boxShadow='0 0 14px '+en.c1;
  old.replaceWith(cv);regs.push({cv,g:cv.getContext('2d'),en})})}

/* panel derecho: vista grande, mini cancha y textos */
function fixPanel(){
 const R=$('svR');if(!R||R.querySelector('.bgp'))return;
 const nmE=R.querySelector('.svNm b');if(!nmE||!/el fondo de la cancha/.test(R.textContent))return;
 const en=fondos()[nmE.textContent];if(!en)return;
 const inf=INFO[en.id]||{d:'Un fondo animado para tu cancha.',f:'Degradado con olas y estrellas',c:en.c0+' y '+en.c1};
 const rar=((R.querySelector('.svNm span')||{}).textContent||'').toLowerCase();
 const big=R.querySelector('#svBig');
 if(big){const cv=document.createElement('canvas');cv.width=450;cv.height=300;cv.id='bgBig';cv.className='bgp';cv.__en=en;big.style.display='none';big.after(cv)}
 const ct=R.querySelector('#svCt');
 if(ct){const cv=document.createElement('canvas');cv.width=450;cv.height=255;cv.id='bgCt';cv.className='bgp';cv.style.cssText='width:100%;height:auto;border-radius:12px;border:2px solid #2a6bff;display:block';cv.__en=en;cv.__st={};ct.style.display='none';ct.after(cv)}
 const d=R.querySelector('.svD');if(d)d.textContent=inf.d;
 const uls=R.querySelectorAll('ul');
 if(uls[0])uls[0].innerHTML=[['Cambia','el fondo de la cancha durante la partida'],['Qué muestra',inf.f],['Colores',inf.c],['Animación','en movimiento continuo'],['Rareza',rar],['Ventaja competitiva','ninguna; es un objeto cosmético']].map(z=>'<li><b>'+z[0]+':</b> '+z[1]+'</li>').join('');
 if(uls[1])uls[1].innerHTML=NOHACE.map(z=>'<li>'+z+'</li>').join('')}
const svG=$('svG'),svR=$('svR');
if(svG)new MutationObserver(()=>{scan();ensure()}).observe(svG,{childList:true});
if(svR)new MutationObserver(()=>{fixPanel();ensure()}).observe(svR,{childList:true});

/* ---------- EN LA PARTIDA: el fondo equipado se mueve detrás de la cancha ---------- */
const GBc=document.createElement('canvas');GBc.width=800;GBc.height=500;
const GS=document.createElement('canvas');GS.width=400;GS.height=250;
let gfr=0,gok=0;
function eqEntry(){const id=(prof.eq||{}).tb;if(!id)return null;const z=IT.find(i=>i[0]==='tb'&&i[1]===id);if(!z)return null;const c=z[4]||[];return{id,c0:c[0]||'#0a1a6a',c1:c[1]||c[0]||'#2a6bff'}}
const _dg=drawGame;
drawGame=function(dt){
 try{
  if(mode==='play'||mode==='over'){
   const en=eqEntry();
   if(en&&!SET.red){
    gfr++;
    if(!gok||gfr%2===0){
     paint(GS.getContext('2d'),400,250,performance.now()/1000,en);
     const g=GBc.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';
     g.drawImage(GS,0,0,800,500);g.fillStyle='rgba(2,3,12,.3)';g.fillRect(0,0,800,500);
     g.save();g.strokeStyle='#fff';g.globalAlpha=.85;g.lineWidth=4;g.shadowColor=en.c1;g.shadowBlur=18;g.strokeRect(14,14,772,472);g.restore();
     gok=1}
    BGC=GBc}}
 }catch(e){}
 _dg(dt)};
})();

/* ===== D.M.R v25: PALETAS NUEVAS (30) + FONDOS POR ZONA EN LA PARTIDA ===== */
(function(){
if(window.__dmr25)return;window.__dmr25=1;
const TAU=6.283185,rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
function rr(g,x,y,w,h,r){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)}
function star5(g,R){g.beginPath();for(let k=0;k<10;k++){const q=k%2?R*.45:R,a=k*.6283-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}
function star4(g,R,w){g.beginPath();for(let k=0;k<8;k++){const q=k%2?R*w:R,a=k*.7854-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}
function vg(g,w,h,a,b,m){const q=g.createLinearGradient(0,-h/2,0,h/2);q.addColorStop(0,a);if(m)q.addColorStop(.5,m);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(-w/2,-h/2,w,h)}
function mix(hx,k){const n=parseInt(hx.slice(1),16),f=v=>Math.round(v+(255-v)*k);return'#'+((1<<24)|(f(n>>16&255)<<16)|(f(n>>8&255)<<8)|f(n&255)).toString(16).slice(1)}

/* ---------- CATÁLOGO: [id, nombre, rareza, precio, diseño, colores, descripción, cuerpo, efecto, animación] ---------- */
const ROWS=[
['pd01','Azul Clásico','c',500,'glass',['#2a6bff','#8fbaff','#ffffff'],'Barra azul con reflejo de cristal pulido. Sencilla y elegante.','Azul cristalino','Reflejo brillante lateral','Brillo que respira'],
['pd02','Rojo Clásico','c',600,'stripe',['#ff2233','#ff8a95','#ffffff'],'El rojo de siempre con una franja central luminosa.','Rojo intenso','Franja central encendida','Franja que late'],
['pd03','Verde Neón','c',700,'tube',['#19ff7a','#b8ffd8','#ffffff'],'Un tubo de neón verde con el núcleo encendido.','Tubo de neón','Núcleo luminoso','Parpadeo suave'],
['pd04','Blanco Brillante','c',800,'shine',['#f2f6ff','#b8c8f0','#ffffff'],'Blanco puro con un destello que cruza de arriba abajo.','Blanco perla','Destello viajero','Barrido de luz'],
['pd05','Amarillo Eléctrico','c',900,'hazard',['#ffe21a','#ffb800','#1a1400'],'Amarillo con franjas de advertencia que avanzan.','Amarillo industrial','Franjas diagonales','Franjas en movimiento'],
['pd06','Naranja Ardiente','c',1000,'embers',['#ff7a1a','#ffb060','#fff0b0'],'Naranja cálido con brasas que suben por la barra.','Naranja ardiente','Brasas ascendentes','Brasas que suben'],
['pd07','Cian Futurista','r',1200,'tech',['#00e5ff','#7ff6ff','#ffffff'],'Paneles tecnológicos con luces que se encienden en secuencia.','Paneles segmentados','Luces LED','LED en secuencia'],
['pd08','Morado Neón','r',1400,'dtube',['#b44dff','#e0a8ff','#ffffff'],'Doble tubo de neón morado que pulsa.','Doble tubo neón','Doble borde luminoso','Pulso morado'],
['pd09','Rosa Eléctrico','r',1600,'scan',['#ff2fb8','#ff9be0','#ffffff'],'Rosa vibrante con líneas de escaneo que suben.','Rosa vibrante','Líneas de escaneo','Escaneo ascendente'],
['pd10','Turquesa Líquido','r',1800,'wave',['#13d9c4','#8ff5e8','#ffffff'],'Ondas de agua turquesa que fluyen dentro de la barra.','Turquesa líquido','Ondas fluidas','Ondas en movimiento'],
['pd11','Plata Metálica','r',2000,'metal',['#c4ccd8','#7a8496','#ffffff'],'Metal cepillado con reflejos que se deslizan.','Metal cepillado','Reflejo deslizante','Brillo que recorre'],
['pd12','Esmeralda Luminosa','r',2400,'gem',['#19e68c','#7dffc4','#eafff5'],'Una gema esmeralda tallada con destellos internos.','Gema facetada','Destellos internos','Centelleo'],
['pd13','Paleta de Fuego','e',2800,'fire',['#ff4a00','#ffb000','#fff3a0'],'Llamas vivas que lamen la barra con resplandor naranja.','Núcleo de magma','Llamas y resplandor','Llamas danzantes'],
['pd14','Paleta de Hielo','e',3500,'ice',['#4de1ff','#bff4ff','#ffffff'],'Cristales de hielo con escarcha y partículas cian.','Hielo cristalino','Escarcha y chispas','Centelleo helado'],
['pd15','Paleta Eléctrica','e',4200,'elec',['#3a8bff','#bfe0ff','#ffffff'],'Arcos eléctricos que saltan por toda la barra.','Núcleo de energía','Rayos internos y chispas','Descargas aleatorias'],
['pd16','Paleta de Plasma','e',5000,'plasma',['#8a2bff','#e08bff','#ffffff'],'Plasma morado que se arremolina en su interior.','Plasma contenido','Remolino de energía','Plasma fluyendo'],
['pd17','Paleta Arcoíris','e',6000,'rainbow',['#ff3b3b','#ffd23b','#3bff8a'],'Todos los colores recorren la barra sin parar.','Espectro completo','Degradado vivo','Colores en ciclo'],
['pd18','Paleta de Cristal','e',7200,'crystal',['#9fe9ff','#ffffff','#c7a6ff'],'Un prisma translúcido que refracta la luz.','Prisma transparente','Refracción de color','Destellos de prisma'],
['pd19','Dorada Real','l',8500,'gold',['#ffc400','#fff3a0','#b87a00'],'Barra dorada futurista con bordes luminosos y partículas de oro.','Oro pulido','Brillo y partículas doradas','Reflejo que recorre'],
['pd20','Energía Cósmica','l',10000,'cosmic',['#5a3bff','#ff3df2','#7ff3ff'],'Nebulosa viva con estrellas que fluyen hacia arriba.','Nebulosa oscura','Polvo de estrellas','Estrellas ascendentes'],
['pd21','Paleta de Lava','l',12000,'lava',['#ff5a00','#ffd400','#2a0a00'],'Roca volcánica con grietas de lava al rojo vivo.','Roca volcánica','Grietas incandescentes','Pulso de lava'],
['pd22','Paleta de Rayos','l',14000,'bolt',['#ffe94d','#3a4aff','#ffffff'],'Tormenta contenida con relámpagos que la iluminan.','Nube de tormenta','Relámpagos','Destellos de tormenta'],
['pd23','Paleta Galáctica','l',16000,'galaxy',['#a64dff','#ff4dff','#6fd8ff'],'Galaxias en espiral girando dentro de la barra.','Núcleo galáctico','Espirales de estrellas','Giro de galaxias'],
['pd24','Paleta de Estrellas','l',19000,'stars',['#2a3aaa','#ffd400','#ffffff'],'Cielo nocturno con estrellas que titilan.','Noche profunda','Estrellas titilantes','Titileo'],
['pd25','Agujero Negro','m',26000,'blackhole',['#ff9a2a','#ffe0a0','#000000'],'Centros oscuros rodeados de un anillo energético.','Vacío absoluto','Anillo de acreción','Anillo girando'],
['pd26','Supernova','m',30000,'nova',['#ffffff','#ffd45a','#ff5a2a'],'Una estrella que estalla en pulsos de luz.','Núcleo estelar','Pulsos y rayos','Pulsación de luz'],
['pd27','Dimensional','m',35000,'glitch',['#00ffd0','#ff3df2','#6a5bff'],'Un portal que se distorsiona con cortes de color.','Portal inestable','Distorsión RGB','Fallas dimensionales'],
['pd28','Energía Divina','m',40000,'divine',['#fff3b0','#ffd45a','#ffffff'],'Luz sagrada con halo y haces que ascienden.','Luz pura','Halo y haces de luz','Ascenso de luz'],
['pd29','Universo Infinito','m',45000,'universe',['#6a3bff','#ff3df2','#00e5ff'],'Capas de universo con galaxias y estrellas a distintas velocidades.','Cosmos profundo','Capas de estrellas','Paralaje infinito'],
['pd30','Singularidad','m',50000,'sing',['#ffffff','#a64dff','#00e5ff'],'Anillos que colapsan hacia un punto de luz.','Punto de colapso','Anillos que se contraen','Colapso continuo']];
const RN={c:['COMÚN','#9aa7c7'],r:['RARA','#4da6ff'],e:['ÉPICA','#c06bff'],l:['LEGENDARIA','#ffd400'],m:['MÍTICA','#ff3df2']};
const DES={},INF={},RR={};
ROWS.forEach(r=>{DES[r[0]]={s:r[4],c:r[5]};INF[r[0]]={d:r[6],m:r[7],e:r[8],a:r[9]};RR[r[0]]=r[2];
 if(!IT.some(i=>i[1]===r[0]))IT.push(['pad',r[0],r[1],r[3],r[5]])});
window.__padRar=RR;
function des(id){if(DES[id])return DES[id];const z=IT.find(i=>i[0]==='pad'&&i[1]===id),c=z&&z[4]&&/^#[0-9a-f]{6}$/i.test(z[4][0])?z[4][0]:'#ff2233';return{s:'plain',c:[c,mix(c,.55),'#ffffff']}}

/* ---------- DISEÑOS (dentro de la barra) ---------- */
const SP={
plain(g,w,h,t,c){g.fillStyle=c[0];g.fillRect(-w/2,-h/2,w,h)},
glass(g,w,h,t,c){vg(g,w,h,c[1],c[0],c[0]);g.fillStyle='#fff';g.globalAlpha=.18+.14*Math.sin(t*2);g.fillRect(-w*.34,-h/2,w*.2,h);g.globalAlpha=1},
stripe(g,w,h,t,c){vg(g,w,h,c[0],'#7a0a14');g.fillStyle=c[1];g.globalAlpha=.55+.45*Math.sin(t*3);g.fillRect(-w*.12,-h/2,w*.24,h);g.fillStyle='#fff';g.globalAlpha=.6;g.fillRect(-w*.04,-h/2,w*.08,h);g.globalAlpha=1},
tube(g,w,h,t,c){g.fillStyle='#03140a';g.fillRect(-w/2,-h/2,w,h);const f=.75+.25*Math.sin(t*5)*Math.sin(t*1.3);g.globalAlpha=f*.5;g.fillStyle=c[0];g.fillRect(-w*.42,-h/2,w*.84,h);g.globalAlpha=f;g.fillStyle=c[1];g.fillRect(-w*.2,-h/2,w*.4,h);g.fillStyle='#fff';g.globalAlpha=f*.9;g.fillRect(-w*.07,-h/2,w*.14,h);g.globalAlpha=1},
shine(g,w,h,t,c){vg(g,w,h,c[0],c[1]);const y=((t*.6)%1.5-.25)*h-h/2,q=g.createLinearGradient(0,y-h*.18,0,y+h*.18);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(255,255,255,.95)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.fillRect(-w/2,y-h*.18,w,h*.36)},
hazard(g,w,h,t,c,u){g.fillStyle=c[0];g.fillRect(-w/2,-h/2,w,h);g.strokeStyle=c[2];g.lineWidth=3.2*u;const s=8*u,o=(t*14*u)%s;for(let y=-h-w;y<h+w;y+=s){g.beginPath();g.moveTo(-w/2,y+o);g.lineTo(w/2,y+o-w*.9);g.stroke()}g.fillStyle=c[1];g.globalAlpha=.25;g.fillRect(-w/2,-h/2,w,h);g.globalAlpha=1},
embers(g,w,h,t,c,u){vg(g,w,h,'#ffa040','#b02800',c[0]);for(let i=0;i<9;i++){const p=(t*.35*(.6+rd(i))+rd(i+3))%1,x=(rd(i+5)-.5)*w*.7,y=h/2-p*h;g.globalAlpha=1-p;g.fillStyle=i%2?c[2]:'#fff';g.beginPath();g.arc(x,y,(.8+rd(i+9)*1.2)*u,0,TAU);g.fill()}g.globalAlpha=1},
tech(g,w,h,t,c,u){g.fillStyle='#04202a';g.fillRect(-w/2,-h/2,w,h);const n=6,sh=h/n,lit=Math.floor(t*3)%n;for(let k=0;k<n;k++){const y=-h/2+k*sh;g.fillStyle=c[0];g.globalAlpha=.22;g.fillRect(-w*.4,y+sh*.12,w*.8,sh*.76);g.globalAlpha=1;g.strokeStyle=c[0];g.lineWidth=.8*u;g.strokeRect(-w*.4,y+sh*.12,w*.8,sh*.76);g.fillStyle=k===lit?c[2]:c[0];g.globalAlpha=k===lit?1:.55;g.fillRect(-w*.14,y+sh*.4,w*.28,sh*.2);g.globalAlpha=1}},
dtube(g,w,h,t,c){g.fillStyle='#10031c';g.fillRect(-w/2,-h/2,w,h);const f=.6+.4*Math.sin(t*3);g.fillStyle=c[0];g.globalAlpha=f;g.fillRect(-w*.46,-h/2,w*.2,h);g.fillRect(w*.26,-h/2,w*.2,h);g.fillStyle=c[1];g.globalAlpha=.9-f*.5;g.fillRect(-w*.1,-h/2,w*.2,h);g.fillStyle='#fff';g.globalAlpha=.6;g.fillRect(-w*.03,-h/2,w*.06,h);g.globalAlpha=1},
scan(g,w,h,t,c,u){vg(g,w,h,c[0],'#6a0f4a');g.fillStyle='#fff';g.globalAlpha=.3;const s=6*u,o=(t*26*u)%s;for(let y=h/2-o;y>-h/2;y-=s)g.fillRect(-w/2,y,w,1.4*u);const y2=h/2-((t*.5)%1)*h;g.fillStyle=c[1];g.globalAlpha=.55;g.fillRect(-w/2,y2-h*.04,w,h*.08);g.globalAlpha=1},
wave(g,w,h,t,c,u){vg(g,w,h,c[0],'#064a46');g.lineWidth=1.5*u;for(let k=0;k<4;k++){g.strokeStyle=k%2?c[1]:'#fff';g.globalAlpha=.7;g.beginPath();for(let y=-h/2;y<=h/2;y+=2*u){const x=Math.sin(y/(6*u)-t*3+k*1.6)*w*.2+(k-1.5)*w*.22;y===-h/2?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}g.globalAlpha=1},
metal(g,w,h,t,c,u){const q=g.createLinearGradient(0,-h/2,0,h/2);q.addColorStop(0,c[0]);q.addColorStop(.5,c[1]);q.addColorStop(1,c[0]);g.fillStyle=q;g.fillRect(-w/2,-h/2,w,h);for(let i=0;i<h/(2.6*u);i++){g.globalAlpha=.06+.1*rd(i);g.fillStyle=i%2?'#fff':'#000';g.fillRect(-w/2,-h/2+i*2.6*u,w,u)}g.globalAlpha=1;const y=((t*.5)%1.4-.2)*h-h/2,s=g.createLinearGradient(0,y-h*.12,0,y+h*.12);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.5,'rgba(255,255,255,.8)');s.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=s;g.fillRect(-w/2,y-h*.12,w,h*.24)},
gem(g,w,h,t,c,u){vg(g,w,h,c[1],'#04603a',c[0]);g.strokeStyle='#eafff5';g.lineWidth=.7*u;g.globalAlpha=.6;const n=5;for(let k=0;k<=n;k++){const y=-h/2+k*h/n;g.beginPath();g.moveTo(-w/2,y);g.lineTo(0,y+h/n*.5*(k%2?1:-1));g.lineTo(w/2,y);g.stroke()}g.beginPath();g.moveTo(0,-h/2);g.lineTo(0,h/2);g.stroke();g.globalAlpha=.16;g.fillStyle='#fff';for(let k=0;k<n;k+=2){g.beginPath();g.moveTo(-w/2,-h/2+k*h/n);g.lineTo(0,-h/2+k*h/n+h/n*.5);g.lineTo(0,-h/2+(k+1)*h/n);g.closePath();g.fill()}const q=Math.floor(t*2.5);g.globalAlpha=.5+.5*Math.sin(t*10);g.fillStyle='#fff';g.save();g.translate((rd(q+3)-.5)*w*.5,(rd(q)-.5)*h*.8);star4(g,w*.45,.18);g.fill();g.restore();g.globalAlpha=1},
fire(g,w,h,t,c){vg(g,w,h,'#7a0a00','#ff7a00','#e02a00');for(let k=0;k<8;k++){const y=-h/2+(k+.6)*h/8,f=.55+.45*Math.sin(t*8+k*1.9),fh=h/8*(1.3+f);for(let s=0;s<2;s++){const x=(s?.2:-.22)*w+Math.sin(t*5+k+s)*w*.1;g.fillStyle=s?c[2]:c[1];g.globalAlpha=.65;g.beginPath();g.moveTo(x-w*.22,y+h/16);g.quadraticCurveTo(x-w*.05,y-fh*.35,x,y-fh*.55);g.quadraticCurveTo(x+w*.05,y-fh*.3,x+w*.22,y+h/16);g.closePath();g.fill()}}g.globalAlpha=1},
ice(g,w,h,t,c,u){vg(g,w,h,'#e6fbff',c[0],c[1]);g.strokeStyle='#fff';g.lineWidth=.8*u;g.globalAlpha=.7;for(let k=0;k<6;k++){const y=-h/2+(k+.5)*h/6;g.beginPath();g.moveTo(-w/2,y+(k%2?-1:1)*h*.04);g.lineTo(w*.1,y);g.lineTo(w/2,y+(k%2?1:-1)*h*.05);g.stroke()}g.fillStyle='#fff';g.globalAlpha=.25;g.beginPath();g.moveTo(-w/2,-h/2);g.lineTo(w*.1,-h*.1);g.lineTo(-w/2,h*.2);g.closePath();g.fill();for(let i=0;i<5;i++){const q=Math.floor(t*3+i*1.7);g.globalAlpha=.4+.6*Math.abs(Math.sin(t*6+i*2));g.fillStyle=i%2?'#fff':c[0];g.save();g.translate((rd(q+i*5)-.5)*w*.7,(rd(q*3+i)-.5)*h*.9);star4(g,w*.3,.2);g.fill();g.restore()}g.globalAlpha=1},
elec(g,w,h,t,c,u){vg(g,w,h,'#0a2a8a','#050f40',c[0]);const q=Math.floor(t*12);g.lineJoin='round';for(let b=0;b<2;b++){g.beginPath();let x=(rd(q+b*7)-.5)*w*.6;g.moveTo(x,-h/2);const n=7;for(let s=1;s<=n;s++){x=(rd(q*5+s+b*13)-.5)*w*.85;g.lineTo(x,-h/2+s*h/n)}g.strokeStyle=c[1];g.globalAlpha=.4;g.lineWidth=3.2*u;g.stroke();g.strokeStyle='#fff';g.globalAlpha=.95;g.lineWidth=u;g.stroke()}g.globalAlpha=1},
plasma(g,w,h,t,c,u){g.fillStyle='#16042e';g.fillRect(-w/2,-h/2,w,h);g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const cx=Math.sin(t*1.7+i*2.1)*w*.3,cy=(((t*.22+i/5)%1)-.5)*h*1.1,r=w*(.7+.25*Math.sin(t*3+i)),q=g.createRadialGradient(cx,cy,0,cx,cy,r);q.addColorStop(0,i%2?c[1]:c[0]);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(-w/2,-h/2,w,h)}g.globalCompositeOperation='source-over';g.strokeStyle='#fff';g.lineWidth=u;g.globalAlpha=.7;g.beginPath();for(let y=-h/2;y<=h/2;y+=2*u){const x=Math.sin(y/(8*u)+t*4)*w*.16;y===-h/2?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();g.globalAlpha=1},
rainbow(g,w,h,t){const n=14;for(let i=0;i<n;i++){g.fillStyle='hsl('+((i*26+t*120)%360)+',95%,58%)';g.fillRect(-w/2,-h/2+i*h/n-1,w,h/n+2)}g.fillStyle='#fff';g.globalAlpha=.25;g.fillRect(-w*.3,-h/2,w*.16,h);g.globalAlpha=1},
crystal(g,w,h,t,c,u){vg(g,w,h,'#0e2a44','#1a1050',c[0]);const pts=[[-.5,-.5,.1,-.35,-.5,-.1],[.5,-.4,.5,-.05,-.05,-.2],[-.5,.05,.5,.1,0,.35],[-.5,.4,.1,.3,.5,.5]];pts.forEach((p,i)=>{g.fillStyle=i%2?c[1]:c[2];g.globalAlpha=.25+.15*Math.sin(t*2+i);g.beginPath();g.moveTo(p[0]*w,p[1]*h);g.lineTo(p[2]*w,p[3]*h);g.lineTo(p[4]*w,p[5]*h);g.closePath();g.fill()});g.strokeStyle='#fff';g.globalAlpha=.7;g.lineWidth=.8*u;g.beginPath();g.moveTo(-w/2,-h*.1);g.lineTo(w*.1,-h*.35);g.lineTo(w/2,-h*.05);g.moveTo(-w/2,h*.2);g.lineTo(w*.1,h*.3);g.lineTo(w/2,h*.15);g.stroke();const y=((t*.6)%1.3-.15)*h-h/2,s=g.createLinearGradient(-w/2,y,w/2,y+h*.1);s.addColorStop(0,c[1]);s.addColorStop(.5,c[2]);s.addColorStop(1,'#fff');g.fillStyle=s;g.globalAlpha=.8;g.fillRect(-w/2,y,w,h*.03);g.globalAlpha=1},
gold(g,w,h,t,c){const q=g.createLinearGradient(-w/2,-h/2,w/2,h/2);q.addColorStop(0,c[1]);q.addColorStop(.3,c[0]);q.addColorStop(.55,c[2]);q.addColorStop(.8,c[0]);q.addColorStop(1,c[1]);g.fillStyle=q;g.fillRect(-w/2,-h/2,w,h);const y=((t*.55)%1.5-.25)*h-h/2,s=g.createLinearGradient(0,y-h*.14,0,y+h*.14);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.5,'rgba(255,255,255,.9)');s.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=s;g.fillRect(-w/2,y-h*.14,w,h*.28);const k=Math.floor(t*2.2);g.fillStyle='#fff';g.globalAlpha=.5+.5*Math.sin(t*9);g.save();g.translate((rd(k)-.5)*w*.6,(rd(k+4)-.5)*h*.8);star4(g,w*.5,.16);g.fill();g.restore();g.globalAlpha=1},
cosmic(g,w,h,t,c,u){g.fillStyle='#08041e';g.fillRect(-w/2,-h/2,w,h);g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const cy=(((t*.12+i/3)%1)-.5)*h*1.2,q=g.createRadialGradient(0,cy,0,0,cy,w*1.1);q.addColorStop(0,i%2?c[1]:c[0]);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=.55;g.fillStyle=q;g.fillRect(-w/2,-h/2,w,h)}g.globalCompositeOperation='source-over';for(let i=0;i<16;i++){const p=(t*.18*(.5+rd(i))+rd(i+2))%1,z=(.8+rd(i)*.9)*u;g.globalAlpha=Math.sin(p*3.14);g.fillStyle=i%3?'#fff':c[2];g.fillRect((rd(i+5)-.5)*w*.85,h/2-p*h,z,z)}g.globalAlpha=1},
lava(g,w,h,t,c,u){g.fillStyle='#1c0905';g.fillRect(-w/2,-h/2,w,h);g.fillStyle='#000';g.globalAlpha=.4;for(let i=0;i<10;i++)g.fillRect((rd(i)-.5)*w,(rd(i+9)-.5)*h,w*.2,h*.04);g.globalAlpha=1;g.lineCap='round';g.lineJoin='round';for(let k=0;k<3;k++){const x0=(k-1)*w*.3,pl=.6+.4*Math.sin(t*3+k*1.3);g.beginPath();g.moveTo(x0,-h/2);for(let j=1;j<=8;j++)g.lineTo(x0+(rd(k*9+j)-.5)*w*.5,-h/2+j*h/8);g.strokeStyle=c[0];g.globalAlpha=pl;g.lineWidth=2.2*u;g.stroke();g.strokeStyle=c[1];g.lineWidth=.9*u;g.stroke()}g.globalAlpha=1},
bolt(g,w,h,t,c,u){vg(g,w,h,'#05072a','#1a2a8a','#0c1260');g.fillStyle='#000';g.globalAlpha=.35;for(let i=0;i<3;i++){const y=(((t*.1+i/3)%1)-.5)*h*1.3;g.beginPath();g.ellipse(Math.sin(t+i)*w*.2,y,w*.6,h*.09,0,0,TAU);g.fill()}g.globalAlpha=1;const f=(t*1.1)%1;if(f<.16){const a=1-f/.16;g.fillStyle='#fff';g.globalAlpha=a*.5;g.fillRect(-w/2,-h/2,w,h);const sd=Math.floor(t*1.1);g.beginPath();let x=(rd(sd)-.5)*w*.5;g.moveTo(x,-h/2);for(let s=1;s<=6;s++){x=(rd(sd*7+s)-.5)*w*.9;g.lineTo(x,-h/2+s*h/6)}g.strokeStyle=c[0];g.globalAlpha=a;g.lineWidth=2.4*u;g.stroke();g.strokeStyle='#fff';g.lineWidth=.9*u;g.stroke()}g.globalAlpha=1},
galaxy(g,w,h,t,c,u){g.fillStyle='#06031a';g.fillRect(-w/2,-h/2,w,h);const n=Math.max(1,Math.round(h/(w*2.4)));for(let i=0;i<n;i++){g.save();g.translate(0,-h/2+(i+.5)*h/n);for(let j=0;j<30;j++)for(let a=0;a<2;a++){const ang=j*.33+t*.9+a*3.1416,r=j/30*w*.95;g.globalAlpha=.9-j/40;g.fillStyle=j%3===0?c[2]:j%2?c[0]:c[1];g.fillRect(Math.cos(ang)*r-.5*u,Math.sin(ang)*r*.65-.5*u,(1+j/30)*u,(1+j/30)*u)}const q=g.createRadialGradient(0,0,0,0,0,w*.35);q.addColorStop(0,'rgba(255,255,255,.95)');q.addColorStop(1,'rgba(255,255,255,0)');g.globalAlpha=1;g.fillStyle=q;g.fillRect(-w,-w,2*w,2*w);g.restore()}g.globalAlpha=1},
stars(g,w,h,t,c,u){vg(g,w,h,c[0],'#02081a');for(let i=0;i<11;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*(1+rd(i+60)*2)+i*3));g.fillStyle=i%4===0?c[1]:'#fff';g.save();g.translate((rd(i)-.5)*w*.8,(rd(i+20)-.5)*h*.92);star5(g,(.9+rd(i+40)*1.6)*u*1.6);g.fill();g.restore()}g.globalAlpha=1},
blackhole(g,w,h,t,c,u){g.fillStyle='#000';g.fillRect(-w/2,-h/2,w,h);for(let k=-1;k<=1;k++){const cy=k*h*.3,rs=k?.65:1;g.save();g.translate(0,cy);g.rotate(Math.sin(t*.6+k)*.25);const q=g.createLinearGradient(-w,0,w,0);q.addColorStop(0,'rgba(255,120,20,0)');q.addColorStop(.5,c[1]);q.addColorStop(1,'rgba(255,120,20,0)');g.strokeStyle=q;g.lineWidth=w*.2*rs;g.beginPath();g.ellipse(0,0,w*.85*rs,w*.26*rs,0,0,TAU);g.stroke();g.restore();g.fillStyle='#000';g.beginPath();g.arc(0,cy,w*.27*rs,0,TAU);g.fill();g.strokeStyle=c[0];g.globalAlpha=.8;g.lineWidth=.8*u;g.stroke();g.globalAlpha=1}for(let i=0;i<8;i++){const p=(t*.3+i/8)%1,a=i*2.4+t,r=(1-p)*h*.5;g.globalAlpha=1-p;g.fillStyle=c[1];g.fillRect(Math.cos(a)*r*.2,Math.sin(a)*r,u,u)}g.globalAlpha=1},
nova(g,w,h,t,c,u){const pul=.75+.25*Math.sin(t*4),q=g.createRadialGradient(0,0,0,0,0,h*.55*pul);q.addColorStop(0,'#fff');q.addColorStop(.25,c[1]);q.addColorStop(.7,c[2]);q.addColorStop(1,'#1a0200');g.fillStyle=q;g.fillRect(-w/2,-h/2,w,h);g.strokeStyle='#fff';g.globalAlpha=.4;g.lineWidth=u;for(let k=0;k<8;k++){const a=k*.785+t*.4;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*h,Math.sin(a)*h);g.stroke()}for(let k=0;k<2;k++){const p=(t*.7+k/2)%1;g.globalAlpha=(1-p)*.9;g.lineWidth=1.6*u;g.strokeStyle=c[0];g.beginPath();g.arc(0,0,p*h*.5,0,TAU);g.stroke()}g.globalAlpha=1},
glitch(g,w,h,t,c,u){g.fillStyle='#05021a';g.fillRect(-w/2,-h/2,w,h);g.strokeStyle=c[2];g.lineWidth=.8*u;g.globalAlpha=.7;for(let k=0;k<4;k++){g.save();g.rotate(t*(k%2?1:-1)*.8);g.beginPath();g.ellipse(0,0,w*(.4+k*.18),w*(.15+k*.07),0,0,TAU);g.stroke();g.restore()}const q=Math.floor(t*12);for(let k=0;k<9;k++){const y=-h/2+k*h/9;if(rd(q*3+k)>.55){const sh=(rd(q+k*7)-.5)*w*.9;g.globalAlpha=.85;g.fillStyle=c[0];g.fillRect(-w*.3+sh,y,w*.6,h/9*.7);g.fillStyle=c[1];g.globalAlpha=.7;g.fillRect(-w*.3-sh*.6,y+h/9*.2,w*.6,h/9*.45)}}g.fillStyle='#fff';g.globalAlpha=.07;for(let y=-h/2;y<h/2;y+=3*u)g.fillRect(-w/2,y,w,u);g.globalAlpha=1},
divine(g,w,h,t,c,u){vg(g,w,h,c[2],c[1],c[0]);g.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const x=(k-1)*w*.32+Math.sin(t*1.2+k)*w*.1,q=g.createLinearGradient(x-w*.2,0,x+w*.2,0);q.addColorStop(0,'rgba(255,255,255,0)');q.addColorStop(.5,'rgba(255,255,255,.7)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.globalAlpha=.5+.3*Math.sin(t*2+k);g.fillRect(x-w*.2,-h/2,w*.4,h)}g.globalCompositeOperation='source-over';g.fillStyle='#fff';for(let i=0;i<9;i++){const p=(t*.3*(.5+rd(i))+rd(i+3))%1;g.globalAlpha=Math.sin(p*3.14);g.fillRect((rd(i+6)-.5)*w*.8,h/2-p*h,1.2*u,1.2*u)}g.globalAlpha=1},
universe(g,w,h,t,c,u){g.fillStyle='#030014';g.fillRect(-w/2,-h/2,w,h);g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const cy=(((t*.06*(i+1)+i/3)%1)-.5)*h*1.3,cx=Math.sin(i*2)*w*.2,q=g.createRadialGradient(cx,cy,0,cx,cy,w*1.2);q.addColorStop(0,i%2?c[1]:c[2]);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.globalAlpha=.4;g.fillRect(-w/2,-h/2,w,h)}g.globalCompositeOperation='source-over';for(let l=0;l<3;l++)for(let i=0;i<8;i++){const p=(t*(.05+l*.12)+rd(i+l*9))%1,z=(.7+l*.5)*u;g.globalAlpha=.4+.2*l;g.fillStyle=l===2?'#fff':l?c[2]:c[1];g.fillRect((rd(i+l*20+5)-.5)*w*.9,h/2-p*h,z,z)}g.save();g.rotate(t*.5);g.fillStyle=c[2];for(let j=0;j<20;j++){const a=j*.5,r=j/20*w*.5;g.globalAlpha=.8-j/30;g.fillRect(Math.cos(a)*r,Math.sin(a)*r*.6,u,u)}g.restore();g.globalAlpha=1},
sing(g,w,h,t,c,u){g.fillStyle='#02010a';g.fillRect(-w/2,-h/2,w,h);for(let k=0;k<6;k++){const p=(t*.45+k/6)%1;g.globalAlpha=p*.9;g.strokeStyle=k%2?c[1]:c[2];g.lineWidth=(.6+p*1.4)*u;g.beginPath();g.arc(0,0,(1-p)*h*.55,0,TAU);g.stroke()}g.globalAlpha=.5;g.strokeStyle=c[2];g.lineWidth=.6*u;for(let a=0;a<6;a++){const an=a*1.047+t*.6;g.beginPath();g.moveTo(Math.cos(an)*h*.5,Math.sin(an)*h*.5);g.lineTo(Math.cos(an)*h*.1,Math.sin(an)*h*.1);g.stroke()}const q=g.createRadialGradient(0,0,0,0,0,w*.9);q.addColorStop(0,'#fff');q.addColorStop(.25,c[0]);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.globalAlpha=.8+.2*Math.sin(t*6);g.fillRect(-w/2,-w,w,2*w);g.globalAlpha=1}};
/* efectos que sobresalen fuera de la barra */
const OUT={
fire(g,w,h,t,c,u){for(let i=0;i<3;i++){const x=(i-1)*w*.3,fh=(5+3*Math.sin(t*9+i*2))*u;g.fillStyle=i===1?c[2]:c[1];g.globalAlpha=.85;g.beginPath();g.moveTo(x-w*.18,-h/2+u);g.quadraticCurveTo(x,-h/2-fh,x+w*.02,-h/2-fh*1.2);g.quadraticCurveTo(x+w*.1,-h/2-fh*.4,x+w*.18,-h/2+u);g.fill()}g.globalAlpha=1},
blackhole(g,w,h,t,c,u){g.save();g.rotate(Math.sin(t*.6)*.25);g.strokeStyle=c[1];g.globalAlpha=.9;g.lineWidth=w*.14;g.beginPath();g.ellipse(0,0,w*.85,w*.26,0,0,Math.PI);g.stroke();g.restore();g.globalAlpha=1},
divine(g,w,h,t,c,u){g.strokeStyle=c[1];g.lineWidth=1.4*u;g.globalAlpha=.8+.2*Math.sin(t*3);g.beginPath();g.ellipse(0,-h/2-3*u,w*.7,2.2*u,0,0,TAU);g.stroke();g.globalAlpha=1},
gold(g,w,h,t,c,u){for(let i=0;i<4;i++){const p=(t*.5+i/4)%1,s=i%2?1:-1;g.globalAlpha=Math.sin(p*3.14);g.fillStyle=c[1];g.save();g.translate(s*(w*.7+p*3*u),h/2-p*h);star4(g,1.8*u,.25);g.fill();g.restore()}g.globalAlpha=1},
elec(g,w,h,t,c,u){const q=Math.floor(t*10);g.strokeStyle=c[1];g.lineWidth=.8*u;g.globalAlpha=.8;for(let i=0;i<2;i++){const y=(rd(q+i*5)-.5)*h,s=i?1:-1;g.beginPath();g.moveTo(s*w/2,y);g.lineTo(s*(w/2+2*u),y+(rd(q+i)-.5)*4*u);g.lineTo(s*(w/2+4*u),y+(rd(q+i+3)-.5)*6*u);g.stroke()}g.globalAlpha=1}};
function drawPad(g,X,Y,w,h,d,t,lt){
 const u=w/14,r=Math.min(w/2,7*u),S=SP[d.s]||SP.plain;
 g.save();g.translate(X,Y);
 if(!lt){g.shadowColor=d.c[0];g.shadowBlur=14*u}
 rr(g,-w/2,-h/2,w,h,r);g.fillStyle=d.c[0];g.fill();g.shadowBlur=0;
 g.save();rr(g,-w/2,-h/2,w,h,r);g.clip();
 S(g,w,h,t,d.c,u);
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
 const sh=g.createLinearGradient(-w/2,0,w/2,0);sh.addColorStop(0,'rgba(0,0,0,.4)');sh.addColorStop(.3,'rgba(255,255,255,.22)');sh.addColorStop(.55,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=sh;g.fillRect(-w/2,-h/2,w,h);
 g.restore();
 rr(g,-w/2,-h/2,w,h,r);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=Math.max(1,w*.09);g.stroke();
 const O=OUT[d.s];if(O)O(g,w,h,t,d.c,u);
 g.restore()}

/* ---------- TIENDA: tarjetas, panel y mini cancha ---------- */
const NOHACE=['No aumenta la velocidad de movimiento','No aumenta el tamaño de la paleta','No mejora el alcance','No cambia la física ni las colisiones','No da ventajas competitivas'];
const padNames=()=>{const m={'Estándar':''};IT.forEach(z=>{if(z[0]==='pad'&&z[1])m[z[2]]=z[1]});return m};
const regs=[];let on=0,last=0;
function thumb(g,d,t){g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,128,128);const q=g.createRadialGradient(64,64,4,64,64,64);q.addColorStop(0,d.c[1]+'66');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,128,128);drawPad(g,64,64,30,108,d,t,true)}
function bigDraw(cv,d,t){const g=cv.getContext('2d'),W=cv.width,H=cv.height;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#03040f';g.fillRect(0,0,W,H);const q=g.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.55);q.addColorStop(0,d.c[1]+'55');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,W,H);g.fillStyle='#fff';for(let i=0;i<36;i++){g.globalAlpha=.25+.6*Math.abs(Math.sin(t+i));g.fillRect(rd(i)*W,rd(i+40)*H,1.4,1.4)}g.globalAlpha=1;drawPad(g,W/2,H/2,58,H*.84,d,t,false)}
function court(cv,dt,t){
 const g=cv.getContext('2d'),W=cv.width,H=cv.height,vw=300,s=W/vw,vh=H/s,d=cv.__d,st=cv.__st;
 if(!st.i){st.i=1;st.bx=150;st.by=85;st.vx=120;st.vy=70;st.p0=vh/2;st.p1=vh/2;st.ty=vh/2;st.h=0;st.hy=0;st.tr=[]}
 st.bx+=st.vx*dt;st.by+=st.vy*dt;
 if(st.by<14){st.by=14;st.vy=Math.abs(st.vy)}else if(st.by>vh-14){st.by=vh-14;st.vy=-Math.abs(st.vy)}
 if(st.bx>=vw-34){st.bx=vw-34;st.vx=-Math.abs(st.vx)}
 if(st.bx<=34){if(!st.test||Math.abs(st.by-st.p0)<30){st.bx=34;st.vx=Math.abs(st.vx);st.h=.35;st.hy=st.by;st.vy=Math.max(-120,Math.min(120,st.vy+(st.by-st.p0)*1.5))}else if(st.bx<4){st.bx=150;st.by=vh/2;st.vx=120;st.vy=(Math.random()-.5)*120}}
 st.p0+=((st.test?st.ty:st.by)-st.p0)*Math.min(1,dt*(st.test?14:8));st.p1+=(st.by-st.p1)*Math.min(1,dt*7);st.h=Math.max(0,st.h-dt);
 g.setTransform(s,0,0,s,0,0);g.globalAlpha=1;g.fillStyle='#02030c';g.fillRect(0,0,vw,vh);g.fillStyle='rgba(20,70,200,.2)';g.fillRect(8,8,vw-16,vh-16);
 g.fillStyle='#fff';for(let i=0;i<14;i++){g.globalAlpha=.2+.5*Math.abs(Math.sin(t+i));g.fillRect(rd(i)*vw,rd(i+40)*vh,1,1)}g.globalAlpha=1;
 g.save();g.strokeStyle='#fff';g.globalAlpha=.85;g.lineWidth=2;g.shadowColor='#2a6bff';g.shadowBlur=8;g.strokeRect(8,8,vw-16,vh-16);g.restore();
 g.save();g.globalAlpha=.4;g.strokeStyle='#2a6bff';g.lineWidth=2;g.setLineDash([6,8]);g.beginPath();g.moveTo(vw/2,8);g.lineTo(vw/2,vh-8);g.stroke();g.restore();
 drawPad(g,21,st.p0,11,56,d,t,false);
 g.save();g.fillStyle='#2a6bff';g.shadowColor='#2a6bff';g.shadowBlur=10;rr(g,vw-26.5,st.p1-28,11,56,5.5);g.fill();g.restore();
 st.tr.push({x:st.bx,y:st.by});if(st.tr.length>12)st.tr.shift();
 st.tr.forEach((q,i)=>{g.globalAlpha=i/st.tr.length*.5;g.fillStyle='#99ccff';g.beginPath();g.arc(q.x,q.y,6*i/st.tr.length,0,TAU);g.fill()});
 g.globalAlpha=1;g.save();g.fillStyle='#fff';g.shadowColor='#99ccff';g.shadowBlur=10;g.beginPath();g.arc(st.bx,st.by,6,0,TAU);g.fill();g.restore();
 if(st.h>0){g.strokeStyle=d.c[1];g.globalAlpha=st.h/.35;g.lineWidth=2;g.beginPath();g.arc(30,st.hy,(.35-st.h)*60,0,TAU);g.stroke();g.globalAlpha=1}}
function loop(n){
 const sv=$('sv');if(!sv||sv.classList.contains('hide')){on=0;regs.length=0;return}
 requestAnimationFrame(loop);
 if(n-last<(SET.red?80:40))return;
 const dt=Math.min(.1,(n-last)/1000),t=n/1000;last=n;
 for(let i=regs.length-1;i>=0;i--){const r=regs[i];if(!r.cv.isConnected){regs.splice(i,1);continue}const b=r.cv.getBoundingClientRect();if(b.bottom<0||b.top>innerHeight)continue;thumb(r.g,r.d,t)}
 const B=$('pdBig');if(B&&B.__d)bigDraw(B,B.__d,t);
 const C=$('pdCt');if(C&&C.__d)court(C,dt,t)}
function ensure(){if(on)return;on=1;last=0;requestAnimationFrame(loop)}
function scan(){
 const sv=$('sv');if(!sv||sv.classList.contains('hide'))return;
 const T=($('svT')||{}).textContent||'',tab=/PALETAS/.test(T)&&!/RESULTADOS|INVENTARIO/.test(T),NM=padNames();
 document.querySelectorAll('#svG .svK').forEach(d=>{
  if(d.dataset.pd)return;d.dataset.pd='1';
  const nm=(d.querySelector('b')||{}).textContent,rtE=d.querySelector('.svRt'),rt=rtE?rtE.textContent:'';
  if(!(tab||/Paletas/.test(rt))||!(nm in NM))return;
  const id=NM[nm],old=d.querySelector('canvas');if(!old)return;
  if(RR[id]&&rtE){const r=RN[RR[id]];d.style.setProperty('--rc',r[1]);rtE.textContent=r[0]+(/·/.test(rt)?' · '+rt.split('·')[1].trim():'')}
  const cv=document.createElement('canvas');cv.width=128;cv.height=128;old.replaceWith(cv);regs.push({cv,g:cv.getContext('2d'),d:des(id)})})}
function fixPanel(){
 const R=$('svR');if(!R||R.querySelector('.pdp'))return;
 const nmE=R.querySelector('.svNm b');if(!nmE||!/tu paleta durante la partida/.test(R.textContent))return;
 const NM=padNames(),nm=nmE.textContent;if(!(nm in NM))return;
 const id=NM[nm],dd=des(id),inf=INF[id],rid=RR[id],r=rid?RN[rid]:null;
 if(r){R.style.setProperty('--rc',r[1]);const sp=R.querySelector('.svNm span');if(sp){sp.textContent=r[0];sp.style.color=r[1]}const tg=R.querySelector('.svTag');if(tg){tg.textContent=(rid==='l'||rid==='m'?'♛ ':'')+r[0];tg.style.background=r[1]}}
 const rarTxt=(r?r[0]:((R.querySelector('.svNm span')||{}).textContent||'')).toLowerCase();
 const big=R.querySelector('#svBig');
 if(big){const cv=document.createElement('canvas');cv.width=450;cv.height=300;cv.id='pdBig';cv.className='pdp';cv.__d=dd;big.style.display='none';big.after(cv)}
 const ct=R.querySelector('#svCt');
 if(ct){const cv=document.createElement('canvas');cv.width=450;cv.height=255;cv.id='pdCt';cv.style.cssText='width:100%;height:auto;border-radius:12px;border:2px solid #2a6bff;display:block';cv.__d=dd;cv.__st={};ct.style.display='none';ct.after(cv);
  const b=document.createElement('button');b.type='button';b.className='tg';b.style.cssText='width:100%;padding:10px;font-size:12px';b.textContent='🎮 PROBAR: mueve la paleta con el dedo';
  b.onclick=()=>{cv.__st.test=!cv.__st.test;cv.style.touchAction=cv.__st.test?'none':'';b.textContent=cv.__st.test?'⏹ DETENER PRUEBA':'🎮 PROBAR: mueve la paleta con el dedo'};
  const mv=e=>{if(!cv.__st.test)return;const q=cv.getBoundingClientRect();cv.__st.ty=(e.clientY-q.top)/q.height*170};
  cv.addEventListener('pointerdown',mv);cv.addEventListener('pointermove',mv);cv.after(b)}
 const dsc=R.querySelector('.svD');if(dsc)dsc.textContent=inf?inf.d:'Barra '+nm+' con un acabado simple y limpio.';
 const uls=R.querySelectorAll('ul');
 if(uls[0])uls[0].innerHTML=[['Cuerpo',inf?inf.m:'Color sólido'],['Colores',dd.c.slice(0,3).join(' · ')],['Efecto especial',inf?inf.e:'Ninguno'],['Animación',inf?inf.a:'Ninguna'],['Se ve en','tu paleta (la izquierda) durante la partida'],['Rareza',rarTxt],['Ventaja competitiva','ninguna; es un objeto cosmético']].map(z=>'<li><b>'+z[0]+':</b> '+z[1]+'</li>').join('');
 if(uls[1])uls[1].innerHTML=NOHACE.map(z=>'<li>'+z+'</li>').join('')}
const svG=$('svG'),svR=$('svR');
if(svG)new MutationObserver(()=>{scan();ensure()}).observe(svG,{childList:true});
if(svR)new MutationObserver(()=>{fixPanel();ensure()}).observe(svR,{childList:true});

/* ---------- FONDOS POR ZONA (cada 10 niveles) EN LA PARTIDA ---------- */
const BW=400,BH=250,ZC=['#ff3b1f','#b6ff00','#19e65a','#2a6bff','#0a7aff','#ff9a1f','#7fe3ff','#4dff3a','#a64dff','#ff2233'];
function vgr(g,a,b,m){const q=g.createLinearGradient(0,0,0,BH);q.addColorStop(0,a);if(m)q.addColorStop(.55,m);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(0,0,BW,BH)}
function glw(g,x,y,r,c,al){g.save();g.globalAlpha=al;g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,2*r,2*r);g.restore()}
function dt_(g,x,y,r,c,al){g.globalAlpha=Math.max(0,Math.min(1,al));g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.globalAlpha=1}
function tri(g,x,y,bw,bh,c){g.fillStyle=c;g.beginPath();g.moveTo(x-bw/2,y);g.lineTo(x,y-bh);g.lineTo(x+bw/2,y);g.closePath();g.fill()}
function peaks(g,base,amp,sc,ph,col,sd){g.fillStyle=col;g.beginPath();g.moveTo(0,BH);for(let x=0;x<=BW;x+=5){const n=x*sc+ph;g.lineTo(x,base-amp*Math.abs(Math.sin(n)+Math.sin(n*2.3+sd)*.5))}g.lineTo(BW,BH);g.closePath();g.fill()}
function stars_(g,t,n,ymax){g.fillStyle='#fff';for(let i=0;i<n;i++){g.globalAlpha=.25+.75*Math.abs(Math.sin(t*(.5+rd(i)*1.5)+i));const s=1+rd(i+30)*1.3;g.fillRect(rd(i)*BW,rd(i+50)*ymax,s,s)}g.globalAlpha=1}
const ZS=[
function(g,t){vgr(g,'#1a0204','#4a0a00','#2a0408');glw(g,200,95,170,'#ff5a00',.45+.12*Math.sin(t*2));glw(g,290,52,60,'#ffa000',.4);dt_(g,290,52,17,'#ffd070',.9);
 peaks(g,160,46,.032,0,'#1a0305',1);peaks(g,190,36,.05,2,'#260408',3);g.lineCap='round';
 for(let k=0;k<3;k++){g.beginPath();for(let y=130;y<=BH;y+=8){const x=100+k*100+Math.sin(y*.05+t*1.5+k)*9+(y-130)*(k-1)*.45;y===130?g.moveTo(x,y):g.lineTo(x,y)}g.strokeStyle='#ff6a00';g.globalAlpha=.55+.35*Math.sin(t*3+k);g.lineWidth=3;g.stroke();g.strokeStyle='#ffd060';g.lineWidth=1;g.stroke()}g.globalAlpha=1;
 const q=g.createLinearGradient(0,215,0,BH);q.addColorStop(0,'#ff8a00');q.addColorStop(1,'#d01800');g.fillStyle=q;g.beginPath();g.moveTo(0,BH);for(let x=0;x<=BW;x+=6)g.lineTo(x,226+Math.sin(x*.04+t*2)*4);g.lineTo(BW,BH);g.fill();
 for(let i=0;i<38;i++){const p=(t*.12*(.5+rd(i))+rd(i+3))%1;dt_(g,rd(i)*BW+Math.sin(t+i)*10,BH-p*BH*.95,1+rd(i+9)*2,i%2?'#ffd060':'#ff7a1a',1-p)}
 for(let i=0;i<14;i++){const p=(t*.06*(.5+rd(i+40))+rd(i+41))%1;dt_(g,rd(i+42)*BW,p*BH*.7,1.2,'#8a7a7a',.4)}},
function(g,t){vgr(g,'#020a02','#102000','#041004');g.strokeStyle='#6a9a00';g.lineWidth=1;
 for(let k=0;k<14;k++){const y=(k+.5)*BH/14,x1=BW*.25+rd(k)*BW*.2,x2=x1+30+rd(k+5)*60,dy=rd(k+9)>.5?12:-12;g.globalAlpha=.4;g.beginPath();g.moveTo(0,y);g.lineTo(x1,y);g.lineTo(x1+10,y+dy);g.lineTo(x2,y+dy);g.lineTo(x2+10,y);g.lineTo(BW,y);g.stroke();g.globalAlpha=.8;g.fillStyle='#b6ff00';g.fillRect(x1-2,y-2,4,4);g.fillRect(x2+8,y-2,4,4);const px=(t*90*(.5+rd(k+2))+k*53)%(BW+40)-20;dt_(g,px,y+(px>x1&&px<x2?dy:0),2,'#ffe600',.95)}
 glw(g,200,125,150,'#b6ff00',.14+.08*Math.sin(t*3));
 for(let k=0;k<3;k++){const f=(t*.55+k*.37)%1;if(f<.2){const sd=Math.floor(t*.55+k*.37)*3+k,a=1-f/.2;g.fillStyle='#e8ff80';g.globalAlpha=a*.2;g.fillRect(0,0,BW,BH);g.beginPath();let x=40+rd(sd)*320;g.moveTo(x,0);for(let s=1;s<=9;s++){x+=(rd(sd*9+s)-.5)*60;g.lineTo(x,s*BH/9)}g.strokeStyle='#ffe600';g.globalAlpha=a;g.lineWidth=3;g.stroke();g.strokeStyle='#fff';g.lineWidth=1;g.stroke()}}g.globalAlpha=1},
function(g,t){vgr(g,'#020c08','#062a14','#04180c');glw(g,70,45,120,'#aaffcc',.25);dt_(g,70,45,15,'#e0fff0',.9);
 g.fillStyle='#b8ffd0';for(let k=0;k<4;k++){g.globalAlpha=.05+.025*Math.sin(t+k);g.beginPath();g.moveTo(40+k*70,0);g.lineTo(80+k*70,0);g.lineTo(150+k*90+Math.sin(t*.4+k)*20,BH);g.lineTo(60+k*90,BH);g.closePath();g.fill()}g.globalAlpha=1;
 for(let l=0;l<3;l++){const by=140+l*40,c='rgba(2,'+(30+l*16)+',12,'+(.95-l*.1)+')',s=26+l*8;for(let k=0;k<10;k++){const x=((k*52+t*(2+l*3))%(BW+90))-45;tri(g,x,by,s*1.6,s*1.4,c);tri(g,x,by-s*.8,s*1.3,s*1.3,c);tri(g,x,by-s*1.5,s,s*1.2,c)}g.fillStyle=c;g.fillRect(0,by,BW,BH)}
 g.fillStyle='#b8ffd0';for(let k=0;k<4;k++){g.globalAlpha=.06;g.beginPath();g.ellipse(((t*6+k*120)%(BW+200))-60,160+k*22,110,10,0,0,TAU);g.fill()}g.globalAlpha=1;
 for(let i=0;i<34;i++)dt_(g,rd(i)*BW+Math.sin(t*.8+i)*18,rd(i+3)*BH+Math.cos(t*.6+i)*12,1.8,i%3?'#d8ff5a':'#ffffaa',.25+.75*Math.abs(Math.sin(t*1.5+i*2)))},
function(g,t){vgr(g,'#0a0426','#2a0a4a','#1a0a3a');glw(g,200,150,180,'#ff3df2',.3);
 for(let k=0;k<2;k++){const a=Math.sin(t*.5+k*2)*.5;g.fillStyle='#cfe0ff';g.globalAlpha=.07;g.beginPath();g.moveTo(80+k*240,BH);g.lineTo(80+k*240+a*190-26,0);g.lineTo(80+k*240+a*190+26,0);g.closePath();g.fill()}g.globalAlpha=1;
 for(let l=0;l<3;l++){const base=130+l*40,bw=BW/9;for(let k=0;k<10;k++){const bh=36+rd(k+l*11)*80*(1-l*.15),x=k*bw-6;g.fillStyle=['#0a0830','#0e0a3e','#160a4a'][l];g.fillRect(x,base-bh,bw-3,bh+100);g.fillStyle=(k+l)%2?'#ff3df2':'#2a9bff';g.globalAlpha=.9;g.fillRect(x,base-bh,bw-3,1.6);g.globalAlpha=1;for(let q=0;q<12;q++){if(Math.sin(t*.6+q*3.7+k*2+l*5)>-.25){g.fillStyle=q%3?'#ffe9a0':'#7fe3ff';g.globalAlpha=.7;g.fillRect(x+4+(q%3)*((bw-12)/3),base-bh+6+Math.floor(q/3)*11,3.4,5);g.globalAlpha=1}}}}
 g.lineWidth=2;g.globalAlpha=.6+.4*Math.sin(t*5);g.strokeStyle='#ff3df2';g.strokeRect(60,98,50,16);g.strokeStyle='#2a9bff';g.strokeRect(250,84,56,18);g.globalAlpha=1;
 g.strokeStyle='#bfe0ff';g.globalAlpha=.28;g.lineWidth=1;for(let i=0;i<50;i++){const p=(t*1.1*(.6+rd(i))+rd(i+2))%1,x=rd(i)*BW,y=p*BH;g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+12);g.stroke()}g.globalAlpha=1;
 const q=g.createLinearGradient(0,215,0,BH);q.addColorStop(0,'rgba(255,61,242,0)');q.addColorStop(1,'rgba(255,61,242,.35)');g.fillStyle=q;g.fillRect(0,215,BW,35)},
function(g,t){vgr(g,'#0a5a90','#00122a','#02305a');g.save();g.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const x=40+k*80+Math.sin(t*.4+k)*18;g.fillStyle='rgba(120,220,255,.07)';g.beginPath();g.moveTo(x,0);g.lineTo(x+22,0);g.lineTo(x+90,BH);g.lineTo(x-30,BH);g.closePath();g.fill()}g.restore();
 g.strokeStyle='#cfefff';g.lineWidth=1.5;for(let k=0;k<3;k++){g.globalAlpha=.22-k*.05;g.beginPath();for(let x=0;x<=BW;x+=6){const y=14+k*10+Math.sin(x*.04+t*1.4+k)*4;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.globalAlpha=1;
 for(let k=0;k<3;k++){const jx=70+k*130+Math.sin(t*.5+k)*22,jy=90+Math.sin(t*.8+k*2)*24,pu=1+.12*Math.sin(t*2.5+k);glw(g,jx,jy,50,'#ff5adf',.3);g.fillStyle='rgba(255,130,230,.55)';g.beginPath();g.ellipse(jx,jy,17*pu,12*pu,0,Math.PI,TAU);g.fill();g.strokeStyle='rgba(255,170,240,.6)';g.lineWidth=1.4;for(let s=-2;s<=2;s++){g.beginPath();for(let y=0;y<=26;y+=3){const x=jx+s*5+Math.sin(y*.3-t*3+s)*3;y?g.lineTo(x,jy+y):g.moveTo(x,jy)}g.stroke()}}
 for(let k=0;k<6;k++){const x=((t*(22+k*6)+k*70)%(BW+60))-30,y=150+Math.sin(k*2)*40+Math.sin(t+k)*5;g.fillStyle=k%2?'#00d0ff':'#9fe9ff';g.globalAlpha=.55;g.beginPath();g.ellipse(x,y,8,3.2,0,0,TAU);g.fill();g.beginPath();g.moveTo(x-7,y);g.lineTo(x-13,y-4+Math.sin(t*9+k)*2);g.lineTo(x-13,y+4);g.fill()}g.globalAlpha=1;
 g.strokeStyle='rgba(200,240,255,.55)';g.lineWidth=1;for(let i=0;i<30;i++){const p=(t*.08*(.6+rd(i))+rd(i+2))%1;g.beginPath();g.arc(rd(i)*BW+Math.sin(t+i)*6,BH-p*BH,2+rd(i+4)*3,0,TAU);g.stroke()}
 peaks(g,235,10,.05,1,'#02122a',2);for(let k=0;k<8;k++){const x=k*52+14;g.strokeStyle=k%2?'#ff5a8a':'#ff9a3a';g.lineWidth=3;g.beginPath();g.moveTo(x,BH);g.lineTo(x+Math.sin(t+k)*3,226);g.stroke();dt_(g,x+Math.sin(t+k)*3,224,4,k%2?'#ff7aa0':'#ffb060',.9)}},
function(g,t){vgr(g,'#3a0d00','#a04a0a','#e07a1a');glw(g,280,70,160,'#ffd24a',.7);dt_(g,280,70,27,'#fff1b0',.95);
 const dn=(base,amp,ph,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,BH);for(let x=0;x<=BW;x+=5)g.lineTo(x,base+Math.sin(x*.014+ph)*amp+Math.sin(x*.035+ph*2)*amp*.3);g.lineTo(BW,BH);g.fill()};
 dn(150,16,t*.03,'#9a4a0e');dn(180,20,2+t*.05,'#702e08');
 g.fillStyle='#2a1004';for(const cx of [70,210,340]){const cy=190;g.fillRect(cx-3,cy-34,6,40);g.fillRect(cx-14,cy-24,4,14);g.fillRect(cx-14,cy-26,14,4);g.fillRect(cx+10,cy-30,4,16);g.fillRect(cx,cy-32,14,4)}
 dn(214,14,4+t*.08,'#3a1404');
 g.fillStyle='#ffd9a0';for(let i=0;i<46;i++){const x=((t*(70+rd(i)*80)+rd(i+3)*BW)%(BW+20))-10;g.globalAlpha=.3;g.fillRect(x,140+rd(i+5)*110,10+rd(i)*10,1)}g.globalAlpha=1;
 g.strokeStyle='#1a0a02';g.lineWidth=1.6;for(let k=0;k<3;k++){const x=((t*14+k*140)%(BW+60))-30,y=50+k*18+Math.sin(t*2+k)*4,f=Math.sin(t*6+k)*3;g.beginPath();g.moveTo(x-8,y-f);g.quadraticCurveTo(x-3,y-3,x,y);g.quadraticCurveTo(x+3,y-3,x+8,y-f);g.stroke()}},
function(g,t){vgr(g,'#031a38','#02101f','#06283f');stars_(g,t,50,110);
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';for(let k=0;k<3;k++){g.strokeStyle=['#7affc8','#7fe3ff','#c07aff'][k];g.globalAlpha=.2;g.lineWidth=28;g.beginPath();for(let x=0;x<=BW;x+=8){const y=50+k*20+Math.sin(x*.02+t*.7+k*2)*22;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.restore();
 peaks(g,175,50,.03,1,'#0e3a5e',2);peaks(g,205,34,.045,3,'#1a5a88',4);
 g.fillStyle='rgba(230,250,255,.8)';for(let k=0;k<7;k++){const x=k*60+20,hh=24+rd(k)*30;g.beginPath();g.moveTo(x-8,BH);g.lineTo(x,BH-hh);g.lineTo(x+8,BH);g.closePath();g.fill()}
 for(let i=0;i<8;i++){const q=Math.floor(t*2+i);dt_(g,rd(q+i*5)*BW,200+rd(q*3+i)*40,1.8,'#fff',.4+.6*Math.abs(Math.sin(t*6+i)))}
 for(let i=0;i<90;i++){const p=(t*.1*(.5+rd(i))+rd(i+3))%1;dt_(g,rd(i)*BW+Math.sin(t*1.2+i)*10,p*BH,1+rd(i+9)*1.8,'#fff',.8)}},
function(g,t){vgr(g,'#021a04','#0a4a10','#04300a');g.fillStyle='#d8ff90';for(let k=0;k<4;k++){g.globalAlpha=.06;g.beginPath();g.moveTo(30+k*100,0);g.lineTo(70+k*100,0);g.lineTo(160+k*100+Math.sin(t*.4+k)*16,BH);g.lineTo(20+k*100,BH);g.closePath();g.fill()}g.globalAlpha=1;
 for(let k=0;k<7;k++){const side=k%2,ro=(side?Math.PI-.55:.55)+Math.sin(t*.8+k)*.12;g.save();g.translate(side?BW:0,20+k*36);g.rotate(ro);g.fillStyle='rgba(8,'+(100+(k*13)%60)+',24,.92)';g.beginPath();g.ellipse(52,0,66,15,0,0,TAU);g.fill();g.strokeStyle='rgba(120,255,120,.35)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(110,0);g.stroke();g.restore()}
 g.lineWidth=3;for(let k=0;k<7;k++){const x0=30+k*56,ey=120+rd(k)*40;g.strokeStyle='#1a6a18';g.beginPath();g.moveTo(x0,0);g.bezierCurveTo(x0+Math.sin(t+k)*14,50,x0-Math.sin(t*.8+k)*16,90,x0+Math.sin(t*.7+k)*12,ey);g.stroke();dt_(g,x0+Math.sin(t*.7+k)*12,ey,4,'#3aff5a',.9)}
 for(let k=0;k<3;k++){const x=((t*40+k*150)%(BW+60))-30,y=60+k*40+Math.sin(t*3+k)*6,f=Math.sin(t*14+k)*5;g.strokeStyle=['#ff3b3b','#ffd400','#2a6bff'][k];g.lineWidth=2.4;g.beginPath();g.moveTo(x-9,y-f);g.quadraticCurveTo(x-3,y-4,x,y);g.quadraticCurveTo(x+3,y-4,x+9,y-f);g.stroke()}
 g.fillStyle='#b8ffb0';for(let k=0;k<3;k++){g.globalAlpha=.06;g.beginPath();g.ellipse(((t*5+k*140)%(BW+200))-50,170+k*24,120,12,0,0,TAU);g.fill()}g.globalAlpha=1;
 for(let i=0;i<32;i++){const p=(t*.06*(.5+rd(i))+rd(i+2))%1;dt_(g,rd(i)*BW+Math.sin(t+i)*10,BH-p*BH,1.6,i%2?'#b8ff3a':'#fff7a0',Math.sin(p*3.14)*.9)}},
function(g,t){vgr(g,'#04010f','#12053a');for(let k=0;k<3;k++)glw(g,BW*(.3+k*.25)+Math.sin(t*.2+k)*20,60+k*60,190,k%2?'#a64dff':'#ff4dff',.25);
 g.fillStyle='#fff';for(let i=0;i<90;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*.9+i));g.fillRect((rd(i)*BW+t*(2+rd(i+80)*5))%BW,rd(i+60)*BH,1.2+rd(i+70),1.2)}g.globalAlpha=1;
 g.save();g.translate(90,165);g.rotate(t*.3);g.scale(1,.6);for(let j=0;j<90;j++)for(let a=0;a<2;a++){const ang=j*.22+a*3.14,r=j*.9;g.globalAlpha=.9-j/110;g.fillStyle=j%3?'#ff9cff':'#9cd8ff';g.fillRect(Math.cos(ang)*r,Math.sin(ang)*r,2,2)}g.restore();g.globalAlpha=1;glw(g,90,165,26,'#fff',.8);
 const pg=g.createRadialGradient(305,78,2,310,82,36);pg.addColorStop(0,'#9a5aff');pg.addColorStop(1,'#1a0a4a');g.fillStyle=pg;g.beginPath();g.arc(310,80,34,0,TAU);g.fill();g.strokeStyle='#ff4dff';g.lineWidth=4;g.globalAlpha=.8;g.beginPath();g.ellipse(310,80,60,14,-.4,0,TAU);g.stroke();g.globalAlpha=1;
 for(let k=0;k<2;k++){const f=(t*.3+k*.5)%1;if(f<.3){const q=f/.3;g.strokeStyle='#fff';g.globalAlpha=1-q;g.lineWidth=2;g.beginPath();g.moveTo(20+k*160+q*220,20+q*120);g.lineTo(20+k*160+q*220-36,20+q*120-20);g.stroke()}}g.globalAlpha=1},
function(g,t){vgr(g,'#0a0204','#3a0610','#1a0308');glw(g,200,56,150,'#ff2233',.35);dt_(g,200,56,30,'#ff4a3a',.95);dt_(g,190,50,5,'#c02a22',.6);dt_(g,210,62,7,'#c02a22',.5);
 g.fillStyle='#1a0408';for(let k=0;k<4;k++){g.globalAlpha=.5;g.beginPath();g.ellipse(((t*8+k*120)%(BW+200))-60,40+k*24,90,9,0,0,TAU);g.fill()}g.globalAlpha=1;
 const f=t%4.4;if(f<.14||(f>.26&&f<.34)){g.fillStyle='rgba(255,60,70,.3)';g.fillRect(0,0,BW,BH);g.strokeStyle='#fff';g.lineWidth=2.4;g.beginPath();let x=60+rd(Math.floor(t/4.4))*280;g.moveTo(x,0);for(let s=1;s<=8;s++){x+=(rd(s+Math.floor(t))-.5)*50;g.lineTo(x,s*BH/8)}g.stroke()}
 const C='#080103';g.fillStyle=C;g.fillRect(120,120,160,100);for(const tx of [112,288]){g.fillStyle=C;g.fillRect(tx-14,90,28,130);tri(g,tx,90,36,30,C)}tri(g,200,120,60,40,C);g.fillStyle=C;g.fillRect(70,150,36,70);g.fillRect(294,150,36,70);for(let k=0;k<9;k++)g.fillRect(122+k*18,112,10,10);
 g.fillStyle='#ffb030';for(let k=0;k<9;k++){g.globalAlpha=.5+.5*Math.sin(t*3+k*2);g.fillRect(128+(k%5)*26,138+Math.floor(k/5)*24,5,9)}
 g.fillStyle='#ff6a1a';g.globalAlpha=.7+.2*Math.sin(t*5);g.beginPath();g.moveTo(186,220);g.lineTo(186,190);g.quadraticCurveTo(200,172,214,190);g.lineTo(214,220);g.fill();g.globalAlpha=1;
 g.fillStyle=C;g.fillRect(0,220,BW,30);
 g.strokeStyle='#000';g.lineWidth=1.8;for(let k=0;k<6;k++){const x=((t*(26+k*5)+k*70)%(BW+60))-30,y=40+k*20+Math.sin(t*2+k)*8,fl=Math.sin(t*14+k*2)*4;g.beginPath();g.moveTo(x-8,y-fl);g.quadraticCurveTo(x-3,y-3,x,y);g.quadraticCurveTo(x+3,y-3,x+8,y-fl);g.stroke()}
 for(let i=0;i<36;i++){const p=(t*.14*(.5+rd(i))+rd(i+3))%1;dt_(g,rd(i)*BW+Math.sin(t+i)*8,BH-p*BH,1+rd(i+9)*1.8,i%2?'#ffb030':'#ff3b1f',1-p)}}];
const GBc=document.createElement('canvas');GBc.width=800;GBc.height=500;
const GS=document.createElement('canvas');GS.width=BW;GS.height=BH;
const gg=GBc.getContext('2d'),gs=GS.getContext('2d');let gfr=0,gz=-1;
function zoneBg(){
 const z=Math.min(9,Math.max(0,Math.floor((lvl-1)/10)));gfr++;
 if((!SET.red&&gfr%2===0)||gz!==z){gz=z;
  gs.setTransform(1,0,0,1,0,0);gs.globalAlpha=1;gs.globalCompositeOperation='source-over';
  gs.save();ZS[z](gs,SET.red?0:performance.now()/1000);gs.restore();
  gg.setTransform(1,0,0,1,0,0);gg.globalAlpha=1;gg.globalCompositeOperation='source-over';
  gg.drawImage(GS,0,0,800,500);gg.fillStyle='rgba(2,3,12,.34)';gg.fillRect(0,0,800,500);
  gg.save();gg.strokeStyle=ZC[z];gg.globalAlpha=.9;gg.lineWidth=4;gg.shadowColor=ZC[z];gg.shadowBlur=14;gg.strokeRect(14,14,772,472);gg.restore()}
 BGC=GBc}

/* ---------- EN LA PARTIDA ---------- */
const _dg=drawGame;
drawGame=function(dt){
 try{const e=prof.eq||{};if(!two&&(mode==='play'||mode==='over')&&!e.tb&&!e.bd)zoneBg()}catch(er){}
 _dg(dt);
 try{
  if((mode==='play'||mode==='over')&&P&&P[0]){
   const id=(prof.eq||{}).pad;
   if(id&&DES[id]){
    let al=1;
    if(evOn('apagon')){const ph=evT%4;if(ph>2.3&&ph<3.7)al=1-Math.min(1,Math.min(ph-2.3,3.7-ph)*6)}
    if(al>.02){const p=P[0];x.save();x.globalAlpha=al;drawPad(x,32,p.y,14,p.h,DES[id],performance.now()/1000,true);
     if(p.slow>0){x.globalAlpha=al*.5;x.fillStyle='#7fe3ff';rr(x,25,p.y-p.h/2,14,p.h,7);x.fill()}
     x.restore()}}}
 }catch(er){}};
})();



/* ===== D.M.R v26: 10 MUNDOS + TARJETAS / EFECTOS DE PERFIL / MARCOS ANIMADOS ===== */
(function(){
if(window.__dmr26)return;window.__dmr26=1;
const TAU=6.283185;
const rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)};
function star4(g,R,w){g.beginPath();for(let k=0;k<8;k++){const q=k%2?R*w:R,a=k*.7854-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}
function glint(g,x,y,R,c){g.save();g.translate(x,y);g.fillStyle=c||'#fff';g.shadowColor=c||'#fff';g.shadowBlur=R;star4(g,R,.18);g.fill();g.restore()}
function halo(g,cx,cy,r0,r1,c,a){g.save();g.globalAlpha=a;g.globalCompositeOperation='lighter';const q=g.createRadialGradient(cx,cy,r0,cx,cy,r1);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(cx,cy,r1,0,TAU);g.fill();g.restore()}

/* =====================================================================
   PARTE 1 · LOS 10 MUNDOS (400x250 → se escala a la cancha)
   ===================================================================== */
const WW=400,WH=250;
const WN=['CIUDAD NEÓN','SELVA MISTERIOSA','DESIERTO EGIPCIO','FONDO DEL OCÉANO','ESPACIO GALÁCTICO','TIERRA DE FUEGO','MONTAÑAS HELADAS','TOKIO NOCTURNO','INFIERNO','MUNDO LEGENDARIO'];
const WCOL=['#c040ff','#19e68c','#ffb040','#00d0ff','#8a5bff','#ff4a1a','#7fe3ff','#ff3df2','#ff2233','#ffd45a'];
const WDK=[.32,.3,.26,.3,.3,.3,.3,.32,.3,.5];
function wv(g,s){const q=g.createLinearGradient(0,0,0,WH);s.forEach(a=>q.addColorStop(a[0],a[1]));g.fillStyle=q;g.fillRect(0,0,WW,WH)}
const wg=(g,x,y,r,c,a)=>halo(g,x,y,0,r,c,a);
function wd(g,x,y,r,c,a){g.globalAlpha=Math.max(0,Math.min(1,a));g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.globalAlpha=1}
function wridge(g,base,amp,sc,ph,col,sd){g.fillStyle=col;g.beginPath();g.moveTo(0,WH);for(let x=0;x<=WW;x+=5){const n=x*sc+ph;g.lineTo(x,base-amp*Math.abs(Math.sin(n)+Math.sin(n*2.3+sd)*.5))}g.lineTo(WW,WH);g.closePath();g.fill()}
function wstars(g,t,n,ym){g.fillStyle='#fff';for(let i=0;i<n;i++){g.globalAlpha=.25+.75*Math.abs(Math.sin(t*(.5+rd(i)*1.5)+i));const s=1+rd(i+30)*1.3;g.fillRect(rd(i)*WW,rd(i+50)*ym,s,s)}g.globalAlpha=1}
function wrain(g,t,n,col,a,sl){g.strokeStyle=col;g.globalAlpha=a;g.lineWidth=1;for(let i=0;i<n;i++){const p=(t*(1.1+rd(i)*.5)+rd(i+2))%1,x=((rd(i)*(WW+60)+p*sl)%(WW+60))-30,y=p*WH;g.beginPath();g.moveTo(x,y);g.lineTo(x-sl*.1,y+12);g.stroke()}g.globalAlpha=1}
function wrise(g,t,n,sp,cols,r0,up){for(let i=0;i<n;i++){const p=(t*sp*(.5+rd(i))+rd(i+3))%1,x=rd(i+9)*WW+Math.sin(t+i)*8,y=up?WH-p*WH:p*WH;wd(g,x,y,r0*(.6+rd(i+5)),cols[i%cols.length],(1-p)*.9)}}
function wfog(g,t,y,col,a,n){g.fillStyle=col;g.globalAlpha=a;for(let k=0;k<n;k++){g.beginPath();g.ellipse(((t*(5+k*2)+k*140)%(WW+260))-80,y+k*12,110,10,0,0,TAU);g.fill()}g.globalAlpha=1}
function wbld(g,base,t,col,edge,seed,n,hmin,hmax,wc){const bw=WW/n;for(let k=0;k<n;k++){const h=hmin+rd(k+seed)*(hmax-hmin),x=k*bw;g.fillStyle=col;g.fillRect(x,base-h,bw+1,h+WH);g.fillStyle=edge[k%edge.length];g.globalAlpha=.9;g.fillRect(x,base-h,bw+1,1.4);g.globalAlpha=1;for(let q=0;q<12;q++){if(Math.sin(t*.5+q*3.7+k*2+seed)>-.3){g.fillStyle=wc[q%wc.length];g.globalAlpha=.7;g.fillRect(x+3+(q%3)*((bw-6)/3),base-h+5+Math.floor(q/3)*9,2.6,4);g.globalAlpha=1}}if(rd(k+seed+40)>.7){g.fillStyle=edge[k%edge.length];g.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+k));g.fillRect(x+bw*.4,base-h-6,1.6,6);g.globalAlpha=1}}}

function w1(g,t){wv(g,[[0,'#04041a'],[.5,'#1a0a40'],[1,'#3a0a5a']]);wg(g,310,64,120,'#6a3bff',.4);wd(g,310,64,26,'#2a2070',1);wd(g,318,58,22,'#4a3aa8',.4);
 for(let k=0;k<3;k++){g.fillStyle='rgba(130,90,255,.1)';g.beginPath();g.ellipse(((t*7+k*160)%(WW+260))-80,40+k*26,120,10,0,0,TAU);g.fill()}wstars(g,t,24,90);
 wbld(g,170,t,'#0a0a34',['#2a9bff','#c040ff'],1,10,40,95,['#7fe3ff','#ffe9a0']);
 const fl=rd(Math.floor(t*12))>.15?1:.45;g.save();g.globalAlpha=.22*fl;g.fillStyle='#00e5ff';g.beginPath();g.moveTo(120,205);g.lineTo(98,118);g.lineTo(142,118);g.closePath();g.fill();g.globalAlpha=.7*fl;g.strokeStyle='#7ff6ff';g.lineWidth=1.4;g.beginPath();g.ellipse(120,112,18,5,0,0,TAU);g.stroke();g.restore();
 wbld(g,205,t,'#060624',['#ff3df2','#2a9bff','#7a4bff'],7,8,50,120,['#ffe9a0','#ff9cff']);
 [[44,100,16,34,'#ff3df2'],[346,108,18,40,'#00e5ff'],[210,120,14,30,'#ffd400']].forEach((a,i)=>{g.save();g.strokeStyle=a[4];g.lineWidth=2;g.shadowColor=a[4];g.shadowBlur=8;g.globalAlpha=.6+.4*Math.sin(t*3+i*2);g.strokeRect(a[0],a[1],a[2],a[3]);g.beginPath();g.moveTo(a[0]+3,a[1]+9);g.lineTo(a[0]+a[2]-3,a[1]+9);g.stroke();g.restore()});
 for(let k=0;k<4;k++){const x=((t*(34+k*13)+k*120)%(WW+80))-40,y=46+k*21+Math.sin(t+k)*3,c=k%2?'#ff3df2':'#7fe3ff',q=g.createLinearGradient(x-26,0,x,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,c);g.strokeStyle=q;g.lineWidth=2;g.beginPath();g.moveTo(x-26,y);g.lineTo(x,y);g.stroke();wd(g,x,y,2,'#fff',1)}
 wbld(g,236,t,'#03030f',['#00e5ff'],13,6,45,90,['#ffc070']);
 const st=g.createLinearGradient(0,230,0,WH);st.addColorStop(0,'#14143a');st.addColorStop(1,'#2a0a4a');g.fillStyle=st;g.fillRect(0,230,WW,20);for(let k=0;k<16;k++){g.fillStyle=['#ff3df2','#00e5ff','#ffd400','#b44dff'][k%4];g.globalAlpha=.2+.2*Math.sin(t*2+k);g.fillRect(k*26+4,230,3,20)}g.globalAlpha=1;
 wfog(g,t,214,'#8a6aff',.08,3);wrain(g,t,50,'#bfe0ff',.3,20)}
function w2(g,t){wv(g,[[0,'#06301f'],[.45,'#0a5a3a'],[1,'#021a10']]);wg(g,110,-10,230,'#d8ffb0',.45);
 g.save();g.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const x=30+k*80+Math.sin(t*.3+k)*14;g.fillStyle='rgba(220,255,160,'+(.07+.03*Math.sin(t+k))+')';g.beginPath();g.moveTo(x,0);g.lineTo(x+26,0);g.lineTo(x+110,WH);g.lineTo(x-24,WH);g.closePath();g.fill()}g.restore();
 wridge(g,150,22,.03,1,'#0a4a30',2);
 for(let s=0;s<5;s++){g.fillStyle='#0c3f2c';g.fillRect(262+s*11,150-(s+1)*13,110-s*22,13);g.fillStyle='rgba(60,255,150,.22)';g.fillRect(262+s*11,150-(s+1)*13,110-s*22,2)}
 g.fillStyle='#03140c';g.fillRect(308,122,20,28);wg(g,318,134,26,'#2aff9a',.3+.15*Math.sin(t*2));
 g.fillStyle='rgba(230,255,255,.12)';g.fillRect(170,55,34,140);for(let i=0;i<20;i++){const p=(t*(.9+rd(i)*.6)+rd(i+4))%1;g.fillStyle='rgba(255,255,255,.75)';g.fillRect(172+rd(i)*30,55+p*140,1.4,14)}g.fillStyle='rgba(220,255,255,.35)';g.beginPath();g.ellipse(187,196,40+4*Math.sin(t*3),9,0,0,TAU);g.fill();
 [[28,26],[92,18],[336,24],[388,20]].forEach((a,i)=>{g.fillStyle='#041a10';g.fillRect(a[0]-a[1]/2,0,a[1],WH);for(let j=0;j<4;j++){const cx=a[0]+Math.sin(t*.7+i+j)*5+(j-1.5)*18,cy=18+j*10;g.fillStyle=j%2?'#0a4a2a':'#073a22';g.beginPath();g.arc(cx,cy,30+j*3,0,TAU);g.fill()}});
 g.strokeStyle='#1a8a3a';g.lineWidth=2;for(let k=0;k<7;k++){const x0=50+k*50;g.beginPath();g.moveTo(x0,0);g.bezierCurveTo(x0+Math.sin(t+k)*10,40,x0-Math.sin(t*.8+k)*12,80,x0+Math.sin(t*.7+k)*9,110+rd(k)*30);g.stroke()}
 const rv=g.createLinearGradient(0,205,0,WH);rv.addColorStop(0,'#13d9c4');rv.addColorStop(1,'#04403a');g.fillStyle=rv;g.fillRect(0,205,WW,45);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();for(let x=0;x<=WW;x+=6){const y=212+k*9+Math.sin(x*.05+t*2+k)*1.5;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 for(let k=0;k<8;k++)wg(g,20+k*52,206,22,k%2?'#2aff9a':'#4ad8ff',.4+.25*Math.sin(t*2+k));
 wfog(g,t,190,'#c8ffe0',.07,3);
 for(let i=0;i<30;i++)wd(g,rd(i)*WW+Math.sin(t*.8+i)*16,rd(i+3)*WH+Math.cos(t*.6+i)*10,1.7,i%3?'#d8ff5a':'#fff7a0',.25+.75*Math.abs(Math.sin(t*1.5+i*2)))}
function w3(g,t){wv(g,[[0,'#3a1a50'],[.4,'#d06a1a'],[.75,'#ffc060'],[1,'#a05a14']]);wg(g,200,150,190,'#fff0a0',.7);wd(g,200,150,34,'#fff7c8',.95);
 wridge(g,170,26,.025,0,'#9a4818',1);
 const pyr=(x,b,w,h)=>{g.fillStyle='#e8903a';g.beginPath();g.moveTo(x-w/2,b);g.lineTo(x,b-h);g.lineTo(x,b);g.closePath();g.fill();g.fillStyle='#7a3812';g.beginPath();g.moveTo(x,b-h);g.lineTo(x+w/2,b);g.lineTo(x,b);g.closePath();g.fill()};
 pyr(90,190,150,100);pyr(310,192,160,110);pyr(205,186,80,52);
 [[150,190],[262,190]].forEach(a=>{g.fillStyle='#8a4210';g.fillRect(a[0]-3,a[1]-44,6,44);g.beginPath();g.moveTo(a[0]-3,a[1]-44);g.lineTo(a[0],a[1]-52);g.lineTo(a[0]+3,a[1]-44);g.fill()});
 g.fillStyle='#7a3a12';for(let k=0;k<12;k++){const h=8+rd(k)*14;g.fillRect(170+k*10,192-h,8,h)}
 const dn=(base,amp,ph,col)=>{g.fillStyle=col;g.beginPath();g.moveTo(0,WH);for(let x=0;x<=WW;x+=5)g.lineTo(x,base+Math.sin(x*.014+ph)*amp+Math.sin(x*.035+ph*2)*amp*.3);g.lineTo(WW,WH);g.fill()};
 dn(196,10,t*.02,'#c07a2a');dn(214,12,2+t*.03,'#8a4a14');
 const gd=(x,s)=>{g.save();g.translate(x,206);g.scale(s,1);g.fillStyle='#1e0c04';g.fillRect(-9,-40,18,40);g.beginPath();g.arc(0,-48,7,0,TAU);g.fill();g.beginPath();g.moveTo(-12,-56);g.lineTo(12,-56);g.lineTo(16,-36);g.lineTo(-16,-36);g.closePath();g.fill();g.fillRect(-18,-6,36,6);g.restore()};
 gd(34,1);gd(366,-1);dn(232,8,5+t*.04,'#2a1006');
 [58,342].forEach((x,i)=>{g.fillStyle='#1e0c04';g.fillRect(x-1.5,206,3,26);const f=1+.25*Math.sin(t*12+i*3);wg(g,x,202,26,'#ffb030',.6);g.fillStyle='#ffd060';g.beginPath();g.ellipse(x,202,3.4*f,6*f,0,0,TAU);g.fill()});
 g.fillStyle='#ffe0a0';for(let i=0;i<50;i++){const x=((t*(80+rd(i)*90)+rd(i+3)*WW)%(WW+20))-10;g.globalAlpha=.3;g.fillRect(x,150+rd(i+5)*95,8+rd(i)*10,1)}g.globalAlpha=1;
 g.strokeStyle='rgba(255,240,180,.14)';g.lineWidth=1.4;for(let k=0;k<3;k++){g.beginPath();for(let x=0;x<=WW;x+=5){const y=188+k*3+Math.sin(x*.07+t*3+k)*1.6;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 for(let i=0;i<30;i++)wd(g,rd(i)*WW+Math.sin(t+i)*8,rd(i+7)*WH,1.2,'#ffe9b0',.25+.2*Math.sin(t*2+i))}
function w4(g,t){wv(g,[[0,'#0a7ab0'],[.35,'#04406e'],[1,'#010a1a']]);g.save();g.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const x=20+k*85+Math.sin(t*.5+k)*16;g.fillStyle='rgba(120,230,255,.09)';g.beginPath();g.moveTo(x,0);g.lineTo(x+24,0);g.lineTo(x+100,WH);g.lineTo(x-34,WH);g.closePath();g.fill()}g.restore();
 g.strokeStyle='#cfefff';g.lineWidth=1.4;for(let k=0;k<3;k++){g.globalAlpha=.2-k*.05;g.beginPath();for(let x=0;x<=WW;x+=6){const y=12+k*9+Math.sin(x*.04+t*1.4+k)*3;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.globalAlpha=1;
 wridge(g,195,30,.035,2,'#032a4a',1);
 g.fillStyle='#07304e';g.fillRect(120,178,130,22);for(let i=0;i<5;i++)g.fillRect(126+i*26,148,8,30);g.beginPath();g.moveTo(116,150);g.lineTo(185,128);g.lineTo(254,150);g.closePath();g.fill();for(let k=0;k<10;k++)g.fillRect(262+k*8,170-rd(k)*22,6,40);wg(g,185,160,40,'#00e5ff',.2+.1*Math.sin(t*2));
 for(let i=0;i<6;i++){g.fillStyle='#00e5ff';g.globalAlpha=.5+.4*Math.sin(t*2+i);g.fillRect(132+i*22,160,3,5)}g.globalAlpha=1;
 g.save();g.translate(330,196);g.rotate(-.22);g.fillStyle='#04182c';g.beginPath();g.moveTo(-50,0);g.lineTo(50,0);g.lineTo(38,22);g.lineTo(-40,22);g.closePath();g.fill();g.fillRect(-4,-60,3,60);g.fillRect(18,-44,3,44);g.beginPath();g.moveTo(-3,-58);g.lineTo(-30,-26);g.lineTo(-3,-30);g.fill();g.restore();
 g.lineCap='round';for(let k=0;k<12;k++){const x=k*34+10,c=['#ff5a8a','#ff9a3a','#b44dff'][k%3];g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.moveTo(x,WH);g.quadraticCurveTo(x+Math.sin(t*1.2+k)*5,WH-18,x+Math.sin(t+k)*7,WH-30-rd(k)*14);g.stroke();wd(g,x+Math.sin(t+k)*7,WH-30-rd(k)*14,3.5,c,.9)}
 g.strokeStyle='#19e68c';g.lineWidth=2.4;for(let k=0;k<9;k++){const x=16+k*46;g.beginPath();g.moveTo(x,WH);for(let y=0;y<=40;y+=5)g.lineTo(x+Math.sin(y*.15-t*1.6+k)*5,WH-y);g.stroke()}
 for(let s=0;s<3;s++)for(let f=0;f<6;f++){const bx=((t*(20+s*7)+s*130)%(WW+80))-40-f*9,by=70+s*38+Math.sin(t*1.3+f+s)*6+(f%2)*7;g.fillStyle=['#ffd24a','#9fe9ff','#ff8aa0'][s];g.globalAlpha=.7;g.beginPath();g.ellipse(bx,by,5,2.2,0,0,TAU);g.fill();g.beginPath();g.moveTo(bx-4,by);g.lineTo(bx-9,by-3);g.lineTo(bx-9,by+3);g.fill()}g.globalAlpha=1;
 const mx=((t*14)%(WW+120))-60,my=110+Math.sin(t*.8)*10,fl=Math.sin(t*3)*6;g.fillStyle='rgba(20,40,90,.8)';g.beginPath();g.moveTo(mx,my);g.quadraticCurveTo(mx-26,my-fl-10,mx-34,my+4);g.quadraticCurveTo(mx-12,my+3,mx,my+14);g.quadraticCurveTo(mx+12,my+3,mx+34,my+4);g.quadraticCurveTo(mx+26,my-fl-10,mx,my);g.fill();
 const tx=((t*9+200)%(WW+80))-40,ty=150+Math.sin(t*.7)*6;g.fillStyle='#2a8a5a';g.beginPath();g.ellipse(tx,ty,9,6,0,0,TAU);g.fill();g.beginPath();g.ellipse(tx+9,ty,3,2.4,0,0,TAU);g.fill();g.fillRect(tx-3,ty+4+Math.sin(t*4)*1.5,3,5);
 g.strokeStyle='rgba(200,240,255,.55)';g.lineWidth=1;for(let i=0;i<28;i++){const p=(t*.08*(.6+rd(i))+rd(i+2))%1;g.beginPath();g.arc(rd(i)*WW+Math.sin(t+i)*5,WH-p*WH,1.5+rd(i+4)*3,0,TAU);g.stroke()}
 wg(g,200,250,170,'#6a3bff',.3)}
function w5(g,t){wv(g,[[0,'#02010c'],[1,'#10053a']]);wg(g,100,70,150,'#2a6bff',.35);wg(g,320,150,170,'#ff3df2',.3);wg(g,220,40,120,'#8a5bff',.3);wstars(g,t,70,WH);
 g.save();g.translate(110,95);g.rotate(t*.12);g.scale(1,.5);for(let j=0;j<110;j++)for(let a=0;a<2;a++){const an=j*.2+a*3.1416,r=j*.9;g.globalAlpha=.9-j/130;g.fillStyle=j%3?'#ff9cff':'#9cd8ff';g.fillRect(Math.cos(an)*r,Math.sin(an)*r,1.8,1.8)}g.restore();g.globalAlpha=1;wg(g,110,95,30,'#fff',.8);
 const pg=g.createRadialGradient(305,88,3,310,92,38);pg.addColorStop(0,'#c09aff');pg.addColorStop(1,'#1a0a4a');g.fillStyle=pg;g.beginPath();g.arc(310,90,36,0,TAU);g.fill();g.strokeStyle='rgba(255,170,255,.75)';g.lineWidth=4;g.beginPath();g.ellipse(310,90,62,14,-.4,0,TAU);g.stroke();
 wd(g,200,200,12,'#8a8aa0',1);wd(g,196,197,3,'#6a6a80',1);
 for(let k=0;k<7;k++){const x=((t*(5+k*2)+k*70)%(WW+60))-30,y=40+k*28;g.save();g.translate(x,y);g.rotate(t*.5+k);g.fillStyle='#3a3050';g.beginPath();for(let i=0;i<6;i++){const a=i*1.047,r=4+rd(k*3+i)*4;g[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.restore()}
 g.fillStyle='#1a1630';g.fillRect(36,190,50,4);g.fillRect(58,178,6,26);g.fillRect(30,184,12,16);g.fillRect(80,184,12,16);wd(g,61,176,2,'#ff3b3b',.4+.6*Math.abs(Math.sin(t*3)));
 const f=(t*.3)%1;if(f<.2){const k=f/.2;g.strokeStyle='#fff';g.globalAlpha=1-k;g.lineWidth=1.6;g.beginPath();g.moveTo(40+k*260,20+k*80);g.lineTo(40+k*260-30,20+k*80-14);g.stroke();g.globalAlpha=1}
 wrise(g,t,24,.08,['#9cd8ff','#ff9cff'],1.2,true)}
function w6(g,t){wv(g,[[0,'#1a0204'],[.5,'#7a1204'],[1,'#ff5a00']]);wg(g,200,170,230,'#ff6a00',.5+.12*Math.sin(t*2));wfog(g,t,50,'#2a0a08',.5,3);wridge(g,170,34,.03,1,'#120304',2);
 g.fillStyle='#140304';g.beginPath();g.moveTo(40,200);g.lineTo(150,92);g.lineTo(175,92);g.lineTo(290,200);g.closePath();g.fill();
 g.save();g.strokeStyle='#ff6a00';g.lineWidth=2.4;g.shadowColor='#ff6a00';g.shadowBlur=8;[[162,94,130,150,110,196],[165,96,190,150,214,196],[160,96,162,140,160,196]].forEach(a=>{g.globalAlpha=.6+.4*Math.sin(t*3+a[0]);g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo(a[2],a[3],a[4],a[5]);g.stroke()});g.restore();
 wg(g,162,92,50,'#ffb000',.8+.2*Math.sin(t*5));
 for(let i=0;i<46;i++){const p=(t*.5*(.7+rd(i)*.5)+rd(i+3))%1,a=-1.57+(rd(i+7)-.5)*1.3,v=90+rd(i+5)*80;wd(g,162+Math.cos(a)*v*p,92+Math.sin(a)*v*p+160*p*p,1.4+rd(i)*1.6,i%2?'#ffd060':'#ff5a1a',1-p)}
 for(let i=0;i<8;i++){const p=(t*.12+i/8)%1;wd(g,162+Math.sin(i*2+t)*14+p*50,92-p*100,8+p*18,'#2a1a1a',(1-p)*.5)}
 g.fillStyle='#120304';g.beginPath();g.moveTo(290,205);g.lineTo(340,150);g.lineTo(352,150);g.lineTo(400,205);g.closePath();g.fill();wg(g,346,150,24,'#ff7a1a',.6);
 const lv=g.createLinearGradient(0,205,0,WH);lv.addColorStop(0,'#ffb000');lv.addColorStop(1,'#d01800');g.fillStyle=lv;g.beginPath();g.moveTo(0,WH);for(let x=0;x<=WW;x+=6)g.lineTo(x,214+Math.sin(x*.04+t*1.6)*4+Math.sin(x*.11+t*2.4)*1.5);g.lineTo(WW,WH);g.fill();
 g.strokeStyle='#fff0a0';g.lineWidth=1;g.globalAlpha=.4;for(let k=0;k<3;k++){g.beginPath();for(let x=0;x<=WW;x+=6){const y=224+k*7+Math.sin(x*.05+t*2+k)*2;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.globalAlpha=1;
 wrise(g,t,44,.14,['#ffd060','#ff7a1a','#ff3b1f'],1.5,true);
 for(let i=0;i<20;i++){const p=(t*.07*(.5+rd(i+40))+rd(i+41))%1;wd(g,rd(i+42)*WW,p*WH*.8,1.2,'#9a8a8a',.4)}
 if((t*.7)%1<.1){g.fillStyle='rgba(255,200,80,.18)';g.fillRect(0,0,WW,WH)}}
function w7(g,t){wv(g,[[0,'#02142a'],[.5,'#0a3a5a'],[1,'#04182a']]);wstars(g,t,50,110);
 g.save();g.globalCompositeOperation='lighter';g.lineCap='round';for(let k=0;k<3;k++){g.strokeStyle=['#7affc8','#7fe3ff','#c07aff'][k];g.globalAlpha=.22;g.lineWidth=26;g.beginPath();for(let x=0;x<=WW;x+=8){const y=44+k*20+Math.sin(x*.02+t*.7+k*2)*22;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.restore();
 const mt=(base,amp,sc,ph,col,cap,sd)=>{wridge(g,base,amp,sc,ph,cap,sd);wridge(g,base+13,amp,sc,ph,col,sd)};
 mt(150,66,.028,1,'#1a4a72','#e8f6ff',2);mt(185,52,.04,3,'#2a6a98','#ffffff',4);
 g.fillStyle='rgba(120,220,255,.25)';g.beginPath();g.moveTo(250,200);g.lineTo(290,150);g.lineTo(330,200);g.fill();
 g.fillStyle='#02101e';g.beginPath();g.ellipse(330,198,26,18,0,Math.PI,TAU);g.fill();wg(g,330,196,30,'#4de1ff',.35+.15*Math.sin(t*2));
 const lk=g.createLinearGradient(0,208,0,WH);lk.addColorStop(0,'#9fe9ff');lk.addColorStop(1,'#1a5a88');g.fillStyle=lk;g.fillRect(0,208,WW,42);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;for(let k=0;k<6;k++){g.beginPath();g.moveTo(rd(k)*WW,208);g.lineTo(rd(k)*WW+(rd(k+3)-.5)*60,WH);g.stroke()}
 const sx=((t*.4)%1.4-.2)*WW;g.save();g.fillStyle='rgba(255,255,255,.25)';g.translate(sx,0);g.rotate(.3);g.fillRect(0,200,16,80);g.restore();
 for(let i=0;i<9;i++){const q=Math.floor(t*2+i);g.globalAlpha=Math.abs(Math.sin(t*6+i));glint(g,rd(q+i*3)*WW,205+rd(q*3+i)*40,3,'#fff')}g.globalAlpha=1;
 g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;for(let i=0;i<70;i++){const p=(t*.45*(.6+rd(i))+rd(i+3))%1,x=(rd(i)*(WW+80)+p*80)%(WW+80)-40,y=p*WH;g.beginPath();g.moveTo(x,y);g.lineTo(x-8,y+5);g.stroke()}
 wfog(g,t,170,'#e8f6ff',.07,3)}
function w8(g,t){wv(g,[[0,'#14042a'],[.5,'#4a0a5a'],[1,'#2a0a3a']]);wg(g,90,60,120,'#ff5aa0',.4);wd(g,90,60,22,'#ffb0d0',.9);
 wbld(g,170,t,'#10062a',['#ff3df2','#2a9bff'],21,10,40,100,['#ff9cff','#7fe3ff']);
 const px=290;g.fillStyle='#10031c';for(let i=0;i<4;i++){const y=190-i*28,w2=70-i*12;g.fillRect(px-w2*.32,y-14,w2*.64,16);g.beginPath();g.moveTo(px-w2*.7,y-14);g.quadraticCurveTo(px-w2*.4,y-14,px,y-26);g.quadraticCurveTo(px+w2*.4,y-14,px+w2*.7,y-14);g.quadraticCurveTo(px+w2*.5,y-10,px+w2*.7,y-8);g.lineTo(px-w2*.7,y-8);g.quadraticCurveTo(px-w2*.5,y-10,px-w2*.7,y-14);g.fill();wd(g,px-w2*.2,y-6,2,'#ff3b3b',.8);wd(g,px+w2*.2,y-6,2,'#ff3b3b',.8)}g.fillRect(px-1,70,2,22);
 wbld(g,215,t,'#08021a',['#00e5ff','#ff3df2','#b44dff'],27,8,50,110,['#ff9cff','#ffe9a0']);
 [[40,110,12,40],[352,120,14,46],[150,128,10,30]].forEach((a,i)=>{g.save();g.strokeStyle=['#ff3df2','#00e5ff','#ffd400'][i];g.lineWidth=2;g.shadowColor=g.strokeStyle;g.shadowBlur=8;g.globalAlpha=.6+.4*Math.sin(t*3+i*2);g.strokeRect(a[0],a[1],a[2],a[3]);g.beginPath();g.moveTo(a[0]+3,a[1]+8);g.lineTo(a[0]+a[2]-3,a[1]+8);g.moveTo(a[0]+3,a[1]+18);g.lineTo(a[0]+a[2]-3,a[1]+18);g.stroke();g.restore()});
 g.strokeStyle='#3a1a4a';g.lineWidth=1.4;g.beginPath();for(let x=0;x<=WW;x+=8){const y=96+10*Math.sin(x/WW*3.14);x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
 for(let k=0;k<12;k++){const x=k*34+12,y=96+10*Math.sin(x/WW*3.14)+Math.sin(t*1.5+k)*2;wg(g,x,y+6,14,'#ff3b3b',.6);g.fillStyle='#ff4a3a';g.beginPath();g.ellipse(x,y+6,4,5.5,0,0,TAU);g.fill()}
 const st=g.createLinearGradient(0,226,0,WH);st.addColorStop(0,'#1a0a30');st.addColorStop(1,'#2a0a4a');g.fillStyle=st;g.fillRect(0,226,WW,24);for(let k=0;k<16;k++){g.fillStyle=['#ff3df2','#00e5ff','#ffd400','#b44dff'][k%4];g.globalAlpha=.2+.2*Math.sin(t*2+k);g.fillRect(k*26+4,226,3,24)}g.globalAlpha=1;
 for(let k=0;k<5;k++)for(let i=0;i<5;i++){const p=(t*.25+i/5)%1;wd(g,40+k*80+Math.sin(p*6+k)*5,226-p*50,4+p*10,'#d8c0f0',(1-p)*.22)}
 wrain(g,t,60,'#e0c8ff',.3,30)}
function w9(g,t){wv(g,[[0,'#060102'],[.5,'#3a0508'],[1,'#8a1004']]);
 for(let k=0;k<5;k++){g.fillStyle='rgba(90,10,12,.5)';g.beginPath();g.ellipse(((t*9+k*130)%(WW+260))-80,30+k*22,110,12,0,0,TAU);g.fill()}
 wg(g,200,175,220,'#ff2010',.5);wridge(g,175,40,.03,.5,'#0a0204',3);
 const C='#050102';g.fillStyle=C;g.fillRect(110,118,180,92);for(let k=0;k<12;k++)g.fillRect(112+k*15,110,9,10);
 [[100,70],[160,60],[200,40],[240,60],[300,70]].forEach(a=>{g.fillRect(a[0]-10,a[1],20,210-a[1]);g.beginPath();g.moveTo(a[0]-14,a[1]);g.lineTo(a[0],a[1]-26);g.lineTo(a[0]+14,a[1]);g.fill()});
 g.fillStyle='#ffb030';for(let k=0;k<14;k++){g.globalAlpha=.4+.6*Math.abs(Math.sin(t*3+k*2));g.fillRect(104+(k%5)*50+(k>9?6:0),90+Math.floor(k/5)*22,4,8)}g.globalAlpha=1;
 g.fillStyle='#ff6a1a';g.globalAlpha=.7+.2*Math.sin(t*5);g.beginPath();g.moveTo(184,210);g.lineTo(184,176);g.quadraticCurveTo(200,152,216,176);g.lineTo(216,210);g.fill();g.globalAlpha=1;
 const lv=g.createLinearGradient(0,208,0,WH);lv.addColorStop(0,'#ff8a00');lv.addColorStop(1,'#c01400');g.fillStyle=lv;g.beginPath();g.moveTo(0,WH);for(let x=0;x<=WW;x+=6)g.lineTo(x,222+Math.sin(x*.05+t*1.8)*3);g.lineTo(WW,WH);g.fill();
 [60,340].forEach(x=>{g.fillStyle='#ff6a1a';for(let k=0;k<10;k++){const p=(t*.7+k/10)%1;g.globalAlpha=.8;g.fillRect(x-2+Math.sin(k)*2,150+p*72,3,8)}g.globalAlpha=1});
 const f=t%4.2;if(f<.14||(f>.26&&f<.34)){g.fillStyle='rgba(255,60,70,.3)';g.fillRect(0,0,WW,WH);g.strokeStyle='#fff';g.lineWidth=2.2;g.beginPath();let x=40+rd(Math.floor(t/4.2))*320;g.moveTo(x,0);for(let s=1;s<=8;s++){x+=(rd(s+Math.floor(t))-.5)*50;g.lineTo(x,s*22)}g.stroke()}
 g.strokeStyle='#000';g.lineWidth=1.8;for(let k=0;k<5;k++){const x=((t*(24+k*5)+k*80)%(WW+60))-30,y=40+k*20+Math.sin(t*2+k)*8,fl=Math.sin(t*14+k*2)*4;g.beginPath();g.moveTo(x-8,y-fl);g.quadraticCurveTo(x-3,y-3,x,y);g.quadraticCurveTo(x+3,y-3,x+8,y-fl);g.stroke()}
 wrise(g,t,40,.14,['#ffb030','#ff3b1f'],1.4,true);for(let i=0;i<14;i++){const p=(t*.06*(.5+rd(i+60))+rd(i+61))%1;wd(g,rd(i+62)*WW,p*WH*.7,1.2,'#7a6a6a',.4)}}
function w10(g,t){wv(g,[[0,'#3a58e8'],[.4,'#9ec0ff'],[.75,'#ffe8b0'],[1,'#ffd890']]);
 g.save();g.translate(200,10);g.globalCompositeOperation='lighter';for(let k=0;k<9;k++){g.rotate(.35);g.fillStyle='rgba(255,240,180,'+(.1+.05*Math.sin(t*1.5+k))+')';g.beginPath();g.moveTo(0,0);g.lineTo(380,-26);g.lineTo(380,26);g.fill()}g.restore();wg(g,200,10,90,'#fff6c0',.8);
 const cl=(y,sp,a,sz)=>{g.fillStyle='rgba(255,255,255,'+a+')';for(let k=0;k<5;k++){const x=((t*sp+k*110)%(WW+200))-100;g.beginPath();g.ellipse(x,y,sz,sz*.28,0,0,TAU);g.ellipse(x+sz*.5,y-sz*.1,sz*.6,sz*.22,0,0,TAU);g.fill()}};
 cl(90,4,.4,60);cl(150,7,.5,70);
 const isl=(x,y,w2,h2,ph)=>{const by=y+Math.sin(t*.8+ph)*4;g.fillStyle='#6a5a8a';g.beginPath();g.moveTo(x-w2,by);g.lineTo(x+w2,by);g.lineTo(x+w2*.2,by+h2);g.lineTo(x-w2*.3,by+h2*.8);g.closePath();g.fill();g.fillStyle='#5ad07a';g.beginPath();g.ellipse(x,by,w2,w2*.18,0,0,TAU);g.fill();return by};
 [[60,110,38,40,1],[345,100,42,46,2],[300,170,28,30,3],[110,175,30,32,4]].forEach((a,i)=>{const by=isl(a[0],a[1],a[2],a[3],a[4]);g.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<8;k++){const p=(t*.9+k/8)%1;g.fillRect(a[0]+(i%2?5:-5)+Math.sin(k)*2,by+a[3]*.7+p*60,1.4,8)}wg(g,a[0]+10,by-6,14,'#9cf0ff',.5);g.fillStyle='#bff6ff';g.beginPath();g.moveTo(a[0]+10,by-12);g.lineTo(a[0]+13,by-4);g.lineTo(a[0]+10,by);g.lineTo(a[0]+7,by-4);g.fill()});
 const cy=isl(200,150,70,60,0);wg(g,200,cy-40,90,'#ffd45a',.5);
 const gq=g.createLinearGradient(0,cy-80,0,cy);gq.addColorStop(0,'#fff3a0');gq.addColorStop(1,'#d09a20');g.fillStyle=gq;g.fillRect(150,cy-30,100,30);[[160,40],[190,56],[200,70],[210,56],[240,40]].forEach(a=>{g.fillRect(a[0]-6,cy-a[1]-10,12,a[1]+10);g.beginPath();g.moveTo(a[0]-8,cy-a[1]-10);g.lineTo(a[0],cy-a[1]-30);g.lineTo(a[0]+8,cy-a[1]-10);g.fill()});g.beginPath();g.arc(200,cy-60,16,Math.PI,0);g.fill();
 g.fillStyle='#fff8d0';for(let k=0;k<6;k++){g.globalAlpha=.5+.5*Math.sin(t*3+k);g.fillRect(160+k*16,cy-20,4,9)}g.globalAlpha=1;
 g.strokeStyle='#ffd45a';g.lineWidth=2;g.beginPath();g.moveTo(98,112);g.quadraticCurveTo(135,92,160,138);g.moveTo(240,138);g.quadraticCurveTo(275,100,310,100);g.stroke();
 g.fillStyle='#ffe9a0';for(let i=0;i<40;i++){const p=(t*.12*(.5+rd(i))+rd(i+3))%1;g.globalAlpha=Math.sin(p*3.14);g.fillRect(rd(i+6)*WW,WH-p*WH,1.8,1.8)}g.globalAlpha=1;
 for(let i=0;i<5;i++){const q=Math.floor(t*1.5+i);g.globalAlpha=Math.abs(Math.sin(t*5+i));glint(g,rd(q+i*3)*WW,rd(q*3+i)*180,4,'#fff')}g.globalAlpha=1}
const WS=[w1,w2,w3,w4,w5,w6,w7,w8,w9,w10];
const WG=document.createElement('canvas');WG.width=800;WG.height=500;
const WS2=document.createElement('canvas');WS2.width=WW;WS2.height=WH;
const wgx=WG.getContext('2d'),wsx=WS2.getContext('2d');let wfr=0,wz=-1,wred=null;
function worldBg(){
 const z=Math.min(9,Math.max(0,Math.floor((lvl-1)/10))),red=!!SET.red;wfr++;
 if((!red&&wfr%2===0)||wz!==z||wred!==red){wz=z;wred=red;
  wsx.setTransform(1,0,0,1,0,0);wsx.globalAlpha=1;wsx.globalCompositeOperation='source-over';
  wsx.save();WS[z](wsx,red?3:performance.now()/1000);wsx.restore();
  wgx.setTransform(1,0,0,1,0,0);wgx.globalAlpha=1;wgx.globalCompositeOperation='source-over';
  wgx.drawImage(WS2,0,0,800,500);wgx.fillStyle='rgba(2,3,12,'+WDK[z]+')';wgx.fillRect(0,0,800,500);
  wgx.save();wgx.strokeStyle=WCOL[z];wgx.globalAlpha=.9;wgx.lineWidth=4;wgx.shadowColor=WCOL[z];wgx.shadowBlur=14;wgx.strokeRect(14,14,772,472);wgx.restore()}
 BGC=WG}
const _dgW=drawGame;
drawGame=function(dt){
 const e=prof.eq||(prof.eq={}),o=e.tb;let sw=false;
 try{if(!two&&(mode==='play'||mode==='over')&&!e.tb&&!e.bd){worldBg();e.tb='__w26';sw=true}}catch(er){}
 try{_dgW(dt)}finally{if(sw){if(o===undefined)delete e.tb;else e.tb=o}}};
/* transición al entrar a un mundo nuevo */
let lastW=-1;
document.head.insertAdjacentHTML('beforeend',`<style>
#w26{position:fixed;inset:0;z-index:47;pointer-events:none;overflow:hidden}
#w26 .a{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#fff 0,var(--c) 38%,#02030c 78%);animation:w26a 2.6s ease-out forwards}
#w26 .t{position:absolute;left:0;right:0;top:38%;text-align:center;font-weight:900;font-size:clamp(26px,9vw,46px);letter-spacing:4px;text-shadow:0 0 26px var(--c);animation:w26t 2.6s ease forwards;opacity:0}
#w26 .t small{display:block;font-size:12px;letter-spacing:8px;color:#fff;margin-bottom:8px}
#w26 .t em{display:block;font-style:normal;font-size:12px;letter-spacing:4px;margin-top:8px;opacity:.9}
@keyframes w26a{0%{clip-path:circle(0% at 50% 50%);opacity:1}45%{clip-path:circle(150% at 50% 50%);opacity:1}100%{clip-path:circle(150% at 50% 50%);opacity:0}}
@keyframes w26t{0%,25%{opacity:0;transform:scale(.7)}45%,75%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.15)}}
</style>`);
function worldIntro(z){const o=document.createElement('div');o.id='w26';o.style.setProperty('--c',WCOL[z]);o.innerHTML='<div class="a"></div><div class="t"><small>MUNDO '+(z+1)+'</small>'+WN[z]+'<em>NIVELES '+(z*10+1)+'–'+(z*10+10)+'</em></div>';document.body.appendChild(o);setTimeout(()=>o.remove(),2700);try{SFX.impact()}catch(e){}}
const _ngW=newGame;
newGame=function(t){const r=_ngW.apply(this,arguments);try{if(!t){const z=Math.min(9,Math.max(0,Math.floor((lvl-1)/10)));if(z!==lastW){lastW=z;worldIntro(z)}}}catch(e){}return r};

/* =====================================================================
   PARTE 2 · DISEÑOS: FRAMES, EFECTOS Y TARJETAS
   ===================================================================== */
function arcs(g,cx,cy,r,a0,a1,c,w,b){g.save();g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';if(b){g.shadowColor=c;g.shadowBlur=b}g.beginPath();g.arc(cx,cy,r,a0,a1);g.stroke();g.restore()}
function rbolt(g,cx,cy,r0,r1,a,q,c,w,wob){const n=6;g.save();g.lineJoin='round';g.lineCap='round';g.beginPath();for(let i=0;i<=n;i++){const R=r0+(r1-r0)*i/n,aa=a+(i&&i<n?(rd(q*13+i)-.5)*wob:0);g[i?'lineTo':'moveTo'](cx+Math.cos(aa)*R,cy+Math.sin(aa)*R)}g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=8;g.globalAlpha=.6;g.lineWidth=w*2.4;g.stroke();g.globalAlpha=1;g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=w*.7;g.stroke();g.restore()}
function cbolt(g,cx,cy,r,a0,len,q,c,w){const n=8;g.save();g.lineJoin='round';g.lineCap='round';g.beginPath();for(let i=0;i<=n;i++){const aa=a0+len*i/n,R=r+(i&&i<n?(rd(q*11+i)-.5)*r*.28:0);g[i?'lineTo':'moveTo'](cx+Math.cos(aa)*R,cy+Math.sin(aa)*R)}g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=8;g.globalAlpha=.6;g.lineWidth=w*2.2;g.stroke();g.globalAlpha=1;g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=w*.7;g.stroke();g.restore()}
function orbit(g,cx,cy,r,t,n,c,sz,sp){g.save();g.fillStyle=c;g.shadowColor=c;g.shadowBlur=sz*3;for(let i=0;i<n;i++){const a=t*sp+i*TAU/n,R=r+Math.sin(t*2+i)*r*.05;g.beginPath();g.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,sz*(.7+.5*Math.abs(Math.sin(t*3+i))),0,TAU);g.fill()}g.restore()}
function sparksF(g,cx,cy,r,t,n,cols,u){for(let i=0;i<n;i++){const k=t*2.2+i*1.7,q=Math.floor(k),ph=k-q,a=rd(q*5+i)*TAU,R=r*(1.02+rd(q+i*9)*.3);g.globalAlpha=Math.sin(ph*3.1416);glint(g,cx+Math.cos(a)*R,cy+Math.sin(a)*R,(2+rd(q*3+i)*2.5)*u,cols[i%cols.length])}g.globalAlpha=1}
function flames(g,cx,cy,r,t,n,cols,hh){for(let k=0;k<n;k++){const a=k*TAU/n,fl=(.4+.6*Math.abs(Math.sin(t*6+k*1.7)))*hh,x0=cx+Math.cos(a)*r,y0=cy+Math.sin(a)*r,aj=a+.04*Math.sin(t*5+k),x1=cx+Math.cos(aj)*(r+fl),y1=cy+Math.sin(aj)*(r+fl),tx=-Math.sin(a)*hh*.28,ty=Math.cos(a)*hh*.28,mx=x0+Math.cos(a)*fl*.5,my=y0+Math.sin(a)*fl*.5;g.fillStyle=cols[k%cols.length];g.globalAlpha=.8;g.beginPath();g.moveTo(x0-tx,y0-ty);g.quadraticCurveTo(mx-tx*.3,my-ty*.3,x1,y1);g.quadraticCurveTo(mx+tx*.3,my+ty*.3,x0+tx,y0+ty);g.closePath();g.fill()}g.globalAlpha=1}
function smoke(g,cx,cy,r,t,n,c,u){for(let i=0;i<n;i++){const p=(t*.22+i/n)%1,a=i*2.399+t*.2,R=r*(1+p*.28);g.globalAlpha=Math.sin(p*3.1416)*.45;g.fillStyle=c;g.beginPath();g.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,(3+p*9)*u,0,TAU);g.fill()}g.globalAlpha=1}
function streaks(g,cx,cy,r,t,n,c1,c2,u,al){g.globalAlpha=al;for(let i=0;i<n;i++){const sp=1.6+rd(i)*2.4,a=t*sp+i*.45,L=.5+rd(i+4)*.9,R=r*(1.06+rd(i+8)*.22);arcs(g,cx,cy,R,a-L,a,i%3?c1:c2,(1+rd(i+2)*1.6)*u,6*u)}g.globalAlpha=1}

/* ---- MARCOS (rodean la foto): (g,cx,cy,r,t), r = radio de la foto ---- */
const FR={
mf01:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.08,0,TAU,'#2a8bff',3.4*u,14*u);arcs(g,cx,cy,r*1.08,0,TAU,'#cfe8ff',u);for(let k=0;k<3;k++)cbolt(g,cx,cy,r*1.1,t*1.6+k*2.09,.9,Math.floor(t*14+k),'#5ab0ff',1.6*u)},
mf02:(g,cx,cy,r,t)=>{const u=r/32;flames(g,cx,cy,r*1.04,t,28,['#ff2a00','#ff7a00','#ffd000'],r*.38);arcs(g,cx,cy,r*1.04,0,TAU,'#ff4a10',2.6*u,10*u)},
mf03:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.07,0,TAU,'#3a6bff',3*u,12*u);for(let k=0;k<4;k++){const q=Math.floor(t*5+k*3);if(rd(q+k*7)>.4){const a=.785+k*1.5708+(rd(q*3)-.5)*.3;rbolt(g,cx,cy,r*1.04,r*(1.3+rd(q)*.05),a,q,'#6aa0ff',1.6*u,.45);if(rd(q+9)>.5)rbolt(g,cx,cy,r*1.04,r*1.22,a+.25,q+4,'#bfe0ff',1.2*u,.4)}}},
mf04:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.06,0,TAU,'#5a3bff',3*u,12*u);arcs(g,cx,cy,r*1.06,t,t+2.2,'#ff6aff',2.4*u,10*u);for(let i=0;i<26;i++){const a=i*2.4+t*.25*(i%2?1:-1),R=r*(1.1+rd(i)*.2);g.globalAlpha=.4+.6*Math.abs(Math.sin(t*2+i));g.fillStyle=i%3?'#fff':'#9cd8ff';g.fillRect(cx+Math.cos(a)*R,cy+Math.sin(a)*R,1.4*u,1.4*u)}g.globalAlpha=1;orbit(g,cx,cy,r*1.16,t,3,'#ff9cff',2*u,1.1)},
mf05:(g,cx,cy,r,t)=>{const u=r/32,p=.5+.5*Math.sin(t*2.4);halo(g,cx,cy,r*.95,r*1.4,'#b44dff',.6+.4*p);for(let i=0;i<3;i++){g.globalAlpha=.95-i*.25;arcs(g,cx,cy,r*(1.06+i*.07+.03*Math.sin(t*3+i)),0,TAU,'#d08aff',(3-i*.8)*u,10*u)}g.globalAlpha=1},
mf06:(g,cx,cy,r,t)=>{const u=r/32,q=g.createLinearGradient(cx-r,cy-r,cx+r,cy+r);q.addColorStop(0,'#fff3a0');q.addColorStop(.5,'#ffc400');q.addColorStop(1,'#b87a00');g.save();g.strokeStyle=q;g.lineWidth=4*u;g.shadowColor='#ffc400';g.shadowBlur=12*u;g.beginPath();g.arc(cx,cy,r*1.07,0,TAU);g.stroke();g.restore();arcs(g,cx,cy,r*1.07,t*2,t*2+.7,'#fff',2*u,8*u);
 const s=r*.5;g.save();g.translate(cx,cy-r*1.02);const c2=g.createLinearGradient(0,-s*1.2,0,0);c2.addColorStop(0,'#fff3a0');c2.addColorStop(1,'#d09a00');g.fillStyle=c2;g.shadowColor='#ffc400';g.shadowBlur=8*u;g.beginPath();g.moveTo(-s,0);g.lineTo(-s,-s*.9);g.lineTo(-s*.5,-s*.35);g.lineTo(0,-s*1.2);g.lineTo(s*.5,-s*.35);g.lineTo(s,-s*.9);g.lineTo(s,0);g.closePath();g.fill();g.shadowBlur=0;['#ff2a55','#2a8bff','#19e68c'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc((i-1)*s*.5,-s*.2,s*.11,0,TAU);g.fill()});g.restore();sparksF(g,cx,cy,r*1.05,t,8,['#fff3a0','#ffc400','#fff'],u*1.3)},
mf07:(g,cx,cy,r,t)=>{const u=r/32,cs=['#00ffd0','#ff3df2','#6a5bff'];for(let k=0;k<3;k++){g.save();g.translate(cx,cy);g.rotate(t*(.9+k*.5)*(k%2?-1:1)+k);g.strokeStyle=cs[k];g.lineWidth=2.4*u;g.shadowColor=cs[k];g.shadowBlur=10*u;g.setLineDash([r*.5,r*.18]);g.beginPath();g.ellipse(0,0,r*(1.1+k*.08),r*(1+k*.08)*(.8+.15*Math.sin(t+k)),0,0,TAU);g.stroke();g.restore()}halo(g,cx,cy,r,r*1.35,'#8a5bff',.35)},
mf08:(g,cx,cy,r,t)=>{const u=r/32,n=18,hi=Math.floor(t*7)%n;arcs(g,cx,cy,r*1.03,0,TAU,'#9fe9ff',2.4*u,8*u);for(let i=0;i<n;i++){const a=i*TAU/n,L=r*(i%2?.26:.4),w2=.11,R=r*1.03;g.fillStyle=i===hi?'rgba(255,255,255,.95)':(i%2?'rgba(120,200,255,.6)':'rgba(190,150,255,.65)');g.strokeStyle='#fff';g.lineWidth=.7*u;g.beginPath();g.moveTo(cx+Math.cos(a-w2)*R,cy+Math.sin(a-w2)*R);g.lineTo(cx+Math.cos(a)*(R+L),cy+Math.sin(a)*(R+L));g.lineTo(cx+Math.cos(a+w2)*R,cy+Math.sin(a+w2)*R);g.closePath();g.fill();g.stroke()}},
mf09:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.07,0,TAU,'#1a4aff',4*u,12*u);g.save();g.translate(cx,cy);g.rotate(t*.5);g.setLineDash([3*u,3*u]);g.strokeStyle='#7fc4ff';g.lineWidth=2*u;g.beginPath();g.arc(0,0,r*1.16,0,TAU);g.stroke();g.restore();for(let k=0;k<3;k++){const a=t*2.4+k*2.09;arcs(g,cx,cy,r*1.07,a-.9,a,'#bfe4ff',2.6*u,10*u);glint(g,cx+Math.cos(a)*r*1.07,cy+Math.sin(a)*r*1.07,4*u,'#fff')}const q=Math.floor(t*10);if(rd(q)>.5)cbolt(g,cx,cy,r*1.12,rd(q+3)*TAU,.8,q,'#5ab0ff',1.4*u)},
mf10:(g,cx,cy,r,t)=>{const u=r/32,fl=rd(Math.floor(t*18))>.12?1:.4;g.globalAlpha=fl;for(let i=0;i<10;i++){const a=i*TAU/10+t*.6;arcs(g,cx,cy,r*1.08,a,a+.45,'#00e5ff',3*u,8*u)}g.globalAlpha=fl*.7;g.save();g.translate(cx,cy);g.rotate(-t*.4);g.strokeStyle='#7ff6ff';g.lineWidth=u;for(let i=0;i<24;i++){const a=i*TAU/24,R=r*(i%3?1.2:1.26);g.beginPath();g.moveTo(Math.cos(a)*r*1.16,Math.sin(a)*r*1.16);g.lineTo(Math.cos(a)*R,Math.sin(a)*R);g.stroke()}g.restore();const sw=((t*.8)%1)*TAU;arcs(g,cx,cy,r*1.08,sw,sw+.25,'#fff',2*u,10*u);g.globalAlpha=1},
mf11:(g,cx,cy,r,t)=>{const u=r/32;smoke(g,cx,cy,r,t,16,'#1a0a22',u*1.4);smoke(g,cx,cy,r*1.05,t+.5,10,'#3a0a1a',u*1.2);arcs(g,cx,cy,r*1.06,0,TAU,'#3a1450',3*u,6*u);const q=Math.floor(t*6);for(let k=0;k<3;k++)if(rd(q+k*5)>.45){const a=rd(q*3+k)*TAU;arcs(g,cx,cy,r*1.08,a,a+.7,k%2?'#ff2a55':'#b44dff',2.6*u,12*u)}},
mf12:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.05,0,TAU,'#cfe8ff',2.6*u,10*u);for(let i=0;i<8;i++){const a=i*TAU/8+t*.3,x=cx+Math.cos(a)*r*1.14,y=cy+Math.sin(a)*r*1.14,s=5*u*(.85+.15*Math.sin(t*3+i));g.save();g.translate(x,y);g.rotate(a+1.5708);const q=g.createLinearGradient(0,-s,0,s);q.addColorStop(0,'#fff');q.addColorStop(1,'#6aa8ff');g.fillStyle=q;g.shadowColor='#bfe4ff';g.shadowBlur=8*u;g.beginPath();g.moveTo(0,-s*1.2);g.lineTo(s*.8,0);g.lineTo(0,s*1.2);g.lineTo(-s*.8,0);g.closePath();g.fill();g.restore()}sparksF(g,cx,cy,r*1.05,t,5,['#fff','#9fd0ff'],u*1.3)},
mf13:(g,cx,cy,r,t)=>{const u=r/32,cs=['#00e5ff','#2a8bff','#ffffff'];for(let k=0;k<3;k++){const a=t*(1.3+k*.8)*(k%2?-1:1)+k,R=r*(1.04+k*.1);arcs(g,cx,cy,R,a,a+3.6-k*.4,cs[k],(3.2-k*.6)*u,10*u);arcs(g,cx,cy,R,a+4,a+4.4,cs[k],1.2*u)}},
mf14:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.04,0,TAU,'#2a4a8a',2*u);streaks(g,cx,cy,r,t,14,'#7fe3ff','#fff',u,1)},
mf15:(g,cx,cy,r,t)=>{const u=r/32,p=.5+.5*Math.sin(t*3);halo(g,cx,cy,r*.9,r*1.45,'#3a8bff',.55+.3*p);halo(g,cx,cy,r,r*1.35,'#ffc400',.4);arcs(g,cx,cy,r*1.05,0,TAU,'#ffc400',3.4*u,14*u);arcs(g,cx,cy,r*1.14,0,TAU,'#3a9bff',2*u,12*u);for(let k=0;k<4;k++)cbolt(g,cx,cy,r*1.14,t*1.5+k*1.57,.8,Math.floor(t*14+k),'#7fc4ff',1.5*u);orbit(g,cx,cy,r*1.22,t,6,'#ffd45a',1.8*u,1.4);sparksF(g,cx,cy,r*1.1,t,8,['#ffd45a','#fff'],u*1.3);g.save();g.strokeStyle='#ffd45a';g.lineWidth=1.6*u;g.shadowColor='#ffc400';g.shadowBlur=8*u;g.beginPath();g.ellipse(cx,cy-r*1.3,r*.5,r*.1,0,0,TAU);g.stroke();g.restore()}};
/* ---- EFECTOS DE PERFIL ---- */
const FXD={
pe01:(g,cx,cy,r,t)=>{const u=r/32;g.shadowBlur=8*u;g.shadowColor='#7fe3ff';for(let i=0;i<16;i++){const a=i*2.399+t*.25*(i%2?1:-1),R=r*(1.12+.16*Math.sin(t*.9+i*1.3));g.globalAlpha=.35+.65*Math.abs(Math.sin(t*1.7+i*2));g.fillStyle=i%3?'#7fe3ff':'#fff';g.beginPath();g.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,(1.4+rd(i)*1.4)*u,0,TAU);g.fill()}g.globalAlpha=1},
pe02:(g,cx,cy,r,t)=>{const u=r/32;for(let k=0;k<5;k++)cbolt(g,cx,cy,r*1.08,t*1.1+k*1.26,.55,Math.floor(t*16+k),'#4da6ff',1.5*u)},
pe03:(g,cx,cy,r,t)=>{sparksF(g,cx,cy,r,t,14,['#ffd400','#ff3df2','#7fe3ff'],r/32*1.4)},
pe04:(g,cx,cy,r,t)=>{const u=r/32;orbit(g,cx,cy,r*1.15,t,8,'#c06bff',1.8*u,1.6);orbit(g,cx,cy,r*1.28,t,6,'#7fe3ff',1.5*u,-1.1)},
pe05:(g,cx,cy,r,t)=>{const u=r/32;arcs(g,cx,cy,r*1.08,0,TAU,'rgba(255,255,255,.25)',1.4*u);for(let k=0;k<2;k++){const a=t*2+k*3.14,x=cx+Math.cos(a)*r*1.08,y=cy+Math.sin(a)*r*1.08;arcs(g,cx,cy,r*1.08,a-.7,a,'#fff',2*u,8*u);glint(g,x,y,6*u,'#fff')}},
pe06:(g,cx,cy,r,t)=>{const u=r/32;for(let i=0;i<3;i++){const p=(t*.5+i/3)%1;g.globalAlpha=(1-p)*.8;arcs(g,cx,cy,r*(1.05+p*.32),0,TAU,'#00e5ff',2*u,8*u)}g.globalAlpha=1},
pe07:(g,cx,cy,r,t)=>{const u=r/32;for(let k=0;k<6;k++){const q=Math.floor(t*7+k*2);if(rd(q+k*4)>.35)rbolt(g,cx,cy,r*1.02,r*(1.3+rd(q+k)*.08),rd(q*3+k)*TAU,q,k%2?'#6aa0ff':'#fff',1.5*u,.5)}},
pe08:(g,cx,cy,r,t)=>{const u=r/32;halo(g,cx,cy,r*.9,r*1.45,'#2a8bff',.5+.3*Math.sin(t*4));arcs(g,cx,cy,r*1.08,0,TAU,'#7fc4ff',2*u,10*u);for(let k=0;k<2;k++){const q=Math.floor(t*12+k);if(rd(q)>.4)cbolt(g,cx,cy,r*1.12,rd(q+k)*TAU,.6,q,'#9fd0ff',1.3*u)}},
pe09:(g,cx,cy,r,t)=>{halo(g,cx,cy,r*.95,r*1.45,'#ff2a00',.5+.2*Math.sin(t*5));flames(g,cx,cy,r*1.04,t,26,['#ff2a00','#ff7a00','#ffd000'],r*.34)},
pe10:(g,cx,cy,r,t)=>{const u=r/32;halo(g,cx,cy,r*.9,r*1.45,'#8a2bff',.55+.25*Math.sin(t*2.6));for(let k=0;k<3;k++){const a=t*(.8+k*.4)*(k%2?-1:1)+k*2;arcs(g,cx,cy,r*(1.1+k*.07),a,a+1.4,'#e0a8ff',1.6*u,8*u)}},
pe11:(g,cx,cy,r,t)=>{const u=r/32;halo(g,cx,cy,r*.9,r*1.45,'#ffc400',.55+.25*Math.sin(t*2.4));arcs(g,cx,cy,r*1.08,0,TAU,'#ffd45a',2*u,10*u);for(let i=0;i<10;i++){const p=(t*.3+i/10)%1;g.globalAlpha=Math.sin(p*3.14);glint(g,cx+(rd(i)-.5)*r*2.3,cy+r*1.2-p*r*2.6,(2+rd(i+3)*2)*u,'#fff3a0')}g.globalAlpha=1},
pe12:(g,cx,cy,r,t)=>{const u=r/32;smoke(g,cx,cy,r,t,14,'#b8c0d8',u*1.4);smoke(g,cx,cy,r*1.04,t+.4,8,'#8a7ab0',u*1.2)},
pe13:(g,cx,cy,r,t)=>{const u=r/32;[['#00e5ff',.5,1.1],['#ff3df2',-.5,-.8]].forEach((a,i)=>{g.save();g.translate(cx,cy);g.rotate(a[1]);g.strokeStyle=a[0];g.lineWidth=2*u;g.shadowColor=a[0];g.shadowBlur=8*u;g.setLineDash([r*.3,r*.15]);g.lineDashOffset=-t*a[2]*r*.6;g.beginPath();g.ellipse(0,0,r*1.32,r*.42,0,0,TAU);g.stroke();g.restore()})},
pe14:(g,cx,cy,r,t)=>{const u=r/32;streaks(g,cx,cy,r*1.1,t,12,'#fff','#7fe3ff',u,.7)},
pe15:(g,cx,cy,r,t)=>{const u=r/32;halo(g,cx,cy,r*.9,r*1.45,'#ffc400',.5+.2*Math.sin(t*3));halo(g,cx,cy,r,r*1.4,'#3a8bff',.3);arcs(g,cx,cy,r*1.08,0,TAU,'#ffd45a',2.4*u,12*u);for(let k=0;k<3;k++)cbolt(g,cx,cy,r*1.14,t*1.4+k*2.09,.7,Math.floor(t*14+k),'#7fc4ff',1.4*u);orbit(g,cx,cy,r*1.2,t,5,'#ffd45a',1.6*u,1.3);sparksF(g,cx,cy,r*1.1,t,8,['#fff3a0','#fff'],u*1.2)}};
/* ---- TARJETAS ANIMADAS: (g,w,h,t,u) ---- */
function bg2(g,w,h,a,b){const q=g.createLinearGradient(0,0,w,h);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(0,0,w,h)}
function neonB(g,w,h,c,u,t){g.save();g.strokeStyle=c;g.lineWidth=2*u;g.shadowColor=c;g.shadowBlur=10*u;g.globalAlpha=.75+.25*Math.sin(t*3);rr(g,u,u,w-2*u,h-2*u,8*u);g.stroke();g.restore()}
function bolt2(g,x0,y0,x1,y1,q,c,w,j){const n=8;g.save();g.lineJoin='round';g.beginPath();g.moveTo(x0,y0);for(let i=1;i<n;i++){const k=i/n;g.lineTo(x0+(x1-x0)*k+(rd(q*9+i)-.5)*j,y0+(y1-y0)*k+(rd(q*5+i+3)-.5)*j)}g.lineTo(x1,y1);g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=10;g.globalAlpha=.6;g.lineWidth=w*2.4;g.stroke();g.globalAlpha=1;g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=w*.8;g.stroke();g.restore()}
function starsC(g,w,h,t,n,sp){g.fillStyle='#fff';for(let i=0;i<n;i++){g.globalAlpha=.25+.75*Math.abs(Math.sin(t*(.6+rd(i)*1.4)+i));const s=.7+rd(i+30)*1.2;g.fillRect((((rd(i)*w-(sp||0)*t*(.3+rd(i+7))*10)%w)+w)%w,rd(i+50)*h,s,s)}g.globalAlpha=1}
const CD={
tc01:(g,w,h,t,u)=>{bg2(g,w,h,'#020a2a','#04246a');for(let b=0;b<3;b++){const q=Math.floor(t*9+b*4);bolt2(g,0,h*(.25+b*.25),w,h*(.2+rd(q+b)*.6),q+b,'#3a9bff',1.6*u,h*.4)}neonB(g,w,h,'#2a8bff',u,t)},
tc02:(g,w,h,t,u)=>{bg2(g,w,h,'#12020a','#020a2a');g.save();g.globalCompositeOperation='lighter';const n=16;for(let k=0;k<n;k++){const x=(k+.5)*w/n,fh=h*(.35+.4*Math.abs(Math.sin(t*3.5+k*1.9))),c=k%2?'#2a6bff':'#ff2a2a',q=g.createLinearGradient(0,h,0,h-fh);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.moveTo(x-w/n*.8,h);g.quadraticCurveTo(x-w/n*.2,h-fh*.5,x+Math.sin(t*5+k)*w/n*.4,h-fh);g.quadraticCurveTo(x+w/n*.2,h-fh*.5,x+w/n*.8,h);g.fill()}g.restore();neonB(g,w,h,'#ff4a6a',u,t)},
tc03:(g,w,h,t,u)=>{bg2(g,w,h,'#050218','#14063a');starsC(g,w,h,t,40,2);halo(g,w*.72,h*.5,0,h*.9,'#8a5bff',.4);g.save();g.translate(w*.72,h*.5);g.rotate(t*.35);g.scale(1,.55);for(let j=0;j<70;j++)for(let a=0;a<2;a++){const an=j*.28+a*3.1416,R=j/70*h*.95;g.globalAlpha=.9-j/90;g.fillStyle=j%3?'#ff9cff':'#9cd8ff';g.fillRect(Math.cos(an)*R*1.4,Math.sin(an)*R*1.4,1.6*u,1.6*u)}g.restore();g.globalAlpha=1;halo(g,w*.72,h*.5,0,h*.16,'#fff',.9);neonB(g,w,h,'#a64dff',u,t)},
tc04:(g,w,h,t,u)=>{bg2(g,w,h,'#06081a','#101a3a');for(let k=0;k<5;k++){g.fillStyle='rgba(40,50,90,.7)';g.beginPath();g.ellipse(((t*10+k*w*.3)%(w*1.4))-w*.2,h*(.12+(k%3)*.1),w*.22,h*.16,0,0,TAU);g.fill()}const f=(t*1.2)%1;if(f<.22){const a=1-f/.22,q=Math.floor(t*1.2);g.fillStyle='rgba(200,220,255,'+(a*.35)+')';g.fillRect(0,0,w,h);const x=w*(.15+rd(q)*.7);bolt2(g,x,0,x+(rd(q+2)-.5)*w*.3,h,q,'#9fc0ff',2*u,h*.5);if(rd(q+5)>.4)bolt2(g,w*rd(q+7),0,w*rd(q+8),h,q+3,'#6a8aff',1.2*u,h*.5)}neonB(g,w,h,'#5a7aff',u,t)},
tc05:(g,w,h,t,u)=>{bg2(g,w,h,'#10032a','#2a0a5a');for(let i=0;i<5;i++)halo(g,w*(.15+i*.2)+Math.sin(t*1.1+i)*w*.08,h*(.5+Math.sin(t*.8+i*2)*.3),0,h*.8,i%2?'#d08aff':'#8a2bff',.5);g.strokeStyle='#fff';g.lineWidth=u;g.globalAlpha=.45;for(let k=0;k<3;k++){g.beginPath();for(let x=0;x<=w;x+=4){const y=h*(.3+k*.2)+Math.sin(x/(14*u)+t*3+k*2)*h*.1;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.globalAlpha=1;neonB(g,w,h,'#b44dff',u,t)},
tc06:(g,w,h,t,u)=>{bg2(g,w,h,'#1a1000','#4a3000');const cx=w*.5,cy=h*.55;g.save();g.translate(cx,cy);g.rotate(t*.2);g.globalCompositeOperation='lighter';for(let k=0;k<12;k++){g.rotate(TAU/12);g.fillStyle='rgba(255,200,60,'+(.12+.06*Math.sin(t*2+k))+')';g.beginPath();g.moveTo(0,0);g.lineTo(w,-h*.07);g.lineTo(w,h*.07);g.fill()}g.restore();const s=h*.55,q=g.createLinearGradient(0,cy-s,0,cy+s*.4);q.addColorStop(0,'#fff3a0');q.addColorStop(.5,'#ffc400');q.addColorStop(1,'#9a6a00');g.save();g.shadowColor='#ffc400';g.shadowBlur=14*u;g.fillStyle=q;g.beginPath();g.moveTo(cx-s,cy+s*.3);g.lineTo(cx-s,cy-s*.35);g.lineTo(cx-s*.5,cy-s*.05);g.lineTo(cx,cy-s*.7);g.lineTo(cx+s*.5,cy-s*.05);g.lineTo(cx+s,cy-s*.35);g.lineTo(cx+s,cy+s*.3);g.closePath();g.fill();g.restore();['#ff2a55','#2a8bff','#19e68c'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(cx+(i-1)*s*.5,cy+s*.12,s*.09,0,TAU);g.fill()});const sx=((t*.7)%1.6-.3)*w;g.save();g.beginPath();g.rect(0,0,w,h);g.clip();g.fillStyle='rgba(255,255,255,.3)';g.translate(sx,0);g.rotate(.4);g.fillRect(0,-h,w*.05,h*3);g.restore();sparksF(g,cx,cy,s*1.2,t,10,['#fff3a0','#ffc400'],u*1.4);neonB(g,w,h,'#ffc400',u,t)},
tc07:(g,w,h,t,u)=>{bg2(g,w,h,'#040414','#0a0a2a');const cx=w*.5,cy=h*.5;halo(g,cx,cy,0,h*1.1,'#6a3bff',.5);for(let k=0;k<7;k++){g.save();g.translate(cx,cy);g.rotate(t*(.6+k*.15)*(k%2?-1:1));const c='hsl('+((k*50+t*60)%360)+',90%,60%)';g.strokeStyle=c;g.lineWidth=2*u;g.shadowColor=c;g.shadowBlur=8*u;g.setLineDash([h*.3,h*.1]);g.beginPath();g.ellipse(0,0,h*(.15+k*.07)*1.8,h*(.15+k*.07),0,0,TAU);g.stroke();g.restore()}halo(g,cx,cy,0,h*.2,'#fff',.8);g.fillStyle='#fff';for(let i=0;i<14;i++){const p=(t*.4+i/14)%1,a=i*2.4;g.globalAlpha=Math.sin(p*3.14);g.fillRect(cx+Math.cos(a)*(1-p)*w*.45,cy+Math.sin(a)*(1-p)*h*.5,1.6*u,1.6*u)}g.globalAlpha=1;neonB(g,w,h,'#8a5bff',u,t)},
tc08:(g,w,h,t,u)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);starsC(g,w,h,t,36,-2);const cx=w*.5,cy=h*.52,R=h*.24;g.save();g.translate(cx,cy);g.rotate(-.2);const q=g.createLinearGradient(-w*.35,0,w*.35,0);q.addColorStop(0,'rgba(255,120,20,0)');q.addColorStop(.5,'#ffd080');q.addColorStop(1,'rgba(255,120,20,0)');g.strokeStyle=q;g.lineWidth=R*.7;g.shadowColor='#ff8a2a';g.shadowBlur=16*u;g.beginPath();g.ellipse(0,0,w*.3,R*.9,0,0,TAU);g.stroke();g.shadowBlur=0;g.fillStyle='#ffe0a0';for(let i=0;i<30;i++){const p=(t*.3+i/30)%1,a=i*2.4+t*2*(1-p);g.globalAlpha=1-p;g.fillRect(Math.cos(a)*(1-p)*w*.3,Math.sin(a)*(1-p)*R*.9,1.6*u,1.6*u)}g.restore();g.globalAlpha=1;g.fillStyle='#000';g.beginPath();g.arc(cx,cy,R,0,TAU);g.fill();g.strokeStyle='#ffb060';g.lineWidth=1.6*u;g.globalAlpha=.8;g.beginPath();g.arc(cx,cy,R+1.5*u,0,TAU);g.stroke();g.globalAlpha=1;neonB(g,w,h,'#ff8a2a',u,t)},
tc09:(g,w,h,t,u)=>{bg2(g,w,h,'#0a1a3a','#1a0a4a');const cols=8,rows=3,cw=w/cols,ch=h/rows;for(let r_=0;r_<rows;r_++)for(let c=0;c<cols;c++)for(let s=0;s<2;s++){const x=c*cw,y=r_*ch,i=(r_*cols+c)*2+s;g.fillStyle='hsla('+(190+rd(i)*90)+',90%,'+(55+20*Math.sin(t*1.6+i))+'%,'+(.18+.22*Math.abs(Math.sin(t*1.2+i*1.3)))+')';g.beginPath();if(s){g.moveTo(x,y);g.lineTo(x+cw,y);g.lineTo(x+cw,y+ch)}else{g.moveTo(x,y);g.lineTo(x,y+ch);g.lineTo(x+cw,y+ch)}g.closePath();g.fill()}g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=.8*u;for(let c=0;c<=cols;c++){g.beginPath();g.moveTo(c*cw,0);g.lineTo(c*cw,h);g.stroke()}for(let r_=0;r_<=rows;r_++){g.beginPath();g.moveTo(0,r_*ch);g.lineTo(w,r_*ch);g.stroke()}const sx=((t*.6)%1.5-.25)*w;g.save();g.translate(sx,0);g.rotate(.35);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,-h,w*.06,h*3);g.restore();for(let i=0;i<4;i++){const q=Math.floor(t*1.5+i);g.globalAlpha=Math.abs(Math.sin(t*5+i));glint(g,w*rd(q+i*3),h*rd(q+i*7),3*u,'#fff')}g.globalAlpha=1;neonB(g,w,h,'#9fe9ff',u,t)},
tc10:(g,w,h,t,u)=>{bg2(g,w,h,'#021408','#032a10');g.lineWidth=1.4*u;const rows=7;for(let k=0;k<rows;k++){const y=(k+.5)*h/rows,x1=w*(.2+rd(k)*.3),dy=(rd(k+9)>.5?1:-1)*h/rows*.5,A=Math.abs(dy),x2=x1+A+w*(.1+rd(k+4)*.2);g.strokeStyle='rgba(40,255,120,.35)';g.beginPath();g.moveTo(0,y);g.lineTo(x1,y);g.lineTo(x1+A,y+dy);g.lineTo(x2,y+dy);g.lineTo(x2+A,y);g.lineTo(w,y);g.stroke();g.fillStyle='#19ff7a';g.fillRect(x1-2*u,y-2*u,4*u,4*u);g.fillRect(x2+A-2*u,y-2*u,4*u,4*u);const px=((t*.5*(.6+rd(k+2))+rd(k))%1)*w,py=px<x1?y:px<x1+A?y+(px-x1)/A*dy:px<x2?y+dy:px<x2+A?y+dy-(px-x2)/A*dy:y;g.save();g.shadowColor='#b6ffd0';g.shadowBlur=8*u;g.fillStyle='#fff';g.beginPath();g.arc(px,py,2*u,0,TAU);g.fill();g.restore()}neonB(g,w,h,'#19ff7a',u,t)},
tc11:(g,w,h,t,u)=>{bg2(g,w,h,'#06102a','#0a1a4a');for(let i=0;i<10;i++){const p=(t*.12*(.6+rd(i))+rd(i+3))%1,x=w*(.05+rd(i)*.9),y=-h*.2+p*h*1.4,s=h*(.12+rd(i+5)*.12),sc=Math.cos(t*1.6+i*1.3);g.save();g.translate(x,y);g.scale(Math.abs(sc)*.8+.2,1);const q=g.createLinearGradient(0,-s,0,s);q.addColorStop(0,'#fff');q.addColorStop(.5,'#7fe3ff');q.addColorStop(1,'#3a6bff');g.fillStyle=q;g.shadowColor='#7fe3ff';g.shadowBlur=10*u;g.beginPath();g.moveTo(0,-s);g.lineTo(s*.7,-s*.2);g.lineTo(0,s);g.lineTo(-s*.7,-s*.2);g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=u;g.stroke();g.restore()}for(let i=0;i<5;i++){const q=Math.floor(t*2+i*1.3);g.globalAlpha=Math.abs(Math.sin(t*6+i));glint(g,w*rd(q*3+i),h*rd(q+i*5),3*u,'#fff')}g.globalAlpha=1;neonB(g,w,h,'#7fe3ff',u,t)},
tc12:(g,w,h,t,u)=>{bg2(g,w,h,'#02161e','#042a3a');const fl=rd(Math.floor(t*14))>.1?1:.5;g.globalAlpha=fl;g.strokeStyle='rgba(0,229,255,.25)';g.lineWidth=u;for(let x=0;x<=w;x+=12*u){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=((t*14)%(12*u));y<=h;y+=12*u){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}g.save();g.translate(w*.5,h*.5);g.strokeStyle='#00e5ff';g.shadowColor='#00e5ff';g.shadowBlur=10*u;g.lineWidth=1.8*u;for(let k=0;k<3;k++){const s=h*(.34-k*.09),ro=t*.7*(k%2?-1:1),sx=1.2+.6*Math.abs(Math.cos(t*.5+k));g.beginPath();for(let i=0;i<6;i++){const a=ro+i*1.0472;g[i?'lineTo':'moveTo'](Math.cos(a)*s*sx,Math.sin(a)*s)}g.closePath();g.stroke()}g.restore();const q=Math.floor(t*10);g.fillStyle='rgba(120,255,255,.5)';for(let k=0;k<3;k++)if(rd(q+k*3)>.6)g.fillRect(0,h*rd(q*2+k),w,2*u);g.globalAlpha=1;neonB(g,w,h,'#00e5ff',u,t)},
tc13:(g,w,h,t,u)=>{bg2(g,w,h,'#120400','#2a0a00');g.save();g.globalCompositeOperation='lighter';for(let k=0;k<18;k++){const p=(t*.55*(.6+rd(k))+rd(k+3))%1,x=w*(.04+rd(k+9)*.92)+Math.sin(t*3+k)*8*u,y=h*(1.1-p*1.3),R=h*(.18-.1*p)*(.8+rd(k+5)*.6),q=g.createRadialGradient(x,y,0,x,y,R);q.addColorStop(0,p<.4?'#fff6c0':'#ff9a2a');q.addColorStop(1,'rgba(255,40,0,0)');g.globalAlpha=.9*(1-p);g.fillStyle=q;g.beginPath();g.arc(x,y,R,0,TAU);g.fill()}g.restore();g.fillStyle='#ffd060';for(let i=0;i<14;i++){const p=(t*.4*(.6+rd(i+20))+rd(i+21))%1;g.globalAlpha=1-p;g.fillRect(w*rd(i+22),h-p*h*1.1,1.6*u,1.6*u)}g.globalAlpha=1;neonB(g,w,h,'#ff7a1a',u,t)},
tc14:(g,w,h,t,u)=>{bg2(g,w,h,'#02010c','#0a0430');halo(g,w*.3,h*.4,0,h*1.1,'#6a3bff',.35);halo(g,w*.75,h*.7,0,h,'#ff3df2',.25);for(let l=0;l<3;l++){g.fillStyle=l===2?'#fff':'#bcd0ff';g.globalAlpha=.3+.2*l;for(let i=0;i<18;i++){const x=(((rd(i+l*30)*w-t*(4+l*8)*u)%w)+w)%w;g.fillRect(x,rd(i+l*30+9)*h,(.8+l*.5)*u,(.8+l*.5)*u)}}g.globalAlpha=1;const px=w*.82,py=h*.45,pr=h*.26,q=g.createRadialGradient(px-pr*.3,py-pr*.3,2,px,py,pr);q.addColorStop(0,'#ffb0ff');q.addColorStop(1,'#2a0a5a');g.fillStyle=q;g.beginPath();g.arc(px,py,pr,0,TAU);g.fill();g.strokeStyle='rgba(255,200,255,.7)';g.lineWidth=2*u;g.beginPath();g.ellipse(px,py,pr*1.7,pr*.35,-.35,0,TAU);g.stroke();const f=(t*.35)%1;if(f<.25){const k=f/.25;g.strokeStyle='#fff';g.globalAlpha=1-k;g.lineWidth=1.6*u;g.beginPath();g.moveTo(w*(.1+k*.5),h*(.1+k*.4));g.lineTo(w*(.1+k*.5)-18*u,h*(.1+k*.4)-9*u);g.stroke()}g.globalAlpha=1;neonB(g,w,h,'#8a5bff',u,t)},
tc15:(g,w,h,t,u)=>{bg2(g,w,h,'#08031a','#1a0a3a');const p=.5+.5*Math.sin(t*2.4);halo(g,w*.5,h*.5,0,h*1.2,'#ffc400',.35+.2*p);halo(g,w*.5,h*.5,0,w*.5,'#2a6bff',.25);const q=Math.floor(t*12);for(let k=0;k<6;k++){const side=k%4,a=rd(q+k*3);let x0,y0,x1,y1;if(side===0){x0=w*a;y0=0;x1=x0+(rd(q+k)-.5)*40*u;y1=h*.35}else if(side===1){x0=w*a;y0=h;x1=x0+(rd(q+k)-.5)*40*u;y1=h*.65}else if(side===2){x0=0;y0=h*a;x1=w*.18;y1=y0+(rd(q+k)-.5)*20*u}else{x0=w;y0=h*a;x1=w*.82;y1=y0+(rd(q+k)-.5)*20*u}if(rd(q*3+k)>.3)bolt2(g,x0,y0,x1,y1,q+k,'#4da6ff',1.4*u,18*u)}g.fillStyle='#ffd45a';for(let i=0;i<22;i++){const pp=(t*.3*(.5+rd(i))+rd(i+3))%1;g.globalAlpha=Math.sin(pp*3.14);g.fillRect(w*rd(i+6),h-pp*h,1.8*u,1.8*u)}g.globalAlpha=1;glint(g,w*.5,h*.5,h*.3*(.8+.2*p),'rgba(255,230,140,.9)');neonB(g,w,h,'#ffc400',u,t)}};

/* =====================================================================
   PARTE 3 · CATÁLOGO + TIENDA (3 categorías nuevas)
   ===================================================================== */
const RAR={b:['BÁSICO','#9aa7c7'],s:['ESPECIAL','#4da6ff'],e:['ÉPICO','#c06bff'],l:['LEGENDARIO','#ffd400']};
const LC=[ /* [id, nombre, rareza, precio DOP, descripción] */
['tc01','Neón Eléctrico','b',500,'Fondo azul con rayos de neón que recorren la tarjeta.'],
['tc02','Fuego Rojo y Azul','s',1000,'Llamas rojas y azules que suben desde el borde.'],
['tc03','Galaxia Infinita','e',2000,'Una galaxia en espiral que gira entre estrellas.'],
['tc04','Tormenta de Rayos','s',1200,'Nubes de tormenta con relámpagos que iluminan todo.'],
['tc05','Energía Morada','s',1100,'Plasma violeta que flota y ondula.'],
['tc06','Corona Dorada','l',4500,'Corona real con rayos de luz y destellos de oro.'],
['tc07','Portal Dimensional','e',2500,'Anillos de colores que giran hacia otra dimensión.'],
['tc08','Agujero Negro','l',4800,'Un vacío con anillo de fuego que devora partículas.'],
['tc09','Cristal Brillante','s',1300,'Facetas de cristal con reflejos que se desplazan.'],
['tc10','Circuito Tecnológico','b',700,'Pistas de circuito con pulsos de energía verde.'],
['tc11','Diamantes Animados','s',1500,'Diamantes que caen girando y destellan.'],
['tc12','Holograma Futurista','e',2200,'Cuadrícula holográfica con figura 3D parpadeante.'],
['tc13','Llamas de Energía','e',1900,'Bolas de energía naranja que ascienden como fuego.'],
['tc14','Universo Cósmico','e',3000,'Nebulosas, estrellas en paralaje y un planeta con anillo.'],
['tc15','Tarjeta Legendaria','l',6000,'Aura dorada con descargas eléctricas azules en los bordes.']];
const LE=[
['pe01','Puntos Luminosos','b',300,'Puntitos de luz que flotan alrededor de tu foto.'],
['pe02','Rayitas Eléctricas','s',800,'Pequeños rayos que recorren el contorno.'],
['pe03','Chispas Mágicas','b',450,'Chispas que aparecen y se desvanecen.'],
['pe04','Partículas Giratorias','s',1000,'Partículas que orbitan tu avatar.'],
['pe05','Destellos de Borde','s',1200,'Destellos brillantes que viajan por el borde.'],
['pe06','Ondas de Energía','e',1800,'Ondas que se expanden desde tu foto.'],
['pe07','Rayos Cruzados','e',2400,'Rayos que cruzan el marco en todas direcciones.'],
['pe08','Aura Azul Eléctrica','e',2000,'Resplandor azul eléctrico que pulsa.'],
['pe09','Aura Roja de Fuego','e',2600,'Llamas rojas alrededor del avatar.'],
['pe10','Aura Morada','s',1400,'Aura violeta con volutas giratorias.'],
['pe11','Aura Dorada Legendaria','l',4200,'Aura de oro con destellos que suben.'],
['pe12','Humo Animado','b',600,'Humo suave que se eleva alrededor.'],
['pe13','Anillos Giratorios','e',2800,'Anillos de energía inclinados que giran.'],
['pe14','Líneas de Velocidad','s',900,'Líneas veloces que rodean tu foto.'],
['pe15','Energía Legendaria','l',5500,'Oro, rayos azules y partículas: lo máximo en energía.']];
const LF=[
['mf01','Marco Neón Eléctrico','b',300,'Borde azul con rayos que recorren el contorno.'],
['mf02','Marco Fuego Infernal','b',450,'Llamas rojas y naranjas alrededor de la foto.'],
['mf03','Marco Tormenta Azul','s',800,'Descargas eléctricas que saltan en las esquinas.'],
['mf04','Marco Galaxia Cósmica','s',1000,'Polvo de estrellas y partículas en órbita.'],
['mf05','Marco Aura Morada','s',1200,'Energía violeta que pulsa alrededor del avatar.'],
['mf06','Marco Corona Dorada','e',1800,'Borde de oro con corona, brillos y partículas.'],
['mf07','Marco Portal Dimensional','e',2000,'Anillos de energía giratorios de colores.'],
['mf08','Marco Cristal Legendario','e',2500,'Cristales luminosos con reflejos que se desplazan.'],
['mf09','Marco Dragón Eléctrico','e',2800,'Energía azul con chispas que recorren el borde.'],
['mf10','Marco Holograma Futurista','e',2800,'Segmentos digitales y líneas holográficas.'],
['mf11','Marco Sombra Oscura','e',3000,'Humo oscuro con destellos rojos y morados.'],
['mf12','Marco Diamante Real','l',3500,'Diamantes y reflejos blancos y azules.'],
['mf13','Marco Anillos de Energía','l',4000,'Varios anillos que giran a distintas velocidades.'],
['mf14','Marco Velocidad Extrema','l',4500,'Líneas de velocidad que no se detienen.'],
['mf15','Marco Dios Legendario','l',6000,'Energía azul, rayos, oro y un aura intensa. Único.']];
const CATS=[
 {k:'tc',ic:'🃏',nm:'TARJETAS ANIMADAS',sub:'Fondo animado para tu perfil',L:LC,card:1},
 {k:'pe',ic:'💫',nm:'EFECTOS DE PERFIL',sub:'Partículas, auras y energía',L:LE},
 {k:'mf',ic:'🖼',nm:'MARCOS ANIMADOS',sub:'Marcos que rodean tu foto',L:LF}];
const IDX={};CATS.forEach((c,ci)=>c.L.forEach(r=>IDX[r[0]]={id:r[0],name:r[1],rar:r[2],price:r[3],d:r[4],k:c.k,ci}));
const own=id=>!!VER||(prof.inv||[]).includes(id);
const eqd=it=>((prof.eq||{})[it.k]||'')===it.id;

/* ---- animación ---- */
const RM=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let regs=[];
function avatarPH(g,cx,cy,r){g.save();g.beginPath();g.arc(cx,cy,r,0,TAU);g.clip();const q=g.createRadialGradient(cx,cy-r*.3,2,cx,cy,r);q.addColorStop(0,'#2a3a8a');q.addColorStop(1,'#070a22');g.fillStyle=q;g.fillRect(cx-r,cy-r,2*r,2*r);g.fillStyle='#4a5aa8';g.beginPath();g.arc(cx,cy-r*.15,r*.32,0,TAU);g.fill();g.beginPath();g.ellipse(cx,cy+r*.85,r*.62,r*.5,0,0,TAU);g.fill();g.restore();g.save();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=Math.max(1,r*.07);g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.restore()}
function drawReg(r,t){const cv=r.cv,g=r.g,w=cv.width,h=cv.height;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);g.save();
 try{if(r.k==='tc'){rr(g,0,0,w,h,w*.05);g.clip();CD[r.id](g,w,h,t,h/70)}
 else{const cx=w/2,cy=h/2,R=w*.24;avatarPH(g,cx,cy,R);(r.k==='pe'?FXD:FR)[r.id](g,cx,cy,R,t)}}catch(e){}
 g.restore()}
/* canvas del perfil (tarjeta de fondo, efecto y marco) */
function put(host,cls,css){let c=null;for(const x of host.children)if(x.tagName==='CANVAS'&&x.classList.contains(cls)){c=x;break}if(!c){c=document.createElement('canvas');c.className=cls;c.style.cssText=css;host.insertBefore(c,host.firstChild)}return c}
function drop(host,cls){for(const x of [...host.children])if(x.tagName==='CANVAS'&&x.classList.contains(cls))x.remove()}
function sync(){
 const e=prof.eq||{},tc=e.tc&&IDX[e.tc]&&own(e.tc)?e.tc:'',pe=e.pe&&IDX[e.pe]&&own(e.pe)?e.pe:'',mf=e.mf&&IDX[e.mf]&&own(e.mf)?e.mf:'';
 ['pcard','pf'].forEach(i=>{const h=$(i);if(!h)return;if(tc){const c=put(h,'pxc','position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;pointer-events:none;border-radius:inherit');c.dataset.id=tc}else drop(h,'pxc')});
 ['cav','av'].forEach(i=>{const h=$(i);if(!h)return;if(pe||mf){const c=put(h,'pxo','position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:3');c.dataset.pe=pe;c.dataset.mf=mf}else drop(h,'pxo')})}
function drawProf(t){
 document.querySelectorAll('canvas.pxc').forEach(c=>{if(c.offsetParent===null)return;const h=c.parentNode,w=Math.max(60,Math.round(h.offsetWidth/2)),hh=Math.max(20,Math.round(h.offsetHeight/2));if(c.width!==w||c.height!==hh){c.width=w;c.height=hh}const f=CD[c.dataset.id];if(!f)return;const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,hh);g.save();try{f(g,w,hh,t,hh/70)}catch(e){}g.restore()});
 document.querySelectorAll('canvas.pxo').forEach(c=>{if(c.offsetParent===null)return;const A=c.parentNode.offsetWidth||44,S=Math.round(A*1.45),B=Math.round(S*1.5);if(c.width!==B){c.width=B;c.height=B;c.style.width=S+'px';c.style.height=S+'px'}const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,B,B);const cx=B/2,R=B/2/1.45;
  const pe=FXD[c.dataset.pe],mf=FR[c.dataset.mf];if(pe){g.save();try{pe(g,cx,cx,R,t)}catch(e){}g.restore()}if(mf){g.save();try{mf(g,cx,cx,R,t)}catch(e){}g.restore()}})}
let last=0;
function loop(n){requestAnimationFrame(loop);const red=SET.red||RM;if(n-last<(red?500:36))return;last=n;const t=red?3:n/1000;
 const px=$('pxp'),open=px&&!px.classList.contains('hide')&&!$('sv').classList.contains('hide');
 if(open||regs.length){const vh=innerHeight;for(const r of regs){if(!r.cv.isConnected||r.cv.offsetParent===null)continue;const b=r.cv.getBoundingClientRect();if(b.bottom<0||b.top>vh)continue;drawReg(r,t)}}
 drawProf(t)}
requestAnimationFrame(loop);setInterval(sync,1000);

/* ---- compras y equipado ---- */
let busy=0;
function buy(it){if(busy)return;busy=1;setTimeout(()=>{busy=0},700);
 if(own(it.id)){toast('Ya tienes este artículo');return}
 const pc=prof.pc||0;if(pc<it.price){SFX.deny();toast('Saldo insuficiente: te faltan DOP '+fmt(it.price-pc));return}
 const go=()=>{if(own(it.id)||(prof.pc||0)<it.price)return;prof.pc-=it.price;prof.inv=prof.inv||[];if(!prof.inv.includes(it.id))prof.inv.push(it.id);try{chkAch()}catch(e){}saveP();updPC();SFX.point();toast('✔ Compraste '+it.name+' · −DOP '+fmt(it.price));render()};
 it.price>=1500?modal('CONFIRMAR COMPRA','¿Comprar <b>'+esc(it.name)+'</b> por <b>DOP '+fmt(it.price)+'</b>?<br><small>Te quedarán DOP '+fmt(pc-it.price)+'</small>',[['COMPRAR',go],['CANCELAR',null,'tg']]):go()}
function equip(it){if(!own(it.id))return;prof.eq=prof.eq||{};const on=prof.eq[it.k]===it.id;prof.eq[it.k]=on?'':it.id;saveP();sync();SFX.point();toast(on?'Quitado: '+it.name:'✔ Equipado: '+it.name);render()}

/* ---- pantalla de la tienda ---- */
document.head.insertAdjacentHTML('beforeend',`<style>
#pxp{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px}
.pxT{display:flex;gap:6px;flex:none}
.pxT button{flex:1;min-width:0;padding:10px 4px;border-radius:12px;border:2px solid #2a6bff;background:rgba(5,10,40,.85);color:#fff;font-size:11px;font-weight:800;letter-spacing:.5px}
.pxT button.on{border-color:#37d6ff;background:rgba(0,90,200,.4);box-shadow:0 0 14px #00c8ff}
.pxH{display:flex;align-items:center;gap:8px;flex:none}.pxH b{font-size:15px;letter-spacing:2px}.pxH small{opacity:.8;font-size:11px;display:block}.pxH i{margin-left:auto;font-style:normal;font-size:10px;font-weight:900;background:#ff2233;border-radius:8px;padding:2px 7px}
#pxG{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;align-content:start;padding:2px 2px 12px;border:2px solid #2a6bff;border-radius:16px;background:rgba(5,10,40,.7);padding:10px;scrollbar-width:thin;scrollbar-color:#2a6bff transparent}
.pxK{position:relative;border:2px solid var(--rc);border-radius:14px;padding:8px 6px;background:linear-gradient(180deg,rgba(20,40,120,.35),rgba(5,10,40,.95));display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:0;box-shadow:0 0 10px color-mix(in srgb,var(--rc) 45%,transparent)}
.pxK.on{box-shadow:0 0 18px var(--rc)}
.pxK canvas{display:block;cursor:pointer;border-radius:10px}
.pxK b{font-size:12px;line-height:1.15}
.pxR{font-size:9px;font-weight:900;letter-spacing:1px;padding:2px 9px;border-radius:10px;color:#000;background:var(--rc)}
.pxP{font-size:12px;font-weight:800;color:#ffd400}.pxP.ok{color:#8fe8ff}.pxP.eq{color:#4dff9a}
.pxB{width:100%;padding:9px 4px;border-radius:8px;border:0;color:#fff;font-size:11px;font-weight:900;letter-spacing:1px;background:linear-gradient(180deg,#2a8bff,#1255d8)}
.pxB.g{background:linear-gradient(180deg,#27d968,#0c9a42)}.pxB.d{background:#1b2a55;color:#7fe3a0}
#pxBigW{display:flex;flex-direction:column;align-items:center;gap:8px}
#pxBig{max-width:100%;border-radius:12px;border:2px solid #2a6bff}
</style>`);
let cur=0;
const sv=$('sv'),svM=sv.querySelector('.svM'),PX=document.createElement('div');PX.id='pxp';PX.className='hide';sv.appendChild(PX);
function openPx(i){cur=i;svM.classList.add('hide');PX.classList.remove('hide');render();markNav()}
function closePx(){if(PX.classList.contains('hide'))return;PX.classList.add('hide');svM.classList.remove('hide');regs=[]}
function markNav(){document.querySelectorAll('#svL button[data-px]').forEach(b=>{const on=!PX.classList.contains('hide')&&+b.dataset.px===cur;b.classList.toggle('on',on)});if(!PX.classList.contains('hide'))document.querySelectorAll('#svL button:not([data-px])').forEach(b=>b.classList.remove('on'))}
function ensureNav(){const L=$('svL');if(!L||L.querySelector('button[data-px]'))return;const inv=L.querySelector('button.inv');CATS.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.dataset.px=i;b.innerHTML='<span>'+c.ic+'</span>'+c.nm;L.insertBefore(b,inv||null)})}
function render(){
 const c=CATS[cur];regs=[];
 const mine=c.L.filter(r=>own(r[0])).length;
 PX.innerHTML='<div class="pxT">'+CATS.map((x,i)=>'<button type="button" data-t="'+i+'" class="'+(i===cur?'on':'')+'">'+x.ic+' '+x.nm.split(' ')[0]+'</button>').join('')+'</div>'
  +'<div class="pxH"><span style="font-size:26px">'+c.ic+'</span><div><b>'+c.nm+'</b><small>'+c.sub+' · tienes '+mine+'/'+c.L.length+'</small></div><i>NUEVO</i></div><div id="pxG"></div>';
 const G=$('pxG');
 c.L.forEach(r=>{const it=IDX[r[0]],R=RAR[it.rar],o=own(it.id),e=eqd(it),d=document.createElement('div');d.className='pxK'+(e?' on':'');d.style.setProperty('--rc',R[1]);d.dataset.id=it.id;
  const w=c.card?160:130,h=c.card?72:130;
  d.innerHTML='<span class="pxR">'+R[0]+'</span><canvas width="'+w+'" height="'+h+'" style="width:'+(c.card?'100%':'110px')+';'+(c.card?'height:auto;aspect-ratio:160/72':'height:110px')+'"></canvas><b>'+esc(it.name)+'</b><div class="pxP '+(e?'eq':o?'ok':'')+'">'+(e?'✔ EN USO':o?'✔ TUYO':'DOP '+fmt(it.price))+'</div><button type="button" class="pxB '+(e?'d':o?'g':'')+'" data-a="b">'+(e?'EQUIPADO ✕':o?'EQUIPAR':'COMPRAR')+'</button>';
  G.appendChild(d);const cv=d.querySelector('canvas');regs.push({cv,g:cv.getContext('2d'),k:it.k,id:it.id})});
 drawNow()}
function drawNow(){const t=performance.now()/1000;regs.forEach(r=>drawReg(r,SET.red||RM?3:t))}
function preview(it){const c=CATS[it.ci],R=RAR[it.rar],o=own(it.id),e=eqd(it);
 modal(it.name,'<div id="pxBigW"><span class="pxR" style="--rc:'+R[1]+';background:'+R[1]+'">'+R[0]+'</span><canvas id="pxBig" width="'+(c.card?320:240)+'" height="'+(c.card?144:240)+'" style="width:'+(c.card?'100%':'200px')+'"></canvas><small>'+esc(it.d)+'</small><b style="color:#ffd400">'+(o?'✔ Ya es tuyo':'DOP '+fmt(it.price))+'</b><small>Solo cambia la apariencia. No da ventajas.</small></div>',
  [[o?(e?'QUITAR':'EQUIPAR'):'COMPRAR',()=>o?equip(it):buy(it)],['CERRAR',null,'tg']]);
 const cv=$('pxBig');if(cv)regs.push({cv,g:cv.getContext('2d'),k:it.k,id:it.id,big:1});drawNow()}
PX.addEventListener('click',e=>{
 const t=e.target.closest('button[data-t]');if(t){SFX.click();cur=+t.dataset.t;render();markNav();return}
 const card=e.target.closest('.pxK');if(!card)return;const it=IDX[card.dataset.id];if(!it)return;
 const b=e.target.closest('button[data-a]');SFX.click();
 if(b){own(it.id)?equip(it):buy(it)}else preview(it)});
/* conexión con tu tienda actual */
const L0=$('svL');
if(L0){ensureNav();new MutationObserver(()=>{ensureNav();markNav()}).observe(L0,{childList:true});
 L0.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.px!=null){SFX.click();openPx(+b.dataset.px)}else closePx()})}
const qI=$('svQ');if(qI)qI.addEventListener('input',closePx);
window.__X={WS:WS,WN:WN,WCOL:WCOL,CD:CD,FXD:FXD,FR:FR,IDX:IDX,RAR:RAR};
sync();
})();





/* ===== D.M.R v27: tienda integrada · 30 fotos animadas · perfil corregido · mapa con 10 mundos ===== */
(function(){
if(window.__dmr27)return;window.__dmr27=1;
const X=window.__X;
if(!X||!X.IDX||!X.CD||!X.WS||!X.FR||!X.FXD){setTimeout(()=>{try{toast('⚠ Falta pegar la línea window.__X en el bloque v26')}catch(e){}},2000);return}
const TAU=6.283185,rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)};
const ca=(h,a)=>{const n=parseInt(h.slice(1),16);return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'};
const mx=(h,k)=>{const n=parseInt(h.slice(1),16),f=k>0?255:0,q=Math.abs(k),c=s=>Math.round(((n>>s)&255)*(1-q)+f*q);return'rgb('+c(16)+','+c(8)+','+c(0)+')'};
const RM=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const mob=()=>matchMedia('(max-width:900px)').matches;
function glint(g,x,y,r,c){g.save();g.translate(x,y);g.fillStyle=c;g.shadowColor=c;g.shadowBlur=r;g.beginPath();for(let k=0;k<8;k++){const q=k%2?r*.2:r,a=k*.7854-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill();g.restore()}
function halo(g,x,y,r,c,al){g.save();g.globalAlpha=al;g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.restore()}
function eye(g,x,y,w,h,rot,col,t,ph){const k=.65+.35*Math.sin(t*2.4+ph),bl=((t*.45+ph)%3.2)<.12?.15:1;g.save();g.translate(x,y);g.rotate(rot);g.shadowColor=col;g.shadowBlur=w*1.8*k;g.fillStyle=col;g.globalAlpha=.55+.45*k;g.beginPath();g.ellipse(0,0,w,h*bl,0,0,TAU);g.fill();g.globalAlpha=.9*k;g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,w*.5,h*.45*bl,0,0,TAU);g.fill();g.restore()}
function bf(g,x,y,R,m){const q=g.createLinearGradient(x-R*.5,y-R*.7,x+R*.5,y+R*.7);q.addColorStop(0,mx(m,.4));q.addColorStop(.5,m);q.addColorStop(1,mx(m,-.6));g.fillStyle=q}
function avatarPH(g,cx,cy,r){g.save();g.beginPath();g.arc(cx,cy,r,0,TAU);g.clip();const q=g.createRadialGradient(cx,cy-r*.3,2,cx,cy,r);q.addColorStop(0,'#2a3a8a');q.addColorStop(1,'#070a22');g.fillStyle=q;g.fillRect(cx-r,cy-r,2*r,2*r);g.fillStyle='#4a5aa8';g.beginPath();g.arc(cx,cy-r*.15,r*.32,0,TAU);g.fill();g.beginPath();g.ellipse(cx,cy+r*.85,r*.62,r*.5,0,0,TAU);g.fill();g.restore();g.save();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=Math.max(1,r*.07);g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.restore()}

/* ---------- AURAS (detrás del personaje) ---------- */
const AU={
elec(g,cx,cy,R,t,a){const q=Math.floor(t*13);g.lineJoin='round';g.lineCap='round';for(let b=0;b<6;b++){const an=rd(q*3+b)*TAU,len=R*(.75+rd(q+b*5)*.5);g.beginPath();g.moveTo(cx+Math.cos(an)*R*.3,cy+Math.sin(an)*R*.3);for(let s=1;s<=6;s++){const aa=an+(rd(q*7+b*9+s)-.5)*.7,d=R*.3+(len-R*.3)*s/6;g.lineTo(cx+Math.cos(aa)*d,cy+Math.sin(aa)*d)}g.strokeStyle=a;g.shadowColor=a;g.shadowBlur=R*.2;g.lineWidth=R*.07;g.globalAlpha=.75;g.stroke();g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=R*.025;g.globalAlpha=.95;g.stroke()}g.globalAlpha=1;halo(g,cx,cy,R*.9,a,.25+.15*Math.sin(t*9))},
fire(g,cx,cy,R,t,a,e){for(let k=0;k<11;k++){const x=cx+(k-5)*R*.2,fh=R*(.5+.5*Math.abs(Math.sin(t*5.5+k*1.7)))*(1-Math.abs(k-5)*.08),q=g.createLinearGradient(0,cy+R,0,cy+R-fh*1.6);q.addColorStop(0,a);q.addColorStop(.6,e);q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.globalAlpha=.85;g.beginPath();g.moveTo(x-R*.17,cy+R);g.quadraticCurveTo(x-R*.04+Math.sin(t*4+k)*R*.05,cy+R-fh,x+Math.sin(t*3+k)*R*.04,cy+R-fh*1.5);g.quadraticCurveTo(x+R*.06,cy+R-fh*.6,x+R*.17,cy+R);g.fill()}g.globalAlpha=1;for(let i=0;i<10;i++){const p=(t*.35*(.6+rd(i))+rd(i+3))%1;g.globalAlpha=1-p;g.fillStyle=i%2?e:a;g.beginPath();g.arc(cx+(rd(i+9)-.5)*R*1.7,cy+R-p*R*1.9,R*.03,0,TAU);g.fill()}g.globalAlpha=1;halo(g,cx,cy+R*.6,R,a,.3)},
smoke(g,cx,cy,R,t,a,e){for(let i=0;i<14;i++){const p=(t*.16+i/14)%1,x=cx+Math.sin(i*2.1+t*.5)*R*.75,y=cy+R*(1.1-p*2.1),r=R*(.2+p*.3);g.fillStyle=ca(i%3?a:e,.3*(1-p));g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}halo(g,cx,cy+R*.5,R*1.1,a,.25)},
rings(g,cx,cy,R,t,a,e){for(let k=0;k<3;k++){g.save();g.translate(cx,cy);g.rotate(t*(.7+k*.4)*(k%2?-1:1)+k*1.1);g.strokeStyle=k%2?e:a;g.lineWidth=R*.05;g.shadowColor=g.strokeStyle;g.shadowBlur=R*.15;g.setLineDash([R*.4,R*.14]);g.beginPath();g.ellipse(0,0,R*(.85+k*.08),R*(.55+k*.1),0,0,TAU);g.stroke();g.restore()}halo(g,cx,cy,R,a,.2)},
galaxy(g,cx,cy,R,t,a,e){g.save();g.translate(cx,cy);g.rotate(t*.35);g.scale(1,.7);for(let j=0;j<80;j++)for(let s=0;s<2;s++){const an=j*.26+s*3.1416,r=j/80*R*1.15;g.globalAlpha=.9-j/100;g.fillStyle=j%3?a:e;g.fillRect(Math.cos(an)*r,Math.sin(an)*r,R*.035,R*.035)}g.restore();g.globalAlpha=1;halo(g,cx,cy,R*.8,a,.35);for(let i=0;i<14;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.3+i));g.fillStyle='#fff';g.fillRect(cx+(rd(i)-.5)*R*2,cy+(rd(i+9)-.5)*R*2,R*.025,R*.025)}g.globalAlpha=1},
holo(g,cx,cy,R,t,a,e){g.strokeStyle=ca(a,.3);g.lineWidth=R*.012;for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(cx+i*R*.25,cy-R);g.lineTo(cx+i*R*.25,cy+R);g.stroke();g.beginPath();g.moveTo(cx-R,cy+i*R*.25);g.lineTo(cx+R,cy+i*R*.25);g.stroke()}const sy=cy-R+((t*.5)%1)*2*R;g.fillStyle=ca(a,.35);g.fillRect(cx-R,sy-R*.05,2*R,R*.1);const q=Math.floor(t*10);for(let k=0;k<4;k++)if(rd(q+k*3)>.55){g.fillStyle=ca(rd(q+k)>.5?a:e,.35);g.fillRect(cx-R+(rd(q*2+k)-.5)*R*.4,cy-R+rd(q+k*7)*2*R,R*1.6,R*.06)}halo(g,cx,cy,R,a,.25)},
ice(g,cx,cy,R,t,a,e){halo(g,cx,cy,R*1.1,a,.3);for(const s of [-1,1]){g.fillStyle=ca(e,.6);g.strokeStyle='#fff';g.lineWidth=R*.015;g.beginPath();g.moveTo(cx+s*R*.9,cy+R);g.lineTo(cx+s*R*.7,cy+R*.1);g.lineTo(cx+s*R*.5,cy+R);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(cx+s*R*.55,cy+R);g.lineTo(cx+s*R*.4,cy+R*.45);g.lineTo(cx+s*R*.25,cy+R);g.closePath();g.fill()}g.fillStyle='#fff';for(let i=0;i<34;i++){const p=(t*.12*(.6+rd(i))+rd(i+3))%1;g.globalAlpha=.85;g.beginPath();g.arc(cx+(rd(i)-.5)*2.2*R+Math.sin(t+i)*R*.06,cy-R+p*2*R,R*(.015+rd(i+5)*.025),0,TAU);g.fill()}g.globalAlpha=1},
spark(g,cx,cy,R,t,a,e){g.save();g.translate(cx,cy-R*.1);g.rotate(t*.25);g.globalCompositeOperation='lighter';for(let k=0;k<12;k++){g.rotate(TAU/12);g.fillStyle=ca(a,.14+.07*Math.sin(t*2+k));g.beginPath();g.moveTo(0,0);g.lineTo(R*1.5,-R*.09);g.lineTo(R*1.5,R*.09);g.fill()}g.restore();halo(g,cx,cy,R,a,.35);for(let i=0;i<7;i++){const q=Math.floor(t*1.6+i*1.3),ph=t*1.6+i*1.3-q;g.globalAlpha=Math.sin(ph*3.14);glint(g,cx+(rd(q*3+i)-.5)*R*1.7,cy+(rd(q+i*5)-.5)*R*1.7,R*.08+rd(q+i)*R*.08,i%2?e:a)}g.globalAlpha=1},
pulse(g,cx,cy,R,t,a,e){for(let i=0;i<4;i++){const p=(t*.5+i/4)%1;g.globalAlpha=(1-p)*.8;g.strokeStyle=i%2?e:a;g.lineWidth=R*.06;g.beginPath();g.arc(cx,cy,R*(.3+p*1.1),0,TAU);g.stroke()}g.globalAlpha=1;halo(g,cx,cy,R,a,.3+.15*Math.sin(t*4))}};

/* ---------- PERSONAJES ---------- */
const HD={
helm(g,x,y,R,t,m,a,e){const w=R*.5;bf(g,x,y,R,m);g.beginPath();g.moveTo(x-w,y+R*.32);g.lineTo(x-w,y-R*.08);g.arc(x,y-R*.08,w,Math.PI,0);g.lineTo(x+w,y+R*.32);g.lineTo(x+w*.5,y+R*.56);g.lineTo(x-w*.5,y+R*.56);g.closePath();g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#03040c';g.beginPath();g.moveTo(x-w*.92,y-R*.06);g.lineTo(x+w*.92,y-R*.06);g.lineTo(x+w*.7,y+R*.14);g.lineTo(x-w*.7,y+R*.14);g.closePath();g.fill();
 eye(g,x-w*.42,y+R*.04,R*.12,R*.05,.2,e,t,0);eye(g,x+w*.42,y+R*.04,R*.12,R*.05,-.2,e,t,.7);
 const sw=Math.sin(t*3);g.fillStyle=a;g.globalAlpha=.9;g.beginPath();g.moveTo(x-R*.06,y-R*.58);g.quadraticCurveTo(x+R*.1+sw*R*.06,y-R*.98,x+R*.3+sw*R*.1,y-R*.9);g.quadraticCurveTo(x+R*.06,y-R*.8,x+R*.06,y-R*.58);g.fill();g.globalAlpha=1;
 g.strokeStyle=ca(a,.6);g.lineWidth=R*.02;g.beginPath();g.moveTo(x-w*.5,y+R*.2);g.lineTo(x-w*.5,y+R*.5);g.moveTo(x+w*.5,y+R*.2);g.lineTo(x+w*.5,y+R*.5);g.stroke()},
skull(g,x,y,R,t,m,a,e){const q=g.createRadialGradient(x-R*.15,y-R*.3,R*.05,x,y,R*.6);q.addColorStop(0,mx(m,.55));q.addColorStop(1,mx(m,-.35));g.fillStyle=q;g.beginPath();g.arc(x,y-R*.1,R*.46,0,TAU);g.fill();rr(g,x-R*.28,y+R*.15,R*.56,R*.36,R*.1);g.fill();
 g.fillStyle='#050308';[-1,1].forEach(s=>{g.beginPath();g.ellipse(x+s*R*.2,y-R*.08,R*.13,R*.15,s*.2,0,TAU);g.fill()});g.beginPath();g.moveTo(x,y+R*.06);g.lineTo(x-R*.06,y+R*.2);g.lineTo(x+R*.06,y+R*.2);g.fill();
 g.strokeStyle='#050308';g.lineWidth=R*.025;g.beginPath();for(let k=-2;k<=2;k++){g.moveTo(x+k*R*.1,y+R*.32);g.lineTo(x+k*R*.1,y+R*.5)}g.stroke();
 eye(g,x-R*.2,y-R*.08,R*.075,R*.1,0,e,t,0);eye(g,x+R*.2,y-R*.08,R*.075,R*.1,0,e,t,.6)},
ninja(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.arc(x,y-R*.05,R*.46,0,TAU);g.fill();g.fillStyle='#020208';g.beginPath();g.moveTo(x-R*.4,y-R*.12);g.quadraticCurveTo(x,y-R*.2,x+R*.4,y-R*.12);g.lineTo(x+R*.36,y+R*.06);g.quadraticCurveTo(x,y,x-R*.36,y+R*.06);g.closePath();g.fill();
 g.fillStyle=mx(m,-.5);g.beginPath();g.ellipse(x,y+R*.2,R*.4,R*.26,0,0,Math.PI);g.fill();
 g.strokeStyle=a;g.lineWidth=R*.08;g.beginPath();g.arc(x,y-R*.05,R*.44,Math.PI*1.12,Math.PI*1.88);g.stroke();
 eye(g,x-R*.18,y-R*.05,R*.11,R*.045,.25,e,t,0);eye(g,x+R*.18,y-R*.05,R*.11,R*.045,-.25,e,t,.7);
 g.fillStyle=a;g.beginPath();g.moveTo(x+R*.42,y-R*.2);g.quadraticCurveTo(x+R*.8,y-R*.1+Math.sin(t*5)*R*.12,x+R*.95,y+R*.1+Math.sin(t*4)*R*.18);g.quadraticCurveTo(x+R*.7,y+Math.sin(t*5+1)*R*.1,x+R*.42,y-R*.1);g.fill()},
king(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.ellipse(x,y+R*.08,R*.4,R*.48,0,0,TAU);g.fill();g.fillStyle=mx(m,-.45);g.beginPath();g.moveTo(x-R*.36,y+R*.2);g.quadraticCurveTo(x,y+R*.85,x+R*.36,y+R*.2);g.quadraticCurveTo(x,y+R*.45,x-R*.36,y+R*.2);g.fill();
 eye(g,x-R*.16,y+R*.0,R*.1,R*.05,.2,e,t,0);eye(g,x+R*.16,y+R*.0,R*.1,R*.05,-.2,e,t,.7);
 const q=g.createLinearGradient(0,y-R*.95,0,y-R*.3);q.addColorStop(0,mx(a,.5));q.addColorStop(1,a);g.save();g.fillStyle=q;g.shadowColor=a;g.shadowBlur=R*.2;g.beginPath();g.moveTo(x-R*.42,y-R*.3);g.lineTo(x-R*.46,y-R*.78);g.lineTo(x-R*.22,y-R*.52);g.lineTo(x,y-R*.92);g.lineTo(x+R*.22,y-R*.52);g.lineTo(x+R*.46,y-R*.78);g.lineTo(x+R*.42,y-R*.3);g.closePath();g.fill();g.restore();
 ['#ff2a55','#2a8bff','#19e68c'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(x+(i-1)*R*.22,y-R*.4,R*.045,0,TAU);g.fill()})},
robot(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);rr(g,x-R*.46,y-R*.4,R*.92,R*.8,R*.14);g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#02060c';rr(g,x-R*.38,y-R*.2,R*.76,R*.26,R*.06);g.fill();const sx=x+Math.sin(t*2.5)*R*.26;g.save();g.shadowColor=e;g.shadowBlur=R*.2;g.fillStyle=e;rr(g,sx-R*.1,y-R*.15,R*.2,R*.16,R*.04);g.fill();g.restore();
 g.fillStyle=ca(a,.5);g.fillRect(x-R*.34,y-R*.1,R*.06,R*.04);g.fillRect(x+R*.28,y-R*.1,R*.06,R*.04);
 g.strokeStyle=ca(a,.7);g.lineWidth=R*.02;g.beginPath();for(let k=-2;k<=2;k++){g.moveTo(x+k*R*.1,y+R*.16);g.lineTo(x+k*R*.1,y+R*.32)}g.moveTo(x,y-R*.4);g.lineTo(x,y-R*.62);g.stroke();
 g.fillStyle=Math.sin(t*5)>0?a:e;g.beginPath();g.arc(x,y-R*.64,R*.05,0,TAU);g.fill()},
mask(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.moveTo(x,y-R*.55);g.bezierCurveTo(x+R*.5,y-R*.5,x+R*.5,y+R*.2,x,y+R*.58);g.bezierCurveTo(x-R*.5,y+R*.2,x-R*.5,y-R*.5,x,y-R*.55);g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#030308';[-1,1].forEach(s=>{g.beginPath();g.moveTo(x+s*R*.06,y-R*.04);g.lineTo(x+s*R*.4,y-R*.2);g.lineTo(x+s*R*.32,y+R*.04);g.closePath();g.fill()});
 eye(g,x-R*.22,y-R*.09,R*.1,R*.045,.35,e,t,0);eye(g,x+R*.22,y-R*.09,R*.1,R*.045,-.35,e,t,.7);
 g.strokeStyle=a;g.lineWidth=R*.025;g.beginPath();g.moveTo(x,y-R*.5);g.lineTo(x,y-R*.2);g.moveTo(x-R*.22,y+R*.2);g.lineTo(x-R*.1,y+R*.42);g.moveTo(x+R*.22,y+R*.2);g.lineTo(x+R*.1,y+R*.42);g.stroke()},
cosmic(g,x,y,R,t,m,a,e){g.fillStyle='#06030f';g.beginPath();g.arc(x,y-R*.08,R*.5,0,TAU);g.fill();g.save();g.beginPath();g.arc(x,y-R*.08,R*.5,0,TAU);g.clip();g.translate(x,y-R*.08);g.rotate(t*.5);for(let j=0;j<60;j++)for(let s=0;s<2;s++){const an=j*.3+s*3.1416,r=j/60*R*.7;g.globalAlpha=.95-j/80;g.fillStyle=j%3?a:e;g.fillRect(Math.cos(an)*r,Math.sin(an)*r*.8,R*.03,R*.03)}g.globalAlpha=1;halo(g,0,0,R*.4,a,.7);g.restore();
 g.strokeStyle=a;g.lineWidth=R*.03;g.beginPath();g.arc(x,y-R*.08,R*.5,0,TAU);g.stroke();eye(g,x-R*.2,y-R*.1,R*.09,R*.05,.2,'#fff',t,0);eye(g,x+R*.2,y-R*.1,R*.09,R*.05,-.2,'#fff',t,.7)},
demon(g,x,y,R,t,m,a,e){g.fillStyle=a;[-1,1].forEach(s=>{g.beginPath();g.moveTo(x+s*R*.28,y-R*.35);g.bezierCurveTo(x+s*R*.5,y-R*.7,x+s*R*.75,y-R*.7,x+s*R*.7,y-R*.98);g.bezierCurveTo(x+s*R*.58,y-R*.72,x+s*R*.42,y-R*.55,x+s*R*.16,y-R*.28);g.fill()});
 bf(g,x,y,R,m);g.beginPath();g.ellipse(x,y+R*.02,R*.44,R*.5,0,0,TAU);g.fill();g.fillStyle='#0a0204';g.beginPath();g.moveTo(x-R*.4,y-R*.2);g.lineTo(x,y-R*.1);g.lineTo(x+R*.4,y-R*.2);g.lineTo(x+R*.3,y-R*.02);g.lineTo(x-R*.3,y-R*.02);g.fill();
 eye(g,x-R*.19,y-R*.06,R*.12,R*.05,.5,e,t,0);eye(g,x+R*.19,y-R*.06,R*.12,R*.05,-.5,e,t,.7);
 g.fillStyle='#fff';g.beginPath();g.moveTo(x-R*.16,y+R*.28);g.lineTo(x-R*.1,y+R*.42);g.lineTo(x-R*.04,y+R*.28);g.moveTo(x+R*.04,y+R*.28);g.lineTo(x+R*.1,y+R*.42);g.lineTo(x+R*.16,y+R*.28);g.fill();halo(g,x,y+R*.3,R*.3,a,.4)},
hood(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.moveTo(x,y-R*.78);g.bezierCurveTo(x+R*.55,y-R*.55,x+R*.62,y+R*.1,x+R*.72,y+R*.62);g.lineTo(x-R*.72,y+R*.62);g.bezierCurveTo(x-R*.62,y+R*.1,x-R*.55,y-R*.55,x,y-R*.78);g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#010106';g.beginPath();g.ellipse(x,y-R*.02,R*.34,R*.4,0,0,TAU);g.fill();
 eye(g,x-R*.14,y-R*.04,R*.1,R*.06,.1,e,t,0);eye(g,x+R*.14,y-R*.04,R*.1,R*.06,-.1,e,t,.7)}};

/* ---------- LAS 30 FOTOS ---------- */
const PH=[
['ph01','Guerrero Eléctrico','e',2000,'helm',['#1a3fa8','#3a9bff','#bfe8ff'],'elec','Casco azul con un aura de rayos que lo recorre sin parar.'],
['ph02','Calavera Ardiente','e',2200,'skull',['#d8cdb8','#ff6a00','#ffd060'],'fire','Una calavera con fuego vivo y ojos que arden.'],
['ph03','Ninja de Sombras','e',2400,'ninja',['#1a1630','#8a3bff','#7ff6ff'],'smoke','Ninja entre humo oscuro con ojos que brillan.'],
['ph04','Rey Legendario','l',4500,'king',['#3a2a60','#ffc400','#fff3a0'],'spark','Rey con corona dorada, destellos y rayos de luz.'],
['ph05','Guerrero de Rayos','e',2600,'helm',['#2a2a40','#ffe94d','#ffffff'],'elec','Armadura oscura rodeada de rayos amarillos.'],
['ph06','Avatar Holográfico','e',2300,'robot',['#0a3a50','#00e5ff','#aaffff'],'holo','Rostro futurista con cuadrícula y fallas holográficas.'],
['ph07','Guerrero Carmesí','s',1200,'helm',['#5a0a14','#ff2a3a','#ffd0a0'],'pulse','Casco rojo con ondas de energía carmesí.'],
['ph08','Cosmos Viviente','l',4800,'cosmic',['#1a0a40','#a64dff','#ffffff'],'galaxy','Una galaxia gira dentro de su cabeza.'],
['ph09','Máscara Misteriosa','s',1000,'mask',['#e8e0d0','#19e68c','#7dffc4'],'smoke','Máscara con humo verde y ojos fantasmales.'],
['ph10','Guerrero de Hielo','e',2100,'helm',['#4a7aa8','#7fe3ff','#ffffff'],'ice','Armadura helada con nieve y cristales.'],
['ph11','Llamas Moradas','e',2800,'demon',['#2a0a4a','#b44dff','#ffb0ff'],'fire','Demonio envuelto en llamas moradas.'],
['ph12','Ojos Luminosos','s',900,'hood',['#14141e','#2a8bff','#ffffff'],'smoke','Figura encapuchada con ojos intensos.'],
['ph13','Guerrero de Anillos','e',2500,'helm',['#0a4a4a','#00ffd0','#e0fff8'],'rings','Casco rodeado de anillos de energía giratorios.'],
['ph14','Armadura Legendaria','l',5000,'helm',['#8a6a10','#ffd45a','#ffffff'],'spark','Armadura de oro con destellos de leyenda.'],
['ph15','Supremo D.M.R','x',6000,'robot',['#102a6a','#ffc400','#7fe3ff'],'elec+rings+spark','Exclusivo D.M.R: rayos, anillos y destellos dorados.'],
['ph16','Samurái Carmesí','e',2300,'ninja',['#3a0a14','#ff3a4a','#ffd0d0'],'spark','Samurái de sombra con banda roja y chispas.'],
['ph17','Robot Neón','s',1100,'robot',['#3a0a4a','#ff3df2','#ffd0ff'],'holo','Robot con visor magenta y pantallas holográficas.'],
['ph18','Demonio de Lava','l',4200,'demon',['#3a0a04','#ff6a00','#ffe060'],'fire','Cuernos incandescentes y fuego de volcán.'],
['ph19','Espectro Fantasma','s',1000,'hood',['#c8d8f0','#9fd0ff','#ffffff'],'smoke','Un espectro etéreo entre niebla azul.'],
['ph20','Cyborg Eléctrico','e',2400,'robot',['#1a2a4a','#4da6ff','#ffffff'],'elec','Cyborg con descargas azules.'],
['ph21','Dragón Dorado','l',4600,'demon',['#6a4a08','#ffc400','#fff3a0'],'fire','Cuernos dorados y llamas de oro.'],
['ph22','Hechicero Arcano','e',2700,'hood',['#2a0a5a','#c06bff','#ffd0ff'],'rings','Hechicero con círculos mágicos en órbita.'],
['ph23','Guerrero Solar','s',1300,'helm',['#7a3a08','#ffb030','#fff0a0'],'spark','Casco solar con rayos de luz.'],
['ph24','Calavera Cósmica','l',4400,'skull',['#9a8ad0','#8a5bff','#ff9cff'],'galaxy','Calavera con una galaxia a su espalda.'],
['ph25','Cazador de Tormentas','e',2500,'ninja',['#14243a','#5aa0ff','#e0f0ff'],'elec','Ninja que atrapa relámpagos.'],
['ph26','Espectro Esmeralda','s',1400,'mask',['#0a3a2a','#19e68c','#d0ffe8'],'pulse','Máscara verde con ondas de energía.'],
['ph27','Titán de Cristal','e',2900,'helm',['#7ab0d8','#bff6ff','#ffffff'],'ice','Armadura de cristal con destellos de hielo.'],
['ph28','Rey Oscuro','l',5000,'king',['#1a0a2a','#b44dff','#ff3a5a'],'smoke','Rey de las sombras con corona violeta.'],
['ph29','Guardián Divino','l',4700,'hood',['#e8e4f8','#ffd45a','#ffffff'],'spark','Guardián de luz con destellos dorados.'],
['ph30','Leyenda Infinita D.M.R','x',6000,'cosmic',['#0a0a3a','#ffc400','#7fe3ff'],'galaxy+elec','Exclusivo D.M.R: galaxia, rayos y oro.']];
const PHC={};PH.forEach(r=>PHC[r[0]]={h:r[4],p:r[5],au:r[6],x:r[2]==='x'||r[2]==='l'});
const HN={helm:'Casco de guerrero',skull:'Calavera',ninja:'Ninja encapuchado',king:'Rey con corona',robot:'Rostro robótico',mask:'Máscara misteriosa',cosmic:'Cabeza cósmica',demon:'Demonio con cuernos',hood:'Figura encapuchada'};
const AN={elec:'rayos eléctricos',fire:'fuego animado',smoke:'humo en movimiento',spark:'destellos y rayos de luz',holo:'cuadrícula holográfica',pulse:'ondas de energía',galaxy:'galaxia girando',ice:'nieve y cristales',rings:'anillos de energía'};
function drawPhoto(g,cx,cy,R,t,c){const m=c.p[0],a=c.p[1],e=c.p[2];g.save();g.beginPath();g.arc(cx,cy,R,0,TAU);g.clip();
 const q=g.createRadialGradient(cx,cy-R*.1,R*.05,cx,cy,R*1.15);q.addColorStop(0,ca(a,.6+.1*Math.sin(t*2)));q.addColorStop(.6,ca(m,.5));q.addColorStop(1,'#04030c');g.fillStyle=q;g.fillRect(cx-R,cy-R,2*R,2*R);
 c.au.split('+').forEach(k=>{g.save();AU[k](g,cx,cy,R,t,a,e);g.restore()});
 const bob=Math.sin(t*1.7)*R*.022;
 g.save();bf(g,cx,cy,R,m);g.beginPath();g.ellipse(cx,cy+R*.98+bob,R*.98,R*.52,0,0,TAU);g.fill();g.strokeStyle=ca(a,.7);g.lineWidth=R*.03;g.stroke();g.restore();
 g.save();HD[c.h](g,cx,cy+R*.04+bob,R,t,m,a,e);g.restore();
 for(let i=0;i<9;i++){const p=(t*.25*(.6+rd(i))+rd(i+5))%1;g.globalAlpha=Math.sin(p*3.14)*.9;g.fillStyle=i%2?e:a;g.beginPath();g.arc(cx+(rd(i)-.5)*R*1.6,cy+R-p*R*2,R*.025,0,TAU);g.fill()}g.globalAlpha=1;
 g.save();g.translate(cx,cy);g.rotate(.5);const sx=(((t*.4)%1.8)-.4)*R*2.4-R*1.2,sg=g.createLinearGradient(sx-R*.2,0,sx+R*.2,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.22)');sg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sg;g.fillRect(-R*2,-R*2,R*4,R*4);g.restore();
 g.restore();
 g.save();g.strokeStyle=a;g.lineWidth=R*.08;g.shadowColor=a;g.shadowBlur=R*.25;g.beginPath();g.arc(cx,cy,R*.95,0,TAU);g.stroke();g.shadowBlur=0;g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=R*.025;g.beginPath();g.arc(cx,cy,R*.99,0,TAU);g.stroke();
 if(c.x){const s=t*2;g.strokeStyle='#fff';g.lineWidth=R*.05;g.shadowColor=a;g.shadowBlur=R*.2;g.beginPath();g.arc(cx,cy,R*.95,s,s+.9);g.stroke()}g.restore()}

/* ---------- CATÁLOGO ---------- */
const RAR={b:['BÁSICO','#9aa7c7'],s:['ESPECIAL','#4da6ff'],e:['ÉPICO','#c06bff'],l:['LEGENDARIO','#ffd400'],x:['EXCLUSIVO D.M.R','#ff3df2']};
const IDX={},LIST={tc:[],pe:[],mf:[],ph:[]};
Object.keys(X.IDX).forEach(k=>{const it=X.IDX[k];if(LIST[it.k]){IDX[it.id]=it;LIST[it.k].push(it)}});
PH.forEach(r=>{const it={id:r[0],name:r[1],rar:r[2],price:r[3],d:r[7],k:'ph'};IDX[it.id]=it;LIST.ph.push(it)});
const CATS7=[{k:'tc',ic:'🃏',nm:'TARJETAS ANIMADAS',sub:'Fondo animado para tu perfil'},{k:'pe',ic:'💫',nm:'EFECTOS DE PERFIL',sub:'Partículas, auras y energía'},{k:'mf',ic:'🖼',nm:'MARCOS ANIMADOS',sub:'Marcos que rodean tu foto'},{k:'ph',ic:'🧑‍🚀',nm:'FOTOS ANIMADAS',sub:'Personajes con movimiento real'}];
const OWN=id=>!!VER||(prof.inv||[]).includes(id);
const EQ=it=>((prof.eq||{})[it.k]||'')===it.id;
const NV=['Ventaja competitiva','ninguna; es un objeto cosmético'];
const NO={tc:['No cambia tus tarjetas de siempre: puedes quitarla cuando quieras','No da puntos ni monedas','No da ventaja en las partidas'],pe:['No tapa tu nombre ni tus datos','No da puntos ni monedas','No da ventaja en las partidas'],mf:['No deforma ni cambia tu foto','No da puntos ni monedas','No da ventaja en las partidas'],ph:['No borra tu foto subida: puedes volver a ella','No da puntos ni monedas','No da ventaja ni cambia tus paletas']};
function feats(it){const r=RAR[it.rar][0].toLowerCase();
 if(it.k==='ph'){const c=PHC[it.id];return[['Personaje',HN[c.h]],['Animación','ojos que brillan, '+c.au.split('+').map(k=>AN[k]).join(' + ')+' y partículas'],['Colores',c.p.join(' · ')],['Se muestra en','tu perfil, el menú principal y las listas'],['Rareza',r],NV]}
 const T={tc:['Se aplica','como fondo animado de tu tarjeta de perfil'],pe:['Se muestra','alrededor de tu foto, con partículas y energía'],mf:['Se muestra','como marco animado que rodea tu foto']}[it.k];
 return[T,['Animación','movimiento continuo en tiempo real'],['Rareza',r],NV]}

/* ---------- ESTILOS ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
canvas.pxo,canvas.pxc{display:none!important}
#svL button[data-px],#pxp{display:none!important}
#svG .svK canvas.c7t{width:100%!important;height:auto!important;border-radius:10px;border:1px solid rgba(255,255,255,.2)}
#svG .svK canvas.c7a{width:112px!important;height:112px!important}
.pxin{animation:pxin .5s ease-out}
@keyframes pxin{from{opacity:0;transform:scale(.9)}}
canvas.ov7{position:fixed;right:auto;bottom:auto;pointer-events:none;max-width:none}
canvas.tc7{pointer-events:none}
</style>`);

/* ---------- DIBUJO DE TARJETAS DE TIENDA ---------- */
function item(g,cx,cy,R,t,it){g.save();if(it.k==='ph')drawPhoto(g,cx,cy,R,t,PHC[it.id]);else{avatarPH(g,cx,cy,R);(it.k==='pe'?X.FXD:X.FR)[it.id](g,cx,cy,R,t)}g.restore()}
function drawItem(cv,it,t,big){const g=cv.getContext('2d'),w=cv.width,h=cv.height;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
 if(it.k==='tc'){g.save();rr(g,0,0,w,h,h*.07);g.clip();X.CD[it.id](g,w,h,t,h/70);
  if(big){avatarPH(g,h*.34,h*.5,h*.2);g.fillStyle='#fff';g.shadowColor='#000';g.shadowBlur=6;g.textBaseline='middle';g.font='900 '+Math.round(h*.1)+'px system-ui,Arial';g.fillText(prof.name||'PLAYER',h*.62,h*.42);g.font='700 '+Math.round(h*.07)+'px system-ui,Arial';g.fillText('NIVEL '+plv(),h*.62,h*.58)}
  g.restore();return}
 if(big){const q=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.6);q.addColorStop(0,'rgba(30,50,140,.5)');q.addColorStop(1,'rgba(2,3,12,0)');g.fillStyle=q;g.fillRect(0,0,w,h)}
 item(g,w/2,h/2,Math.min(w,h)*.3,t,it)}
function drawMini(cv,it,t){const g=cv.getContext('2d'),w=cv.width,h=cv.height;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
 g.save();rr(g,2,2,w-4,h-4,h*.45);g.clip();g.fillStyle='#070b22';g.fillRect(0,0,w,h);if(it.k==='tc'){X.CD[it.id](g,w,h,t,h/70);g.fillStyle='rgba(4,6,22,.4)';g.fillRect(0,0,w,h)}g.restore();
 g.strokeStyle='#2a6bff';g.lineWidth=2;rr(g,2,2,w-4,h-4,h*.45);g.stroke();
 const R=h*.3,cx=h*.55,cy=h/2;if(it.k==='tc')avatarPH(g,cx,cy,R);else item(g,cx,cy,R,t,it);
 g.fillStyle='#fff';g.textBaseline='middle';g.font='800 '+Math.round(h*.22)+'px system-ui,Arial';g.fillText(prof.name||'PLAYER',h*1.08,h*.36);g.font='700 '+Math.round(h*.15)+'px system-ui,Arial';g.fillStyle='rgba(255,255,255,.8)';g.fillText('NIVEL '+plv(),h*1.08,h*.58);
 g.fillStyle='rgba(255,255,255,.2)';rr(g,h*1.08,h*.72,w*.5,h*.08,h*.04);g.fill();g.fillStyle='#3a8bff';rr(g,h*1.08,h*.72,w*.3,h*.08,h*.04);g.fill()}

/* ---------- TIENDA INTEGRADA (misma pantalla que las otras categorías) ---------- */
const sv=$('sv');let cur=-1,sel='',regs=[],busy=0;
const hideTb=v=>{const tb=sv.querySelector('.svTb');if(tb)tb.style.display=v?'none':''};
function nav(){const L=$('svL');if(!L)return;
 if(!L.querySelector('[data-n7]')){const inv=L.querySelector('button.inv');CATS7.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.dataset.n7=i;b.innerHTML='<span>'+c.ic+'</span>'+c.nm;L.insertBefore(b,inv||null)})}
 L.querySelectorAll('button').forEach(b=>{if(b.dataset.n7!=null)b.classList.toggle('on',+b.dataset.n7===cur);else if(cur>=0)b.classList.remove('on')})}
function render7(){const c=CATS7[cur],L=LIST[c.k],G=$('svG'),st=G.scrollTop,mine=L.filter(i=>OWN(i.id)).length;
 if(!sel||!IDX[sel]||IDX[sel].k!==c.k){const eq=L.find(EQ);sel=(eq||L[0]).id}
 hideTb(1);$('svT').innerHTML='<span>'+c.ic+'</span><div><b>'+c.nm+'</b><small>'+c.sub+' · tienes '+mine+'/'+L.length+'</small></div>';
 G.innerHTML='';regs=[];
 L.forEach(it=>{const rc=RAR[it.rar],o=OWN(it.id),e=EQ(it),d=document.createElement('div'),tc=c.k==='tc';d.className='svK'+(it.id===sel?' on':'');d.dataset.i7=it.id;d.style.setProperty('--rc',rc[1]);
  d.innerHTML='<span class="svRt">'+rc[0]+'</span><canvas class="'+(tc?'c7t':'c7a')+'" width="'+(tc?240:160)+'" height="'+(tc?120:160)+'"></canvas><b>'+esc(it.name)+'</b><div class="svPr">'+(o?(e?'EN USO':'✔ TUYO'):'<i class="svCn">$</i>'+fmt(it.price))+'</div><button type="button" class="svA '+(e?'d':o?'g':'')+'" data-a7="1">'+(e?'EQUIPADO ✕':o?'EQUIPAR':'COMPRAR')+'</button>';
  G.appendChild(d);regs.push({cv:d.querySelector('canvas'),it})});
 G.scrollTop=st;panel7();nav()}
function panel7(){const R=$('svR'),it=IDX[sel];if(!it)return;const rc=RAR[it.rar],o=OWN(it.id),e=EQ(it);R.style.setProperty('--rc',rc[1]);
 R.innerHTML='<button class="svRx" id="rx7" type="button">✕ CERRAR</button><div class="svBW"><span class="svTag" style="background:'+rc[1]+'">'+(it.rar==='l'||it.rar==='x'?'♛ ':'')+rc[0]+'</span><canvas id="big7" class="pxin" width="600" height="'+(it.k==='tc'?300:400)+'"></canvas></div>'
 +'<div class="svNm"><b>'+esc(it.name)+'</b><span style="color:'+rc[1]+'">'+rc[0]+'</span></div><p class="svD">'+esc(it.d)+'</p>'
 +'<h4>CARACTERÍSTICAS</h4><ul>'+feats(it).map(z=>'<li><b>'+z[0]+':</b> '+esc(z[1])+'</li>').join('')+'</ul>'
 +'<h4>LO QUE NO HACE</h4><ul class="no">'+NO[it.k].map(z=>'<li>'+z+'</li>').join('')+'</ul>'
 +'<h4>ASÍ SE VE EN TU PERFIL</h4><canvas id="mini7" width="480" height="112" style="width:100%;height:auto;border-radius:12px;display:block"></canvas>'
 +'<div class="svBuy"><div class="svPr big">'+(o?(e?'EN USO':'✔ TUYO'):'<i class="svCn">$</i>DOP '+fmt(it.price))+'</div><button id="act7" type="button" class="svA '+(e?'d':o?'g':'')+'">'+(e?'EQUIPADO ✕':o?'EQUIPAR':'COMPRAR')+'</button></div>';
 $('rx7').onclick=()=>{SFX.click();R.classList.remove('open')};$('act7').onclick=()=>act(it)}
function act(it){if(!OWN(it.id)){buy(it);return}equip(it)}
function buy(it){if(busy)return;busy=1;setTimeout(()=>{busy=0},700);
 const pc=prof.pc||0;if(pc<it.price){SFX.deny();toast('Saldo insuficiente: te faltan DOP '+fmt(it.price-pc));return}
 const go=()=>{if(OWN(it.id)||(prof.pc||0)<it.price)return;prof.pc-=it.price;prof.inv=prof.inv||[];if(!prof.inv.includes(it.id))prof.inv.push(it.id);try{chkAch()}catch(e){}saveP();updPC();SFX.point();toast('✔ Compraste '+it.name+' · −DOP '+fmt(it.price));if(cur>=0)render7()};
 it.price>=1500?modal('CONFIRMAR COMPRA','¿Comprar <b>'+esc(it.name)+'</b> por <b>DOP '+fmt(it.price)+'</b>?<br><small>Te quedarán DOP '+fmt(pc-it.price)+'</small>',[['COMPRAR',go],['CANCELAR',null,'tg']]):go()}
function equip(it){prof.eq=prof.eq||{};const on=prof.eq[it.k]===it.id;prof.eq[it.k]=on?'':it.id;saveP();SFX.point();toast(on?'Quitado: '+it.name:'✔ Equipado: '+it.name);if(cur>=0)render7()}
$('svG').addEventListener('click',e=>{const d=e.target.closest('.svK[data-i7]');if(!d||cur<0)return;const it=IDX[d.dataset.i7];if(!it)return;SFX.click();
 if(e.target.closest('[data-a7]')){act(it);return}
 sel=it.id;render7();if(mob())$('svR').classList.add('open')});
const L0=$('svL');
if(L0){nav();new MutationObserver(nav).observe(L0,{childList:true});
 L0.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.n7!=null){SFX.click();cur=+b.dataset.n7;sel='';render7();$('svR').classList.remove('open')}
  else if(cur>=0){cur=-1;hideTb(0)}})}
const qI=$('svQ');if(qI)qI.addEventListener('input',()=>{if(cur>=0){cur=-1;hideTb(0)}});
new MutationObserver(()=>{if(sv.classList.contains('hide')&&cur>=0){cur=-1;hideTb(0)}}).observe(sv,{attributes:true,attributeFilter:['class']});

/* ---------- FOTO, EFECTO Y MARCO SOBRE TU AVATAR (en cualquier lugar donde salga) ---------- */
const pool=[];
function ovc(i){let c=pool[i];if(!c){c=document.createElement('canvas');c.className='ov7';document.body.appendChild(c);pool[i]=c}return c}
function overlays(t){const e=prof.eq||{},ph=e.ph&&PHC[e.ph]&&OWN(e.ph)?e.ph:'',pe=e.pe&&X.FXD[e.pe]&&OWN(e.pe)?e.pe:'',mf=e.mf&&X.FR[e.mf]&&OWN(e.mf)?e.mf:'';let n=0;
 if(ph||pe||mf){const T=[];[['av',2],['cav',21]].forEach(z=>{const el=$(z[0]);if(el&&el.offsetParent!==null)T.push([el,z[1]])});
  document.querySelectorAll('.rk .av,.idrow .av').forEach(el=>{const row=el.closest('.rk,.idrow');if(!row||el.id)return;const nb=row.querySelector('.rkt b,span b');if(!nb)return;const s=(nb.textContent||'').trim(),nm=prof.name||'';if(nm&&s.indexOf(nm)===0&&!/\w/.test(s.charAt(nm.length)))T.push([el,21])});
  const dpr=Math.min(devicePixelRatio||1,2);
  for(const z of T){const el=z[0],r=el.getBoundingClientRect();if(r.width<8||r.bottom<0||r.top>innerHeight)continue;
   const S=r.width*1.45,B=Math.min(320,Math.max(40,Math.round(S*dpr))),c=ovc(n++);if(c.width!==B){c.width=B;c.height=B}
   const s=c.style;s.display='block';s.left=(r.left+r.width/2-S/2)+'px';s.top=(r.top+r.height/2-S/2)+'px';s.width=S+'px';s.height=S+'px';s.zIndex=z[1];
   const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,B,B);const cx=B/2,R=B/2/1.45;
   if(ph){g.save();drawPhoto(g,cx,cx,R,t,PHC[ph]);g.restore()}
   if(pe){g.save();try{X.FXD[pe](g,cx,cx,R,t)}catch(er){}g.restore()}
   if(mf){g.save();try{X.FR[mf](g,cx,cx,R,t)}catch(er){}g.restore()}}}
 for(let i=n;i<pool.length;i++)if(pool[i])pool[i].style.display='none'}
/* tarjeta animada como fondo de tu perfil */
function tcSync(t){const e=prof.eq||{},id=e.tc&&X.CD[e.tc]&&OWN(e.tc)?e.tc:'';
 ['pcard','pf'].forEach(hid=>{const h=$(hid);if(!h)return;let c=null;for(const k of h.children)if(k.tagName==='CANVAS'&&k.classList.contains('tc7')){c=k;break}
  if(!id){if(c)c.remove();return}if(h.offsetParent===null)return;
  if(!c){c=document.createElement('canvas');c.className='tc7';c.style.cssText='position:absolute;left:0;top:0;right:auto;bottom:auto;width:100%;height:100%;z-index:-1;pointer-events:none;border-radius:inherit';h.insertBefore(c,h.firstChild);h.style.position='relative';h.style.isolation='isolate'}
  const dpr=Math.min(devicePixelRatio||1,2),w=Math.max(40,Math.round(h.offsetWidth*dpr)),hh=Math.max(20,Math.round(h.offsetHeight*dpr));if(c.width!==w||c.height!==hh){c.width=w;c.height=hh}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,hh);g.save();try{X.CD[id](g,w,hh,t,hh/70)}catch(er){}g.restore();g.fillStyle='rgba(4,6,22,.38)';g.fillRect(0,0,w,hh)})}

/* ---------- MAPA DE NIVELES: un mundo animado cada 10 niveles ---------- */
const ZC0=['#ff3b1f','#b6ff00','#19e65a','#2a6bff','#0a7aff','#ff9a1f','#7fe3ff','#4dff3a','#a64dff','#ff2233'];
const S7=document.createElement('canvas');S7.width=400;S7.height=250;const s7=S7.getContext('2d');
function paintZone(c,z,t){s7.setTransform(1,0,0,1,0,0);s7.globalAlpha=1;s7.globalCompositeOperation='source-over';s7.save();try{X.WS[z](s7,t)}catch(e){}s7.restore();
 const g=c.getContext('2d'),w=c.width,h=c.height,n=Math.max(1,Math.round(h/(w*.62))),th=h/n;
 for(let i=0;i<n;i++){g.save();g.translate(0,i*th);if(i%2){g.translate(0,th);g.scale(1,-1)}g.drawImage(S7,0,0,w,th);g.restore()}
 g.fillStyle='rgba(2,3,12,'+(z===9?.5:.4)+')';g.fillRect(0,0,w,h)}
function mapSkin(){const In=$('lmIn');if(!In||In.querySelector('canvas.wz'))return;const Wd=In.offsetWidth||480,Ht=In.offsetHeight,ov=70;
 In.querySelectorAll('canvas.zc').forEach(o=>{const z=+o.dataset.z,top=parseFloat(o.style.top)||0,h=parseFloat(o.style.height)||600;o.classList.remove('zc');o.style.display='none';
  const t0=Math.max(0,top-ov),h0=Math.min(Ht,top+h+ov)-t0,c=document.createElement('canvas');c.className='wz';c.dataset.z=z;c.width=Math.round(Wd/1.4);c.height=Math.max(2,Math.round(h0/1.4));
  const mk='linear-gradient(180deg,transparent 0,#000 '+ov+'px,#000 calc(100% - '+ov+'px),transparent 100%)';
  c.style.cssText='position:absolute;left:0;right:auto;bottom:auto;max-width:none;z-index:0;top:'+t0+'px;width:'+Wd+'px;height:'+h0+'px;-webkit-mask-image:'+mk+';mask-image:'+mk;
  In.insertBefore(c,In.firstChild)});
 In.querySelectorAll('.mn').forEach(b=>{const s=b.querySelector('span'),n=s?parseInt(s.textContent):0;if(n)b.style.setProperty('--nc',X.WCOL[Math.min(9,Math.floor((n-1)/10))])});
 In.querySelectorAll('.dr').forEach(d=>{const k=+d.id.slice(2);if(k)d.style.setProperty('--c',k===10?'#ffd24a':X.WCOL[k-1])});
 In.querySelectorAll('svg g[stroke]').forEach(gx=>{const s=gx.getAttribute('stroke'),i=ZC0.indexOf(s);if(i>=0){gx.setAttribute('stroke',X.WCOL[i]);if(gx.style.filter)gx.style.filter=gx.style.filter.split(s).join(X.WCOL[i])}})}
const _ol=openLevels;
openLevels=function(){const r=_ol.apply(this,arguments);try{mapSkin();setTimeout(mapSkin,250)}catch(e){}return r};
let mlast=0;
function mapz(n,t){const lm=$('lm');if(!lm||lm.classList.contains('hide'))return;if(n-mlast<(SET.red?400:55))return;mlast=n;
 const sc=$('lmSc'),st=sc.scrollTop,vh=innerHeight,mid=st+vh*.5;let zz=-1;
 document.querySelectorAll('#lmIn canvas.wz').forEach(c=>{const top=parseFloat(c.style.top),h=parseFloat(c.style.height);
  if(mid>=top+70&&mid<top+h-70)zz=+c.dataset.z;if(top+h<st-150||top>st+vh+150)return;paintZone(c,+c.dataset.z,t)});
 if(zz>=0){const lk=(VER?100:(prof.best||0))<10*zz,nm=(lk?'🔒 ':'')+X.WN[zz],E=$('lmZ');if(E.textContent!==nm){E.textContent=nm;E.style.color=X.WCOL[zz]}}}

/* ---------- BUCLE ÚNICO ---------- */
let last=0;
function loop(n){requestAnimationFrame(loop);const red=SET.red||RM;if(n-last<(red?500:40))return;last=n;const t=red?3:n/1000;
 try{overlays(t)}catch(e){}
 try{tcSync(t)}catch(e){}
 try{if(cur>=0&&!sv.classList.contains('hide')){const vh=innerHeight;for(const r of regs){if(!r.cv.isConnected)continue;const b=r.cv.getBoundingClientRect();if(b.bottom<0||b.top>vh)continue;drawItem(r.cv,r.it,t,false)}
  const B=$('big7');if(B)drawItem(B,IDX[sel],t,true);const M=$('mini7');if(M)drawMini(M,IDX[sel],t)}}catch(e){}
 try{mapz(n/1000,red?3:n/1000)}catch(e){}}
requestAnimationFrame(loop);
})();



/* ===== D.M.R v28: animaciones reales (tarjetas, marcos, fotos) + perfil público + duración ===== */
(function(){
if(window.__dmr28)return;window.__dmr28=1;
const X=window.__X;
if(!X||!X.IDX||!X.CD||!X.FR||!X.FXD){setTimeout(()=>{try{toast('⚠ Falta la línea window.__X del bloque v26')}catch(e){}},2000);return}
const SEGUNDOS={}; /* ejemplo: {pe05:30} = ese efecto dura 30 s; vacío = permanentes */
const TAU=6.283185,rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
const rr=(g,x,y,w,h,r)=>{g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h)};
const ca=(h,a)=>{const n=parseInt(h.slice(1),16);return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'};
const mx=(h,k)=>{const n=parseInt(h.slice(1),16),f=k>0?255:0,q=Math.abs(k),c=s=>Math.round(((n>>s)&255)*(1-q)+f*q);return'rgb('+c(16)+','+c(8)+','+c(0)+')'};
function glint(g,x,y,r,c){g.save();g.translate(x,y);g.fillStyle=c;g.shadowColor=c;g.shadowBlur=r;g.beginPath();for(let k=0;k<8;k++){const q=k%2?r*.2:r,a=k*.7854-1.5708;g[k?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill();g.restore()}
function halo(g,x,y,r,c,al){g.save();g.globalAlpha=al;g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.restore()}
function eye(g,x,y,w,h,rot,col,t,ph){const k=.65+.35*Math.sin(t*2.4+ph),bl=((t*.45+ph)%3.2)<.12?.15:1;g.save();g.translate(x,y);g.rotate(rot);g.shadowColor=col;g.shadowBlur=w*1.8*k;g.fillStyle=col;g.globalAlpha=.55+.45*k;g.beginPath();g.ellipse(0,0,w,h*bl,0,0,TAU);g.fill();g.globalAlpha=.9*k;g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,w*.5,h*.45*bl,0,0,TAU);g.fill();g.restore()}
function bf(g,x,y,R,m){const q=g.createLinearGradient(x-R*.5,y-R*.7,x+R*.5,y+R*.7);q.addColorStop(0,mx(m,.4));q.addColorStop(.5,m);q.addColorStop(1,mx(m,-.6));g.fillStyle=q}
function avatarPH(g,cx,cy,r){g.save();g.beginPath();g.arc(cx,cy,r,0,TAU);g.clip();const q=g.createRadialGradient(cx,cy-r*.3,2,cx,cy,r);q.addColorStop(0,'#2a3a8a');q.addColorStop(1,'#070a22');g.fillStyle=q;g.fillRect(cx-r,cy-r,2*r,2*r);g.fillStyle='#4a5aa8';g.beginPath();g.arc(cx,cy-r*.15,r*.32,0,TAU);g.fill();g.beginPath();g.ellipse(cx,cy+r*.85,r*.62,r*.5,0,0,TAU);g.fill();g.restore();g.save();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=Math.max(1,r*.07);g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();g.restore()}

/* ---------- auras y personajes de las fotos ---------- */
const AU={
elec(g,cx,cy,R,t,a){const q=Math.floor(t*13);g.lineJoin='round';g.lineCap='round';for(let b=0;b<6;b++){const an=rd(q*3+b)*TAU,len=R*(.75+rd(q+b*5)*.5);g.beginPath();g.moveTo(cx+Math.cos(an)*R*.3,cy+Math.sin(an)*R*.3);for(let s=1;s<=6;s++){const aa=an+(rd(q*7+b*9+s)-.5)*.7,d=R*.3+(len-R*.3)*s/6;g.lineTo(cx+Math.cos(aa)*d,cy+Math.sin(aa)*d)}g.strokeStyle=a;g.shadowColor=a;g.shadowBlur=R*.2;g.lineWidth=R*.07;g.globalAlpha=.75;g.stroke();g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=R*.025;g.globalAlpha=.95;g.stroke()}g.globalAlpha=1;halo(g,cx,cy,R*.9,a,.25+.15*Math.sin(t*9))},
fire(g,cx,cy,R,t,a,e){for(let k=0;k<11;k++){const x=cx+(k-5)*R*.2,fh=R*(.5+.5*Math.abs(Math.sin(t*5.5+k*1.7)))*(1-Math.abs(k-5)*.08),q=g.createLinearGradient(0,cy+R,0,cy+R-fh*1.6);q.addColorStop(0,a);q.addColorStop(.6,e);q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.globalAlpha=.85;g.beginPath();g.moveTo(x-R*.17,cy+R);g.quadraticCurveTo(x-R*.04+Math.sin(t*4+k)*R*.05,cy+R-fh,x+Math.sin(t*3+k)*R*.04,cy+R-fh*1.5);g.quadraticCurveTo(x+R*.06,cy+R-fh*.6,x+R*.17,cy+R);g.fill()}g.globalAlpha=1;for(let i=0;i<10;i++){const p=(t*.35*(.6+rd(i))+rd(i+3))%1;g.globalAlpha=1-p;g.fillStyle=i%2?e:a;g.beginPath();g.arc(cx+(rd(i+9)-.5)*R*1.7,cy+R-p*R*1.9,R*.03,0,TAU);g.fill()}g.globalAlpha=1;halo(g,cx,cy+R*.6,R,a,.3)},
smoke(g,cx,cy,R,t,a,e){for(let i=0;i<14;i++){const p=(t*.16+i/14)%1,x=cx+Math.sin(i*2.1+t*.5)*R*.75,y=cy+R*(1.1-p*2.1),r=R*(.2+p*.3);g.fillStyle=ca(i%3?a:e,.3*(1-p));g.beginPath();g.arc(x,y,r,0,TAU);g.fill()}halo(g,cx,cy+R*.5,R*1.1,a,.25)},
rings(g,cx,cy,R,t,a,e){for(let k=0;k<3;k++){g.save();g.translate(cx,cy);g.rotate(t*(.7+k*.4)*(k%2?-1:1)+k*1.1);g.strokeStyle=k%2?e:a;g.lineWidth=R*.05;g.shadowColor=g.strokeStyle;g.shadowBlur=R*.15;g.setLineDash([R*.4,R*.14]);g.beginPath();g.ellipse(0,0,R*(.85+k*.08),R*(.55+k*.1),0,0,TAU);g.stroke();g.restore()}halo(g,cx,cy,R,a,.2)},
galaxy(g,cx,cy,R,t,a,e){g.save();g.translate(cx,cy);g.rotate(t*.35);g.scale(1,.7);for(let j=0;j<80;j++)for(let s=0;s<2;s++){const an=j*.26+s*3.1416,r=j/80*R*1.15;g.globalAlpha=.9-j/100;g.fillStyle=j%3?a:e;g.fillRect(Math.cos(an)*r,Math.sin(an)*r,R*.035,R*.035)}g.restore();g.globalAlpha=1;halo(g,cx,cy,R*.8,a,.35);for(let i=0;i<14;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*1.3+i));g.fillStyle='#fff';g.fillRect(cx+(rd(i)-.5)*R*2,cy+(rd(i+9)-.5)*R*2,R*.025,R*.025)}g.globalAlpha=1},
holo(g,cx,cy,R,t,a,e){g.strokeStyle=ca(a,.3);g.lineWidth=R*.012;for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(cx+i*R*.25,cy-R);g.lineTo(cx+i*R*.25,cy+R);g.stroke();g.beginPath();g.moveTo(cx-R,cy+i*R*.25);g.lineTo(cx+R,cy+i*R*.25);g.stroke()}const sy=cy-R+((t*.5)%1)*2*R;g.fillStyle=ca(a,.35);g.fillRect(cx-R,sy-R*.05,2*R,R*.1);const q=Math.floor(t*10);for(let k=0;k<4;k++)if(rd(q+k*3)>.55){g.fillStyle=ca(rd(q+k)>.5?a:e,.35);g.fillRect(cx-R+(rd(q*2+k)-.5)*R*.4,cy-R+rd(q+k*7)*2*R,R*1.6,R*.06)}halo(g,cx,cy,R,a,.25)},
ice(g,cx,cy,R,t,a,e){halo(g,cx,cy,R*1.1,a,.3);for(const s of [-1,1]){g.fillStyle=ca(e,.6);g.strokeStyle='#fff';g.lineWidth=R*.015;g.beginPath();g.moveTo(cx+s*R*.9,cy+R);g.lineTo(cx+s*R*.7,cy+R*.1);g.lineTo(cx+s*R*.5,cy+R);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(cx+s*R*.55,cy+R);g.lineTo(cx+s*R*.4,cy+R*.45);g.lineTo(cx+s*R*.25,cy+R);g.closePath();g.fill()}g.fillStyle='#fff';for(let i=0;i<34;i++){const p=(t*.12*(.6+rd(i))+rd(i+3))%1;g.globalAlpha=.85;g.beginPath();g.arc(cx+(rd(i)-.5)*2.2*R+Math.sin(t+i)*R*.06,cy-R+p*2*R,R*(.015+rd(i+5)*.025),0,TAU);g.fill()}g.globalAlpha=1},
spark(g,cx,cy,R,t,a,e){g.save();g.translate(cx,cy-R*.1);g.rotate(t*.25);g.globalCompositeOperation='lighter';for(let k=0;k<12;k++){g.rotate(TAU/12);g.fillStyle=ca(a,.14+.07*Math.sin(t*2+k));g.beginPath();g.moveTo(0,0);g.lineTo(R*1.5,-R*.09);g.lineTo(R*1.5,R*.09);g.fill()}g.restore();halo(g,cx,cy,R,a,.35);for(let i=0;i<7;i++){const q=Math.floor(t*1.6+i*1.3),ph=t*1.6+i*1.3-q;g.globalAlpha=Math.sin(ph*3.14);glint(g,cx+(rd(q*3+i)-.5)*R*1.7,cy+(rd(q+i*5)-.5)*R*1.7,R*.08+rd(q+i)*R*.08,i%2?e:a)}g.globalAlpha=1},
pulse(g,cx,cy,R,t,a,e){for(let i=0;i<4;i++){const p=(t*.5+i/4)%1;g.globalAlpha=(1-p)*.8;g.strokeStyle=i%2?e:a;g.lineWidth=R*.06;g.beginPath();g.arc(cx,cy,R*(.3+p*1.1),0,TAU);g.stroke()}g.globalAlpha=1;halo(g,cx,cy,R,a,.3+.15*Math.sin(t*4))}};
const HD={
helm(g,x,y,R,t,m,a,e){const w=R*.5;bf(g,x,y,R,m);g.beginPath();g.moveTo(x-w,y+R*.32);g.lineTo(x-w,y-R*.08);g.arc(x,y-R*.08,w,Math.PI,0);g.lineTo(x+w,y+R*.32);g.lineTo(x+w*.5,y+R*.56);g.lineTo(x-w*.5,y+R*.56);g.closePath();g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#03040c';g.beginPath();g.moveTo(x-w*.92,y-R*.06);g.lineTo(x+w*.92,y-R*.06);g.lineTo(x+w*.7,y+R*.14);g.lineTo(x-w*.7,y+R*.14);g.closePath();g.fill();
 eye(g,x-w*.42,y+R*.04,R*.12,R*.05,.2,e,t,0);eye(g,x+w*.42,y+R*.04,R*.12,R*.05,-.2,e,t,.7);
 const sw=Math.sin(t*3);g.fillStyle=a;g.globalAlpha=.9;g.beginPath();g.moveTo(x-R*.06,y-R*.58);g.quadraticCurveTo(x+R*.1+sw*R*.06,y-R*.98,x+R*.3+sw*R*.1,y-R*.9);g.quadraticCurveTo(x+R*.06,y-R*.8,x+R*.06,y-R*.58);g.fill();g.globalAlpha=1;
 g.strokeStyle=ca(a,.6);g.lineWidth=R*.02;g.beginPath();g.moveTo(x-w*.5,y+R*.2);g.lineTo(x-w*.5,y+R*.5);g.moveTo(x+w*.5,y+R*.2);g.lineTo(x+w*.5,y+R*.5);g.stroke()},
skull(g,x,y,R,t,m,a,e){const q=g.createRadialGradient(x-R*.15,y-R*.3,R*.05,x,y,R*.6);q.addColorStop(0,mx(m,.55));q.addColorStop(1,mx(m,-.35));g.fillStyle=q;g.beginPath();g.arc(x,y-R*.1,R*.46,0,TAU);g.fill();rr(g,x-R*.28,y+R*.15,R*.56,R*.36,R*.1);g.fill();
 g.fillStyle='#050308';[-1,1].forEach(s=>{g.beginPath();g.ellipse(x+s*R*.2,y-R*.08,R*.13,R*.15,s*.2,0,TAU);g.fill()});g.beginPath();g.moveTo(x,y+R*.06);g.lineTo(x-R*.06,y+R*.2);g.lineTo(x+R*.06,y+R*.2);g.fill();
 g.strokeStyle='#050308';g.lineWidth=R*.025;g.beginPath();for(let k=-2;k<=2;k++){g.moveTo(x+k*R*.1,y+R*.32);g.lineTo(x+k*R*.1,y+R*.5)}g.stroke();
 eye(g,x-R*.2,y-R*.08,R*.075,R*.1,0,e,t,0);eye(g,x+R*.2,y-R*.08,R*.075,R*.1,0,e,t,.6)},
ninja(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.arc(x,y-R*.05,R*.46,0,TAU);g.fill();g.fillStyle='#020208';g.beginPath();g.moveTo(x-R*.4,y-R*.12);g.quadraticCurveTo(x,y-R*.2,x+R*.4,y-R*.12);g.lineTo(x+R*.36,y+R*.06);g.quadraticCurveTo(x,y,x-R*.36,y+R*.06);g.closePath();g.fill();
 g.fillStyle=mx(m,-.5);g.beginPath();g.ellipse(x,y+R*.2,R*.4,R*.26,0,0,Math.PI);g.fill();
 g.strokeStyle=a;g.lineWidth=R*.08;g.beginPath();g.arc(x,y-R*.05,R*.44,Math.PI*1.12,Math.PI*1.88);g.stroke();
 eye(g,x-R*.18,y-R*.05,R*.11,R*.045,.25,e,t,0);eye(g,x+R*.18,y-R*.05,R*.11,R*.045,-.25,e,t,.7);
 g.fillStyle=a;g.beginPath();g.moveTo(x+R*.42,y-R*.2);g.quadraticCurveTo(x+R*.8,y-R*.1+Math.sin(t*5)*R*.12,x+R*.95,y+R*.1+Math.sin(t*4)*R*.18);g.quadraticCurveTo(x+R*.7,y+Math.sin(t*5+1)*R*.1,x+R*.42,y-R*.1);g.fill()},
king(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.ellipse(x,y+R*.08,R*.4,R*.48,0,0,TAU);g.fill();g.fillStyle=mx(m,-.45);g.beginPath();g.moveTo(x-R*.36,y+R*.2);g.quadraticCurveTo(x,y+R*.85,x+R*.36,y+R*.2);g.quadraticCurveTo(x,y+R*.45,x-R*.36,y+R*.2);g.fill();
 eye(g,x-R*.16,y,R*.1,R*.05,.2,e,t,0);eye(g,x+R*.16,y,R*.1,R*.05,-.2,e,t,.7);
 const q=g.createLinearGradient(0,y-R*.95,0,y-R*.3);q.addColorStop(0,mx(a,.5));q.addColorStop(1,a);g.save();g.fillStyle=q;g.shadowColor=a;g.shadowBlur=R*.2;g.beginPath();g.moveTo(x-R*.42,y-R*.3);g.lineTo(x-R*.46,y-R*.78);g.lineTo(x-R*.22,y-R*.52);g.lineTo(x,y-R*.92);g.lineTo(x+R*.22,y-R*.52);g.lineTo(x+R*.46,y-R*.78);g.lineTo(x+R*.42,y-R*.3);g.closePath();g.fill();g.restore();
 ['#ff2a55','#2a8bff','#19e68c'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(x+(i-1)*R*.22,y-R*.4,R*.045,0,TAU);g.fill()})},
robot(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);rr(g,x-R*.46,y-R*.4,R*.92,R*.8,R*.14);g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#02060c';rr(g,x-R*.38,y-R*.2,R*.76,R*.26,R*.06);g.fill();const sx=x+Math.sin(t*2.5)*R*.26;g.save();g.shadowColor=e;g.shadowBlur=R*.2;g.fillStyle=e;rr(g,sx-R*.1,y-R*.15,R*.2,R*.16,R*.04);g.fill();g.restore();
 g.fillStyle=ca(a,.5);g.fillRect(x-R*.34,y-R*.1,R*.06,R*.04);g.fillRect(x+R*.28,y-R*.1,R*.06,R*.04);
 g.strokeStyle=ca(a,.7);g.lineWidth=R*.02;g.beginPath();for(let k=-2;k<=2;k++){g.moveTo(x+k*R*.1,y+R*.16);g.lineTo(x+k*R*.1,y+R*.32)}g.moveTo(x,y-R*.4);g.lineTo(x,y-R*.62);g.stroke();
 g.fillStyle=Math.sin(t*5)>0?a:e;g.beginPath();g.arc(x,y-R*.64,R*.05,0,TAU);g.fill()},
mask(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.moveTo(x,y-R*.55);g.bezierCurveTo(x+R*.5,y-R*.5,x+R*.5,y+R*.2,x,y+R*.58);g.bezierCurveTo(x-R*.5,y+R*.2,x-R*.5,y-R*.5,x,y-R*.55);g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#030308';[-1,1].forEach(s=>{g.beginPath();g.moveTo(x+s*R*.06,y-R*.04);g.lineTo(x+s*R*.4,y-R*.2);g.lineTo(x+s*R*.32,y+R*.04);g.closePath();g.fill()});
 eye(g,x-R*.22,y-R*.09,R*.1,R*.045,.35,e,t,0);eye(g,x+R*.22,y-R*.09,R*.1,R*.045,-.35,e,t,.7);
 g.strokeStyle=a;g.lineWidth=R*.025;g.beginPath();g.moveTo(x,y-R*.5);g.lineTo(x,y-R*.2);g.moveTo(x-R*.22,y+R*.2);g.lineTo(x-R*.1,y+R*.42);g.moveTo(x+R*.22,y+R*.2);g.lineTo(x+R*.1,y+R*.42);g.stroke()},
cosmic(g,x,y,R,t,m,a,e){g.fillStyle='#06030f';g.beginPath();g.arc(x,y-R*.08,R*.5,0,TAU);g.fill();g.save();g.beginPath();g.arc(x,y-R*.08,R*.5,0,TAU);g.clip();g.translate(x,y-R*.08);g.rotate(t*.5);for(let j=0;j<60;j++)for(let s=0;s<2;s++){const an=j*.3+s*3.1416,r=j/60*R*.7;g.globalAlpha=.95-j/80;g.fillStyle=j%3?a:e;g.fillRect(Math.cos(an)*r,Math.sin(an)*r*.8,R*.03,R*.03)}g.globalAlpha=1;halo(g,0,0,R*.4,a,.7);g.restore();
 g.strokeStyle=a;g.lineWidth=R*.03;g.beginPath();g.arc(x,y-R*.08,R*.5,0,TAU);g.stroke();eye(g,x-R*.2,y-R*.1,R*.09,R*.05,.2,'#fff',t,0);eye(g,x+R*.2,y-R*.1,R*.09,R*.05,-.2,'#fff',t,.7)},
demon(g,x,y,R,t,m,a,e){g.fillStyle=a;[-1,1].forEach(s=>{g.beginPath();g.moveTo(x+s*R*.28,y-R*.35);g.bezierCurveTo(x+s*R*.5,y-R*.7,x+s*R*.75,y-R*.7,x+s*R*.7,y-R*.98);g.bezierCurveTo(x+s*R*.58,y-R*.72,x+s*R*.42,y-R*.55,x+s*R*.16,y-R*.28);g.fill()});
 bf(g,x,y,R,m);g.beginPath();g.ellipse(x,y+R*.02,R*.44,R*.5,0,0,TAU);g.fill();g.fillStyle='#0a0204';g.beginPath();g.moveTo(x-R*.4,y-R*.2);g.lineTo(x,y-R*.1);g.lineTo(x+R*.4,y-R*.2);g.lineTo(x+R*.3,y-R*.02);g.lineTo(x-R*.3,y-R*.02);g.fill();
 eye(g,x-R*.19,y-R*.06,R*.12,R*.05,.5,e,t,0);eye(g,x+R*.19,y-R*.06,R*.12,R*.05,-.5,e,t,.7);
 g.fillStyle='#fff';g.beginPath();g.moveTo(x-R*.16,y+R*.28);g.lineTo(x-R*.1,y+R*.42);g.lineTo(x-R*.04,y+R*.28);g.moveTo(x+R*.04,y+R*.28);g.lineTo(x+R*.1,y+R*.42);g.lineTo(x+R*.16,y+R*.28);g.fill();halo(g,x,y+R*.3,R*.3,a,.4)},
hood(g,x,y,R,t,m,a,e){bf(g,x,y,R,m);g.beginPath();g.moveTo(x,y-R*.78);g.bezierCurveTo(x+R*.55,y-R*.55,x+R*.62,y+R*.1,x+R*.72,y+R*.62);g.lineTo(x-R*.72,y+R*.62);g.bezierCurveTo(x-R*.62,y+R*.1,x-R*.55,y-R*.55,x,y-R*.78);g.fill();g.strokeStyle=a;g.lineWidth=R*.03;g.stroke();
 g.fillStyle='#010106';g.beginPath();g.ellipse(x,y-R*.02,R*.34,R*.4,0,0,TAU);g.fill();
 eye(g,x-R*.14,y-R*.04,R*.1,R*.06,.1,e,t,0);eye(g,x+R*.14,y-R*.04,R*.1,R*.06,-.1,e,t,.7)}};
const PH=[
['ph01','Guerrero Eléctrico','e',2000,'helm',['#1a3fa8','#3a9bff','#bfe8ff'],'elec','Casco azul con un aura de rayos que lo recorre sin parar.'],
['ph02','Calavera Ardiente','e',2200,'skull',['#d8cdb8','#ff6a00','#ffd060'],'fire','Una calavera con fuego vivo y ojos que arden.'],
['ph03','Ninja de Sombras','e',2400,'ninja',['#1a1630','#8a3bff','#7ff6ff'],'smoke','Ninja entre humo oscuro con ojos que brillan.'],
['ph04','Rey Legendario','l',4500,'king',['#3a2a60','#ffc400','#fff3a0'],'spark','Rey con corona dorada, destellos y rayos de luz.'],
['ph05','Guerrero de Rayos','e',2600,'helm',['#2a2a40','#ffe94d','#ffffff'],'elec','Armadura oscura rodeada de rayos amarillos.'],
['ph06','Avatar Holográfico','e',2300,'robot',['#0a3a50','#00e5ff','#aaffff'],'holo','Rostro futurista con cuadrícula y fallas holográficas.'],
['ph07','Guerrero Carmesí','s',1200,'helm',['#5a0a14','#ff2a3a','#ffd0a0'],'pulse','Casco rojo con ondas de energía carmesí.'],
['ph08','Cosmos Viviente','l',4800,'cosmic',['#1a0a40','#a64dff','#ffffff'],'galaxy','Una galaxia gira dentro de su cabeza.'],
['ph09','Máscara Misteriosa','s',1000,'mask',['#e8e0d0','#19e68c','#7dffc4'],'smoke','Máscara con humo verde y ojos fantasmales.'],
['ph10','Guerrero de Hielo','e',2100,'helm',['#4a7aa8','#7fe3ff','#ffffff'],'ice','Armadura helada con nieve y cristales.'],
['ph11','Llamas Moradas','e',2800,'demon',['#2a0a4a','#b44dff','#ffb0ff'],'fire','Demonio envuelto en llamas moradas.'],
['ph12','Ojos Luminosos','s',900,'hood',['#14141e','#2a8bff','#ffffff'],'smoke','Figura encapuchada con ojos intensos.'],
['ph13','Guerrero de Anillos','e',2500,'helm',['#0a4a4a','#00ffd0','#e0fff8'],'rings','Casco rodeado de anillos de energía giratorios.'],
['ph14','Armadura Legendaria','l',5000,'helm',['#8a6a10','#ffd45a','#ffffff'],'spark','Armadura de oro con destellos de leyenda.'],
['ph15','Supremo D.M.R','x',6000,'robot',['#102a6a','#ffc400','#7fe3ff'],'elec+rings+spark','Exclusivo D.M.R: rayos, anillos y destellos dorados.'],
['ph16','Samurái Carmesí','e',2300,'ninja',['#3a0a14','#ff3a4a','#ffd0d0'],'spark','Samurái de sombra con banda roja y chispas.'],
['ph17','Robot Neón','s',1100,'robot',['#3a0a4a','#ff3df2','#ffd0ff'],'holo','Robot con visor magenta y pantallas holográficas.'],
['ph18','Demonio de Lava','l',4200,'demon',['#3a0a04','#ff6a00','#ffe060'],'fire','Cuernos incandescentes y fuego de volcán.'],
['ph19','Espectro Fantasma','s',1000,'hood',['#c8d8f0','#9fd0ff','#ffffff'],'smoke','Un espectro etéreo entre niebla azul.'],
['ph20','Cyborg Eléctrico','e',2400,'robot',['#1a2a4a','#4da6ff','#ffffff'],'elec','Cyborg con descargas azules.'],
['ph21','Dragón Dorado','l',4600,'demon',['#6a4a08','#ffc400','#fff3a0'],'fire','Cuernos dorados y llamas de oro.'],
['ph22','Hechicero Arcano','e',2700,'hood',['#2a0a5a','#c06bff','#ffd0ff'],'rings','Hechicero con círculos mágicos en órbita.'],
['ph23','Guerrero Solar','s',1300,'helm',['#7a3a08','#ffb030','#fff0a0'],'spark','Casco solar con rayos de luz.'],
['ph24','Calavera Cósmica','l',4400,'skull',['#9a8ad0','#8a5bff','#ff9cff'],'galaxy','Calavera con una galaxia a su espalda.'],
['ph25','Cazador de Tormentas','e',2500,'ninja',['#14243a','#5aa0ff','#e0f0ff'],'elec','Ninja que atrapa relámpagos.'],
['ph26','Espectro Esmeralda','s',1400,'mask',['#0a3a2a','#19e68c','#d0ffe8'],'pulse','Máscara verde con ondas de energía.'],
['ph27','Titán de Cristal','e',2900,'helm',['#7ab0d8','#bff6ff','#ffffff'],'ice','Armadura de cristal con destellos de hielo.'],
['ph28','Rey Oscuro','l',5000,'king',['#1a0a2a','#b44dff','#ff3a5a'],'smoke','Rey de las sombras con corona violeta.'],
['ph29','Guardián Divino','l',4700,'hood',['#e8e4f8','#ffd45a','#ffffff'],'spark','Guardián de luz con destellos dorados.'],
['ph30','Leyenda Infinita D.M.R','x',6000,'cosmic',['#0a0a3a','#ffc400','#7fe3ff'],'galaxy+elec','Exclusivo D.M.R: galaxia, rayos y oro.']];
const PHC={};PH.forEach(r=>PHC[r[0]]={h:r[4],p:r[5],au:r[6],x:r[2]==='x'||r[2]==='l'});
function drawPhoto(g,cx,cy,R,t,c){const m=c.p[0],a=c.p[1],e=c.p[2];g.save();g.beginPath();g.arc(cx,cy,R,0,TAU);g.clip();
 const q=g.createRadialGradient(cx,cy-R*.1,R*.05,cx,cy,R*1.15);q.addColorStop(0,ca(a,.6+.1*Math.sin(t*2)));q.addColorStop(.6,ca(m,.5));q.addColorStop(1,'#04030c');g.fillStyle=q;g.fillRect(cx-R,cy-R,2*R,2*R);
 c.au.split('+').forEach(k=>{g.save();AU[k](g,cx,cy,R,t,a,e);g.restore()});
 const bob=Math.sin(t*1.7)*R*.022;
 g.save();bf(g,cx,cy,R,m);g.beginPath();g.ellipse(cx,cy+R*.98+bob,R*.98,R*.52,0,0,TAU);g.fill();g.strokeStyle=ca(a,.7);g.lineWidth=R*.03;g.stroke();g.restore();
 g.save();HD[c.h](g,cx,cy+R*.04+bob,R,t,m,a,e);g.restore();
 for(let i=0;i<9;i++){const p=(t*.25*(.6+rd(i))+rd(i+5))%1;g.globalAlpha=Math.sin(p*3.14)*.9;g.fillStyle=i%2?e:a;g.beginPath();g.arc(cx+(rd(i)-.5)*R*1.6,cy+R-p*R*2,R*.025,0,TAU);g.fill()}g.globalAlpha=1;
 g.save();g.translate(cx,cy);g.rotate(.5);const sx=(((t*.4)%1.8)-.4)*R*2.4-R*1.2,sg=g.createLinearGradient(sx-R*.2,0,sx+R*.2,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.22)');sg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sg;g.fillRect(-R*2,-R*2,R*4,R*4);g.restore();
 g.restore();
 g.save();g.strokeStyle=a;g.lineWidth=R*.08;g.shadowColor=a;g.shadowBlur=R*.25;g.beginPath();g.arc(cx,cy,R*.95,0,TAU);g.stroke();g.shadowBlur=0;g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=R*.025;g.beginPath();g.arc(cx,cy,R*.99,0,TAU);g.stroke();
 if(c.x){const s=t*2;g.strokeStyle='#fff';g.lineWidth=R*.05;g.shadowColor=a;g.shadowBlur=R*.2;g.beginPath();g.arc(cx,cy,R*.95,s,s+.9);g.stroke()}g.restore()}

/* ---------- datos y utilidades ---------- */
const kd=id=>PHC[id]?'ph':((X.IDX[id]||{}).k||'');
const OWN=id=>!!VER||(prof.inv||[]).includes(id);
function clean(eq,own){const o={};if(!eq)return o;['tc','pe','mf','ph'].forEach(k=>{const id=eq[k];if(!id||kd(id)!==k)return;if(own&&!OWN(id))return;o[k]=id});return o}
/* un artículo suelto (tienda): tarjeta, efecto, marco o foto */
function drawItem(cv,id,t,big){const g=cv.getContext('2d'),w=cv.width,h=cv.height,k=kd(id);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
 if(k==='tc'){g.save();rr(g,0,0,w,h,h*.07);g.clip();X.CD[id](g,w,h,t,h/70);
  if(big){avatarPH(g,h*.34,h*.5,h*.2);g.fillStyle='#fff';g.shadowColor='#000';g.shadowBlur=6;g.textBaseline='middle';g.font='900 '+Math.round(h*.1)+'px system-ui,Arial';g.fillText(prof.name||'PLAYER',h*.62,h*.42);g.font='700 '+Math.round(h*.07)+'px system-ui,Arial';g.fillText('NIVEL '+plv(),h*.62,h*.58)}
  g.restore();return}
 if(big){const q=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.6);q.addColorStop(0,'rgba(30,50,140,.5)');q.addColorStop(1,'rgba(2,3,12,0)');g.fillStyle=q;g.fillRect(0,0,w,h)}
 const R=Math.min(w,h)*.3,cx=w/2,cy=h/2;g.save();
 if(k==='ph')drawPhoto(g,cx,cy,R,t,PHC[id]);else{avatarPH(g,cx,cy,R);(k==='pe'?X.FXD:X.FR)[id](g,cx,cy,R,t)}g.restore()}
function drawMini(cv,id,t){const g=cv.getContext('2d'),w=cv.width,h=cv.height,k=kd(id);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
 g.save();rr(g,2,2,w-4,h-4,h*.45);g.clip();g.fillStyle='#070b22';g.fillRect(0,0,w,h);if(k==='tc'){X.CD[id](g,w,h,t,h/70);g.fillStyle='rgba(4,6,22,.4)';g.fillRect(0,0,w,h)}g.restore();
 g.strokeStyle='#2a6bff';g.lineWidth=2;rr(g,2,2,w-4,h-4,h*.45);g.stroke();
 const R=h*.3,cx=h*.55,cy=h/2;g.save();if(k==='tc')avatarPH(g,cx,cy,R);else if(k==='ph')drawPhoto(g,cx,cy,R,t,PHC[id]);else{avatarPH(g,cx,cy,R);(k==='pe'?X.FXD:X.FR)[id](g,cx,cy,R,t)}g.restore();
 g.fillStyle='#fff';g.textBaseline='middle';g.font='800 '+Math.round(h*.22)+'px system-ui,Arial';g.fillText(prof.name||'PLAYER',h*1.08,h*.36);g.font='700 '+Math.round(h*.15)+'px system-ui,Arial';g.fillStyle='rgba(255,255,255,.8)';g.fillText('NIVEL '+plv(),h*1.08,h*.58);
 g.fillStyle='rgba(255,255,255,.2)';rr(g,h*1.08,h*.72,w*.5,h*.08,h*.04);g.fill();g.fillStyle='#3a8bff';rr(g,h*1.08,h*.72,w*.3,h*.08,h*.04);g.fill()}

/* ---------- estilos: oculta los dibujos congelados y muestra los nuevos ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
canvas.ov7,canvas.tc7,canvas.pxo,canvas.pxc,#big7,#mini7,#svG canvas.c7t,#svG canvas.c7a{display:none!important}
canvas.ov8{position:fixed;inset:auto;right:auto;bottom:auto;pointer-events:none;max-width:none}
canvas.tc8{pointer-events:none}
#svG canvas.m8{position:static!important;inset:auto!important;display:block;border-radius:10px}
#svG canvas.m8t{width:100%!important;height:auto!important;border:1px solid rgba(255,255,255,.2)}
#svG canvas.m8a{width:112px!important;height:112px!important}
#svR canvas.m8{position:static!important;inset:auto!important;display:block}
</style>`);

/* ---------- tienda: tarjetas, vista grande y "así se ve en tu perfil" ---------- */
const vis=el=>{const b=el.getBoundingClientRect();return b.bottom>0&&b.top<innerHeight&&b.width>0};
function shop(t){const sv=$('sv');if(!sv||sv.classList.contains('hide'))return;
 document.querySelectorAll('#svG .svK[data-i7]').forEach(d=>{const id=d.dataset.i7;let c=d.querySelector('canvas.m8');
  if(!c){const o=d.querySelector('canvas');if(!o)return;const tc=kd(id)==='tc';c=document.createElement('canvas');c.className='m8 '+(tc?'m8t':'m8a');c.width=tc?240:160;c.height=tc?120:160;o.after(c)}
  if(vis(c))drawItem(c,id,t,false)});
 const on=document.querySelector('#svG .svK.on[data-i7]');if(!on)return;const id=on.dataset.i7;
 const b=$('big7');if(b){let c=b.parentNode.querySelector('#big8');if(!c){c=document.createElement('canvas');c.id='big8';c.className='m8';c.width=b.width||600;c.height=b.height||400;b.after(c)}drawItem(c,id,t,true)}
 const m=$('mini7');if(m){let c=m.parentNode.querySelector('#mini8');if(!c){c=document.createElement('canvas');c.id='mini8';c.className='m8';c.width=480;c.height=112;c.style.cssText='width:100%;height:auto;border-radius:12px;display:block';m.after(c)}drawMini(c,id,t)}}

/* ---------- perfil público: lee lo que cada jugador tiene equipado ---------- */
const PUBN={},PUBI={},pend={};let pubT=0;
async function pubLoad(){if(!fb||!ME||!SY||Date.now()-pubT<15000)return;pubT=Date.now();
 try{const s=await FS.getDocs(FS.query(FS.collection(fb.db,'players'),FS.orderBy('xp','desc'),FS.limit(60)));s.forEach(d=>{const x=d.data();if(x&&x.name&&x.eq){PUBN[String(x.name).toLowerCase()]=x.eq;if(x.id)PUBI[x.id]=x.eq}})}catch(e){}}
function pubId(id){if(id in PUBI||pend[id])return;pend[id]=1;pget(id).then(d=>{PUBI[id]=(d&&d.eq)||null}).catch(()=>{PUBI[id]=null})}

/* ---------- avatar: foto + efecto + marco sobre cualquier lugar donde salga ---------- */
const pool=[];
function ovc(i){let c=pool[i];if(!c){c=document.createElement('canvas');c.className='ov8';document.body.appendChild(c);pool[i]=c}return c}
function targets(){const T=[],add=(el,eq,own)=>{if(!el||!eq)return;const e=clean(eq,own);if(!(e.ph||e.pe||e.mf))return;const r=el.getBoundingClientRect();if(r.width<8||r.height<8||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return;const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(!h||!el.contains(h))return;T.push({el,r,e})};
 const me=prof.eq,nm=(prof.name||'').toLowerCase();
 add($('av'),me,1);add($('cav'),me,1);
 document.querySelectorAll('.rk .av').forEach(el=>{const row=el.closest('.rk'),b=row&&row.querySelector('.rkt b');if(!b)return;const n=(b.textContent||'').trim().toLowerCase();add(el,n===nm?me:PUBN[n],n===nm)});
 document.querySelectorAll('.frr').forEach(row=>{const el=row.querySelector('.av'),id=row.dataset.i;if(!el||!id)return;if(id===prof.id)add(el,me,1);else{pubId(id);add(el,PUBI[id],0)}});
 try{if(PVc&&!$('pv').classList.contains('hide')){const own=PVc.id===prof.id;if(!own)PUBI[PVc.id]=PVc.eq||null;add($('pvAv'),own?me:PVc.eq,own)}}catch(e){}
 return T}
function overlays(t){const T=targets(),dpr=Math.min(devicePixelRatio||1,2);let n=0;
 for(const z of T){const r=z.r,S=r.width*1.45,B=Math.min(320,Math.max(48,Math.round(S*dpr))),c=ovc(n++);if(c.width!==B){c.width=B;c.height=B}
  const ov=z.el.closest('.ov'),zi=ov?(parseInt(getComputedStyle(ov).zIndex)||5)+1:6,s=c.style;
  s.display='block';s.left=(r.left+r.width/2-S/2)+'px';s.top=(r.top+r.height/2-S/2)+'px';s.width=S+'px';s.height=S+'px';s.zIndex=zi;
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,B,B);const cx=B/2,R=B/2/1.45;
  if(z.e.ph){g.save();drawPhoto(g,cx,cx,R,t,PHC[z.e.ph]);g.restore()}
  if(z.e.pe){g.save();try{X.FXD[z.e.pe](g,cx,cx,R,t)}catch(er){}g.restore()}
  if(z.e.mf){g.save();try{X.FR[z.e.mf](g,cx,cx,R,t)}catch(er){}g.restore()}}
 for(let i=n;i<pool.length;i++)if(pool[i])pool[i].style.display='none'}

/* ---------- tarjeta animada como fondo (tu perfil y el de otros) ---------- */
function cards(t){const dpr=Math.min(devicePixelRatio||1,2);
 [['pcard',()=>prof.eq,1],['pf',()=>prof.eq,1],['pvCard',()=>{try{return PVc&&PVc.id!==prof.id?PVc.eq:prof.eq}catch(e){return prof.eq}},0]].forEach(z=>{const h=$(z[0]);if(!h)return;
  let c=null;for(const k of h.children)if(k.tagName==='CANVAS'&&k.classList.contains('tc8')){c=k;break}
  let own=z[2];try{if(z[0]==='pvCard')own=!PVc||PVc.id===prof.id}catch(e){}
  const eq=clean(z[1](),own),id=eq.tc||'';
  if(!id){if(c)c.remove();return}if(h.offsetParent===null)return;
  if(!c){c=document.createElement('canvas');c.className='tc8';c.style.cssText='position:absolute;left:0;top:0;right:auto;bottom:auto;width:100%;height:100%;z-index:-1;pointer-events:none;border-radius:inherit';h.insertBefore(c,h.firstChild);h.style.position='relative';h.style.isolation='isolate'}
  const w=Math.max(40,Math.round(h.offsetWidth*dpr)),hh=Math.max(20,Math.round(h.offsetHeight*dpr));if(c.width!==w||c.height!==hh){c.width=w;c.height=hh}
  const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,hh);g.save();try{X.CD[id](g,w,hh,t,hh/70)}catch(er){}g.restore();g.fillStyle='rgba(4,6,22,.38)';g.fillRect(0,0,w,hh)})}

/* ---------- duración en segundos de los efectos ---------- */
const dur={id:null};
setInterval(()=>{try{const e=prof.eq||(prof.eq={}),id=e.pe||'';
 if(dur.id===null){dur.id=id;return}
 if(id!==dur.id){dur.id=id;prof.fxEnd=(id&&SEGUNDOS[id])?Date.now()+SEGUNDOS[id]*1000:0;saveP()}
 else if(id&&prof.fxEnd&&Date.now()>=prof.fxEnd){e.pe='';prof.fxEnd=0;dur.id='';saveP();toast('⏱ Terminó el efecto. Sigue en tu inventario')}}catch(e){}},1000);

/* ---------- bucle único: SIEMPRE se mueve (no se congela con "Efectos reducidos") ---------- */
let last=0,tk=0;
function loop(n){requestAnimationFrame(loop);const slow=SET.red||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);if(n-last<(slow?66:33))return;last=n;const t=n/1000;tk++;
 try{shop(t)}catch(e){}
 try{overlays(t)}catch(e){}
 try{cards(t)}catch(e){}
 if(tk%30===0){try{const lst=!$('rnk').classList.contains('hide')||!$('fr2').classList.contains('hide')||!$('pv').classList.contains('hide');if(lst)pubLoad()}catch(e){}}}
requestAnimationFrame(loop);
})();


/* ===== D.M.R v29: panel maestro rediseñado · foto de perfil visible para todos · 11 puntos · hielo/fuego/rayo ===== */
(function(){
if(window.__dmr29)return;window.__dmr29=1;

/* ---------- AJUSTES ---------- */
const FREEZE=2.5;   /* segundos que se congela la paleta rival con el hielo */
const SLOWRAY=5;    /* segundos que se ralentiza la paleta rival con el rayo */
const MAXPTS=11;    /* puntos máximos */

/* =========================================================
   1) 11 PUNTOS MÁXIMOS (se mantiene el tiempo limitado)
   ========================================================= */
function fin11(){
 mode='over';const el=$('tmr');if(el)el.style.display='none';
 const a=sc[0],c=sc[1],w0=a>c,pre='🎯 '+MAXPTS+' PUNTOS · '+a+' - '+c;
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
const _pt=point;
point=function(w){_pt(w);if(mode==='play'&&(sc[0]>=MAXPTS||sc[1]>=MAXPTS))fin11()};

/* =========================================================
   2) PODERES: hielo congela, fuego acelera, rayo ralentiza
   ========================================================= */
const _aa=applyAb;
applyAb=function(k){
 _aa(k);
 try{
  if(!B||!P)return;const op=1-B.last,p=P[op];if(!p)return;
  if(k==='hielo'){p.frz=FREEZE;p.slow=Math.max(p.slow||0,FREEZE)}
  else if(k==='turbo'){p.slow=Math.max(p.slow||0,SLOWRAY);try{gtx.push({s:'⚡ PALETA LENTA '+SLOWRAY+'s',l:1,c:'#ffd400'})}catch(e){}}
  else if(k==='hielo')return;
 }catch(e){}};
const _up=update;
update=function(dt){
 let fz=null;
 try{if(P&&mode==='play'){fz=P.map(p=>p&&p.frz>0?{y:p.y,ty:p.ty}:null)}}catch(e){}
 _up(dt);
 try{if(fz)P.forEach((p,i)=>{if(p&&fz[i]){p.y=fz[i].y;p.ty=fz[i].ty;p.frz-=dt;p.slow=Math.max(p.slow||0,.3)}})}catch(e){}};

/* =========================================================
   3) FOTO DE PERFIL VISIBLE PARA OTROS JUGADORES
   ========================================================= */
const okPh=s=>typeof s==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(s)&&s.length<60000;
let ready=false,pushed=null,banned=false,chkU='';
const _sp=saveP;
saveP=function(){_sp();
 try{if(ready&&!banned&&ME&&fb&&SY){const p=okPh(prof.photo)?prof.photo:'';
  if(pushed!==p){pushed=p;FS.setDoc(FS.doc(fb.db,'players',prof.id),{photo:p},{merge:true}).catch(()=>{pushed=null})}}}catch(e){}};
async function pull(){
 if(!ME){ready=false;chkU='';pushed=null;banned=false;return}
 if(!fb||!SY||chkU===ME.uid)return;chkU=ME.uid;
 try{const d=await pget(prof.id);
  if(d){banned=!!d.photoBan;
   if(banned){prof.photo='';_sv();try{setAv()}catch(e){}pushed='';toast('🚫 Tu foto fue retirada por moderación')}
   else if(okPh(d.photo)){if(!okPh(prof.photo)){prof.photo=d.photo;_sv();try{setAv()}catch(e){}}pushed=d.photo}
   else pushed=''}
  ready=true;saveP()}catch(e){chkU=''}}
/* normas antes de subir la foto */
const f0=$('upF').onchange;
$('upF').onchange=function(e){
 const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 if(banned){toast('🚫 No puedes cambiar tu foto: fue retirada por moderación');return}
 modal('📷 NORMAS DE LA FOTO','<small>Solo foto de tu cara o de ti con ropa. No se permiten desnudos, ropa interior ni contenido sexual o violento. Tu foto la verán otros jugadores; si la reportan y se revisa, se retira.</small>',
  [['ACEPTO',()=>{if(f0)f0.call($('upF'),{target:{files:[f],value:''}})}],['CANCELAR',null,'tg']])};

/* mostrar las fotos de los demás */
const PHO={},ASK={};let plt=0;
async function loadPhotos(){
 if(!fb||!ME||!SY||Date.now()-plt<10000)return;plt=Date.now();
 try{const s=await FS.getDocs(FS.query(FS.collection(fb.db,'players'),FS.orderBy('xp','desc'),FS.limit(80)));
  s.forEach(d=>{const x=d.data();if(!x)return;const ok=okPh(x.photo)&&!x.photoBan;
   if(x.id){if(ok)PHO['i'+x.id]=x.photo;else delete PHO['i'+x.id]}
   if(x.name){const k='n'+String(x.name).toLowerCase();if(ok)PHO[k]=x.photo;else delete PHO[k]}})}catch(e){}}
function askId(id){if(!id||id===prof.id||('i'+id) in PHO||(ASK[id]&&Date.now()-ASK[id]<30000))return;ASK[id]=Date.now();
 pget(id).then(d=>{if(d&&okPh(d.photo)&&!d.photoBan){PHO['i'+id]=d.photo;if(d.name)PHO['n'+String(d.name).toLowerCase()]=d.photo}}).catch(()=>{})}
function setBg(el,ph){if(!el||!ph)return;const k=ph.length+ph.slice(-14);if(el.dataset.pk===k)return;el.dataset.pk=k;el.style.backgroundImage='url("'+ph+'")'}
const nm1=el=>{if(!el)return'';const n=el.firstChild&&el.firstChild.nodeType===3?el.firstChild.nodeValue:el.textContent;return String(n||'').trim().toLowerCase()};
function applyPh(){
 if(!fb||!ME||!SY)return;
 const open=['rnk','fr2','pv','fm','rq','ad','ap'].some(i=>{const e=$(i);return e&&!e.classList.contains('hide')});
 if(open)loadPhotos();
 const mine=(prof.name||'').toLowerCase();
 document.querySelectorAll('.rk').forEach(r=>{const n=nm1(r.querySelector('.rkt b'));if(!n||n===mine)return;setBg(r.querySelector('.av'),PHO['n'+n])});
 document.querySelectorAll('.frr').forEach(r=>{const id=r.dataset.i;if(!id||id===prof.id)return;askId(id);setBg(r.querySelector('.av'),PHO['i'+id])});
 document.querySelectorAll('.idrow:not(.frr) .av').forEach(a=>{const r=a.closest('.idrow'),n=nm1(r&&r.querySelector('span b'));if(!n||n===mine)return;setBg(a,PHO['n'+n])});
 try{const pvOpen=!$('pv').classList.contains('hide'),own=!PVc||PVc.id===prof.id;
  if(pvOpen&&PVc&&!own){const ph=okPh(PVc.photo)&&!PVc.photoBan?PVc.photo:null;setBg($('pvAv'),ph)}
  const b=$('pvRp');if(b)b.style.display=(pvOpen&&PVc&&!own)?'':'none'}catch(e){}}
setInterval(()=>{try{pull()}catch(e){}try{applyPh()}catch(e){}},1000);
/* reportar la foto de otro jugador */
$('pvX').insertAdjacentHTML('beforebegin','<button class="tg" id="pvRp" type="button" style="display:none">⚠ REPORTAR FOTO</button>');
$('pvRp').onclick=()=>{SFX.click();const d=PVc;if(!d||d.id===prof.id||!fb||!ME)return;
 modal('⚠ REPORTAR FOTO','¿Reportar la foto de <b>'+esc(d.name||'este jugador')+'</b> por contenido inapropiado?',[['REPORTAR',async()=>{
  try{await FS.setDoc(FS.doc(fb.db,'reports',prof.id+'_'+d.id+'_'+Date.now()),{from:prof.id,to:d.id,fromName:prof.name,toName:d.name||'',cat:'foto',sev:3,why:'Foto inapropiada',desc:'Foto de perfil inapropiada',st:'p',match:null,t:Date.now()});toast('⚠ Reporte enviado')}catch(e){toast(errEs(e))}}],['CANCELAR',null,'tg']])};

/* =========================================================
   4) PANEL MAESTRO: diseño, móvil y correcciones
   ========================================================= */
document.head.insertAdjacentHTML('beforeend',`<style>
#ap{background:linear-gradient(180deg,#05103a 0,#02030c 48%)!important}
#ap .apw{max-width:560px!important;width:100%;margin:0 auto!important;height:100%;overflow:hidden}
#ap *{min-width:0;box-sizing:border-box}
#ap .apc,#ap .rpc,#ap .stc{overflow-wrap:anywhere}
#ap .aph{gap:8px;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:linear-gradient(90deg,rgba(255,34,51,.28),rgba(42,107,255,.4));border-bottom:2px solid #2a6bff;box-shadow:0 4px 20px rgba(42,107,255,.45)}
#ap .aph>span{flex:1;font-size:15px;letter-spacing:3px;text-shadow:0 0 12px var(--b)}
#ap .aph .sm{width:42px;height:42px;flex:none;border-radius:12px}
#ap #apX{border-color:#ff4a5a;background:linear-gradient(135deg,#8a0a18,#ff2233);box-shadow:0 0 14px rgba(255,34,51,.6)}
#ap #apPh{border-color:#37d6ff}
#ap .apt{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:10px 10px 10px;border-bottom:1px solid #2a6bff55;background:rgba(3,8,32,.85)}
#ap .apt button{flex:none;width:100%;padding:11px 2px;font-size:11px;border-radius:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:.18s;border:2px solid #1d4fc4;background:rgba(5,10,40,.9)}
#ap .apt button.on{background:linear-gradient(90deg,var(--a),var(--b));border-color:#fff;box-shadow:0 0 16px var(--b);transform:translateY(-1px)}
#ap .apb{overflow-x:hidden;padding:12px 12px calc(24px + env(safe-area-inset-bottom,0px))}
#ap .apc{border:1px solid rgba(42,107,255,.6);background:linear-gradient(180deg,rgba(14,26,80,.72),rgba(5,8,28,.96));border-radius:16px;box-shadow:0 0 12px rgba(42,107,255,.22);animation:ap29 .25s ease-out}
#ap .apc .apc{background:rgba(3,6,24,.9)}
@keyframes ap29{from{opacity:0;transform:translateY(6px)}}
#ap .stc{border:1px solid #2a6bff;background:linear-gradient(180deg,rgba(14,30,100,.7),rgba(4,8,30,.95));box-shadow:0 0 12px rgba(42,107,255,.3)}
#ap .stg2{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
#ap .g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:6px}
#ap .bg{grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}
#ap .tg,#ap .tg.mn{width:100%;max-width:100%;padding:11px 6px;font-size:12px;border-radius:12px;white-space:normal;line-height:1.2}
#ap .g3 .tg.mn{font-size:11px}
#ap .btn{min-width:0;width:100%;max-width:100%;padding:13px;font-size:14px;border-radius:14px}
#ap .rw{flex-wrap:wrap;gap:6px}
#ap .in,#ap select.in,#ap textarea.in{width:100%;font-size:15px;padding:13px 12px;border-radius:12px;border:2px solid #2a6bff;background:#070d34}
#ap select.in{appearance:none;-webkit-appearance:none;padding-right:40px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='%237fc4ff' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
#ap #mM{font-weight:800;border-color:#37d6ff;box-shadow:0 0 12px rgba(55,214,255,.3)}
#mHint{font-size:12px;line-height:1.45;background:#0a1030;border:1px solid #2a6bff;border-radius:10px;padding:9px 11px;opacity:.95}
#ap .idrow{flex-wrap:wrap;gap:6px}
#ap .idrow>span{flex:1 1 130px}
#ap .idrow .tg.mn{width:auto;flex:none}
#rnk .panel,#pv .panel,#fr2 .panel,#rq .panel{overflow-x:hidden}
.rk{gap:8px;padding:8px 10px;overflow:hidden;flex-wrap:nowrap}
.rkn{flex:none;width:28px}
.rk .av{flex:none}
.rkt{flex:1 1 0;min-width:0;overflow:hidden}
.rkt b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rkx{flex:none;font-size:12px}
</style>`);

/* selector de mensajes: descripción de cada opción + regalar desde ahí */
const HINT={pm:'✉ MENSAJE PRIVADO: llega al buzón de un jugador. Necesita destinatario, título y texto.',an:'📢 ANUNCIO GLOBAL: lo ven todos los jugadores en su buzón. Te pide confirmación antes de enviar.',gr:'🩶 VERIFICADOS GRISES: solo a jugadores que tengan el sello gris ahora mismo.',em:'📧 CORREO: usa el servicio de correo configurado (requiere la función sendMail en la nube).'};
function hintUpd(){const M=$('mM'),h=$('mHint');if(!M||!h)return;h.textContent=HINT[M.value]||'';const g=$('mGift');if(g)g.style.display=(M.value==='pm'||M.value==='em')?'':'none'}
function ensureHint(){const M=$('mM');if(!M||$('mHint'))return;
 M.insertAdjacentHTML('afterend','<div id="mHint"></div><button class="tg" id="mGift" type="button">🎁 REGALAR MONEDAS U OBJETOS A ESTE JUGADOR</button>');
 $('mGift').onclick=()=>{SFX.click();const v=($('mT')?$('mT').value:'').trim();if(!v){toast('Escribe primero el ID o el nombre del jugador');return}
  const b=[...document.querySelectorAll('#apT button')].find(x=>/Regalos/.test(x.textContent));if(!b)return;b.click();setTimeout(()=>{const g=$('gT');if(g)g.value=v},60)};
 hintUpd()}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='mM')hintUpd()});
/* textos "undefined" */
let ft=0;
function fixUndef(){const roots=['ap','rnk','fr2','rkL','rq','pv'].map(i=>$(i)).filter(Boolean);
 roots.forEach(r=>{const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const o=n.nodeValue;if(o.indexOf('undefined')<0)continue;if(n.parentNode&&/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(n.parentNode.nodeName))continue;
  const v=o.replace(/ID\s+undefined/g,'ID no disponible').replace(/\bundefined\b/g,'Sin nombre disponible');if(v!==o)n.nodeValue=v}})}
const ob=new MutationObserver(()=>{ensureHint();clearTimeout(ft);ft=setTimeout(fixUndef,120)});
const apB=$('apB');if(apB)ob.observe(apB,{childList:true,subtree:true});
['rkL','f2List','rqBox'].forEach(i=>{const e=$(i);if(e)new MutationObserver(()=>{clearTimeout(ft);ft=setTimeout(fixUndef,120)}).observe(e,{childList:true,subtree:true})});

/* moderar fotos (solo administradores) */
const aph=document.querySelector('#ap .aph');
if(aph&&$('apX')){$('apX').insertAdjacentHTML('beforebegin','<button class="sm" id="apPh" type="button" aria-label="Moderar fotos">🖼</button>');
 $('apPh').onclick=()=>{SFX.click();if(document.body.dataset.adm2!=='1'||!fb||!ME)return;
  modal('🖼 MODERAR FOTO','Escribe el ID del jugador:<input id="mpId" class="in" inputmode="numeric" maxlength="8" placeholder="ID del jugador" style="margin-top:10px">',
   [['QUITAR FOTO',()=>mod(true)],['PERMITIR OTRA VEZ',()=>mod(false),'tg'],['CERRAR',null,'tg']])};
 async function mod(ban){const id=($('mpId')||{}).value;const q=String(id||'').trim();
  if(!/^\d{4,8}$/.test(q)){toast('Escribe un ID válido');return}
  try{const d=await pget(q);if(!d){toast('No existe ese ID');return}
   await FS.setDoc(FS.doc(fb.db,'players',q),ban?{photo:'',photoBan:true}:{photoBan:false},{merge:true});
   delete PHO['i'+q];if(d.name)delete PHO['n'+String(d.name).toLowerCase()];
   if(ban)await FS.addDoc(FS.collection(fb.db,'inbox'),{toUid:d.uid||'',to:d.id,kind:'sanction',title:'🖼 FOTO RETIRADA',body:'Tu foto de perfil fue retirada por incumplir las normas.',t:Date.now(),read:false}).catch(()=>{});
   await FS.addDoc(FS.collection(fb.db,'adminLog'),{by:ME.uid,byName:prof.name,action:ban?'photo_remove':'photo_allow',target:q,why:'',result:'ok',t:Date.now()}).catch(()=>{});
   SFX.point();toast(ban?'🖼 Foto retirada':'✔ Ya puede subir foto')}catch(e){SFX.deny();toast(errEs(e))}}}
})();




/* ===== D.M.R v30: arreglo panel maestro + filtros desplegables + sugerencias ===== */
(function(){
if(window.__dmr30)return;window.__dmr30=1;

document.head.insertAdjacentHTML('beforeend',`<style>
/* 1) ARREGLO: los botones .mn del panel heredaban el estilo flotante del mapa de niveles */
#ap .mn,#ap button.mn,#ap .tg.mn{position:static!important;transform:none!important;left:auto!important;top:auto!important;width:auto!important;height:auto!important;min-height:38px;border-radius:10px!important;font-size:12px!important;font-weight:800;letter-spacing:0;padding:9px 10px!important;box-shadow:none!important;animation:none!important;z-index:auto!important;background:rgba(10,20,70,.92)!important;color:#fff!important;border:2px solid #2a6bff!important;text-shadow:none!important;opacity:1!important;white-space:normal;line-height:1.2}
#ap .mn::before,#ap .mn::after{display:none!important}
#ap .mn.dn,#ap .mn.cu,#ap .mn.lk,#ap .mn.bs{width:auto!important;height:auto!important}

/* 2) Menú desplegable personalizado */
.cs30b{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;min-height:46px;border-radius:12px;border:2px solid #2a6bff;background:#070d34;color:#fff;font-size:14px;font-weight:800;text-align:left;box-shadow:0 0 10px rgba(42,107,255,.35)}
.cs30b span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.cs30b i{font-style:normal;color:#7fc4ff;flex:none}
.cs30l{position:fixed;z-index:99999;background:#050a2c;border:2px solid #37d6ff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.7),0 0 18px rgba(55,214,255,.4);overflow-y:auto;padding:6px;animation:cs30 .15s ease-out;scrollbar-width:thin;scrollbar-color:#2a6bff transparent}
@keyframes cs30{from{opacity:0;transform:translateY(-4px)}}
.cs30l button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:12px;min-height:44px;border:0;border-radius:10px;background:transparent;color:#fff;font-size:14px;font-weight:700;text-align:left}
.cs30l button.on{background:rgba(42,107,255,.35);color:#8fe8ff}
.cs30l button:active{background:rgba(42,107,255,.5)}

/* 3) Sugerencias */
#sg30Btn{width:100%;margin-top:10px;padding:12px;border-radius:14px;border:2px solid #ffd400;background:rgba(40,30,0,.55);color:#ffd400;font-size:14px;font-weight:900;letter-spacing:1px;box-shadow:0 0 12px rgba(255,212,0,.3)}
.sg30c{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
.sg30c button{flex:1 1 auto;padding:9px 10px;border-radius:10px;border:2px solid #2a6bff;background:#070d34;color:#fff;font-size:12px;font-weight:800}
.sg30c button.on{border-color:#ffd400;background:rgba(120,90,0,.5);color:#ffd400}
#sgT{width:100%;min-height:110px;padding:12px;border-radius:12px;border:2px solid #2a6bff;background:#070d34;color:#fff;font-size:15px;resize:none;user-select:text;-webkit-user-select:text}
.sg30n{text-align:right;font-size:11px;opacity:.7;margin-top:4px}
.sg30i{border:1px solid rgba(42,107,255,.6);border-radius:14px;padding:10px;margin-bottom:8px;background:rgba(10,20,70,.7);overflow-wrap:anywhere}
.sg30i small{opacity:.7;display:block;margin-bottom:4px}
.sg30i b{color:#ffd400}
.sg30i .tg{margin-top:8px}
</style>`);

/* ---------- Desplegable personalizado para todos los <select> del panel ---------- */
let openL=null;
function closeL(){if(openL){openL.remove();openL=null}}
document.addEventListener('click',e=>{if(openL&&!openL.contains(e.target))closeL()});
document.addEventListener('scroll',closeL,true);
addEventListener('resize',closeL);
function showL(sel,b,upd){
 closeL();
 const l=document.createElement('div');l.className='cs30l';
 [...sel.options].forEach((o,i)=>{
  const it=document.createElement('button');it.type='button';it.className=i===sel.selectedIndex?'on':'';
  it.innerHTML='<span>'+esc(o.text)+'</span>'+(i===sel.selectedIndex?'<span>✔</span>':'');
  it.onclick=ev=>{ev.stopPropagation();SFX.click();sel.selectedIndex=i;
   sel.dispatchEvent(new Event('input',{bubbles:true}));sel.dispatchEvent(new Event('change',{bubbles:true}));upd();closeL()};
  l.appendChild(it)});
 document.body.appendChild(l);
 const r=b.getBoundingClientRect(),vh=innerHeight,below=vh-r.bottom-12,above=r.top-12;
 const h=Math.min(l.scrollHeight+12,280);
 const down=below>=Math.min(h,200)||below>=above;
 const mh=Math.max(120,Math.min(280,down?below:above));
 l.style.left=Math.max(8,r.left)+'px';l.style.width=Math.min(r.width,innerWidth-16)+'px';
 l.style.maxHeight=mh+'px';
 if(down)l.style.top=(r.bottom+4)+'px';else l.style.bottom=(vh-r.top+4)+'px';
 openL=l}
function enh(sel){
 if(sel.dataset.cs||sel.multiple)return;sel.dataset.cs='1';sel.style.display='none';
 const b=document.createElement('button');b.type='button';b.className='cs30b';
 const upd=()=>{const o=sel.options[sel.selectedIndex];b.innerHTML='<span>'+esc(o?o.text:'')+'</span><i>▾</i>'};
 upd();sel.after(b);
 b.onclick=e=>{e.stopPropagation();SFX.click();showL(sel,b,upd)};
 sel.addEventListener('change',upd)}
let rq=0;
function scan(){rq=0;const ap=$('ap');if(!ap)return;ap.querySelectorAll('select').forEach(enh);addSgTab()}
function sched(){if(!rq)rq=requestAnimationFrame(scan)}
const apEl=$('ap');if(apEl)new MutationObserver(sched).observe(apEl,{childList:true,subtree:true});

/* ---------- Sugerencias de los jugadores ---------- */
let cat='Otra';
const CATS=['Diseño','Jugabilidad','Online','Errores','Otra'];
function openSug(txt){
 modal('💡 AYÚDANOS A MEJORAR D.M.R PING PONG',
  '<small>¿Qué te gustaría mejorar? (máx. 200 caracteres)</small>'
  +'<div class="sg30c" id="sgC">'+CATS.map(c=>'<button type="button" data-c="'+c+'" class="'+(c===cat?'on':'')+'">'+c+'</button>').join('')+'</div>'
  +'<textarea id="sgT" maxlength="200" placeholder="Escribe tu idea..."></textarea><div class="sg30n" id="sgN">0/200</div>',
  [['ENVIAR SUGERENCIA',async()=>{
    const v=(($('sgT')||{}).value||'').trim();
    if(v.length<5){toast('Escribe al menos 5 letras');setTimeout(()=>openSug(v),50);return}
    await send(v.slice(0,200),cat)}],['CANCELAR',null,'tg']]);
 setTimeout(()=>{const t=$('sgT');if(t&&txt)t.value=txt;const n=$('sgN');if(t&&n){n.textContent=t.value.length+'/200';t.oninput=()=>{n.textContent=t.value.length+'/200'}}},30)}
document.addEventListener('click',e=>{const b=e.target.closest('#sgC button');if(!b)return;cat=b.dataset.c;document.querySelectorAll('#sgC button').forEach(x=>x.classList.toggle('on',x===b))});
async function send(text,c){
 if(!ME||!fb||!SY){toast('Inicia sesión para enviar sugerencias');return}
 let last=0;try{last=+localStorage.getItem('sg30')||0}catch(e){}
 if(Date.now()-last<60000){toast('Espera un minuto para enviar otra');return}
 try{
  await FS.addDoc(FS.collection(fb.db,'suggestions'),{uid:ME.uid,pid:prof.id,name:prof.name||'',cat:c,text,t:Date.now()});
  try{localStorage.setItem('sg30',String(Date.now()))}catch(e){}
  SFX.point();toast('✔ Sugerencia enviada. ¡Gracias!')
 }catch(e){SFX.deny();toast(errEs(e))}}
/* botón en el menú principal */
const menu=$('menu');
if(menu&&!$('sg30Btn')){const b=document.createElement('button');b.id='sg30Btn';b.type='button';b.textContent='💡 ENVIAR SUGERENCIA';b.onclick=()=>{SFX.click();au();openSug()};menu.appendChild(b)}

/* pestaña "Sugerencias" solo para administradores */
function addSgTab(){
 const T=$('apT');if(!T||T.querySelector('#sg30T')||document.body.dataset.adm2!=='1')return;
 const b=document.createElement('button');b.id='sg30T';b.type='button';b.textContent='💡 Sugerencias';
 b.onclick=async()=>{
  SFX.click();T.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  const B=$('apB');if(!B)return;B.innerHTML='<div class="apc">Cargando sugerencias...</div>';
  try{
   const s=await FS.getDocs(FS.query(FS.collection(fb.db,'suggestions'),FS.orderBy('t','desc'),FS.limit(50)));
   const rows=[];s.forEach(d=>rows.push({id:d.id,...d.data()}));
   if(!rows.length){B.innerHTML='<div class="apc">Aún no hay sugerencias.</div>';return}
   B.innerHTML=rows.map(r=>'<div class="sg30i" data-i="'+esc(r.id)+'"><small>'+new Date(r.t||0).toLocaleString()+' · ID '+esc(String(r.pid||'?'))+' · '+esc(r.name||'')+'</small><b>'+esc(r.cat||'Otra')+'</b><div>'+esc(r.text||'')+'</div><button type="button" class="tg" data-del="'+esc(r.id)+'">🗑 BORRAR</button></div>').join('');
   B.onclick=async e=>{const d=e.target.closest('[data-del]');if(!d)return;
    try{await FS.deleteDoc(FS.doc(fb.db,'suggestions',d.dataset.del));const it=d.closest('.sg30i');if(it)it.remove();SFX.point()}catch(er){toast(errEs(er))}}
  }catch(e){B.innerHTML='<div class="apc">No se pudieron leer las sugerencias: '+esc(errEs(e))+'</div>'}};
 T.appendChild(b)}
setInterval(sched,1500);
})();


/* ===== D.M.R v31: bloquear clic derecho, ver código fuente y atajos de inspección ===== */
(function(){
if(window.__dmr31)return;window.__dmr31=1;

/* 1) Sin menú de clic derecho / pulsación larga (se permite solo dentro de campos de texto) */
const okT=e=>e.target&&e.target.closest&&e.target.closest('input,textarea');
document.addEventListener('contextmenu',e=>{if(!okT(e))e.preventDefault()},true);

/* 2) Sin atajos: F12, Ctrl+U (ver fuente), Ctrl+S (guardar), Ctrl+Shift+I/J/C (inspeccionar) */
document.addEventListener('keydown',e=>{
 const k=(e.key||'').toLowerCase(),c=e.ctrlKey||e.metaKey;
 if(k==='f12'||(c&&['u','s'].includes(k))||(c&&e.shiftKey&&['i','j','c'].includes(k))||(e.metaKey&&e.altKey&&['i','u'].includes(k))){
  e.preventDefault();e.stopPropagation();return false}
},true);

/* 3) Sin arrastrar imágenes ni copiar fuera de los campos de texto */
document.addEventListener('dragstart',e=>{if(!okT(e))e.preventDefault()},true);
document.addEventListener('copy',e=>{if(!okT(e))e.preventDefault()},true);
})();
