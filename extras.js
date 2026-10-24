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