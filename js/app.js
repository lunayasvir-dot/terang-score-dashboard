// Terang Score — dashboard (vanilla JS, tanpa build step).
import * as D from './data.js';
import { ringSVG, lineChart, BAND_META, fmtDate } from './charts.js';
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, today, addDays, toISO, fromISO, longDate, cfg, examDate, daysToExam, isDone,
  streakAtRisk, band, weeklySeries, scoreInfo, squad, addPoints, premiumLeft } from './state.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const S = () => St.S;
const rp = (n) => `Rp${n.toLocaleString('id-ID')}`;

/* ------------------------------------------------------------------ utilitas UI */
function ribbon(text) {
  const el = document.createElement('div');
  el.textContent = text;
  $('#ribbon').appendChild(el);
  setTimeout(() => el.remove(), 3700);
}
function openDlg(title, body) {
  $('#dlg').innerHTML = `<div class="dlg-body"><div class="dlg-head"><h2 id="dlg-title">${title}</h2>
    <button class="icon-btn" data-act="dlg-close" aria-label="Tutup">${icon('close')}</button></div>${body}</div>`;
  if (!$('#dlg').open) $('#dlg').showModal();
}
const closeDlg = () => { if ($('#dlg').open) $('#dlg').close(); };
const initial = (n) => esc((n || '?').trim().charAt(0).toUpperCase());
const bandPill = (v) => { const m = BAND_META[band(v)]; return `<span class="gap-val">${icon(m.icon, 16)} ${v} · ${m.label}</span>`; };
function applyTheme() {
  const r = document.documentElement;
  r.dataset.theme = S().theme === 'dark' ? 'dark' : 'light';
  r.dataset.reduceMotion = S().reduceMotion ? 'true' : 'false';
}
function miniRing(frac, label, sub) {
  const C = 2 * Math.PI * 34;
  return `<svg class="mini" viewBox="0 0 80 80" width="84" height="84" role="img" aria-label="${esc(label)}">
    <circle cx="40" cy="40" r="34" fill="none" stroke="var(--line)" stroke-width="8"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="var(--blue-strong)" stroke-width="8" stroke-linecap="round"
      stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 40 40)"/>
    <text x="40" y="45" text-anchor="middle" font-size="16" font-weight="800" fill="var(--text)">${sub}</text></svg>`;
}
const weekDots = () => {
  const t = today(); const mon = addDays(t, -((t.getDay() + 6) % 7));
  const lbl = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];
  const days = new Set([...S().studyDates, ...S().restDates]);
  if (isDone()) days.add(toISO(t));
  return `<div class="week-dots" role="img" aria-label="Hari belajar minggu ini">${lbl.map((l, i) => {
    const on = days.has(toISO(addDays(mon, i)));
    return `<span class="wd${on ? ' on' : ''}" title="${l}">${on ? icon('check', 14) : l}</span>`;
  }).join('')}</div>`;
};
const stateLabel = (st) => ({ calibrating: 'Lagi Kenalan', terukur: 'Terukur', terkalibrasi: 'Sudah Pas' }[st]);

/* ------------------------------------------------------------------ navigasi */
const NAV = [
  ['beranda', 'Beranda', 'home'], ['squad', '#SquadTerang', 'users'],
  ['poin', 'Poin & Jurus', 'gift'], ['passport', 'Paspor', 'passport'], ['profil', 'Profil', 'user'],
];
function renderNav(route) {
  const group = { laporan: 'beranda', daily: 'beranda', 'lapor-hasil': 'beranda' }[route] || route;
  const dark = S().theme === 'dark';
  $('#nav').hidden = route === 'onboarding';
  $('#nav').innerHTML = `<div class="brand"><span class="brand-mark">${mascot('happy', 36)}</span>Terang Score</div>` +
    NAV.map(([id, label, ic]) => `<a href="#/${id}" ${id === group ? 'aria-current="page"' : ''}>${icon(ic, 22)}<span>${label}</span></a>`).join('') +
    `<div class="spacer"></div><button class="nav-link nav-desktop" data-act="theme-flip" aria-label="${dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}">${icon(dark ? 'sun' : 'moon', 22)}<span>${dark ? 'Mode Terang' : 'Mode Gelap'}</span></button>`;
}

/* ------------------------------------------------------------------ BERANDA */
function gapRows() {
  const info = scoreInfo();
  const calib = S().scoreState === 'calibrating';
  const rows = calib ? cfg().topics.map(([name]) => ({ name, v: null })) : info.now;
  return rows.map((r, i) => {
    const flagged = S().flagged.includes(r.name);
    const tag = flagged ? ` <span class="tag">Baru ditandai</span>` : '';
    if (calib) return `<div class="gap-row"><span class="gap-name">${esc(r.name)}${tag}</span>
      <span class="muted small">masih dikenali</span><div class="bar" style="border-style:dashed"></div></div>`;
    const b = band(r.v);
    return `<div class="gap-row"><span class="gap-name">${esc(r.name)}${tag}</span>${bandPill(r.v)}
      <div class="bar ${b === 'close' ? 'gold' : b === 'needs' ? 'orange' : ''}" role="img" aria-label="${esc(r.name)} ${r.v} dari 100"><i style="width:${r.v}%"></i></div>
      ${i === 0 ? `<button class="btn small" data-act="train" data-topic="${esc(r.name)}" style="grid-column:1/-1;justify-self:start;margin-top:6px">${icon('zap', 16)} Asah topik ini</button>` : ''}</div>`;
  }).join('');
}

function viewHome() {
  const c = cfg(), d = daysToExam(), info = scoreInfo(), st = S().scoreState, calib = st === 'calibrating';
  const sq = squad(); const done = isDone(); const risk = streakAtRisk();
  const dayText = d > 0 ? `${d} hari lagi` : d === 0 ? 'hari ini' : `${-d} hari lalu`;
  const weak = info.weak.name;
  let mood = 'happy', msg = calib ? '' : `Hai! Hari ini kita asah <b>${esc(weak)}</b> yuk. Cuma 10 soal kok.`;
  if (calib) { mood = 'think'; msg = 'Aku lagi kenalan sama kemampuanmu nih. Kerjain beberapa soal ya, biar skornya makin akurat!'; }
  else if (risk) { mood = 'cheer'; msg = `Api Belajarmu hampir padam! Kerjain 10 soal aja udah cukup, yuk sebelum hari habis.`; }
  else if (done) { mood = 'proud'; msg = 'Misi hari ini beres! Keren banget. Besok kita lanjut lagi ya.'; }
  const warn = d > 0 && d <= 14 ? `<div class="card warn"><p class="warn-title">${icon('alert')} Ujian ${esc(c.label)} tinggal ${d} hari</p>
      <p>Waktunya latihan penuh dan fokus ke topik yang paling lemah. Kamu nggak sendirian, squad nemenin kamu.</p></div>` : '';
  const report = d <= 0 && d >= -7 && st !== 'terkalibrasi' ? `<div class="card tint"><div class="card-head"><h2>Udah ujian? Ceritain hasilnya, yuk!</h2></div>
      <p class="muted">Hasil resmi bikin skormu makin akurat dan dapet poin. Bukti pendukung sifatnya opsional.</p>
      <div class="btn-row" style="margin-top:12px"><a class="btn" href="#/lapor-hasil">${icon('trophy')} Lapor hasil · +100 poin</a></div></div>` : '';
  const ringBadge = st === 'terkalibrasi' ? `<span class="pill gold badge-cal">${icon('check', 16)} Sudah Pas</span>` : '';
  const ring = `<div class="card ring-card"><h2>Skor Siap-mu</h2>
      <button class="ring-btn" data-act="ring-detail" aria-label="${calib ? 'Buka rincian skor, saat ini masih Lagi Kenalan' : `Buka rincian skor, Skor Siap ${info.score}, status ${BAND_META[info.band].label}`}">
        ${ringSVG({ mode: calib ? 'calibrating' : 'score', score: info.score, band: info.band, badge: ringBadge })}</button>
      <p class="ring-line">${calib ? 'Skor makin akurat seiring latihanmu.' : BAND_META[info.band].line}</p>
      <p class="small muted">${calib ? 'Ketuk cincin buat lihat apa yang perlu diasah.' : st === 'terukur' ? 'Dihitung dari latihanmu.' : 'Sudah disesuaikan dengan hasil ujian nyata.'} Skor ini bukan jaminan lolos ujian.</p></div>`;
  const daily = `<div class="card"><div class="card-head"><h2>Misi Harian</h2>${done ? `<span class="pill tint">${icon('check', 16)} Beres</span>` : ''}</div>
      <div class="streak">${miniRing(done ? 1 : 0, done ? 'Misi harian selesai' : 'Misi harian belum dikerjakan', done ? '10/10' : '0/10')}
      <div><p>${done ? 'Satu misi udah cukup buat jaga Api Belajarmu hari ini. Kerja bagus!' : `10 soal, sekitar 10 menit${calib ? '' : `, fokus ke <b>${esc(weak)}</b>`}.`}</p></div></div>
      <div class="btn-row" style="margin-top:14px">${done
        ? `<a class="btn" href="#/laporan">${icon('chart')} Lihat Rapor Mingguan</a>`
        : `<a class="btn primary" href="#/daily${calib ? '' : `?topic=${encodeURIComponent(weak)}`}">${icon('zap')} Mulai Misi Harian</a>`}</div></div>`;
  const streak = `<div class="card${risk ? ' warn' : ''}"><div class="streak"><div class="flame ${S().streak > 0 ? 'lit' : ''}" id="flame">${icon('flame', 30)}</div>
      <div><div class="streak-num">${S().streak} <span class="small muted" style="font-weight:600">hari Api Belajar</span></div>
      <p class="small muted">Rekor ${Math.max(S().bestStreak, S().streak)} hari · Tiket Libur: ${S().restPasses}</p></div></div>
      ${weekDots()}
      ${risk ? `<p class="warn-title" style="margin-top:12px">${icon('clock')} Jam belajarmu udah lewat nih</p><p class="small">Api Belajar ${S().streak} hari belum aman hari ini. Satu misi harian cukup, atau pakai Tiket Libur kalau lagi butuh istirahat.</p>
      <div class="btn-row" style="margin-top:10px"><a class="btn small" href="#/daily">Kerjain misi harian</a>
      <button class="btn small" data-act="rest-pass" ${S().restPasses < 1 ? 'disabled' : ''}>${icon('ticket', 16)} Pakai Tiket Libur</button></div>` : ''}</div>`;
  const pct = Math.round((sq.done / sq.total) * 100);
  const squadCard = `<div class="card"><div class="card-head"><h2>${esc(c.squad)}</h2><a class="btn link small" href="#/squad">Buka ${icon('chevron', 14)}</a></div>
      <p class="muted small">Tujuan bareng minggu ini: semua anggota nyelesain misi harian 4 hari.</p>
      <div class="bar" style="margin:10px 0 6px" role="img" aria-label="${sq.done} dari ${sq.total} anggota sudah 4 hari"><i style="width:${pct}%"></i></div>
      <p><b>${sq.done} dari ${sq.total}</b> anggota udah 4 hari · sisa ${sq.daysLeft} hari</p></div>`;
  const { overall } = weeklySeries();
  const delta = overall[7] - overall[6];
  const teaser = `<div class="card"><div class="card-head"><h2>Rapor Mingguan</h2><a class="btn link small" href="#/laporan">Buka ${icon('chevron', 14)}</a></div>
      <p class="finding">${icon('chart')}<span>${calib ? 'Rapor mingguan muncul setelah dua minggu data latihan.'
        : `Skor minggu ini ${delta >= 0 ? 'naik' : 'turun'} <b>${Math.abs(delta)} poin</b>. Paling jago: <b>${esc(info.strong.name)}</b>, paling perlu diasah: <b>${esc(info.weak.name)}</b>.`}</span></p></div>`;
  return `<div class="page-head"><div><h1>Halo${S().name ? ', ' + esc(S().name) : ''}!</h1>
      <p>Target ${esc(c.label)} (fokus ${c.subtes}) · ${longDate(examDate())} (${dayText})</p></div></div>
    <div class="stack"><div class="hero">${say(mood, msg)}</div>${warn}${report}
    <div class="grid home-grid"><div class="stack">${ring}<div class="card"><div class="card-head"><h2>Radar Skill</h2><span class="pill tint">${icon('target', 16)} Topik ${c.subtes}</span></div>
      <p class="small muted" style="margin-bottom:6px">Biar kamu tau topik mana yang udah jago dan mana yang perlu diasah.</p>${gapRows()}</div></div>
    <div class="stack">${daily}${streak}${squadCard}${teaser}</div></div></div>`;
}

/* ------------------------------------------------------------------ RAPOR MINGGUAN */
const RP = { topic: 'all', table: false };
function viewReport() {
  const info = scoreInfo(), calib = S().scoreState === 'calibrating';
  const ser = weeklySeries();
  const nWeeks = calib ? 1 : 8;
  const pick = RP.topic === 'all' ? ser.overall : (ser.topics.find((t) => t.name === RP.topic) || { vals: ser.overall }).vals;
  const start = 8 - nWeeks;
  const data = pick.slice(start).map((v, i) => ({ value: v, date: ser.weeks[start + i], label: fmtDate(ser.weeks[start + i]) }));
  const d = daysToExam();
  const examSlot = d > 0 ? Math.min(13, 7 + Math.ceil(d / 7)) : 7;
  const slots = Math.max(8, examSlot + 1);
  const delta = ser.overall[7] - ser.overall[6];
  const finding = `Minggu ini skormu ${delta >= 0 ? 'naik' : 'turun'} ${Math.abs(delta)} poin. Kamu paling jago di <b>${esc(info.strong.name)}</b> (${info.strong.v}), dan yang perlu diasah lagi adalah <b>${esc(info.weak.name)}</b> (${info.weak.v}).`;
  RP.data = data; RP.start = start; RP.ser = ser;
  let body;
  if (data.length < 2) {
    body = `<div class="empty">${mascot('calm', 84)}<h2>Grafiknya muncul setelah dua minggu data</h2>
      <p class="muted">Kerjain misi harian beberapa hari ke depan biar garis skormu mulai kebentuk.</p>
      <a class="btn primary" href="#/daily">Mulai Misi Harian</a></div>`;
  } else if (RP.table) {
    body = `<table class="data"><caption class="sr">Skor per minggu</caption><thead><tr><th>Minggu</th><th>Skor</th><th>Perubahan</th></tr></thead><tbody>${data.map((r, i) =>
      `<tr><td>${r.label}</td><td>${r.value}</td><td>${i ? (r.value - data[i - 1].value >= 0 ? '+' : '') + (r.value - data[i - 1].value) : '—'}</td></tr>`).join('')}</tbody></table>`;
  } else {
    const marks = RP.topic === 'all' ? [{ i: data.length - 1, kind: 'strong', label: info.strong.name }, { i: data.length - 1, kind: 'weak', label: info.weak.name }] : [];
    body = `<div class="chart-wrap" id="chart-wrap">${lineChart({ data, slots, examSlot, examLabel: fmtDate(examDate()), calibrating: false, marks })}<div id="tip" class="tip" hidden></div></div>
      <p class="small muted">Biru = kemajuan dan topik terjago. Oranye = topik yang perlu diasah dan tanggal ujian. Ketuk titik buat lihat rinciannya.</p>`;
  }
  const chips = ['all', ...ser.topics.map((t) => t.name)].map((n) =>
    `<button class="chip" data-act="filter-topic" data-topic="${esc(n)}" aria-pressed="${RP.topic === n}">${n === 'all' ? 'Semua topik' : esc(n)}</button>`).join('');
  return `<div class="page-head"><div><h1>Rapor Mingguan</h1><p>Lihat gimana skormu berkembang dari minggu ke minggu</p></div>
      <a class="btn" href="#/beranda">${icon('home')} Beranda</a></div>
    <div class="stack"><div class="card"><p class="finding">${icon('star')}<span>${calib ? 'Skormu masih lagi kenalan. Rapor ini makin akurat seiring latihanmu.' : finding}</span></p>
      ${calib ? '' : `<div class="btn-row" style="margin-top:12px"><button class="btn small" data-act="train" data-topic="${esc(info.weak.name)}">${icon('zap', 16)} Asah topik ini: ${esc(info.weak.name)}</button></div>`}</div>
    <div class="card"><div class="toolbar"><div class="chips" role="group" aria-label="Filter topik">${chips}</div>
      ${data.length >= 2 ? `<button class="btn small" data-act="toggle-table">${RP.table ? 'Lihat grafik' : 'Lihat sebagai tabel'}</button>` : ''}</div>${body}</div></div>`;
}
function showTip(i) {
  const wrap = $('#chart-wrap'), tip = $('#tip'); if (!wrap || !tip || !RP.data) return;
  const dpt = RP.data[i]; const prev = RP.data[i - 1];
  const gi = RP.start + i;
  let changed = '—';
  if (gi > 0) {
    const ch = RP.ser.topics.map((t) => ({ n: t.name, dv: t.vals[gi] - t.vals[gi - 1] })).sort((a, b) => Math.abs(b.dv) - Math.abs(a.dv))[0];
    changed = `${esc(ch.n)} (${ch.dv >= 0 ? '+' : ''}${ch.dv})`;
  }
  tip.innerHTML = `<b>Minggu ${dpt.label}</b>Skor: <b style="display:inline">${dpt.value}</b><br>Selisih: ${prev ? (dpt.value - prev.value >= 0 ? '+' : '') + (dpt.value - prev.value) : '—'}<br>Topik yang berubah: ${changed}`;
  tip.hidden = false;
  const pt = $(`.pt[data-i="${i}"] .dot`, wrap).getBoundingClientRect(), wr = wrap.getBoundingClientRect();
  tip.style.left = `${Math.min(Math.max(pt.left - wr.left + pt.width / 2, 110), wr.width - 110)}px`;
  tip.style.top = `${pt.top - wr.top}px`;
  $$('.pt', wrap).forEach((p) => p.classList.toggle('sel', +p.dataset.i === i));
}

/* ------------------------------------------------------------------ QUIZ (Misi Harian) */
let Q = null;
function startQuiz(focus) {
  let list = D.BANK.slice();
  if (focus) list = [...list.filter((q) => q.topic === focus), ...list.filter((q) => q.topic !== focus)];
  Q = { list: list.slice(0, 10), i: 0, picked: null, wrong: [], right: 0, finished: false, focus };
}
function viewDaily(params) {
  if (!Q) startQuiz(params.get('topic'));
  if (Q.finished) return viewDailyDone();
  const q = Q.list[Q.i];
  const letters = ['A', 'B', 'C', 'D'];
  const opts = q.o.map((o, i) => {
    let cls = '';
    if (Q.picked != null) cls = i === q.a ? ' right' : i === Q.picked ? ' wrong' : '';
    return `<button class="opt${cls}" data-act="pick" data-i="${i}" ${Q.picked != null ? 'disabled' : ''}><span class="key">${letters[i]}</span><span>${esc(o)}</span>
      ${Q.picked != null && i === q.a ? `<span class="sr">Jawaban benar</span>${icon('check')}` : ''}</button>`;
  }).join('');
  const ok = Q.picked === q.a;
  const fb = Q.picked == null ? '' : `<div class="feedback" role="status"><div class="say">${mascot(ok ? 'cheer' : 'think', 52)}<div><b>${ok ? 'Tepat banget!' : 'Belum pas, tapi nggak apa-apa.'}</b>
      <p>${esc(q.e)}</p>${ok ? '' : `<p class="small muted" style="margin-top:6px">Topik <b>${esc(q.topic)}</b> masuk Radar Skill-mu buat diasah lagi.</p>`}</div></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="next">${Q.i === 9 ? 'Selesai' : 'Soal berikutnya'}</button></div></div>`;
  return `<div class="quiz"><div class="page-head"><div><h1>Misi Harian</h1><p>${Q.focus ? `Fokus: ${esc(Q.focus)}` : 'Satu misi kecil buat jaga Api Belajarmu'}</p></div>
      <a class="btn small" href="#/beranda">Keluar</a></div>
    <div class="card"><div class="goal-top"><span class="muted small">Soal ${Q.i + 1} dari 10 · ${esc(q.topic)}</span></div>
      <div class="bar" style="margin-bottom:16px" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${Q.i + (Q.picked != null ? 1 : 0)}"><i style="width:${(Q.i + (Q.picked != null ? 1 : 0)) * 10}%"></i></div>
      <h2>${esc(q.q)}</h2>${opts}${fb}</div></div>`;
}
function finishDaily() {
  Q.finished = true;
  const s = S();
  s.flagged = [...new Set([...s.flagged, ...Q.wrong])].slice(-4);
  Q.firstToday = !isDone();
  if (Q.firstToday) {
    s.doneDate = toISO(today());
    s.streak += 1; s.bestStreak = Math.max(s.bestStreak, s.streak);
    if (!s.studyDates.includes(toISO(today()))) s.studyDates.push(toISO(today()));
    s.userDays = Math.min(4, s.userDays + 1); s.sessions += 1;
    Q.got = addPoints(20, 'Misi harian selesai');
    if (s.scoreState === 'calibrating' && s.sessions >= 3) { s.scoreState = 'terukur'; ribbon('Skormu sekarang sudah Terukur!'); }
    checkSquadGoal();
  }
  St.save();
}
function viewDailyDone() {
  return `<div class="quiz"><div class="card done-ring">${mascot(Q.right >= 7 ? 'proud' : 'cheer', 110)}
      <div class="flame lit pop">${icon('flame', 30)}</div>
      <h1>Misi harian beres!</h1>
      <p>${Q.right} benar dari 10 · Api Belajar <b>${S().streak} hari</b>${Q.firstToday ? ` · +${Q.got} poin` : ''}</p>
      ${Q.wrong.length ? `<p class="small muted">Topik yang ditandai di Radar Skill: ${[...new Set(Q.wrong)].map(esc).join(', ')}</p>` : '<p class="small muted">Semua jawabanmu tepat. Mantap!</p>'}
      <div class="btn-row" style="justify-content:center"><button class="btn primary" data-act="share-squad">${icon('share')} Bagikan ke squad</button>
      <a class="btn" href="#/beranda">Kembali ke Beranda</a></div></div></div>`;
}

/* ------------------------------------------------------------------ SQUAD */
const SQ = { filter: 'all', sort: 'abc', timer: null };
function checkSquadGoal() {
  const sq = squad();
  if (sq.done >= sq.total && !S().celebrated) {
    S().celebrated = true; addPoints(50, 'Squad mencapai tujuan bersama');
    ribbon('Tujuan squad tercapai! +50 poin'); St.save();
    return true;
  }
  return false;
}
function viewSquad() {
  const sq = squad();
  let list = sq.members.slice();
  if (SQ.filter === 'done') list = list.filter((m) => m.days >= 4);
  if (SQ.filter === 'todo') list = list.filter((m) => m.days < 4);
  const me = list.filter((m) => m.me);
  const others = list.filter((m) => !m.me).sort((a, b) => (SQ.sort === 'abc' ? a.name.localeCompare(b.name, 'id') : a.active - b.active));
  const rows = [...me, ...others].map((m) => `<button class="member${m.me ? ' me' : ''}" data-act="member" data-id="${m.id}"
      aria-label="${esc(m.name)}${m.me ? ' (kamu)' : ''}: ${m.days} dari 4 hari selesai">
      <span class="avatar">${initial(m.name)}</span><span><span class="member-name">${esc(m.name)}${m.me ? ' (kamu)' : ''}</span></span>
      <span class="dots" aria-hidden="true">${[0, 1, 2, 3].map((k) => `<i class="dot-d${k < m.days ? ' on' : ''}"></i>`).join('')}</span></button>`).join('');
  const pct = Math.round((sq.done / sq.total) * 100);
  const allDone = sq.done >= sq.total;
  const blk = Math.floor(Date.now() / 1500000);
  const present = Array.from({ length: 5 }, (_, k) => D.SQUAD_NAMES[(blk + k * 3) % D.SQUAD_NAMES.length]);
  const joined = S().room;
  const ageNote = S().age === '18+' ? '' : `<p class="small muted" style="margin-top:8px">${icon('lock', 16)} Mode usia ${esc(S().age === 'u16' ? 'di bawah 16' : '16–17')}: tanpa obrolan bebas dan tanpa pesan langsung, hanya reaksi siap pakai.</p>`;
  return `<div class="page-head"><div><h1>#SquadTerang</h1><p>${esc(cfg().squad)} · ${sq.total} anggota</p></div></div>
    <div class="stack"><div class="card goal" id="goal">
      ${allDone ? `<div class="celebrate-banner">${mascot('cheer', 40)} Yeay, tujuan bareng tercapai! Seluruh squad udah nyelesain 4 hari.</div>` : ''}
      <div class="goal-top"><div><div class="goal-num">${sq.done}<span class="muted" style="font-size:1.25rem"> / ${sq.total}</span></div>
        <p class="muted">anggota udah nyelesain misi harian 4 hari</p></div><span class="pill tint">${icon('clock', 16)} Sisa ${sq.daysLeft} hari minggu ini</span></div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${sq.total}" aria-valuenow="${sq.done}" aria-label="Kemajuan tujuan bareng"><i style="width:${pct}%"></i></div>
      <p class="small muted" style="margin-top:8px">Di sini nggak ada peringkat dan nggak ada skor. Yang dihitung: kita sampai bareng-bareng.</p></div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card"><div class="toolbar"><div class="seg" role="group" aria-label="Filter anggota">
        ${[['all', 'Semua'], ['done', 'Sudah 4 hari'], ['todo', 'Belum']].map(([k, l]) => `<button data-act="sq-filter" data-k="${k}" aria-pressed="${SQ.filter === k}">${l}</button>`).join('')}</div>
        <div class="seg" role="group" aria-label="Urutan"><button data-act="sq-sort" data-k="abc" aria-pressed="${SQ.sort === 'abc'}">Abjad</button><button data-act="sq-sort" data-k="active" aria-pressed="${SQ.sort === 'active'}">Terakhir aktif</button></div></div>
        ${rows || '<p class="muted">Nggak ada anggota di filter ini.</p>'}${ageNote}
        <p class="small muted" style="margin-top:10px">Titik terisi = misi harian selesai di hari itu. Titik kosong cuma netral, bukan tanda gagal.</p></div>
      <div class="stack"><div class="card room"><div class="card-head"><h2>${icon('moon')} Ruang Belajar Hening</h2><span class="pill tint">Tanpa obrolan</span></div>
        <div class="timer" id="room-timer" aria-live="off">--:--</div>
        <p class="muted small">Timer bareng 25 menit. Yang lagi belajar muncul sebagai avatar, tanpa chat, suara, atau video. Tinggal fokus bareng.</p>
        <div class="avatars" aria-label="Lagi belajar">${present.map((n) => `<span class="avatar" title="${esc(n)}">${initial(n)}</span>`).join('')}${joined ? `<span class="avatar" style="background:var(--blue);color:var(--on-blue)" title="Kamu">${initial(S().name || 'K')}</span>` : ''}</div>
        <button class="btn ${joined ? '' : 'small'}" data-act="room-toggle">${joined ? 'Keluar ruangan' : 'Masuk ruangan'}</button></div>
      <div class="card"><h2 style="margin-bottom:8px">Teman Belajar-mu</h2><p class="finding">${icon('heart')}<span><b>Bella</b> ${S().squadAllDone ? 'udah selesai hari ini.' : 'udah nyelesain 3 dari 4 hari.'} Kalian saling ngingetin, bukan saingan.</span></p></div></div></div></div>`;
}
function tickRoom() {
  const el = $('#room-timer'); if (!el) { clearInterval(SQ.timer); SQ.timer = null; return; }
  const rem = 1500 - (Math.floor(Date.now() / 1000) % 1500);
  el.textContent = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(rem % 60).padStart(2, '0')}`;
}
function celebrate() {
  const g = $('#goal'); if (!g || S().reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['var(--gold)', 'var(--blue)', 'var(--orange)'];
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('span'); c.className = 'confetti';
    c.style.left = `${Math.random() * 100}%`; c.style.background = colors[i % 3]; c.style.animationDelay = `${Math.random() * .6}s`;
    g.appendChild(c); setTimeout(() => c.remove(), 3000);
  }
}

/* ------------------------------------------------------------------ POIN & JURUS */
const planPrice = (p) => {
  const base = 59000 * p.months; const save = Math.round((1 - p.price / base) * 100);
  return { perMonth: Math.round(p.price / p.months / 100) * 100, save };
};
function viewPoints() {
  const s = S(); const left = premiumLeft();
  const premium = left > 0
    ? `<span class="pill gold">${icon('crown', 16)} Premium aktif</span><p style="margin-top:8px">Sisa <b>${left} hari</b> (sampai ${fromISO(s.premiumUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })})</p>`
    : `<span class="pill neutral">Paket Gratis</span><p style="margin-top:8px" class="muted">${s.trialClaimed ? 'Mau akses penuh lagi? Tukar poin atau pilih paket di bawah.' : 'Kamu belum nyoba Premium. Klaim gratis 7 hari di katalog di bawah!'}</p>`;
  const cat = D.CATALOG.map((it) => {
    const claimed = it.once && s.trialClaimed;
    const label = claimed ? 'Sudah diklaim' : it.cost === 0 ? 'Klaim gratis' : `${it.cost} poin`;
    return `<div class="item"><div><b>${esc(it.name)}</b>${it.once ? ' <span class="tag">Sekali per akun</span>' : ''}<p class="small muted">${esc(it.desc)}</p></div>
    <button class="btn small${it.cost === 0 && !claimed ? ' primary' : ''}" data-act="redeem" data-id="${it.id}" ${claimed || s.points < it.cost ? 'disabled' : ''}>${label}</button></div>`;
  }).join('');
  const plans = D.PLANS.map((p) => {
    const { perMonth, save } = planPrice(p);
    return `<div class="plan${p.popular ? ' popular' : ''}">${p.popular ? '<span class="flag">Paling populer</span>' : ''}
      <h3>${icon('crown', 18)} ${p.name}</h3><div class="price">${rp(p.price)}</div>
      <p class="small muted">${p.months > 1 ? `≈ ${rp(perMonth)}/bulan · hemat ${save}%` : 'Bayar per bulan'}</p><p class="small">${esc(p.note)}</p>
      <button class="btn${p.popular ? ' primary' : ''} block" data-act="plan" data-id="${p.id}" style="margin-top:6px">Pilih paket</button></div>`;
  }).join('');
  const list = D.PLAYBOOKS.map((p) => `<div class="item"><div><b>${esc(p.title)}</b>
    <p class="small muted">${esc(p.by)} · ${p.min} menit baca · ditinjau tim Terang</p></div><button class="btn small" data-act="pb-open" data-id="${p.id}">Baca</button></div>`).join('');
  return `<div class="page-head"><div><h1>Poin & Jurus Alumni</h1><p>Poin dikasih buat kemajuan nyata, bukan lamanya kamu nongkrong di layar.</p></div></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start">
      <div class="stack"><div class="card"><div class="say">${mascot('happy', 64)}<div><p class="muted">Saldo poin</p><div class="balance">${s.points.toLocaleString('id-ID')}</div></div></div>
        <p class="small muted" style="margin:10px 0 6px">Batas poin bulan ini: ${s.earnedMonth} dari ${D.MONTH_CAP}</p>
        <div class="bar gold" role="progressbar" aria-valuemin="0" aria-valuemax="${D.MONTH_CAP}" aria-valuenow="${s.earnedMonth}"><i style="width:${Math.min(100, (s.earnedMonth / D.MONTH_CAP) * 100)}%"></i></div></div>
        <div class="card">${premium}${s.vouchers ? `<p class="small" style="margin-top:8px">${icon('ticket', 16)} Voucher diskon 20%: ${s.vouchers} buah</p>` : ''}</div></div>
      <div class="card"><h2 style="margin-bottom:6px">Cara dapet poin</h2>${D.EARN_RULES.map(([a, b]) => `<div class="item"><span>${a}</span><span class="tag">${b}</span></div>`).join('')}</div></div>
    <div class="card"><h2 style="margin-bottom:6px">Katalog Hadiah</h2>${cat}<p class="small muted" style="margin-top:8px">Nggak ada hadiah uang tunai. Hadiah dari mitra masih contoh.</p></div>
    <div class="card"><div class="card-head"><h2>Paket Premium</h2></div><p class="small muted" style="margin-bottom:16px">Semua paket buka: ${D.PLAN_FEATURES.join(' · ')}. Harga di bawah masih contoh, belum final.</p><div class="plans">${plans}</div></div>
    <div class="card"><h2 style="margin-bottom:6px">Jurus Alumni</h2>${list}
      <p class="small muted" style="margin-top:8px">Konten contoh buat prototipe, bukan dari alumni sungguhan.</p></div>
    <div class="card"><h2 style="margin-bottom:6px">Riwayat poin</h2>${s.ledger.slice(0, 6).map((l) => `<div class="item"><span>${esc(l.t)}<span class="small muted"> · ${fromISO(l.d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span></span><b>${l.p > 0 ? '+' : ''}${l.p}</b></div>`).join('')}</div></div>`;
}

/* ------------------------------------------------------------------ PASPOR */
function viewPassport() {
  const s = S(), info = scoreInfo(), calib = s.scoreState === 'calibrating';
  const log = D.PASSPORT_LOG.map((l) => `<div class="item"><div><span class="tag">${l.src}</span> ${esc(l.text)}</div>
    <span class="small muted">${l.ago} hari lalu</span></div>`).join('');
  const shares = s.shares.length ? s.shares.map((sh) => `<div class="item"><div>${icon(sh.type === 'pdf' ? 'pdf' : 'link')} <b>${esc(sh.label)}</b>
    <p class="small muted">${sh.type === 'pdf' ? 'PDF' : esc(sh.url)} · berlaku sampai ${fromISO(sh.expires).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}${sh.revoked ? ' · dicabut' : ''}</p></div>
    ${sh.revoked ? '<span class="tag">Dicabut</span>' : `<button class="btn small" data-act="share-revoke" data-id="${sh.id}">Cabut akses</button>`}</div>`).join('')
    : '<p class="muted">Belum ada yang dibagikan. Datamu baru keluar kalau kamu setuju.</p>';
  return `<div class="page-head"><div><h1>Paspor Belajar</h1><p>Satu catatan belajar dari web, aplikasi, dan simulasi AI</p></div>
      <button class="btn primary" data-act="share-open">${icon('share')} Bagikan</button></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start"><div class="card"><div class="card-head"><h2>Ringkasan skor</h2></div>
      <p>${calib ? `<span class="pill neutral">${icon('dots')} Lagi Kenalan</span>` : `<span class="pill band-${info.band}">${icon(BAND_META[info.band].icon)} ${BAND_META[info.band].label}</span> ${s.scoreState === 'terkalibrasi' ? `<span class="pill gold">${icon('check', 16)} Sudah Pas</span>` : ''}`}</p>
      <p style="margin-top:10px" class="muted">${calib ? 'Skor makin akurat seiring latihanmu.' : `Skor Siap terakhir ${info.score}/100 · Api Belajar ${s.streak} hari`}</p>
      ${s.result ? `<p class="small" style="margin-top:8px">Hasil ujian nyata: ${s.result.actual}/${s.result.max} (setara ${s.result.pct}/100)</p>` : ''}</div>
    <div class="card tint"><h2 style="margin-bottom:6px">${icon('lock')} Data ini milikmu</h2><ul class="list-plain small"><li>Setiap berbagi lewat tautan atau PDF butuh persetujuanmu dulu.</li><li>Tautan bisa dicabut kapan aja.</li><li>Papan Squad nggak nampilin skor atau hasil diagnostikmu.</li></ul></div></div>
    <div class="card"><h2 style="margin-bottom:6px">Riwayat belajar</h2>${log}</div>
    <div class="card"><h2 style="margin-bottom:6px">Yang lagi dibagikan</h2>${shares}</div></div>`;
}
function shareDialog() {
  const s = S(), info = scoreInfo(), minor = s.age !== '18+';
  openDlg('Bagikan Paspor Belajar', `<p class="muted">Cek dulu isinya sebelum bikin tautan atau PDF ya.</p>
    <div class="card tint"><b>Yang ikut dibagikan</b><ul class="list-plain small" style="margin-top:6px">
      <li>Status skor: ${s.scoreState === 'calibrating' ? 'Lagi Kenalan' : `${info.score}/100 · ${BAND_META[info.band].label}`}</li><li>Tren skor mingguan dan topik terjago/terlemah</li><li>Api Belajar dan lencana</li></ul>
      <b style="display:block;margin-top:8px">Yang nggak ikut</b><p class="small">Data squad, kontak, dan riwayat obrolan.</p></div>
    <div class="field"><label for="sh-label">Dibagikan ke siapa?</label><input id="sh-label" type="text" placeholder="mis. Mentor, kakak tingkat" maxlength="40"></div>
    <div class="field"><label for="sh-type">Bentuk</label><select id="sh-type"><option value="link">Tautan</option><option value="pdf">PDF</option></select></div>
    <div class="field"><label for="sh-exp">Berlaku</label><select id="sh-exp"><option value="7">7 hari</option><option value="30">30 hari</option></select></div>
    <label class="check"><input type="checkbox" id="sh-c1" data-change="share-consent"><span>Aku setuju membagikan ringkasan di atas. Aku tau aksesnya bisa dicabut kapan aja.</span></label>
    ${minor ? `<label class="check"><input type="checkbox" id="sh-c2" data-change="share-consent"><span>Wali aku sudah setuju (wajib untuk pengguna di bawah 18 tahun).</span></label>` : ''}
    <div class="btn-row"><button class="btn primary" id="sh-go" data-act="share-create" disabled>Buat</button><button class="btn" data-act="dlg-close">Batal</button></div>`);
}

/* ------------------------------------------------------------------ LAPOR HASIL */
const RS = { step: 1 };
function viewResult() {
  const s = S();
  if (RS.step === 1) return `<div class="quiz"><div class="page-head"><div><h1>Ceritain hasil ujianmu</h1><p>${esc(cfg().label)} · ${longDate(examDate())}</p></div></div>
    <div class="card"><div class="say" style="margin-bottom:14px">${mascot('happy', 56)}<div class="bubble">Makasih udah mau cerita! Hasil aslimu bikin skornya makin pas.</div></div>
    <div class="field"><label for="r-act">Skor resmi subtes ${cfg().subtes}-mu</label><input id="r-act" type="number" min="0" inputmode="numeric" placeholder="mis. 140"></div>
    <div class="field"><label for="r-max">Skor maksimum subtes</label><input id="r-max" type="number" min="1" inputmode="numeric" value="${cfg().max}"></div>
    <label class="check"><input type="checkbox" id="r-proof"><span>Simpan bukti hasil di Paspor Belajar (opsional, baru dibagikan kalau kamu setuju).</span></label>
    <p id="r-err" class="small" style="color:var(--orange-strong);margin-top:8px" role="alert"></p>
    <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="res-submit">Kirim hasil</button><a class="btn" href="#/beranda">Nanti aja</a></div></div></div>`;
  if (RS.step === 2) return `<div class="quiz"><div class="card done-ring">${mascot('proud', 100)}<span class="pill gold">${icon('check')} Sudah Pas</span>
    <h1>Skormu udah disesuaikan!</h1><div class="card tint" style="width:100%;text-align:left"><p>Skor Siap terakhir: <b>${RS.last}/100</b></p><p>Hasil nyata: <b>${s.result.actual}/${s.result.max}</b> (setara <b>${s.result.pct}/100</b>)</p>
    <p class="small muted" style="margin-top:6px">Selisih ${s.result.pct - RS.last >= 0 ? '+' : ''}${s.result.pct - RS.last} poin dipakai buat menyesuaikan cara hitung skormu.</p></div>
    <p class="muted">${RS.got ? `+${RS.got} poin karena udah lapor hasil.` : ''}</p>
    <button class="btn primary" data-act="res-next">Lanjut ke tujuan berikutnya</button></div></div>`;
  return `<div class="quiz"><div class="page-head"><div><h1>Habis ini ngapain?</h1><p>Perjalanan belajarmu belum selesai. Lanjut ke tujuan baru, atau bantu yang lain.</p></div></div>
    <div class="card"><h2>Siap-siap lagi</h2><p class="muted">Ulangi SKD dengan target baru, skormu mulai lagi dari Lagi Kenalan.</p>
      <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="res-goal">Ulangi SKD</button><button class="btn" disabled>Siapkan SKB (segera hadir)</button></div></div>
    <div class="card"><h2>Jadi kakak mentor Kating Squad</h2><p class="muted">Alumni 18+ yang terverifikasi bisa dampingi squad dan dapat hari Premium.</p>
    <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="res-mentor" ${s.kating ? 'disabled' : ''}>${s.kating ? 'Sudah terdaftar' : 'Daftar jadi mentor'}</button><a class="btn" href="#/passport">Lihat Paspor Belajar</a></div></div></div>`;
}

/* ------------------------------------------------------------------ ONBOARDING */
const OB = { step: 0, date: '', i: 0, picked: null, wrong: [] };
const obQuestions = () => D.DIAG_IDX.map((k) => D.BANK[k]);
function viewOnboarding() {
  if (OB.step === 0) {
    if (!OB.date) OB.date = toISO(addDays(today(), cfg().days));
    return `<div class="quiz" style="margin:0 auto"><div class="page-head"><div><h1>Selamat datang di Terang Score!</h1><p>Belum perlu bikin akun. Kenalan dulu yuk.</p></div></div>
      <div class="card"><div class="say" style="margin-bottom:16px">${mascot('cheer', 80)}<div class="bubble">Hai, aku maskot Terang! Aku bakal nemenin kamu belajar. Yuk kita mulai dari ngecek posisimu sekarang, cuma 5 soal.</div></div>
      <div class="label" style="margin-bottom:8px">Target ujianmu</div><div class="chips"><span class="pill tint">${icon('target', 16)} ${esc(cfg().label)} · subtes ${cfg().subtes}</span></div>
      <div class="field" style="margin-top:16px"><label for="ob-date">Tanggal ujian</label><input id="ob-date" type="date" value="${OB.date}" data-change="ob-date"></div>
      <button class="btn primary" data-act="ob-start">Mulai cek posisi (5 menit)</button></div></div>`;
  }
  if (OB.step === 1) {
    const qs = obQuestions(), q = qs[OB.i]; const L = ['A', 'B', 'C', 'D'];
    return `<div class="quiz" style="margin:0 auto"><div class="page-head"><div><h1>Cek Posisi</h1><p>Soal ${OB.i + 1} dari ${qs.length}</p></div></div>
      <div class="card"><div class="bar" style="margin-bottom:16px"><i style="width:${(OB.i + (OB.picked != null ? 1 : 0)) * 100 / qs.length}%"></i></div>
      <h2>${esc(q.q)}</h2>${q.o.map((o, i) => {
        const cls = OB.picked == null ? '' : i === q.a ? ' right' : i === OB.picked ? ' wrong' : '';
        return `<button class="opt${cls}" data-act="ob-pick" data-i="${i}" ${OB.picked != null ? 'disabled' : ''}><span class="key">${L[i]}</span><span>${esc(o)}</span></button>`; }).join('')}
      ${OB.picked != null ? `<div class="feedback"><p>${esc(q.e)}</p><div class="btn-row" style="margin-top:10px"><button class="btn primary" data-act="ob-next">${OB.i === qs.length - 1 ? 'Lihat hasil' : 'Berikutnya'}</button></div></div>` : ''}</div></div>`;
  }
  return `<div class="quiz" style="margin:0 auto"><div class="card ring-card">${mascot('think', 72)}${ringSVG({ mode: 'calibrating' })}
    <h1>Hasil awalmu udah siap!</h1><p class="ring-line">Skor makin akurat seiring latihanmu. Angkanya belum kami tampilkan sampai datanya cukup bisa dipercaya.</p>
    ${OB.wrong.length ? `<p class="small">Topik yang perlu diasah: <b>${[...new Set(OB.wrong)].map(esc).join(', ')}</b></p>` : '<p class="small">Mantap, belum ada kesenjangan besar yang kelihatan.</p>'}
    <div class="field" style="width:100%;text-align:left"><label for="ob-name">Simpan progresmu: siapa namamu? (opsional)</label><input id="ob-name" type="text" maxlength="30" autocomplete="given-name"></div>
    <button class="btn primary" data-act="ob-save">Simpan & lihat Beranda</button></div></div>`;
}

/* ------------------------------------------------------------------ PROFIL */
function viewProfile() {
  const s = S(); const minor = s.age !== '18+';
  return `<div class="page-head"><div><h1>Profil & Pengaturan</h1><p>Privasi, pengingat, dan tampilan</p></div></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start"><div class="card"><h2 style="margin-bottom:12px">Profilmu</h2>
      <div class="field"><label for="p-name">Nama</label><input id="p-name" type="text" value="${esc(s.name)}" maxlength="30" data-change="set-name"></div>
      <div class="field"><label>Target ujian</label><div><span class="pill tint">${icon('target', 16)} ${esc(cfg().label)} · subtes ${cfg().subtes}</span></div></div>
      <div class="field"><label for="p-date">Tanggal ujian</label><input id="p-date" type="date" value="${s.examDate}" data-change="set-date"></div>
      <div class="field"><label for="p-age">Kelompok usia</label><select id="p-age" data-change="set-age"><option value="u16" ${s.age === 'u16' ? 'selected' : ''}>Di bawah 16</option><option value="16-17" ${s.age === '16-17' ? 'selected' : ''}>16–17</option><option value="18+" ${s.age === '18+' ? 'selected' : ''}>18 ke atas</option></select>
      <span class="small muted">Fitur sosial dibuka bertahap sesuai usia (PP Tunas, UU PDP Pasal 25).</span></div></div>
    <div class="stack"><div class="card"><h2 style="margin-bottom:12px">Tampilan</h2>
      <div class="seg theme-seg" role="group" aria-label="Mode tampilan"><button data-act="theme" data-k="light" aria-pressed="${s.theme !== 'dark'}">${icon('sun', 16)} Terang</button><button data-act="theme" data-k="dark" aria-pressed="${s.theme === 'dark'}">${icon('moon', 16)} Gelap</button></div>
      <label class="check" style="margin-top:14px"><input type="checkbox" data-change="set-motion" ${s.reduceMotion ? 'checked' : ''}><span>Kurangi gerakan (animasi dimatikan)</span></label></div>
    <div class="card"><h2 style="margin-bottom:12px">Pengingat</h2>
      <div class="field"><label for="p-hour">Jam belajar biasanya</label><select id="p-hour" data-change="set-hour">${[6, 12, 16, 19, 21].map((h) => `<option value="${h}" ${h === s.reminderHour ? 'selected' : ''}>${String(h).padStart(2, '0')}.00</option>`).join('')}</select></div>
      <div class="field"><label for="p-ch">Lewat mana?</label><select id="p-ch" data-change="set-channel"><option value="inapp" ${s.channel === 'inapp' ? 'selected' : ''}>Notifikasi di aplikasi</option><option value="wa" ${s.channel === 'wa' ? 'selected' : ''} ${minor ? 'disabled' : ''}>WhatsApp (khusus pengguna dewasa)</option></select></div></div></div></div>
    <div class="demo"><h2 style="margin-bottom:4px">Panel Demo</h2><p class="small muted" style="margin-bottom:12px">Buat nyobain berbagai keadaan layar tanpa nunggu. Cuma ada di prototipe.</p>
      <div class="label small" style="margin-bottom:6px">Keadaan skor</div><div class="seg" role="group" aria-label="Keadaan skor">${['calibrating', 'terukur', 'terkalibrasi'].map((k) => `<button data-act="demo-state" data-k="${k}" aria-pressed="${s.scoreState === k}">${stateLabel(k)}</button>`).join('')}</div>
      <div class="btn-row" style="margin-top:14px"><button class="btn small" data-act="demo-risk">${s.forceRisk ? 'Matikan' : 'Simulasikan'} Api Belajar hampir padam</button>
      <button class="btn small" data-act="demo-exam">Simulasikan ujian udah lewat</button><button class="btn small" data-act="demo-near">Simulasikan ujian 10 hari lagi</button>
      <button class="btn small" data-act="demo-squad">Squad selesai semua</button><button class="btn small" data-act="demo-onboard">Ulangi onboarding</button><button class="btn small" data-act="demo-reset">Reset data demo</button></div></div></div>`;
}

/* ------------------------------------------------------------------ router & render */
const VIEWS = { beranda: viewHome, laporan: viewReport, daily: viewDaily, 'lapor-hasil': viewResult, squad: viewSquad, poin: viewPoints, passport: viewPassport, profil: viewProfile, onboarding: viewOnboarding };
const TITLES = { laporan: 'Rapor Mingguan', daily: 'Misi Harian', 'lapor-hasil': 'Lapor Hasil', onboarding: 'Selamat Datang' };
let current = 'beranda';
function render(keepScroll) {
  const [path, qs] = (location.hash.replace(/^#\//, '') || 'beranda').split('?');
  current = VIEWS[path] ? path : 'beranda';
  if (!S().onboarded && current !== 'onboarding') { location.hash = '#/onboarding'; return; }
  const main = $('#main'); const y = window.scrollY;
  main.innerHTML = VIEWS[current](new URLSearchParams(qs || ''));
  renderNav(current);
  document.title = `Terang Score — ${TITLES[current] || NAV.find((n) => n[0] === current)?.[1] || 'Dashboard'}`;
  requestAnimationFrame(() => {
    $$('.ring-val').forEach((c) => { c.style.strokeDasharray = `${c.dataset.target} 100`; });
    if (current === 'squad') { tickRoom(); if (!SQ.timer) SQ.timer = setInterval(tickRoom, 1000); }
  });
  if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#/daily')) Q = null; // keluar dari misi harian = sesi kuis dibersihkan
  if (!location.hash.startsWith('#/lapor-hasil')) RS.step = 1;
  render(); $('#main').focus({ preventScroll: true });
});

/* ------------------------------------------------------------------ aksi */
function resetFor(over) {
  const s = S();
  St.replaceState(St.fresh({ theme: s.theme, reduceMotion: s.reduceMotion, ...over }));
}
const ACT = {
  'dlg-close': () => closeDlg(),
  theme: (el) => { S().theme = el.dataset.k; St.save(); applyTheme(); render(true); },
  'theme-flip': () => { S().theme = S().theme === 'dark' ? 'light' : 'dark'; St.save(); applyTheme(); render(true); },
  'ring-detail': () => {
    const info = scoreInfo(), s = S();
    if (s.scoreState === 'calibrating') return openDlg('Skormu lagi kenalan', `<div class="say">${mascot('think', 64)}<div>Angka skormu belum ditampilkan karena data latihanmu belum cukup buat jadi patokan. Makin sering latihan, makin akurat skornya.</div></div>
      <p class="small muted">Batas data dari Lagi Kenalan ke Terukur ditentukan tim data. Di prototipe ini: tiga misi harian.</p><a class="btn primary" href="#/daily" data-act="dlg-close">Mulai Misi Harian</a>`);
    const top = info.now.slice(0, 3);
    openDlg(`Skor Siap ${info.score}`, `<p><span class="pill band-${info.band}">${icon(BAND_META[info.band].icon)} ${BAND_META[info.band].label}</span></p>
      <p class="muted">Topik yang paling nahan skormu:</p>${top.map((t) => `<div class="item"><div><b>${esc(t.name)}</b><p class="small muted">Kalau naik ke 75, skormu nambah sekitar ${Math.max(0, Math.round((75 - t.v) / cfg().topics.length))} poin</p></div>${bandPill(t.v)}</div>`).join('')}
      <a class="btn primary" href="#/daily?topic=${encodeURIComponent(top[0].name)}" data-act="dlg-close">Misi Harian: ${esc(top[0].name)}</a>
      <p class="small muted">Batas status (Di Jalur, Dikit Lagi, Perlu Diasah) masih sementara, ditentukan tim data. Skor bukan jaminan lolos ujian.</p>`);
  },
  train: (el) => { Q = null; location.hash = `#/daily?topic=${encodeURIComponent(el.dataset.topic)}`; },
  'rest-pass': () => { const s = S(); if (s.restPasses < 1) return; s.restPasses -= 1; s.restDates.push(toISO(today())); s.forceRisk = false; St.save(); ribbon('Tiket Libur dipakai. Api Belajarmu aman!'); render(true); },
  pick: (el) => {
    if (Q.picked != null) return; const q = Q.list[Q.i]; Q.picked = +el.dataset.i;
    if (Q.picked === q.a) Q.right++; else Q.wrong.push(q.topic);
    render(true);
  },
  next: () => { if (Q.i === 9) finishDaily(); else { Q.i++; Q.picked = null; } render(); },
  'share-squad': () => { ribbon('Dibagikan ke squad!'); },
  'filter-topic': (el) => { RP.topic = el.dataset.topic; render(true); },
  'toggle-table': () => { RP.table = !RP.table; render(true); },
  'sq-filter': (el) => { SQ.filter = el.dataset.k; render(true); },
  'sq-sort': (el) => { SQ.sort = el.dataset.k; render(true); },
  member: (el) => {
    const m = squad().members.find((x) => x.id === +el.dataset.id);
    const badges = D.BADGES.slice(0, 1 + (m.streak % 4));
    openDlg(esc(m.name) + (m.me ? ' (kamu)' : ''), `<p><span class="pill tint">${icon('flame', 16)} Api Belajar ${m.streak} hari</span></p>
      <div class="chips">${badges.map((b) => `<span class="pill gold">${esc(b)}</span>`).join('')}</div>
      <p class="small muted">Kartu ini cuma nampilin kehadiran dan Api Belajar, bukan skor.</p>
      ${m.me ? '' : `<div class="label">Kirim semangat</div>${D.CHEERS.map((c) => `<button class="btn block" style="margin-top:6px;justify-content:flex-start;text-align:left" data-act="cheer" data-n="${esc(m.name)}">${esc(c)}</button>`).join('')}`}`);
  },
  cheer: (el) => { closeDlg(); ribbon(`Semangat terkirim ke ${el.dataset.n}!`); },
  'room-toggle': () => { S().room = !S().room; St.save(); render(true); },
  redeem: (el) => {
    const it = D.CATALOG.find((c) => c.id === el.dataset.id), s = S();
    if (!it || s.points < it.cost || (it.once && s.trialClaimed)) return;
    s.points -= it.cost;
    if (it.once) s.trialClaimed = true;
    if (it.days) { const from = premiumLeft() > 0 ? fromISO(s.premiumUntil) : today(); s.premiumUntil = toISO(addDays(from, it.days)); }
    if (it.voucher) s.vouchers += 1;
    s.ledger.unshift({ t: `${it.cost === 0 ? 'Klaim' : 'Tukar'}: ${it.name}`, p: -it.cost, d: toISO(today()) }); St.save();
    ribbon(it.days ? `Premium aktif ${it.days} hari lagi!` : `Berhasil: ${it.name}`); render(true);
  },
  plan: (el) => {
    const p = D.PLANS.find((x) => x.id === el.dataset.id), s = S(); const { perMonth, save } = planPrice(p);
    const disc = s.vouchers > 0 ? Math.round(p.price * 0.8 / 100) * 100 : null;
    openDlg(`Paket Premium ${p.name}`, `<div class="say">${mascot('cheer', 60)}<div><div class="price">${rp(p.price)}</div><p class="small muted">${p.months > 1 ? `≈ ${rp(perMonth)}/bulan · hemat ${save}% dibanding bayar bulanan` : 'Bayar per bulan'}</p></div></div>
      <ul class="list-plain">${D.PLAN_FEATURES.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${disc ? `<p class="pill gold">${icon('ticket', 16)} Dengan voucher 20%: ${rp(disc)}</p>` : '<p class="small muted">Punya voucher diskon? Tukar di Katalog Hadiah pakai poinmu.</p>'}
      <p class="small muted">Harga contoh. Pembayaran belum tersambung di prototipe ini.</p>
      <button class="btn" data-act="dlg-close">Oke, ngerti</button>`);
  },
  'pb-open': (el) => { const p = D.PLAYBOOKS.find((x) => x.id === el.dataset.id); openDlg(esc(p.title), `<p class="small muted">${esc(p.by)} · ditinjau tim Terang sebelum terbit · konten contoh</p><ul class="list-plain">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`); },
  'share-open': () => shareDialog(),
  'share-create': () => {
    const s = S(); const type = $('#sh-type').value, days = +$('#sh-exp').value;
    const sh = { id: Date.now(), type, label: $('#sh-label').value.trim() || 'Penerima tanpa nama', expires: toISO(addDays(today(), days)), revoked: false,
      url: `https://terang.example/paspor/${Math.random().toString(36).slice(2, 10)}` };
    s.shares.unshift(sh); St.save(); closeDlg(); render(true);
    if (type === 'pdf') printPassport(); else ribbon('Tautan dibuat. Kamu bisa mencabutnya kapan aja.');
  },
  'share-revoke': (el) => { const sh = S().shares.find((x) => x.id === +el.dataset.id); if (sh) sh.revoked = true; St.save(); ribbon('Akses dicabut'); render(true); },
  'demo-state': (el) => {
    const s = S(); s.scoreState = el.dataset.k;
    if (el.dataset.k === 'terkalibrasi' && !s.result) s.result = { actual: 140, max: 175, pct: 80 };
    St.save(); render(true);
  },
  'demo-risk': () => { S().forceRisk = !S().forceRisk; St.save(); render(true); },
  'demo-exam': () => { S().examDate = toISO(addDays(today(), -1)); St.save(); ribbon('Tanggal ujian diset kemarin. Cek Beranda.'); render(true); },
  'demo-near': () => { S().examDate = toISO(addDays(today(), 10)); St.save(); ribbon('Ujian 10 hari lagi. Cek Beranda.'); render(true); },
  'demo-squad': () => { S().squadAllDone = true; St.save(); location.hash = '#/squad'; render(); if (checkSquadGoal()) { render(true); } setTimeout(celebrate, 150); },
  'demo-onboard': () => { St.S.onboarded = false; Object.assign(OB, { step: 0, date: '', i: 0, picked: null, wrong: [] }); St.save(); location.hash = '#/onboarding'; render(); },
  'demo-reset': () => { resetFor({}); Q = null; applyTheme(); ribbon('Data demo direset'); location.hash = '#/beranda'; render(); },
  'ob-start': () => { OB.step = 1; OB.i = 0; OB.picked = null; OB.wrong = []; render(); },
  'ob-pick': (el) => { if (OB.picked != null) return; const q = obQuestions()[OB.i]; OB.picked = +el.dataset.i; if (OB.picked !== q.a) OB.wrong.push(q.topic); render(true); },
  'ob-next': () => { if (OB.i === obQuestions().length - 1) OB.step = 2; else { OB.i++; OB.picked = null; } render(); },
  'ob-save': () => {
    const name = ($('#ob-name').value || '').trim();
    resetFor({ name, examDate: OB.date || toISO(addDays(today(), cfg().days)), scoreState: 'calibrating', streak: 0, bestStreak: 0, studyDates: [], userDays: 0,
      sessions: 0, points: 0, earnedMonth: 0, ledger: [], flagged: [...new Set(OB.wrong)], restPasses: 2 });
    addPoints(10, 'Diagnostik selesai'); St.save(); Q = null; location.hash = '#/beranda'; render();
  },
  'res-submit': () => {
    const a = parseFloat($('#r-act').value), m = parseFloat($('#r-max').value);
    if (!(a >= 0) || !(m > 0) || a > m) { $('#r-err').textContent = 'Isi skor resminya dulu ya (nggak boleh lebih dari skor maksimum) biar bisa disesuaikan.'; return; }
    const s = S(); RS.last = scoreInfo().score;
    s.result = { actual: a, max: m, pct: Math.round((a / m) * 100) }; s.scoreState = 'terkalibrasi';
    RS.got = s.resultRewarded ? 0 : addPoints(100, 'Melaporkan hasil ujian'); s.resultRewarded = true; St.save(); RS.step = 2; render();
  },
  'res-next': () => { RS.step = 3; render(); },
  'res-mentor': () => { S().kating = true; St.save(); ribbon('Makasih! Tim kami bakal verifikasi statusmu.'); render(true); },
  'res-goal': () => {
    const s = S();
    resetFor({ name: s.name, points: s.points, earnedMonth: s.earnedMonth, ledger: s.ledger, age: s.age, premiumUntil: s.premiumUntil, trialClaimed: s.trialClaimed, vouchers: s.vouchers,
      scoreState: 'calibrating', streak: 0, bestStreak: 0, studyDates: [], userDays: 0, sessions: 0, flagged: [] });
    RS.step = 1; Q = null; ribbon('Target baru dimulai. Skormu mulai dari Lagi Kenalan.'); location.hash = '#/beranda'; render();
  },
};
const CHG = {
  'set-name': (el) => { S().name = el.value.trim().slice(0, 30); St.save(); },
  'set-date': (el) => { if (el.value) { S().examDate = el.value; St.save(); } },
  'set-age': (el) => { const s = S(); s.age = el.value; if (s.age !== '18+' && s.channel === 'wa') s.channel = 'inapp'; St.save(); render(true); },
  'set-hour': (el) => { S().reminderHour = +el.value; St.save(); },
  'set-channel': (el) => { S().channel = el.value; St.save(); },
  'set-motion': (el) => { S().reduceMotion = el.checked; St.save(); applyTheme(); },
  'ob-date': (el) => { OB.date = el.value; },
  'share-consent': () => { const ok = $('#sh-c1').checked && (!$('#sh-c2') || $('#sh-c2').checked); $('#sh-go').disabled = !ok; },
};
function printPassport() {
  const s = S(), info = scoreInfo();
  const area = document.createElement('div'); area.id = 'print-area';
  area.innerHTML = `<h1>Paspor Belajar Terang</h1><p>Target: ${esc(cfg().label)}</p><p>Status skor: ${s.scoreState === 'calibrating' ? 'Lagi Kenalan' : `${info.score}/100 · ${BAND_META[info.band].label}`}</p>
    <p>Api Belajar: ${s.streak} hari</p><p>Dibuat ${longDate(today())}. Dibagikan atas persetujuan pemiliknya. Skor bukan jaminan lolos ujian.</p>`;
  document.body.appendChild(area); window.print(); setTimeout(() => area.remove(), 500);
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) { if (el.tagName !== 'A') e.preventDefault(); ACT[el.dataset.act](el, e); }
  const pt = e.target.closest('.pt'); if (pt) showTip(+pt.dataset.i);
  else if (!e.target.closest('.tip') && $('#tip')) $('#tip').hidden = true;
  if (e.target === $('#dlg')) closeDlg();
});
document.addEventListener('change', (e) => { const el = e.target.closest('[data-change]'); if (el && CHG[el.dataset.change]) CHG[el.dataset.change](el); });
document.addEventListener('mouseover', (e) => { const pt = e.target.closest('.pt'); if (pt) showTip(+pt.dataset.i); });
document.addEventListener('focusin', (e) => { const pt = e.target.closest('.pt'); if (pt) showTip(+pt.dataset.i); });
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('pt')) { e.preventDefault(); showTip(+e.target.dataset.i); } });

St.load(); applyTheme();
if (!location.hash) location.hash = '#/beranda';
render();
