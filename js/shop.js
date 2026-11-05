/* shop.js · tienda: paletas, pelotas, mesas, efectos y potenciadores */
import { t } from './i18n.js';
import { P, save } from './state.js';
import { ITEMS, CATS, DEFAULT_EQ } from './data/catalog.js';
import { esc, toast, screen, sfx, bus, fmt, confirmBox, tilt } from './util.js';
import { checkAch } from './quests.js';

const owned = (it) => it.cat === 'pw' ? false : (it.pc === 0 || P.inv.includes(it.id));
const equipped = (it) => (P.eq[it.cat] || DEFAULT_EQ[it.cat]) === it.id;
const CAT_IC = { pad: '🏓', bl: '⚪', tb: '🟦', fx: '✨', pw: '💎' };

function preview(it) {
  if (it.cat === 'pad') return '<div style="width:70px;height:20px;border-radius:12px;background:linear-gradient(180deg,#fff8,' + it.col + ' 30%,#0008);box-shadow:0 0 18px ' + it.col + ',0 6px 8px #0008;transform:rotate(-24deg)"></div>';
  if (it.cat === 'bl') return '<div style="width:50px;height:50px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff9,' + it.cols[0] + ' 40%,' + it.cols[1] + ' 120%);box-shadow:0 0 16px ' + it.cols[0] + ',inset -6px -8px 12px #0006,0 6px 8px #0008"></div>';
  if (it.cat === 'tb') return '<div style="width:78px;height:50px;border-radius:6px;background:linear-gradient(135deg,' + it.cols[0] + ',' + it.cols[1] + ');border:2px solid ' + it.acc + ';box-shadow:0 8px 12px #0008;transform:perspective(200px) rotateX(38deg)"><div style="position:absolute;inset:0;margin:auto;width:2px;height:100%;background:#fffa"></div></div>';
  if (it.cat === 'fx') return '<div style="display:flex;gap:4px;flex-wrap:wrap;width:64px;justify-content:center">' + (it.cols.length ? it.cols : ['#ff7088', '#7fb0ff', '#fff']).map((c) => '<i style="width:14px;height:14px;border-radius:50%;background:' + c + ';box-shadow:0 0 10px ' + c + '"></i>').join('') + '</div>';
  return '<div style="font-size:42px;filter:drop-shadow(0 4px 6px #000a)">' + it.ic + '</div>';
}

export function openShop(startCat = 'pad') {
  let cat = startCat;
  const sc = screen({ id: 'scShop', title: t('shop_title'), wide: true });
  const top = document.createElement('div'); top.className = 'row wrap'; top.style.justifyContent = 'center';
  const tabs = document.createElement('div'); tabs.className = 'row'; tabs.style.cssText = 'gap:6px;overflow-x:auto;flex:none;padding:2px';
  const grid = document.createElement('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px';
  sc.body.append(top, tabs, grid);

  const draw = () => {
    top.innerHTML = '<span class="cur"><i class="coin3d">$</i>' + fmt(P.pc) + '</span><span class="cur gm"><i class="gem3d"></i>' + fmt(P.gems) + '</span>';
    tabs.innerHTML = '';
    CATS.forEach((c) => {
      const b = document.createElement('button'); b.className = 'b3d sm ' + (c === cat ? 'blue' : 'ghost'); b.style.flex = 'none';
      b.textContent = CAT_IC[c] + ' ' + t('cat_' + c); b.onclick = () => { sfx('click'); cat = c; draw(); }; tabs.appendChild(b);
    });
    grid.innerHTML = '';
    ITEMS.filter((x) => x.cat === cat).forEach((it) => {
      const own = owned(it), eq = equipped(it), card = document.createElement('div');
      card.className = 'li'; card.style.cssText = 'flex-direction:column;text-align:center;gap:6px;padding:10px 6px;position:relative;' + (eq ? 'border-color:var(--green);box-shadow:0 0 14px rgba(25,230,160,.5);' : '');
      card.innerHTML = '<div style="height:62px;display:flex;align-items:center;justify-content:center;position:relative">' + preview(it) + '</div><b style="font-size:12px">' + esc(t(it.n)) + '</b>' +
        (it.d ? '<small>' + esc(t(it.d)) + '</small>' : '') + (cat === 'pw' ? '<small>' + esc(t('you_have', { n: it.id === 'pw_shield' ? P.shield : P.boost })) + '</small>' : '');
      const b = document.createElement('button'); b.className = 'b3d sm block';
      if (it.cat === 'pw') { b.classList.add('violet'); b.innerHTML = it.gm + ' <i class="gem3d" style="width:14px;height:14px"></i>'; }
      else if (eq) { b.classList.add('green'); b.textContent = '✔ ' + t('equipped'); b.disabled = true; }
      else if (own) { b.classList.add('blue'); b.textContent = t('equip'); }
      else if (it.gm) { b.classList.add('violet'); b.innerHTML = it.gm + ' <i class="gem3d" style="width:14px;height:14px"></i>'; }
      else { b.classList.add('gold'); b.innerHTML = fmt(it.pc) + ' <i class="coin3d" style="width:16px;height:16px;font-size:10px">$</i>'; }
      b.onclick = () => {
        if (own && it.cat !== 'pw') { P.eq[it.cat] = it.id; save(); sfx('click'); bus.emit('look'); draw(); return; }
        const cost = it.gm || it.pc, have = it.gm ? P.gems : P.pc;
        if (have < cost) { sfx('deny'); toast(t(it.gm ? 'no_gems' : 'no_coins'), 'bad'); return; }
        confirmBox(t(it.n), t('buy_q', { p: cost + (it.gm ? ' 💎' : ' 🪙') }), t('buy'), () => {
          if (it.gm) P.gems -= cost; else P.pc -= cost;
          if (it.id === 'pw_shield') P.shield++; else if (it.id === 'pw_boost') P.boost++;
          else { P.inv.push(it.id); P.eq[it.cat] = it.id; }
          save(); sfx('coin'); toast('✔ ' + t(it.n), 'good'); checkAch(); bus.emit('look'); draw();
        }, 'gold');
      };
      card.appendChild(b); grid.appendChild(card);
      if (it.cat !== 'pw') tilt(card, 8);
    });
  };
  draw(); return sc;
}
