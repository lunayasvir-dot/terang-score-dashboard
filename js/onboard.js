// Landing page (#/mulai) dan onboarding pertama kali (#/onboarding):
// isi info umum satu pertanyaan per layar → cek posisi 5 soal → rencana belajar.
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, today, addDays, toISO, fromISO, longDate } from './state.js';
import { TARGETS, BANK, DIAG_IDX } from './data.js';
import { ringSVG } from './charts.js';
import { $, $$, hooks } from './ui.js';
import * as DEMO from './demo.js';

/* ------------------------------------------------------------------ LANDING */
export function viewLanding() {
  const proof = [['A', 'var(--blue)'], ['R', 'var(--gold)'], ['S', 'var(--orange)'], ['D', 'var(--blue)']].map(([l, c]) => `<span style="background:${c}">${l}</span>`).join('');
  const q = BANK[3];
  const squad = Array.from({ length: 15 }, (_, i) => {
    const n = 'ABCDEFGHIJKLMNO'[i]; const filled = [4, 4, 3, 4, 2, 4, 4, 1, 4, 3, 4, 4, 2, 4, 4][i];
    return `<div><span class="avatar">${n}</span><div class="sq-dots">${[0, 1, 2, 3].map((k) => `<i class="${k < filled ? 'f' : ''}" style="--d:${i + k * 3}"></i>`).join('')}</div></div>`;
  }).join('');
  const chat = [['me', 'Cara cepet hitung 15% dari 240 gimana?'], ['ai', '10% dari 240 = 24, 5% = 12. Jadi 15% = <b>36</b>.'], ['me', 'Oh, gitu doang ternyata.'], ['ai', 'Iya! Mau coba satu soal persen lagi?']]
    .map(([w, t], i) => `<div class="msg ${w}" style="--d:${i}">${w === 'ai' ? mascot('happy', 32) : ''}<div class="bubble2"><p>${t}</p></div></div>`).join('');
  return `<div class="landing">
    <header class="l-wrap l-nav"><span class="l-logo">${mascot('happy', 40)} Terang Score</span><button class="btn small" data-act="land-demo"><span class="hide-sm">Aku udah punya akun</span><span class="show-sm">Masuk</span></button></header>
    <section class="l-wrap l-hero">
      <div><h1>Sepuluh soal sehari, sampai namamu ada di <span class="hl">pengumuman</span>.</h1>
        <p class="l-sub">Latihan CPNS, UTBK, dan LPDP yang tahu posisimu, nemenin tiap hari, dan bikin kamu belajar bareng squad. Gratis buat mulai.</p>
        <div class="l-cta"><button class="btn primary xl" data-act="land-start">Mulai gratis</button><button class="btn xl" data-act="land-watch">&#9654; Tonton demo</button></div>
        <button class="btn link small" data-act="land-demo" style="padding:0;margin-top:12px">atau lihat dashboard contoh &rarr;</button>
        <div class="l-proof"><span class="avs">${proof}</span> Digunakan oleh 10K+ pembelajar Indonesia</div></div>
      <div class="l-stage" aria-hidden="true"><div class="l-blob"></div><div class="l-blob b2"></div>
        <button class="mascot-btn" data-act="poke" tabindex="-1">${mascot('cheer', 260)}</button>
        <span class="float f1">${icon('flame', 18)} 12 hari Api Belajar</span>
        <span class="float f2">${icon('half', 18)} Skor Siap 74 · Dikit Lagi</span>
        <span class="float f3">${icon('users', 18)} Squad 18/20 udah 4 hari</span>
        <span class="float f4">${icon('check', 18)} Misi Harian beres!</span></div>
    </section>
    <div class="l-strip"><div class="l-wrap"><span>Siap buat</span><b>${icon('building', 20)} CPNS</b><b>${icon('book', 20)} UTBK-SNBT</b><b>${icon('grad', 20)} LPDP</b><span>dan belajar harian lainnya</span></div></div>
    ${DEMO.demoSection()}${DEMO.featureGrid()}

    <section class="l-wrap l-sec"><div class="l-copy"><div class="l-num">01</div><span class="l-kicker">Kenali posisimu</span><h2>Lima menit, langsung tau posisimu.</h2>
      <p>Cek posisi singkat bikin Skor Siap-mu mulai kebentuk. Selama datanya belum cukup, kami bilang jujur: skornya masih "Lagi Kenalan". Nggak ada janji palsu soal peluang lolos.</p></div>
      <div class="l-demo l-ring io">${ringSVG({ mode: 'score', score: 71, band: 'close' })}<p class="small muted">Radar Skill nunjukin topik yang paling perlu diasah.</p></div></section>

    <section class="l-wrap l-sec rev"><div class="l-copy"><div class="l-num">02</div><span class="l-kicker">Misi Harian</span><h2>Sepuluh soal. Sepuluh menit. Beres.</h2>
      <p>Satu misi kecil cukup buat jaga Api Belajarmu tetap nyala. Lagi capek? Ada Tiket Libur, jadi kamu nggak dihukum karena istirahat.</p></div>
      <div class="l-demo" id="land-q"><span class="qz-label">Coba satu soal</span><h3 class="qz-q" style="font-size:1.25rem">${esc(q.q)}</h3>
        ${q.o.map((o, i) => `<button class="opt" data-act="land-try" data-i="${i}"><span class="key">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}<p class="small" id="land-fb" role="status" style="margin-top:12px"></p></div></section>

    <section class="l-wrap l-sec"><div class="l-copy"><div class="l-num">03</div><span class="l-kicker">#SquadTerang</span><h2>Belajar bareng, bukan saingan.</h2>
      <p>Squad isinya 15–25 orang dengan target yang sama. Nggak ada peringkat dan nggak ada skor yang dipamerin. Yang dihitung cuma satu: kita sampai bareng-bareng.</p></div>
      <div class="l-demo io"><div class="sq-grid">${squad}</div><p class="small muted" style="margin-top:12px">Titik terisi = misi harian selesai hari itu.</p></div></section>

    <section class="l-wrap l-sec rev"><div class="l-copy"><div class="l-num">04</div><span class="l-kicker">Tanya AI</span><h2>Bingung jam 11 malam? Tanya aja.</h2>
      <p>Tanya AI, AI Interview, dan Review Dokumen siap kapan aja. Bukan cuma buat ujian, tapi juga tugas kuliah, CV, sampai rangkuman bacaan.</p></div>
      <div class="l-demo io"><div class="l-chat">${chat}</div></div></section>

    <section class="l-band"><div class="l-wrap"><div><b>10K+</b><span>pembelajar Indonesia</span></div><div><b>10 menit</b><span>sehari udah cukup</span></div><div><b>3</b><span>ujian besar: CPNS, UTBK, LPDP</span></div></div></section>

    <section class="l-wrap l-exams">${[['CPNS', 'building', 'SKD lengkap: TWK, TIU, dan TKP. Latihan dari soal penalaran sampai manajemen waktu.'], ['UTBK', 'book', 'Penalaran dan literasi buat masuk PTN impian, dengan ritme 10 menit sehari.'], ['LPDP', 'grad', 'Tes Bakat Skolastik, esai, sampai latihan wawancara bareng AI.']]
    .map(([k, ic, d]) => `<div class="l-exam"><span class="stat-ic">${icon(ic, 24)}</span><h3>${TARGETS[k].label}</h3><p class="small muted">${d}</p><button class="btn small" data-act="land-start" data-k="${k}">Siapin ${TARGETS[k].short}</button></div>`).join('')}</section>

    <section class="l-wrap l-final">${mascot('proud', 140)}<h2>Siap mulai? Sepuluh menit aja dulu.</h2><p class="muted">Tanpa kartu, tanpa ribet. Kamu bisa berhenti kapan aja.</p>
      <button class="btn primary xl" data-act="land-start" style="margin-top:10px">Mulai gratis</button></section>
    <footer class="l-wrap l-foot"><span>© 2026 Terang Score · prototipe</span><span>Angka 10K+ dari terang.ai. Data lain di halaman ini contoh.</span></footer>
  </div>`;
}

/* ------------------------------------------------------------------ ONBOARDING */
const QS = {
  name: { ask: () => 'Hai! Aku maskot Terang. Boleh tau nama panggilanmu?', type: 'text', optional: true },
  goal: { ask: (a) => `Salam kenal${a.name ? ', ' + esc(a.name) : ''}! Lagi siap-siap buat apa?`, opts: [['CPNS', 'CPNS', 'building', 'SKD: TWK, TIU, TKP'], ['UTBK', 'UTBK-SNBT', 'book', 'Masuk PTN impian'], ['LPDP', 'LPDP', 'grad', 'Beasiswa S2/S3'], ['UMUM', 'Belajar umum aja', 'sparkle', 'Mapel, kuliah, kerja']] },
  status: { ask: () => 'Sekarang kamu lagi…', opts: [['sma', 'Pelajar SMA/SMK', 'book'], ['mhs', 'Mahasiswa', 'grad'], ['fresh', 'Fresh graduate', 'star'], ['kerja', 'Sudah bekerja', 'building']] },
  age: { ask: () => 'Biar fiturnya pas, usiamu berapa?', note: 'Fitur sosial dibuka bertahap sesuai usia, demi keamananmu.', opts: [['u16', 'Di bawah 16', 'user'], ['16-17', '16–17 tahun', 'user'], ['18+', '18 tahun ke atas', 'user']] },
  date: { ask: () => 'Kapan ujianmu?', type: 'date' },
  daily: { ask: () => 'Berapa lama kamu mau belajar setiap hari?', note: 'Pilih yang realistis. Konsisten tiap hari lebih ampuh daripada sekali belajar lama.', opts: [['15', '15 menit', 'clock', 'Santai, pas di sela-sela kegiatan'], ['30', '30 menit', 'clock', 'Rutin, ritme yang paling seimbang'], ['45', '45 menit', 'flame', 'Serius, buat target yang makin dekat'], ['60', 'Lebih dari 1 jam', 'flame', 'Intensif, mode persiapan penuh']] },
  time: { ask: () => 'Biasanya kamu sempat belajar jam berapa?', note: 'Kami ingetin di jam ini. Bisa diubah kapan aja di Profil.', opts: [['6', 'Pagi', 'sun', 'sekitar 06.00'], ['12', 'Siang', 'sun', 'sekitar 12.00'], ['16', 'Sore', 'sun', 'sekitar 16.00'], ['19', 'Malam', 'moon', 'sekitar 19.00'], ['21', 'Larut', 'moon', 'sekitar 21.00']] },
  source: { ask: () => 'Terakhir nih, dari mana kamu tau Terang AI?', optional: true, opts: [['tiktok', 'TikTok', 'video'], ['ig', 'Instagram', 'heart'], ['teman', 'Dari teman', 'users'], ['kampus', 'Sekolah atau kampus', 'grad'], ['lain', 'Lainnya', 'sparkle']] },
};
export const durLabel = (m) => (m >= 60 ? 'Lebih dari 1 jam' : `${m} menit`);
const OB = { i: 0, a: {}, d: {} };
export function resetOnboarding(goal) {
  OB.i = 0;
  OB.a = { name: '', goal: goal || null, status: null, age: null, date: '', dateUnknown: false, daily: null, time: null, source: null };
  OB.d = { i: 0, picked: null, wrong: [], right: 0 };
}
resetOnboarding();
const steps = () => ['name', 'goal', 'status', 'age', ...(OB.a.goal === 'UMUM' ? [] : ['date']), 'daily', 'time', 'source', 'pre', 'diag', 'result'];
const diagQs = () => DIAG_IDX.map((k) => BANK[k]);
const answered = (k) => {
  const a = OB.a;
  if (!QS[k] || k === 'name' || k === 'source') return true;
  if (k === 'date') return a.dateUnknown || !!a.date;
  return a[k] != null;
};

export function viewOnboarding() {
  const st = steps(); const k = st[OB.i]; const total = st.length - 1;
  const top = (back = true) => `<div class="ob-top">${back && OB.i > 0 ? `<button class="qz-x" data-act="ob-back" aria-label="Kembali">${icon('chevron', 22).replace('M9 5l7 7-7 7', 'M15 5l-7 7 7 7')}</button>` : `<a class="qz-x" href="#/mulai" aria-label="Tutup">${icon('close', 22)}</a>`}
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${OB.i}"><i style="width:${Math.max(4, (OB.i / total) * 100)}%"></i></div></div>`;
  const foot = (label, ok, skip) => `<div class="ob-foot">${skip ? `<button class="btn" data-act="ob-skip">Lewati</button>` : '<span></span>'}<button class="btn primary xl" data-act="ob-next" ${ok ? '' : 'disabled'}>${label}</button></div>`;

  if (QS[k]) {
    const q = QS[k]; const a = OB.a;
    let body = '';
    if (q.type === 'text') body = `<label class="sr" for="ob-name">Nama panggilan</label><input class="ob-input" id="ob-name" type="text" maxlength="30" autocomplete="given-name" placeholder="mis. Sari" value="${esc(a.name)}" data-change="ob-name">`;
    else if (q.type === 'date') body = `<label class="label" for="ob-date">Tanggal ujian</label><input class="ob-input" id="ob-date" type="date" value="${a.date}" min="${toISO(today())}" data-change="ob-date" style="margin:8px 0 14px">
      <div class="tiles"><button class="tile" data-act="ob-unknown" aria-pressed="${a.dateUnknown}"><span class="ti">${icon('clock', 20)}</span><span>Belum tau<small>Nanti kami kasih perkiraan</small></span></button></div>`;
    else body = `<div class="tiles" role="group">${q.opts.map(([v, l, ic, sub]) => `<button class="tile" data-act="ob-pick" data-k="${k}" data-v="${v}" aria-pressed="${a[k] === v}"><span class="ti">${icon(ic, 20)}</span><span>${l}${sub ? `<small>${sub}</small>` : ''}</span></button>`).join('')}</div>`;
    return `<div class="ob">${top()}<div class="ob-body"><div class="ob-ask">${mascot(OB.i === 0 ? 'cheer' : 'happy', 96)}<div class="bubble">${q.ask(a)}</div></div>
      ${q.note ? `<p class="small muted" style="margin:-8px 0 14px">${q.note}</p>` : ''}${body}</div>${foot('Lanjut', answered(k), q.optional)}</div>`;
  }
  if (k === 'pre') {
    return `<div class="ob">${top()}<div class="ob-body" style="display:grid;place-items:center;text-align:center;gap:14px">${mascot('cheer', 150)}
      <h1>Oke${OB.a.name ? ', ' + esc(OB.a.name) : ''}! Rencanamu hampir siap.</h1><p class="muted" style="max-width:44ch">Sekarang cek posisimu dulu: 5 soal, sekitar 5 menit. Santai, ini bukan ujian. Salah juga nggak apa-apa.</p></div>
      <div class="ob-foot"><button class="btn" data-act="ob-skipdiag">Nanti aja</button><button class="btn primary xl" data-act="ob-next">Gas, mulai</button></div></div>`;
  }
  if (k === 'diag') {
    const qs = diagQs(); const d = OB.d; const q = qs[d.i]; const ok = d.picked === q.a;
    const opts = q.o.map((o, i) => {
      const cls = d.picked == null ? '' : i === q.a ? ' right' : i === d.picked ? ' wrong' : '';
      return `<button class="opt${cls}" data-act="ob-dpick" data-i="${i}" ${d.picked != null ? 'disabled' : ''}><span class="key">${i + 1}</span><span>${esc(o)}</span></button>`;
    }).join('');
    const sheet = d.picked == null ? '' : `<div class="sheet ${ok ? 'ok' : 'no'}" role="status"><div class="sheet-in"><div class="sheet-msg">${mascot(ok ? 'cheer' : 'think', 56)}<div><h3>${ok ? 'Tepat!' : 'Belum pas, santai aja.'}</h3><p class="small">${esc(q.e)}</p></div></div>
      <button class="btn primary" data-act="ob-dnext">${d.i === qs.length - 1 ? 'Lihat hasil' : 'Lanjut'}</button></div></div>`;
    return `<div class="ob"><div class="ob-top"><a class="qz-x" href="#/mulai" aria-label="Tutup">${icon('close', 22)}</a><div class="bar"><i style="width:${((d.i + (d.picked != null ? 1 : 0)) / qs.length) * 100}%"></i></div><span class="small muted">${d.i + 1}/${qs.length}</span></div>
      <div class="ob-body" style="padding-bottom:200px"><span class="qz-label">Cek posisi · ${esc(q.topic)}</span><h2 class="qz-q">${esc(q.q)}</h2>${opts}<p class="qz-hint">Tips: tekan 1–4 di keyboard.</p></div>${sheet}</div>`;
  }
  // result
  const a = OB.a; const target = a.goal && a.goal !== 'UMUM' ? a.goal : null;
  const date = target ? (a.date && !a.dateUnknown ? fromISO(a.date) : addDays(today(), TARGETS[target].days)) : null;
  const wrong = [...new Set(OB.d.wrong)];
  const rows = [
    ['Target', target ? TARGETS[target].label : 'Belajar umum'],
    ...(date ? [['Ujian', `${longDate(date)}${a.dateUnknown || !a.date ? ' (perkiraan)' : ''}`]] : []),
    ['Belajar harian', durLabel(+(a.daily || 30))],
    ['Pengingat', `jam ${String(a.time || 19).padStart(2, '0')}.00`],
  ];
  return `<div class="ob"><div class="ob-body" style="display:grid;justify-items:center;text-align:center;gap:12px">
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center">${mascot('proud', 96)}<div class="ring-sm">${ringSVG({ mode: 'calibrating' })}</div></div>
    <h1>Rencanamu udah siap!</h1><p class="muted" style="max-width:46ch">Skor Siap-mu masih Lagi Kenalan. Makin sering latihan, makin akurat. ${OB.d.right ? `Tadi kamu benar ${OB.d.right} dari ${diagQs().length}.` : ''}</p>
    ${wrong.length ? `<p class="small">Yang perlu diasah duluan: <b>${wrong.map(esc).join(', ')}</b></p>` : ''}
    <div class="ob-sum">${rows.map(([l, v]) => `<div><span>${l}</span><b>${esc(v)}</b></div>`).join('')}</div></div>
    <div class="ob-foot"><span></span><button class="btn primary xl" data-act="ob-finish">Mulai belajar</button></div></div>`;
}

function finish() {
  const a = OB.a; const old = St.S;
  const target = a.goal && a.goal !== 'UMUM' ? a.goal : 'CPNS';
  St.replaceState(St.fresh({
    theme: old.theme, reduceMotion: old.reduceMotion, onboarded: true, name: (a.name || '').trim().slice(0, 30), target,
    examDate: a.date && !a.dateUnknown ? a.date : toISO(addDays(today(), TARGETS[target].days)),
    age: a.age || '18+', reminderHour: +(a.time || 19), dailyMin: +(a.daily || 30), status: a.status, source: a.source, general: a.goal === 'UMUM',
    scoreState: 'calibrating', streak: 0, bestStreak: 0, studyDates: [], userDays: 0, sessions: 0, points: 0, earnedMonth: 0, ledger: [],
    flagged: [...new Set(OB.d.wrong)], pathStep: 0,
  }));
  St.addPoints(10, 'Cek posisi selesai'); St.save();
  location.hash = a.goal === 'UMUM' ? '#/profil?tab=eksplor' : '#/beranda';
}

export const acts = {
  ...DEMO.acts,
  'land-go': (el) => { St.S.onboarded = true; St.save(); location.hash = el.dataset.to; },
  'land-watch': () => { const d = $('#demo'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  poke: (el) => { const m = el.querySelector('.mascot'); if (!m) return; m.classList.remove('poke'); void m.getBoundingClientRect(); m.classList.add('poke'); setTimeout(() => m.classList.remove('poke'), 750); },
  'land-start': (el) => { resetOnboarding(el.dataset.k); location.hash = '#/onboarding'; },
  'land-demo': () => { St.S.onboarded = true; St.save(); location.hash = '#/beranda'; },
  'land-try': (el) => {
    const q = BANK[3]; const i = +el.dataset.i; const box = $('#land-q');
    $$('.opt', box).forEach((b, j) => { b.disabled = true; b.classList.toggle('right', j === q.a); b.classList.toggle('wrong', j === i && i !== q.a); });
    $('#land-fb').innerHTML = `${i === q.a ? '<b>Tepat!</b>' : '<b>Hampir!</b>'} ${esc(q.e)} Gimana, seru kan? <button class="btn link small" data-act="land-start">Lanjut 9 soal lagi</button>`;
  },
  'ob-pick': (el) => { OB.a[el.dataset.k] = el.dataset.v; hooks.render(true); },
  'ob-unknown': () => { OB.a.dateUnknown = !OB.a.dateUnknown; if (OB.a.dateUnknown) OB.a.date = ''; hooks.render(true); },
  'ob-next': () => { const nm = $('#ob-name'); if (nm) OB.a.name = nm.value.trim(); if (!answered(steps()[OB.i])) return; OB.i += 1; hooks.render(); },
  'ob-skip': () => { OB.i += 1; hooks.render(); },
  'ob-back': () => { OB.i = Math.max(0, OB.i - 1); hooks.render(); },
  'ob-skipdiag': () => { OB.i = steps().indexOf('result'); hooks.render(); },
  'ob-dpick': (el) => {
    const d = OB.d; if (d.picked != null) return; const q = diagQs()[d.i]; d.picked = +el.dataset.i;
    if (d.picked === q.a) d.right += 1; else d.wrong.push(q.topic);
    hooks.render(true);
  },
  'ob-dnext': () => { const d = OB.d; if (d.i === diagQs().length - 1) OB.i += 1; else { d.i += 1; d.picked = null; } hooks.render(); },
  'ob-finish': () => finish(),
};
export const changes = {
  'ob-name': (el) => { OB.a.name = el.value.trim(); },
  'ob-date': (el) => { OB.a.date = el.value; if (el.value) OB.a.dateUnknown = false; hooks.render(true); },
};
export function onKey(e) {
  // Tombol 1–4 untuk menjawab cek posisi; Enter untuk lanjut.
  const k = steps()[OB.i];
  if (k === 'diag') {
    if (/^[1-4]$/.test(e.key) && OB.d.picked == null) { const b = $(`[data-act="ob-dpick"][data-i="${+e.key - 1}"]`); if (b) b.click(); }
    else if (e.key === 'Enter' && OB.d.picked != null) { e.preventDefault(); acts['ob-dnext'](); }
  }
}
export function after(route) {
  if (route === 'onboarding') { const n = $('#ob-name'); if (n && !n.value) n.focus(); return; }
  if (route !== 'mulai' || typeof IntersectionObserver !== 'function') { $$('.io').forEach((x) => x.classList.add('go')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add('go');
    $$('.ring-val', en.target).forEach((c) => { c.style.strokeDasharray = `${c.dataset.target} 100`; });
    io.unobserve(en.target);
  }), { threshold: 0.35 });
  $$('.io').forEach((x) => io.observe(x));
}
