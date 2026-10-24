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

/* ===== D.M.R v22: MAPA DE NIVELES NUEVO (pegar al FINAL de tu segundo archivo) ===== */
(function(){
if(window.__dmr22)return;window.__dmr22=1;
const rd=n=>{const s=Math.sin(n*127.1)*43758.5;return s-Math.floor(s)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BEST=()=>VER?100:(prof.best||0);
const zi=L=>Math.min(9,Math.floor((L-1)/10));
const ZN=[['ZONA VOLCÁNICA','#ff3b1f','#ffa000'],['ZONA ELÉCTRICA','#b6ff00','#ffe600'],['BOSQUE MISTERIOSO','#19e65a','#d8ff5a'],['CIUDAD NEÓN','#2a6bff','#c040ff'],['OCÉANO PROFUNDO','#0a7aff','#00d0ff'],['DESIERTO DORADO','#ff9a1f','#ffd24a'],['REINO DE HIELO','#7fe3ff','#d8f6ff'],['SELVA SALVAJE','#4dff3a','#b8ff3a'],['DIMENSIÓN CÓSMICA','#a64dff','#ff4dff'],['FORTALEZA SUPREMA','#ff2233','#ffd24a']];
const STEP=104,DOOR=176,TOP=520,BOT=190;

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
#lmIn canvas.zc{position:absolute!important;inset:auto!important;left:0!important}
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
.mn.ev{width:80px;height:80px;font-size:26px;border-color:#ffd400;box-shadow:0 0 22px #ffd400,inset 0 0 12px #ffd40055}
.mn.ev.lk{border-color:#4a4220;box-shadow:none}
.mn.bs{width:104px;height:104px;font-size:36px;border-color:#ffd24a;box-shadow:0 0 34px #ff2233,0 0 14px #ffd24a}
.mn.bs.lk{border-color:#4a2a22;box-shadow:none}
.mst{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:2px;font-size:13px;letter-spacing:1px;white-space:nowrap;pointer-events:none}
.mst i{font-style:normal;color:#3a3f5a}.mst i.on{color:#ffd400;text-shadow:0 0 8px #ffd400}
.mbd{position:absolute;left:50%;top:-22px;transform:translateX(-50%);font-size:22px;filter:drop-shadow(0 0 6px #ffd400);pointer-events:none}
.mlk{position:absolute;right:-4px;bottom:-4px;font-size:14px}
.lmSt{position:absolute;transform:translate(-50%,-50%);z-index:3;text-align:center;font-size:11px;font-weight:900;letter-spacing:3px;color:#8fe8ff;text-shadow:0 0 10px #00c8ff}
.lmSt span{display:block;font-size:42px;filter:drop-shadow(0 0 12px #00c8ff)}
.dr{position:absolute;transform:translate(-50%,-50%);width:170px;height:128px;z-index:3;cursor:pointer}
.dr.big{transform:translate(-50%,-50%) scale(1.7)}
.drA{position:absolute;left:14px;right:14px;top:0;bottom:30px;border:3px solid var(--c);border-bottom:0;border-radius:72px 72px 0 0;overflow:hidden;background:#010208;box-shadow:0 0 20px var(--c),inset 0 0 16px var(--c)}
.dr.op .drA{animation:lmGl 2s ease-in-out infinite}
@keyframes lmGl{50%{box-shadow:0 0 34px var(--c),inset 0 0 26px var(--c)}}
.drG{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#fff,var(--c) 40%,transparent 75%);opacity:0;transition:opacity 1s .3s}
.drL,.drR{position:absolute;top:0;bottom:0;width:50.5%;background:repeating-linear-gradient(90deg,#1b2038 0 6px,#10142a 6px 12px);transition:transform 1.5s cubic-bezier(.65,0,.25,1)}
.drL{left:0;border-right:2px solid var(--c)}.drR{right:0;border-left:2px solid var(--c)}
.dr.op .drL{transform:translateX(-102%)}.dr.op .drR{transform:translateX(102%)}.dr.op .drG{opacity:.9}
.drK{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:30px;z-index:2;transition:all .9s;filter:drop-shadow(0 0 8px var(--c))}
.dr.op .drK{opacity:0;transform:translate(-50%,-160%) scale(1.8)}
.drT{position:absolute;left:0;right:0;bottom:0;text-align:center;font-size:10px;font-weight:900;letter-spacing:2px;background:rgba(5,8,28,.92);border:1px solid var(--c);border-radius:8px;padding:3px 2px;line-height:1.3;box-shadow:0 0 10px var(--c)}
.drT small{display:block;font-size:8.5px;letter-spacing:0;opacity:.85}
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
let W=0,H=0,zb=[],Y=[],DYv=[],io=null,raf=0,run=0,curZ=-1,last=0,tick=0;const vis=new Set(),ST={stop:0};
function build(){
 const In=$('lmIn');W=Math.min(480,innerWidth);H=TOP+99*STEP+9*DOOR+BOT;
 const best=BEST(),cur=Math.min(100,best+1),cx=W/2,amp=W*.3;
 prof.dseen=prof.dseen||{};prof.lst=prof.lst||{};prof.lrw=prof.lrw||{};
 const P=i=>({x:cx+Math.sin(i*.62)*amp,y:H-BOT-((i-1)*STEP+Math.floor((i-1)/10)*DOOR)});
 const dY=k=>(P(10*k).y+P(10*k+1).y)/2;
 In.style.width=W+'px';In.style.height=H+'px';In.innerHTML='';
 if(io)io.disconnect();vis.clear();
 io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target)),{root:$('lmSc'),rootMargin:'300px'});
 Y=[];for(let i=1;i<=100;i++)Y[i]=P(i).y;DYv=[];for(let k=1;k<=9;k++)DYv[k]=dY(k);DYv[10]=Y[100]-230;
 /* zonas con escenarios animados */
 zb=[];const cz=zi(cur);
 for(let z=0;z<10;z++){
  const top=z===9?0:dY(z+1),bot=z===0?H:dY(z);zb.push([top,bot]);
  const c=document.createElement('canvas');c.className='zc';c.dataset.z=z;c.width=Math.ceil(W/2);c.height=Math.ceil((bot-top)/2);
  c.style.cssText='top:'+top+'px;width:'+W+'px;height:'+(bot-top)+'px';
  c.style.filter=best<10*z?'brightness('+Math.max(.1,.42-(z-cz)*.05)+') saturate(.55)':'';
  c.__g=c.getContext('2d');c.__bk=bake(c,z,top);In.appendChild(c)}
 /* camino */
 const pts=[];
 for(let i=1;i<=100;i++){const p=P(i);pts.push({x:p.x,y:p.y,lo:i});if(i%10===0&&i<100)pts.push({x:cx,y:dY(i/10),lo:i})}
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
 /* puertas (cada 10 niveles) y puerta gigante del nivel 100 */
 for(let k=1;k<=10;k++){
  const e=EVS[k-1],open=best>=10*k&&prof.dseen[k],col=k===10?'#ffd24a':ZN[k-1][1];
  const d=document.createElement('div');d.id='dr'+k;d.className='dr'+(k===10?' big':'')+(open?' op':'');
  d.style.cssText='left:'+cx+'px;top:'+DYv[k]+'px;--c:'+col;
  d.innerHTML='<div class="drA"><div class="drG"></div><div class="drL"></div><div class="drR"></div></div><div class="drK">🔒</div><div class="drT">'+(k===10?'PUERTA FINAL':'PUERTA '+k*10)+'<small>'+e.ic+' '+e.n+'</small></div>';
  d.onclick=()=>doorTap(k);In.appendChild(d)}
 /* niveles */
 for(let i=1;i<=100;i++){
  const p=P(i),b=document.createElement('button'),st=prof.lst[i]||0,z=ZN[zi(i)];
  b.type='button';b.className='mn'+(i<=best?' dn':i===cur?' cu':' lk')+(i===100?' bs':i%10===0?' ev':'');
  b.style.cssText='left:'+p.x+'px;top:'+p.y+'px;--nc:'+z[1]+(i>cur?';opacity:'+Math.max(.14,.62-(i-cur)*.03):'');
  b.innerHTML=(i%10===0?'<b class="mbd">'+(i===100?'👑':EVS[i/10-1].ic)+'</b>':'')+'<span>'+i+'</span>'+(i>cur?'<i class="mlk">🔒</i>':'<span class="mst">'+[1,2,3].map(k=>'<i'+(k<=st?' class="on"':'')+'>★</i>').join('')+'</span>');
  b.onclick=()=>tap(i);In.appendChild(b)}
 upd()}

/* ---------- animación de fondos ---------- */
function loop(n){raf=requestAnimationFrame(loop);if(n-last<(SET.red?60:33))return;last=n;const t=n/1000,st=$('lmSc').scrollTop,vh=innerHeight;
 document.querySelectorAll('#lmIn canvas.zc').forEach(c=>{const z=+c.dataset.z,b=zb[z];if(!b||b[1]<st-300||b[0]>st+vh+300)return;
  try{const g=c.__g;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;scene(z,g,c.width,c.height,t);if(c.__bk)g.drawImage(c.__bk,0,0)}
  catch(e){if(!loop.e){loop.e=1;showErr('mapa: '+e.message)}}})}

/* diseño propio de cada nivel (el mismo del tablero) pintado de fondo */
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
 modal('NIVEL '+i+(i===100?' · JEFE FINAL':''),
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
