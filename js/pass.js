// Pass Ujian (sekali bayar, per ujian) + Premium Bulanan sebagai pembanding.
// Harga = hipotesis untuk uji pasar, BUKAN harga final. Pembayaran belum tersambung di prototipe.
// Pass bukan sekadar Premium ganti nama: tiap pass punya jalur kesiapan bertahap dan cek kesiapan akhir.
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, today, addDays, toISO, fromISO, daysBetween, daysToExam } from './state.js';
import { track } from './analytics.js';
import { rp, openDlg, closeDlg, ribbon, hooks } from './ui.js';

export const PASSES = [
  { id: 'lpdp', exam: 'LPDP', name: 'Pass Gaspol Wawancara LPDP', tag: 'Sprint 30 hari', days: 30, price: 49000, ic: 'grad', color: 'var(--blue)',
    who: 'Buat pejuang beasiswa yang mau lolos tahap wawancara.',
    path: [['doc', 'Bedah Profil & Esai'], ['wave', 'Drill Wawancara AI'], ['video', 'Mock Interview + Feedback'], ['check', 'Cek Siap Akhir']],
    value: 'Persiapan wawancara jadi perjalanan 30 hari yang terarah, bukan sekadar latihan AI acak.' },
  { id: 'cpns', exam: 'CPNS', name: 'Pass Ngebut SKD CPNS', tag: 'Intensif 60 hari', days: 60, price: 69000, ic: 'building', color: 'var(--gold)',
    who: 'Buat calon ASN yang lagi nyiapin SKD: TWK, TIU, TKP.',
    path: [['target', 'Diagnostik SKD'], ['zap', 'Libas Topik Lemah'], ['flame', 'Latihan Harian'], ['ticket', 'Tryout SKD Penuh'], ['check', 'Simulasi Final']],
    value: 'Ganti latihan soal yang acak-acakan jadi program yang terukur dan fokus ke skor.' },
  { id: 'utbk', exam: 'UTBK', name: 'Pass Jagoan SNBT', tag: 'Mastery 90 hari', days: 90, price: 89000, ic: 'book', color: 'var(--orange)',
    who: 'Buat siswa yang ngincer PTN impian lewat UTBK-SNBT.',
    path: [['target', 'Tes Diagnostik'], ['book', 'Belajar Terarah'], ['sparkle', 'Latihan Adaptif'], ['chart', 'Pantau Progres'], ['check', 'Tryout Final + Proyeksi']],
    value: 'Roadmap 90 hari yang ikut menyesuaikan sama progres belajarmu.' },
  { id: 'ielts', exam: 'IELTS', name: 'Pass Naik Band IELTS', tag: 'Booster 60 hari', days: 60, price: 99000, ic: 'chat', color: 'var(--blue-strong)',
    who: 'Buat pelajar & profesional yang ngejar target band IELTS.',
    path: [['target', 'Diagnostik Band'], ['chart', 'Peta Skill Gap'], ['wave', 'Latihan Speaking & Writing'], ['flame', 'Pantau Band Mingguan'], ['check', 'Mock Test Final']],
    value: 'Kejar target band lewat milestone personal, bukan les bahasa Inggris umum.',
    note: 'Estimasi band dari AI bersifat indikatif, bukan hasil resmi IELTS.' },
  { id: 'toefl', exam: 'TOEFL', name: 'Pass Tancap Skor TOEFL', tag: 'Accelerator 60 hari', days: 60, price: 99000, ic: 'headset', color: 'var(--gold)',
    who: 'Buat pelajar & profesional yang nyiapin TOEFL iBT.',
    path: [['target', 'Diagnostik Skor'], ['star', 'Rencana Target Skor'], ['book', 'Latihan per Section'], ['clock', 'Mock Berwaktu'], ['check', 'Cek Skor Akhir']],
    value: 'Persiapan TOEFL jadi perjalanan menuju target skor yang bisa diukur.',
    note: 'Estimasi skor dari AI bukan skor resmi TOEFL. Format mengikuti TOEFL iBT yang berlaku saat peluncuran.' },
];
export const REGULAR = { name: 'Premium Bulanan', price: 25000, who: 'Buat yang belajar terus-terusan atau lintas beberapa ujian.',
  flow: ['Akses semua fitur premium', 'Pilih topik atau ujian sesukamu', 'Latihan fleksibel kapan aja', 'Aktif selama langganan jalan'] };
const COMPARE = [
  ['Pembayaran', 'Rp25.000/bulan', 'Sekali bayar'],
  ['Alasan beli', 'Akses fitur terus-menerus', 'Ngejar satu target ujian'],
  ['Cara belajar', 'Bebas, atur sendiri', 'Terstruktur, per milestone'],
  ['Durasi', 'Sampai berhenti langganan', '30–90 hari'],
  ['Personalisasi', 'Dukungan belajar umum', 'Jalur kesiapan khusus ujian'],
  ['Hasil akhir', 'Akses fitur belajar', 'Cek kesiapan akhir'],
  ['Perpanjangan', 'Otomatis tiap bulan', 'Tanpa perpanjangan otomatis'],
];

const S = () => St.S;
export const passFor = (target) => PASSES.find((p) => p.exam === target) || PASSES[1];
export const activePass = () => {
  const a = S().pass; if (!a || !a.until) return null;
  const left = daysBetween(today(), fromISO(a.until)); if (left < 0) return null;
  return { ...PASSES.find((p) => p.id === a.id), left, step: a.step || 0 };
};

function pathLine(p, step = -1) {
  return `<ol class="pp">${p.path.map(([ic, t], i) => `<li class="${i < step ? 'done' : i === step ? 'cur' : ''}"><span class="pp-ic">${icon(i < step ? 'check' : ic, 16)}</span><span>${t}</span></li>`).join('')}</ol>`;
}

export function passCard(p, rec) {
  return `<div class="pass${rec ? ' rec' : ''}" style="--pc:${p.color}">${rec ? '<span class="flag">Cocok buat targetmu</span>' : ''}
    <div class="pass-top"><span class="pass-ic">${icon(p.ic, 22)}</span><div><small>${p.exam} · ${p.tag}</small><h3>${esc(p.name)}</h3></div></div>
    <div class="pass-price">${rp(p.price)}<small> sekali bayar · ${p.days} hari</small></div>
    <p class="small muted">${esc(p.who)}</p>${pathLine(p)}
    <button class="btn ${rec ? 'primary' : ''} block" data-act="pass-open" data-id="${p.id}">Lihat jalurnya</button></div>`;
}

// Kartu rekomendasi kecil (Beranda & hasil cek posisi). Tanpa kelangkaan palsu, tanpa janji skor.
export function recommendCard(target) {
  const p = passFor(target); const ap = activePass();
  if (ap) return `<div class="card pass-active"><div class="card-head"><h2>${icon('crown')} ${esc(ap.name)}</h2><span class="pill gold">Sisa ${ap.left} hari</span></div>
    ${pathLine(ap, ap.step)}${ap.left <= 7 || daysToExam() <= 0 ? `<p class="small" style="margin:6px 0">${ap.left <= 7 ? `Pass-mu tinggal ${ap.left} hari.` : 'Ujianmu udah lewat.'} Mau lanjut ke target berikutnya, atau pakai Premium Bulanan buat belajar santai?</p><div class="btn-row"><a class="btn small" href="#/lapor-hasil">Target berikutnya</a><a class="btn small" href="#/poin">Premium Bulanan</a></div>` : `<a class="btn block" href="#/poin">Lihat progres pass</a>`}</div>`;
  return `<div class="card pass-mini" style="--pc:${p.color}"><div class="say">${mascot('happy', 52)}<div><small class="muted">Rekomendasi Nyala buat targetmu</small><h3>${esc(p.name)}</h3>
    <p class="small"><b>${rp(p.price)}</b> sekali bayar · ${p.days} hari, lengkap sampai cek siap akhir.</p></div></div>
    <button class="btn block" data-act="pass-open" data-id="${p.id}" style="margin-top:10px">Lihat jalurnya</button></div>`;
}

export function passSection() {
  const target = S().target; const ap = activePass();
  const sorted = [passFor(target), ...PASSES.filter((p) => p !== passFor(target))];
  const active = ap ? `<div class="card pass-active"><div class="card-head"><h2>${icon('crown')} Pass aktif: ${esc(ap.name)}</h2><span class="pill gold">Sisa ${ap.left} hari</span></div>
    ${pathLine(ap, ap.step)}<p class="small muted">Milestone ${Math.min(ap.step + 1, ap.path.length)} dari ${ap.path.length}. Selesaikan Misi Harian dan Jalur Belajar buat maju ke milestone berikutnya.</p>
    <button class="btn small" data-act="pass-step">Tandai milestone selesai (demo)</button></div>` : '';
  return `<div class="card pass-hero"><div class="say">${mascot('cheer', 72)}<div><span class="l-kicker">Pass Ujian · sekali bayar</span><h2>Beli pas butuh. Belajar dengan tujuan.</h2>
    <p class="small muted">Tiap pass punya jalur dari diagnostik sampai cek siap akhir, khusus buat satu ujian. Bukan langganan, nggak ada perpanjangan otomatis.</p></div></div></div>
    ${active}
    <div class="passes">${sorted.map((p, i) => passCard(p, i === 0)).join('')}</div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card regular"><div class="card-head"><h2>${icon('star')} ${REGULAR.name}</h2><span class="pill tint">Langganan</span></div>
        <div class="pass-price">${rp(REGULAR.price)}<small> /bulan</small></div><p class="small muted">${REGULAR.who}</p>
        <ul class="list-plain small" style="margin:10px 0">${REGULAR.flow.map((f) => `<li>${f}</li>`).join('')}</ul>
        <button class="btn block" data-act="regular-open">Pilih Premium Bulanan</button></div>
      <div class="card"><h2 style="margin-bottom:8px">Bedanya apa?</h2><div class="tbl-wrap"><table class="data cmp"><thead><tr><th></th><th>Premium Bulanan</th><th>Pass Ujian</th></tr></thead>
        <tbody>${COMPARE.map(([d, a, b]) => `<tr><th scope="row">${d}</th><td>${a}</td><td><b>${b}</b></td></tr>`).join('')}</tbody></table></div></div></div>
    <p class="small muted">Semua harga masih hipotesis buat uji pasar, belum harga final. Poinmu bisa ditukar voucher diskon pass di Katalog Hadiah.</p>`;
}

function buyBlock(price, label, act, id) {
  const s = S(); const disc = s.vouchers > 0 ? Math.round(price * 0.8 / 100) * 100 : null;
  return `${disc ? `<label class="check"><input type="checkbox" id="pv-use" checked><span>Pakai voucher 20%: jadi <b>${rp(disc)}</b></span></label>` : '<p class="small muted">Punya poin? Tukar voucher diskon di Katalog Hadiah.</p>'}
    <p class="small muted">Pembayaran belum tersambung di prototipe ini, jadi ini cuma demo.</p>
    <div class="btn-row"><button class="btn primary" data-act="${act}" data-id="${id || ''}">${label}</button><button class="btn" data-act="dlg-close">Nanti dulu</button></div>`;
}

export const acts = {
  'pass-open': (el) => {
    const p = PASSES.find((x) => x.id === el.dataset.id); track('pass_viewed', { pass: p.id });
    openDlg(esc(p.name), `${say('cheer', `<b>${rp(p.price)}</b> sekali bayar · ${p.days} hari<br><span class="small">${esc(p.value)}</span>`, 60)}
      <p class="label">Jalur kesiapanmu</p>${pathLine(p)}
      ${p.note ? `<p class="small" style="color:var(--orange-strong)">${icon('alert', 14)} ${esc(p.note)}</p>` : ''}
      ${buyBlock(p.price, `Aktifkan pass (demo)`, 'pass-buy', p.id)}`);
  },
  'pass-buy': (el) => {
    const p = PASSES.find((x) => x.id === el.dataset.id), s = S(); const v = document.getElementById('pv-use');
    if (v && v.checked && s.vouchers > 0) s.vouchers -= 1;
    const until = toISO(addDays(today(), p.days));
    s.pass = { id: p.id, until, step: 0 };
    if (!s.premiumUntil || fromISO(s.premiumUntil) < fromISO(until)) s.premiumUntil = until;
    if (p.exam !== s.target) { s.target = p.exam; s.examDate = s.examDate; }
    s.ledger.unshift({ t: `Aktif: ${p.name}`, p: 0, d: toISO(today()) }); St.save(); closeDlg();
    ribbon(`${p.name} aktif! Yuk mulai milestone pertama.`); hooks.render(true);
  },
  'pass-step': () => { const s = S(); if (!s.pass) return; const ap = activePass(); s.pass.step = Math.min((s.pass.step || 0) + 1, ap.path.length); St.save(); hooks.render(true); },
  'regular-open': () => openDlg(REGULAR.name, `${say('happy', `<b>${rp(REGULAR.price)}/bulan</b>, diperpanjang otomatis dan bisa berhenti kapan aja.`, 56)}
    <ul class="list-plain">${REGULAR.flow.map((f) => `<li>${f}</li>`).join('')}</ul>${buyBlock(REGULAR.price, 'Mulai langganan (demo)', 'regular-buy')}`),
  'regular-buy': () => { const s = S(); s.premiumUntil = toISO(addDays(today(), 30)); s.ledger.unshift({ t: 'Aktif: Premium Bulanan', p: 0, d: toISO(today()) }); St.save(); closeDlg(); ribbon('Premium Bulanan aktif!'); hooks.render(true); },
};
