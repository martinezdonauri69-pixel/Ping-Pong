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