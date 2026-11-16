// Kartu Ujian: pilih kartu & harga, Ujian Saya, Riwayat Pembayaran (fitur Terang AI yang sudah ada).
// Jumlah paket per ujian, durasi TBS, dan harga contoh (Rp0 / Rp15.000) mengikuti halaman "Ujian Tersedia".
// Nama paket selain yang gratis dan "Ambis 2026 #n" adalah contoh.
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, today, toISO, fromISO } from './state.js';
import { ribbon, openDlg, closeDlg, hooks, rp } from './ui.js';

const S = () => St.S;
export const TABS = {
  UTBK: { label: 'UTBK', n: 10, dur: '3 jam 15 menit', blurb: 'Simulasi UTBK-SNBT dalam berbagai paket pilihan.', free: 'TPS (Gratis)', pat: 'UTBK Ambis 2026', sub: 'Simulasi Tes Potensi Skolastik UTBK Terang AI', ic: 'book' },
  LPDP: { label: 'LPDP', n: 16, dur: '1 jam 30 menit', blurb: 'Simulasi tes untuk beasiswa LPDP dalam berbagai paket pilihan.', free: 'TBS (Gratis)', pat: 'TBS Ambis 2026', sub: 'Simulasi Tes Bakat Skolastik LPDP Terang AI', ic: 'grad' },
  CPNS: { label: 'CPNS', n: 4, dur: '1 jam 40 menit', blurb: 'Simulasi SKD CPNS dalam berbagai paket pilihan.', free: 'SKD (Gratis)', pat: 'SKD Ambis 2026', sub: 'Simulasi SKD CPNS Terang AI', ic: 'building' },
};
const PRICE = 15000;

export function cardsOf(tab) {
  const t = TABS[tab];
  return Array.from({ length: t.n }, (_, i) => ({
    id: `${tab}-${i}`, tab, name: i === 0 ? t.free : `${t.pat} #${i}`, price: i === 0 ? 0 : PRICE, dur: t.dur, sub: t.sub,
  }));
}
export const cardById = (id) => { const [tab, i] = id.split('-'); return TABS[tab] ? cardsOf(tab)[+i] : null; };
const owned = (id) => S().cards.some((c) => c.id === id);
const KT = { tab: null, more: false };

function tile(c) {
  const has = owned(c.id); const t = TABS[c.tab];
  return `<div class="exam-card"><span class="pill outline"><i class="dot-o"></i> ${t.label}</span>
    <p class="small muted">${esc(c.sub)}</p><h3>${esc(c.name)}</h3><p class="small muted">Durasi: ${c.dur}</p>
    <div class="exam-art">${icon(t.ic, 44)}</div><div class="price" style="text-align:center">${rp(c.price)}</div>
    <button class="btn ${has ? '' : 'primary'} block" data-act="${has ? 'kartu-go' : 'kartu-buy'}" data-id="${c.id}">${has ? 'Mulai Simulasi' : c.price === 0 ? 'Ambil Kartu' : 'Beli Kartu'}</button></div>`;
}

export function viewKartu(params) {
  const sub = params.get('sub') || 'pilih';
  if (!KT.tab) KT.tab = S().target;
  const subTabs = [['pilih', 'Pilih Kartu Ujian'], ['saya', 'Ujian Saya'], ['riwayat', 'Riwayat Pembayaran']]
    .map(([k, l]) => `<a class="chip${sub === k ? ' on' : ''}" href="#/kartu?sub=${k}" ${sub === k ? 'aria-current="page"' : ''}>${l}</a>`).join('');
  let body = '';
  if (sub === 'pilih') {
    const list = cardsOf(KT.tab); const shown = KT.more ? list : list.slice(0, 6); const t = TABS[KT.tab];
    body = `<div class="chips tabs" role="tablist">${Object.entries(TABS).map(([k, v]) => `<button class="chip tab" role="tab" aria-selected="${KT.tab === k}" data-act="kartu-tab" data-k="${k}">${icon(v.ic, 16)} ${v.label} <span class="count">${v.n}</span></button>`).join('')}</div>
      <div class="card tint banner"><h2>${t.label}</h2><p>${t.blurb}</p></div>
      <div class="exam-grid">${shown.map(tile).join('')}</div>
      ${list.length > 6 ? `<div class="btn-row" style="justify-content:center"><button class="btn" data-act="kartu-more">${KT.more ? 'Tampilkan lebih sedikit' : `Tampilkan semua ${list.length} paket`}</button></div>` : ''}
      <p class="small muted">Harga dan nama paket di prototipe ini contoh. Pembayaran belum tersambung.</p>`;
  } else if (sub === 'saya') {
    const cs = S().cards;
    body = cs.length ? `<div class="exam-grid">${cs.map((c) => { const k = cardById(c.id); return `<div class="exam-card"><span class="pill outline"><i class="dot-o"></i> ${TABS[k.tab].label}</span><h3>${esc(k.name)}</h3><p class="small muted">Durasi: ${k.dur} · diambil ${fromISO(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
      <button class="btn primary block" data-act="kartu-go" data-id="${k.id}">Mulai Simulasi</button></div>`; }).join('')}</div>`
      : `<div class="card empty">${mascot('calm', 84)}<h2>Belum ada kartu ujian</h2><p class="muted">Ambil kartu gratis dulu buat nyoba simulasinya.</p><a class="btn primary" href="#/kartu?sub=pilih">Pilih kartu</a></div>`;
  } else {
    const ps = S().payments;
    body = ps.length ? `<div class="card"><table class="data"><caption class="sr">Riwayat pembayaran</caption><thead><tr><th>Tanggal</th><th>Kartu</th><th>Harga</th><th>Status</th></tr></thead><tbody>${ps.map((p) => `<tr><td>${fromISO(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>${esc(p.name)}</td><td>${rp(p.paid)}</td><td>${esc(p.status)}</td></tr>`).join('')}</tbody></table></div>`
      : `<div class="card empty">${mascot('calm', 84)}<h2>Belum ada transaksi</h2><p class="muted">Riwayat pembelian kartumu bakal muncul di sini.</p></div>`;
  }
  return `<div class="page-head"><div><h1>Kartu Ujian</h1><p>Pilih paket simulasi yang cocok buat targetmu</p></div></div>
    <div class="stack"><div class="chips">${subTabs}</div>${body}</div>`;
}

export const acts = {
  'kartu-tab': (el) => { KT.tab = el.dataset.k; KT.more = false; hooks.render(true); },
  'kartu-more': () => { KT.more = !KT.more; hooks.render(true); },
  'kartu-buy': (el) => {
    const c = cardById(el.dataset.id), s = S();
    if (c.price === 0) { addCard(c, 0, 'Gratis'); closeDlg(); ribbon(`Kartu "${c.name}" masuk ke Ujian Saya`); hooks.render(true); return; }
    const disc = s.vouchers > 0;
    openDlg('Beli Kartu', `${say('happy', `<b>${esc(c.name)}</b><br><span class="small muted">${esc(c.sub)} · ${c.dur}</span>`, 56)}
      <div class="price">${rp(c.price)}</div>
      ${disc ? `<label class="check"><input type="checkbox" id="kb-v" checked><span>Pakai voucher diskon 20% (kamu punya ${s.vouchers})</span></label>` : '<p class="small muted">Punya voucher diskon? Tukar poinmu di Poin & Jurus.</p>'}
      <p class="small muted">Pembayaran belum tersambung di prototipe ini, jadi pembelian dicatat sebagai demo.</p>
      <div class="btn-row"><button class="btn primary" data-act="kartu-confirm" data-id="${c.id}">Konfirmasi (demo)</button><button class="btn" data-act="dlg-close">Batal</button></div>`);
  },
  'kartu-confirm': (el) => {
    const c = cardById(el.dataset.id), s = S(); const v = document.getElementById('kb-v');
    const useV = !!(v && v.checked && s.vouchers > 0); const paid = useV ? Math.round((c.price * 0.8) / 100) * 100 : c.price;
    if (useV) s.vouchers -= 1;
    addCard(c, paid, 'Demo (belum dibayar)'); closeDlg(); ribbon(`Kartu "${c.name}" masuk ke Ujian Saya`); hooks.render(true);
  },
  'kartu-go': (el) => { location.hash = `#/daily?mode=tryout&card=${el.dataset.id}`; },
};
function addCard(c, paid, status) {
  const s = S(); if (owned(c.id)) return;
  s.cards.unshift({ id: c.id, date: toISO(today()) });
  s.payments.unshift({ id: c.id, name: c.name, paid, status, date: toISO(today()) });
  St.save();
}
