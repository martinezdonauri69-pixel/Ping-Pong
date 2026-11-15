/* shop.js · tienda: paletas 3D (40), pelotas (12 clásicas + 40 en 3D), mesas, efectos y potenciadores.
   Las paletas se ven en 3D con UN solo visor (paddles3d.js) y las pelotas 3D con UN solo visor (balls3d.js): no hay una escena por tarjeta. */
import { t } from './i18n.js';
import { P, save, lvl } from './state.js';
import { ITEMS, CATS, DEFAULT_EQ } from './data/catalog.js';
import { createPreviewer } from './paddles3d.js';
import { createBallPreviewer } from './balls3d.js';
import { esc, toast, screen, sfx, bus, fmt, confirmBox, tilt } from './util.js';
import { checkAch } from './quests.js';

const owned = (it) => it.cat === 'pw' ? false : (it.pc === 0 || P.inv.includes(it.id));
const equipped = (it) => (P.eq[it.cat] || DEFAULT_EQ[it.cat]) === it.id;
const CAT_IC = { pad: '🏓', bl: '⚪', tb: '🟦', fx: '✨', pw: '💎' };
const EX_IC = { fire: '🔥', light: '✨', energy: '⚡', hell: '😈', gold: '👑', cosmic: '♾️', dragon: '🐉', bolt: '⚡', frost: '❄️', water: '🌊' };
const TIER_COL = ['#7fb0ff', '#19e6a0', '#b57bff', '#ffc21a', '#ff3df2'];

/* ventaja de una paleta en texto: "+2% Precisión" */
function perk(it) {
  if (it.id === 'pd_clasica') return t('pd_plain');
  const k = ['pr', 'ct', 'sp'].find((x) => it.st[x] > 0);
  const a = k ? '+' + Math.round(it.st[k] * 100) + '% ' + t('pd_' + k) : t('pd_fxonly');
  return a + (EX_IC[it.ex] ? ' ' + EX_IC[it.ex] : '');
}

function preview(it) {
  if (it.cat === 'bl') return '<div style="width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff9,' + it.cols[0] + ' 40%,' + it.cols[1] + ' 120%);box-shadow:0 0 16px ' + it.cols[0] + ',inset -6px -8px 12px #0006,0 6px 8px #0008"></div>';
  if (it.cat === 'tb') return '<div style="width:78px;height:50px;border-radius:6px;background:linear-gradient(135deg,' + it.cols[0] + ',' + it.cols[1] + ');border:2px solid ' + it.acc + ';box-shadow:0 8px 12px #0008;transform:perspective(200px) rotateX(38deg)"><div style="position:absolute;inset:0;margin:auto;width:2px;height:100%;background:#fffa"></div></div>';
  if (it.cat === 'fx') return '<div style="display:flex;gap:4px;flex-wrap:wrap;width:64px;justify-content:center">' + (it.cols.length ? it.cols : ['#ff7088', '#7fb0ff', '#fff']).map((c) => '<i style="width:14px;height:14px;border-radius:50%;background:' + c + ';box-shadow:0 0 10px ' + c + '"></i>').join('') + '</div>';
  return '<div style="font-size:42px;filter:drop-shadow(0 4px 6px #000a)">' + it.ic + '</div>';
}

export function openShop(startCat = 'pad') {
  let cat = startCat, pv = null, bv = null;
  const sc = screen({ id: 'scShop', title: t('shop_title'), wide: true, onclose: () => { if (pv) pv.dispose(); pv = null; if (bv) bv.dispose(); bv = null; } });
  const top = document.createElement('div'); top.className = 'row wrap'; top.style.justifyContent = 'center';
  const tabs = document.createElement('div'); tabs.className = 'row'; tabs.style.cssText = 'gap:6px;overflow-x:auto;flex:none;padding:2px';
  const note = document.createElement('div'); note.className = 'muted c'; note.style.fontSize = '11px';
  const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px';   /* 3 columnas en el móvil */
  sc.body.append(top, tabs, note, grid);

  const draw = () => {
    top.innerHTML = '<span class="cur"><i class="coin3d">$</i>' + fmt(P.pc) + '</span><span class="cur gm"><i class="gem3d"></i>' + fmt(P.gems) + '</span>';
    tabs.innerHTML = '';
    CATS.forEach((c) => {
      const b = document.createElement('button'); b.className = 'b3d sm ' + (c === cat ? 'blue' : 'ghost'); b.style.flex = 'none';
      b.textContent = CAT_IC[c] + ' ' + t('cat_' + c); b.onclick = () => { sfx('click'); cat = c; draw(); sc.body.scrollTop = 0; }; tabs.appendChild(b);
    });
    note.textContent = cat === 'pad' ? t('pd_note') : '';
    if (pv) pv.clear(); if (bv) bv.clear();
    grid.innerHTML = '';
    if (cat !== 'pad' && pv) { pv.dispose(); pv = null; }            /* se libera el visor que no se usa */
    if (cat !== 'bl' && bv) { bv.dispose(); bv = null; }
    if (cat === 'pad' && !pv) pv = createPreviewer(sc.body);
    if (cat === 'bl' && !bv) bv = createBallPreviewer(sc.body);
    ITEMS.filter((x) => x.cat === cat).forEach((it) => {
      const own = owned(it), eq = equipped(it), card = document.createElement('div'), isPad = it.cat === 'pad', is3d = it.cat === 'bl' && !!it.v, locked = !own && it.lv && lvl() < it.lv;
      card.className = 'li';
      card.style.cssText = 'flex-direction:column;text-align:center;gap:4px;padding:8px 4px;position:relative;min-width:0;' + (eq ? 'border-color:var(--green);box-shadow:0 0 14px rgba(25,230,160,.5);' : isPad ? 'border-color:' + TIER_COL[it.tier] + '66;' : is3d ? 'border-color:' + TIER_COL[it.rar] + '66;' : '');
      const nm = it.name || t(it.n);
      card.innerHTML = '<b style="font-size:11px;line-height:1.1;overflow-wrap:anywhere">' + esc(nm) + '</b>' +
        (isPad ? '<canvas class="pv" style="width:100%;aspect-ratio:200/112;display:block"></canvas><small style="font-size:9.5px;line-height:1.15;color:' + TIER_COL[it.tier] + '">' + esc(perk(it)) + '</small>'
          : is3d ? '<canvas class="pv" style="width:100%;aspect-ratio:176/150;display:block;cursor:pointer"></canvas>'
          : '<div style="height:62px;display:flex;align-items:center;justify-content:center;position:relative">' + preview(it) + '</div>' + (it.d ? '<small>' + esc(t(it.d)) + '</small>' : '') + (cat === 'pw' ? '<small>' + esc(t('you_have', { n: it.id === 'pw_shield' ? P.shield : P.boost })) + '</small>' : ''));
      const b = document.createElement('button'); b.className = 'b3d sm block'; b.style.cssText = 'min-height:30px;padding:2px 4px;font-size:12px';
      if (it.cat === 'pw') { b.classList.add('violet'); b.innerHTML = it.gm + ' <i class="gem3d" style="width:14px;height:14px"></i>'; }
      else if (eq) { b.classList.add('green'); b.textContent = '✔ ' + t('equipped'); b.disabled = true; }
      else if (own) { b.classList.add('blue'); b.textContent = t('equip'); }
      else if (locked) { b.classList.add('ghost'); b.textContent = '🔒 Lv.' + it.lv; }                 /* paleta difícil: pide nivel de perfil */
      else if (it.gm) { b.classList.add('violet'); b.innerHTML = it.gm + ' <i class="gem3d" style="width:14px;height:14px"></i>'; }
      else { b.classList.add('gold'); b.innerHTML = fmt(it.pc) + ' <i class="coin3d" style="width:16px;height:16px;font-size:10px">$</i>'; }
      b.onclick = () => {
        if (own && it.cat !== 'pw') { P.eq[it.cat] = it.id; save(); sfx('click'); bus.emit('look'); draw(); return; }
        if (locked) { sfx('deny'); toast('🔒 Lv.' + it.lv, 'bad'); return; }
        const cost = it.gm || it.pc, have = it.gm ? P.gems : P.pc;
        if (have < cost) { sfx('deny'); toast(t(it.gm ? 'no_gems' : 'no_coins'), 'bad'); return; }   /* no se puede comprar sin monedas */
        confirmBox(nm, t('buy_q', { p: cost + (it.gm ? ' 💎' : ' 🪙') }), t('buy'), () => {
          if ((it.gm ? P.gems : P.pc) < cost) { sfx('deny'); return; }
          if (it.gm) P.gems -= cost; else P.pc -= cost;
          if (it.id === 'pw_shield') P.shield++; else if (it.id === 'pw_boost') P.boost++;
          else { P.inv.push(it.id); P.eq[it.cat] = it.id; }
          save(); sfx('coin'); toast('✔ ' + nm, 'good'); checkAch(); bus.emit('look'); draw();
        }, 'gold');
      };
      card.appendChild(b); grid.appendChild(card);
      if (isPad) pv.add(card.querySelector('canvas'), it); else if (is3d) bv.add(card.querySelector('canvas'), it); else if (it.cat !== 'pw') tilt(card, 8);
    });
  };
  draw(); return sc;
}
