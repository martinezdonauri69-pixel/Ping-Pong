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
