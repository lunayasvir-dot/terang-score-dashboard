// Terang Score — dashboard (vanilla JS, tanpa build step).
import * as D from './data.js';
import { ringSVG, lineChart, BAND_META, fmtDate } from './charts.js';
import { icon } from './icons.js';
import * as St from './state.js';
import { esc, today, addDays, toISO, fromISO, daysBetween, longDate, cfg, examDate, daysToExam, isDone, isRested,
  streakAtRisk, band, weeklySeries, scoreInfo, squad, addPoints } from './state.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const S = () => St.S;

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
const bandWord = (v) => BAND_META[band(v)];
const bandPill = (v) => { const m = bandWord(v); return `<span class="gap-val">${icon(m.icon, 16)} ${v} · ${m.label}</span>`; };
function applyTheme() {
  const r = document.documentElement;
  const p = D.PALETTES[S().palette] || D.PALETTES.klasik;
  r.dataset.palette = S().palette;
  r.dataset.reduceMotion = S().reduceMotion ? 'true' : 'false';
  r.style.setProperty('--blue', p.blue);
  r.style.setProperty('--blue-strong', p.strong);
  if (S().palette === 'malam') r.style.setProperty('--blue-tint', '#1B2D40'); else r.style.setProperty('--blue-tint', `color-mix(in srgb, ${p.blue} 16%, white)`);
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

/* ------------------------------------------------------------------ navigasi */
const NAV = [
  ['beranda', 'Score & Plan', 'home'], ['squad', '#SquadTerang', 'users'],
  ['poin', 'Points & Playbooks', 'gift'], ['passport', 'Passport', 'passport'], ['profil', 'Profil', 'user'],
];
function renderNav(route) {
  const group = { laporan: 'beranda', daily: 'beranda', 'lapor-hasil': 'beranda' }[route] || route;
  $('#nav').hidden = route === 'onboarding';
  $('#nav').innerHTML = `<div class="brand"><span class="brand-mark">${icon('star', 20)}</span>Terang Score</div>` +
    NAV.map(([id, label, ic]) => `<a href="#/${id}" ${id === group ? 'aria-current="page"' : ''}>${icon(ic, 22)}<span>${label}</span></a>`).join('');
}

/* ------------------------------------------------------------------ BERANDA */
function gapRows(limit) {
  const info = scoreInfo();
  const calib = S().scoreState === 'calibrating';
  const rows = calib ? cfg().topics.map(([name]) => ({ name, v: null })) : info.now;
  return rows.slice(0, limit || rows.length).map((r, i) => {
    const flagged = S().flagged.includes(r.name);
    const tag = flagged ? ` <span class="tag">Ditandai dari latihan</span>` : '';
    if (calib) return `<div class="gap-row"><span class="gap-name">${esc(r.name)}${tag}</span>
      <span class="muted small">belum cukup data</span><div class="bar" style="border-style:dashed"></div></div>`;
    const b = band(r.v);
    return `<div class="gap-row"><span class="gap-name">${esc(r.name)}${tag}</span>${bandPill(r.v)}
      <div class="bar ${b === 'close' ? 'gold' : b === 'needs' ? 'orange' : ''}" role="img" aria-label="${esc(r.name)} ${r.v} dari 100"><i style="width:${r.v}%"></i></div>
      ${i === 0 ? `<button class="btn small" data-act="train" data-topic="${esc(r.name)}" style="grid-column:1/-1;justify-self:start;margin-top:6px">Latih topik ini</button>` : ''}</div>`;
  }).join('');
}

function viewHome() {
  const c = cfg(), d = daysToExam(), info = scoreInfo(), st = S().scoreState, calib = st === 'calibrating';
  const sq = squad();
  const dayText = d > 0 ? `${d} hari lagi` : d === 0 ? 'hari ini' : `${-d} hari lalu`;
  const warn = d > 0 && d <= 14 ? `<div class="card warn"><p class="warn-title">${icon('alert')} Ujian ${esc(c.label)} tinggal ${d} hari</p>
      <p>Saatnya latihan penuh dan fokus ke topik terlemah. Kamu tidak sendirian, squad menemanimu.</p></div>` : '';
  const report = d <= 0 && d >= -7 && st !== 'terkalibrasi' ? `<div class="card tint"><div class="card-head"><h2>Ujianmu sudah selesai? Laporkan hasilnya</h2></div>
      <p class="muted">Hasil resmi membuat skor lebih akurat dan memberi poin. Bukti pendukung bersifat opsional.</p>
      <div class="btn-row" style="margin-top:12px"><a class="btn" href="#/lapor-hasil">Laporkan hasil · +100 poin</a></div></div>` : '';
  const ringBadge = st === 'terkalibrasi' ? `<span class="pill gold badge-cal">${icon('check', 16)} Terkalibrasi</span>` : '';
  const ring = `<div class="card ring-card">
      <button class="ring-btn" data-act="ring-detail" aria-label="${calib ? 'Buka rincian skor, saat ini Calibrating' : `Buka rincian skor, Readiness Score ${info.score}, status ${BAND_META[info.band].label}`}">
        ${ringSVG({ mode: calib ? 'calibrating' : 'score', score: info.score, band: info.band, badge: ringBadge })}</button>
      <p class="ring-line">${calib ? 'Skor makin akurat seiring latihanmu.' : BAND_META[info.band].line}</p>
      <p class="small muted">${calib ? 'Ketuk cincin untuk melihat apa yang perlu dilatih.' : st === 'terukur' ? 'Skor terukur dari latihanmu.' : 'Dikalibrasi dengan hasil ujian nyata.'} Skor bukan jaminan hasil ujian.</p></div>`;
  const weak = info.weak.name;
  const done = isDone();
  const daily = `<div class="card"><div class="card-head"><h2>Daily 10 hari ini</h2>${done ? `<span class="pill tint">${icon('check', 16)} Selesai</span>` : ''}</div>
      <div class="streak">${miniRing(done ? 1 : 0, done ? 'Daily 10 selesai' : 'Daily 10 belum dikerjakan', done ? '10/10' : '0/10')}
      <div><p>${done ? 'Satu unit sudah cukup menjaga Streak-mu hari ini. Kerja bagus.' : `10 soal, sekitar 10 menit${calib ? '' : `, fokus ke <b>${esc(weak)}</b>`}.`}</p></div></div>
      <div class="btn-row" style="margin-top:14px">${done
        ? `<a class="btn" href="#/laporan">${icon('chart')} Lihat Weekly Score Report</a>`
        : `<a class="btn primary" href="#/daily${calib ? '' : `?topic=${encodeURIComponent(weak)}`}">${icon('target')} Kerjakan Daily 10</a>`}</div></div>`;
  const risk = streakAtRisk();
  const streak = `<div class="card${risk ? ' warn' : ''}"><div class="streak"><div class="flame ${S().streak > 0 ? 'lit' : ''}" id="flame">${icon('flame', 30)}</div>
      <div><div class="streak-num">${S().streak} <span class="small muted" style="font-weight:600">hari Streak</span></div>
      <p class="small muted">Rekor terbaik ${Math.max(S().bestStreak, S().streak)} hari · Rest Day Pass: ${S().restPasses}</p></div></div>
      ${weekDots()}
      ${risk ? `<p class="warn-title" style="margin-top:12px">${icon('clock')} Waktu belajarmu sudah lewat</p><p class="small">Streak ${S().streak} hari belum aman hari ini. Satu Daily 10 sudah cukup, atau pakai Rest Day Pass bila perlu istirahat.</p>
      <div class="btn-row" style="margin-top:10px"><a class="btn small" href="#/daily">Kerjakan Daily 10</a>
      <button class="btn small" data-act="rest-pass" ${S().restPasses < 1 ? 'disabled' : ''}>Pakai Rest Day Pass</button></div>` : ''}</div>`;
  const pct = Math.round((sq.done / sq.total) * 100);
  const squadCard = `<div class="card"><div class="card-head"><h2>${esc(cfg().squad)}</h2><a class="btn link small" href="#/squad">Buka ${icon('chevron', 14)}</a></div>
      <p class="muted small">Tujuan bersama minggu ini: semua anggota menyelesaikan Daily 10 selama 4 hari.</p>
      <div class="bar" style="margin:10px 0 6px" role="img" aria-label="${sq.done} dari ${sq.total} anggota sudah 4 hari"><i style="width:${pct}%"></i></div>
      <p><b>${sq.done} dari ${sq.total}</b> anggota sudah menyelesaikan 4 hari · sisa ${sq.daysLeft} hari</p></div>`;
  const { overall } = weeklySeries();
  const delta = overall[7] - overall[6];
  const teaser = `<div class="card"><div class="card-head"><h2>Weekly Score Report</h2><a class="btn link small" href="#/laporan">Buka ${icon('chevron', 14)}</a></div>
      <p class="finding">${icon('chart')}<span>${calib ? 'Laporan mingguan akan muncul setelah dua minggu data latihan.'
        : `Skor minggu ini ${delta >= 0 ? 'naik' : 'turun'} <b>${Math.abs(delta)} poin</b>. Terkuat: <b>${esc(info.strong.name)}</b>, terlemah: <b>${esc(info.weak.name)}</b>.`}</span></p></div>`;
  return `<div class="page-head"><div><h1>Halo${S().name ? ', ' + esc(S().name) : ''}!</h1>
      <p>Target ${esc(c.label)} · ${longDate(examDate())} (${dayText})</p></div></div>
    <div class="stack">${warn}${report}
    <div class="grid home-grid"><div class="stack">${ring}<div class="card"><div class="card-head"><h2>Peta Kesenjangan</h2></div>${gapRows()}</div></div>
    <div class="stack">${daily}${streak}${squadCard}${teaser}</div></div></div>`;
}

/* ------------------------------------------------------------------ WEEKLY SCORE REPORT */
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
  const finding = `Minggu ini skor ${delta >= 0 ? 'naik' : 'turun'} ${Math.abs(delta)} poin. Topik terkuatmu <b>${esc(info.strong.name)}</b> (${info.strong.v}), topik terlemah <b>${esc(info.weak.name)}</b> (${info.weak.v}).`;
  RP.data = data; RP.start = start; RP.ser = ser;
  let body;
  if (data.length < 2) {
    body = `<div class="empty"><span class="ic-big">${icon('chart', 44)}</span><h2>Grafik muncul setelah dua minggu data</h2>
      <p class="muted">Selesaikan Daily 10 beberapa hari ini untuk membangun garis skormu.</p>
      <a class="btn primary" href="#/daily">Kerjakan Daily 10</a></div>`;
  } else if (RP.table) {
    body = `<table class="data"><caption class="sr">Skor per minggu</caption><thead><tr><th>Minggu</th><th>Skor</th><th>Perubahan</th></tr></thead><tbody>${data.map((r, i) =>
      `<tr><td>${r.label}</td><td>${r.value}</td><td>${i ? (r.value - data[i - 1].value >= 0 ? '+' : '') + (r.value - data[i - 1].value) : '—'}</td></tr>`).join('')}</tbody></table>`;
  } else {
    const marks = RP.topic === 'all' ? [{ i: data.length - 1, kind: 'strong', label: info.strong.name }, { i: data.length - 1, kind: 'weak', label: info.weak.name }] : [];
    body = `<div class="chart-wrap" id="chart-wrap">${lineChart({ data, slots, examSlot, examLabel: fmtDate(examDate()), calibrating: false, marks })}<div id="tip" class="tip" hidden></div></div>
      <p class="small muted">Biru menandai kemajuan dan topik terkuat. Oranye menandai topik terlemah dan tanggal ujian. Ketuk titik untuk rincian.</p>`;
  }
  const chips = ['all', ...ser.topics.map((t) => t.name)].map((n) =>
    `<button class="chip" data-act="filter-topic" data-topic="${esc(n)}" aria-pressed="${RP.topic === n}">${n === 'all' ? 'Semua topik' : esc(n)}</button>`).join('');
  return `<div class="page-head"><div><h1>Weekly Score Report</h1><p>Perkembangan skormu dari minggu ke minggu</p></div>
      <a class="btn" href="#/beranda">${icon('home')} Beranda</a></div>
    <div class="stack"><div class="card"><p class="finding">${icon('star')}<span>${calib ? 'Skor masih dikalibrasi. Laporan akan makin akurat seiring latihanmu.' : finding}</span></p>
      ${calib ? '' : `<div class="btn-row" style="margin-top:12px"><button class="btn small" data-act="train" data-topic="${esc(info.weak.name)}">Latih topik ini: ${esc(info.weak.name)}</button></div>`}</div>
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
  tip.innerHTML = `<b>Minggu ${dpt.label}</b>Skor: <b style="display:inline">${dpt.value}</b><br>Selisih: ${prev ? (dpt.value - prev.value >= 0 ? '+' : '') + (dpt.value - prev.value) : '—'}<br>Topik berubah: ${changed}`;
  tip.hidden = false;
  const pt = $(`.pt[data-i="${i}"] .dot`, wrap).getBoundingClientRect(), wr = wrap.getBoundingClientRect();
  tip.style.left = `${Math.min(Math.max(pt.left - wr.left + pt.width / 2, 110), wr.width - 110)}px`;
  tip.style.top = `${pt.top - wr.top}px`;
  $$('.pt', wrap).forEach((p) => p.classList.toggle('sel', +p.dataset.i === i));
}

/* ------------------------------------------------------------------ QUIZ (Daily 10 & diagnostik) */
let Q = null;
const topicOf = (q) => cfg().cat[q.cat];
function startQuiz(focus) {
  const bank = D.BANKS[cfg().bank];
  let list = bank.slice();
  if (focus) list = [...list.filter((q) => topicOf(q) === focus), ...list.filter((q) => topicOf(q) !== focus)];
  Q = { list, i: 0, picked: null, wrong: [], right: 0, finished: false, focus };
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
  const fb = Q.picked == null ? '' : `<div class="feedback" role="status"><b>${Q.picked === q.a ? 'Tepat!' : 'Belum tepat, tidak apa-apa.'}</b>
      <p>${esc(q.e)}</p>${Q.picked !== q.a ? `<p class="small muted" style="margin-top:6px">Topik <b>${esc(topicOf(q))}</b> ditandai di Peta Kesenjangan.</p>` : ''}
      <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="next">${Q.i === 9 ? 'Selesai' : 'Soal berikutnya'}</button></div></div>`;
  return `<div class="quiz"><div class="page-head"><div><h1>Daily 10</h1><p>${Q.focus ? `Fokus: ${esc(Q.focus)}` : 'Satu unit kecil untuk menjaga Streak'}</p></div>
      <a class="btn small" href="#/beranda">Keluar</a></div>
    <div class="card"><div class="goal-top"><span class="muted small">Soal ${Q.i + 1} dari 10 · ${esc(topicOf(q))}</span></div>
      <div class="bar" style="margin-bottom:16px" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${Q.i + (Q.picked != null ? 1 : 0)}"><i style="width:${(Q.i + (Q.picked != null ? 1 : 0)) * 10}%"></i></div>
      ${q.p ? `<p class="passage">${esc(q.p)}</p>` : ''}<h2>${esc(q.q)}</h2>${opts}${fb}</div></div>`;
}
function finishDaily() {
  Q.finished = true; Q.keep = true;
  const s = S();
  s.flagged = [...new Set([...s.flagged, ...Q.wrong])].slice(-4);
  Q.firstToday = !isDone();
  if (Q.firstToday) {
    s.doneDate = toISO(today());
    s.streak += 1; s.bestStreak = Math.max(s.bestStreak, s.streak);
    if (!s.studyDates.includes(toISO(today()))) s.studyDates.push(toISO(today()));
    s.userDays = Math.min(4, s.userDays + 1); s.sessions += 1;
    Q.got = addPoints(20, 'Daily 10 selesai');
    if (s.scoreState === 'calibrating' && s.sessions >= 3) { s.scoreState = 'terukur'; ribbon('Skor kamu sekarang Terukur'); }
    checkSquadGoal();
  }
  St.save();
}
function viewDailyDone() {
  return `<div class="quiz"><div class="card done-ring"><div class="flame lit ${S().streak ? 'pop' : ''}">${icon('flame', 30)}</div>
      ${miniRing(1, 'Progress hari ini penuh', '10/10')}
      <h1>Daily 10 selesai!</h1>
      <p>${Q.right} benar dari 10 · Streak <b>${S().streak} hari</b>${Q.firstToday ? ` · +${Q.got} poin` : ''}</p>
      ${Q.wrong.length ? `<p class="small muted">Topik yang ditandai: ${[...new Set(Q.wrong)].map(esc).join(', ')}</p>` : ''}
      <div class="btn-row" style="justify-content:center"><button class="btn primary" data-act="share-squad">${icon('share')} Bagikan ke squad</button>
      <a class="btn" href="#/beranda" data-act="quiz-exit">Kembali ke Beranda</a></div></div></div>`;
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
  const others = list.filter((m) => !m.me).sort((a, b) => SQ.sort === 'abc' ? a.name.localeCompare(b.name, 'id') : a.active - b.active);
  const rows = [...me, ...others].map((m) => `<button class="member${m.me ? ' me' : ''}" data-act="member" data-id="${m.id}"
      aria-label="${esc(m.name)}${m.me ? ' (kamu)' : ''}: ${m.days} dari 4 hari selesai">
      <span class="avatar">${initial(m.name)}</span><span><span class="member-name">${esc(m.name)}${m.me ? ' (kamu)' : ''}</span></span>
      <span class="dots" aria-hidden="true">${[0, 1, 2, 3].map((k) => `<i class="dot-d${k < m.days ? ' on' : ''}"></i>`).join('')}</span></button>`).join('');
  const pct = Math.round((sq.done / sq.total) * 100);
  const allDone = sq.done >= sq.total;
  const blk = Math.floor(Date.now() / 1500000);
  const present = Array.from({ length: 5 }, (_, k) => D.SQUAD_NAMES[(blk + k * 3) % D.SQUAD_NAMES.length]);
  const joined = S().room;
  const ageNote = S().age === '18+' ? '' : `<p class="small muted" style="margin-top:8px">${icon('lock', 16)} Mode usia ${esc(S().age === 'u16' ? 'di bawah 16' : '16–17')}: tanpa obrolan bebas dan tanpa pesan langsung; hanya reaksi siap pakai.</p>`;
  return `<div class="page-head"><div><h1>#SquadTerang</h1><p>${esc(cfg().squad)} · ${sq.total} anggota</p></div></div>
    <div class="stack"><div class="card goal" id="goal">
      ${allDone ? `<div class="celebrate-banner">${icon('star')} Tujuan bersama tercapai! Seluruh squad menyelesaikan 4 hari.</div>` : ''}
      <div class="goal-top"><div><div class="goal-num">${sq.done}<span class="muted" style="font-size:1.25rem"> / ${sq.total}</span></div>
        <p class="muted">anggota sudah menyelesaikan 4 hari Daily 10</p></div><span class="pill tint">${icon('clock', 16)} Sisa ${sq.daysLeft} hari minggu ini</span></div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${sq.total}" aria-valuenow="${sq.done}" aria-label="Kemajuan tujuan bersama"><i style="width:${pct}%"></i></div>
      <p class="small muted" style="margin-top:8px">Papan ini tidak mengurutkan anggota dari terbaik ke terburuk dan tidak menampilkan skor.</p></div>
    <div class="grid cols-2" style="align-items:start">
      <div class="card"><div class="toolbar"><div class="seg" role="group" aria-label="Filter anggota">
        ${[['all', 'Semua'], ['done', 'Sudah selesai'], ['todo', 'Belum']].map(([k, l]) => `<button data-act="sq-filter" data-k="${k}" aria-pressed="${SQ.filter === k}">${l}</button>`).join('')}</div>
        <div class="seg" role="group" aria-label="Urutan"><button data-act="sq-sort" data-k="abc" aria-pressed="${SQ.sort === 'abc'}">Abjad</button><button data-act="sq-sort" data-k="active" aria-pressed="${SQ.sort === 'active'}">Terakhir aktif</button></div></div>
        ${rows || '<p class="muted">Tidak ada anggota pada filter ini.</p>'}${ageNote}
        <p class="small muted" style="margin-top:10px">Titik terisi = Daily 10 selesai pada hari target. Titik kosong bersifat netral.</p></div>
      <div class="stack"><div class="card room"><div class="card-head"><h2>Silent Study Room</h2><span class="pill tint">Tanpa obrolan</span></div>
        <div class="timer" id="room-timer" aria-live="off">--:--</div>
        <p class="muted small">Timer bersama 25 menit. Yang hadir tampil sebagai avatar, tanpa chat, suara, atau video.</p>
        <div class="avatars" aria-label="Sedang belajar">${present.map((n) => `<span class="avatar" title="${esc(n)}">${initial(n)}</span>`).join('')}${joined ? `<span class="avatar" style="background:var(--blue);color:var(--on-blue)" title="Kamu">${initial(S().name || 'K')}</span>` : ''}</div>
        <button class="btn ${joined ? '' : 'small'}" data-act="room-toggle">${joined ? 'Keluar ruangan' : 'Masuk ruangan'}</button></div>
      <div class="card"><h2 style="margin-bottom:8px">Buddy-mu</h2><p class="finding">${icon('heart')}<span><b>Bella</b> ${S().squadAllDone ? 'sudah selesai hari ini.' : 'sudah menyelesaikan 3 dari 4 hari.'} Kalian saling mengingatkan, bukan bersaing.</span></p></div></div></div></div>`;
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

/* ------------------------------------------------------------------ POIN & PLAYBOOKS */
function viewPoints() {
  const s = S();
  const cat = D.CATALOG.map((it) => `<div class="item"><div><b>${esc(it.name)}</b><p class="small muted">${esc(it.desc)}</p></div>
    <button class="btn small" data-act="redeem" data-id="${it.id}" ${s.points < it.cost ? 'disabled' : ''}>${it.cost} poin</button></div>`).join('');
  const list = (RP.allPb ? D.PLAYBOOKS : D.PLAYBOOKS.filter((p) => p.exam === s.target));
  const pbHtml = (list.length ? list : D.PLAYBOOKS).map((p) => `<div class="item"><div><span class="tag">${p.exam}</span> <b>${esc(p.title)}</b>
    <p class="small muted">${esc(p.by)} · ${p.min} menit baca · ditinjau tim Terang</p></div><button class="btn small" data-act="pb-open" data-id="${p.id}">Baca</button></div>`).join('');
  return `<div class="page-head"><div><h1>Points & Playbooks</h1><p>Poin diberikan untuk kemajuan nyata, bukan lamanya waktu di layar.</p></div></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start">
      <div class="card"><p class="muted">Saldo poin</p><div class="balance">${s.points.toLocaleString('id-ID')}</div>
        <p class="small muted" style="margin:10px 0 6px">Batas poin bulan ini: ${s.earnedMonth} dari ${D.MONTH_CAP}</p>
        <div class="bar gold" role="progressbar" aria-valuemin="0" aria-valuemax="${D.MONTH_CAP}" aria-valuenow="${s.earnedMonth}"><i style="width:${Math.min(100, (s.earnedMonth / D.MONTH_CAP) * 100)}%"></i></div></div>
      <div class="card"><h2 style="margin-bottom:6px">Cara mendapat poin</h2>${D.EARN_RULES.map(([a, b]) => `<div class="item"><span>${a}</span><span class="tag">${b}</span></div>`).join('')}</div></div>
    <div class="card"><h2 style="margin-bottom:6px">Katalog hadiah</h2>${cat}<p class="small muted" style="margin-top:8px">Tanpa hadiah uang tunai. Hadiah mitra masih contoh.</p></div>
    <div class="card"><div class="card-head"><h2>Playbooks alumni</h2><button class="btn small" data-act="pb-all">${RP.allPb ? 'Hanya targetku' : 'Semua ujian'}</button></div>${pbHtml}
      <p class="small muted" style="margin-top:8px">Konten ilustrasi untuk prototipe.</p></div>
    <div class="card"><h2 style="margin-bottom:6px">Riwayat poin</h2>${s.ledger.slice(0, 6).map((l) => `<div class="item"><span>${esc(l.t)}<span class="small muted"> · ${fromISO(l.d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span></span><b>${l.p > 0 ? '+' : ''}${l.p}</b></div>`).join('')}</div></div>`;
}

/* ------------------------------------------------------------------ PASSPORT */
function viewPassport() {
  const s = S(), info = scoreInfo(), calib = s.scoreState === 'calibrating';
  const log = D.PASSPORT_LOG.map((l) => `<div class="item"><div><span class="tag">${l.src}</span> ${esc(l.text)}</div>
    <span class="small muted">${l.ago} hari lalu</span></div>`).join('');
  const shares = s.shares.length ? s.shares.map((sh) => `<div class="item"><div>${icon(sh.type === 'pdf' ? 'pdf' : 'link')} <b>${esc(sh.label)}</b>
    <p class="small muted">${sh.type === 'pdf' ? 'PDF' : esc(sh.url)} · berlaku sampai ${fromISO(sh.expires).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}${sh.revoked ? ' · dicabut' : ''}</p></div>
    ${sh.revoked ? '<span class="tag">Dicabut</span>' : `<button class="btn small" data-act="share-revoke" data-id="${sh.id}">Cabut akses</button>`}</div>`).join('')
    : '<p class="muted">Belum ada yang dibagikan. Data hanya keluar setelah kamu setuju.</p>';
  return `<div class="page-head"><div><h1>Terang Passport</h1><p>Satu catatan belajar lintas web, aplikasi, dan AI Interview</p></div>
      <button class="btn primary" data-act="share-open">${icon('share')} Bagikan</button></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start"><div class="card"><div class="card-head"><h2>Ringkasan skor</h2></div>
      <p>${calib ? '<span class="pill neutral">Calibrating</span>' : `<span class="pill band-${info.band}">${icon(BAND_META[info.band].icon)} ${BAND_META[info.band].label}</span> ${s.scoreState === 'terkalibrasi' ? `<span class="pill gold">${icon('check', 16)} Terkalibrasi</span>` : ''}`}</p>
      <p style="margin-top:10px" class="muted">${calib ? 'Skor makin akurat seiring latihanmu.' : `Skor terakhir ${info.score}/100 · Streak ${s.streak} hari`}</p>
      ${s.result ? `<p class="small" style="margin-top:8px">Hasil ujian nyata: ${s.result.actual}/${s.result.max} (setara ${s.result.pct}/100)</p>` : ''}</div>
    <div class="card tint"><h2 style="margin-bottom:6px">${icon('lock')} Data milikmu</h2><ul class="list-plain small"><li>Setiap pembagian lewat tautan atau PDF perlu persetujuan eksplisit.</li><li>Tautan dapat dicabut kapan saja.</li><li>Squad Board tidak menampilkan skor atau hasil diagnostikmu.</li></ul></div></div>
    <div class="card"><h2 style="margin-bottom:6px">Riwayat belajar</h2>${log}</div>
    <div class="card"><h2 style="margin-bottom:6px">Yang sedang dibagikan</h2>${shares}</div></div>`;
}
function shareDialog() {
  const s = S(), info = scoreInfo(), minor = s.age !== '18+';
  openDlg('Bagikan Passport', `<p class="muted">Periksa isi yang akan dibagikan sebelum membuat tautan atau PDF.</p>
    <div class="card tint"><b>Isi yang dibagikan</b><ul class="list-plain small" style="margin-top:6px">
      <li>Status skor: ${s.scoreState === 'calibrating' ? 'Calibrating' : `${info.score}/100 · ${BAND_META[info.band].label}`}</li><li>Tren skor mingguan dan topik terkuat/terlemah</li><li>Streak dan lencana</li></ul>
      <b style="display:block;margin-top:8px">Tidak ikut dibagikan</b><p class="small">Data squad, kontak, dan riwayat obrolan.</p></div>
    <div class="field"><label for="sh-label">Dibagikan kepada</label><input id="sh-label" type="text" placeholder="mis. Mentor, konselor sekolah" maxlength="40"></div>
    <div class="field"><label for="sh-type">Bentuk</label><select id="sh-type"><option value="link">Tautan</option><option value="pdf">PDF</option></select></div>
    <div class="field"><label for="sh-exp">Berlaku</label><select id="sh-exp"><option value="7">7 hari</option><option value="30">30 hari</option></select></div>
    <label class="check"><input type="checkbox" id="sh-c1" data-change="share-consent"><span>Saya setuju membagikan ringkasan di atas. Saya tahu akses bisa dicabut kapan saja.</span></label>
    ${minor ? `<label class="check"><input type="checkbox" id="sh-c2" data-change="share-consent"><span>Wali saya telah menyetujui pembagian ini (diperlukan untuk pengguna di bawah 18 tahun).</span></label>` : ''}
    <div class="btn-row"><button class="btn primary" id="sh-go" data-act="share-create" disabled>Buat</button><button class="btn" data-act="dlg-close">Batal</button></div>`);
}

/* ------------------------------------------------------------------ LAPOR HASIL */
const RS = { step: 1 };
function viewResult() {
  const s = S(), info = scoreInfo();
  if (RS.step === 1) return `<div class="quiz"><div class="page-head"><div><h1>Laporkan hasil ujian</h1><p>${esc(cfg().label)} · ${longDate(examDate())}</p></div></div>
    <div class="card"><div class="field"><label for="r-act">Skor resmi kamu</label><input id="r-act" type="number" min="0" inputmode="numeric" placeholder="mis. 620"></div>
    <div class="field"><label for="r-max">Skor maksimum ujian</label><input id="r-max" type="number" min="1" inputmode="numeric" value="${s.target === 'IELTS' ? 9 : s.target === 'TOEFL' ? 677 : s.target === 'UTBK' ? 800 : 100}"></div>
    <label class="check"><input type="checkbox" id="r-proof"><span>Saya ingin menyimpan bukti hasil di Passport (opsional, hanya dibagikan atas persetujuanmu).</span></label>
    <p id="r-err" class="small" style="color:var(--orange-strong);margin-top:8px" role="alert"></p>
    <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="res-submit">Kirim hasil</button><a class="btn" href="#/beranda">Nanti saja</a></div></div></div>`;
  if (RS.step === 2) return `<div class="quiz"><div class="card done-ring"><span class="pill gold">${icon('check')} Terkalibrasi</span>
    <h1>Skormu sudah dikalibrasi</h1><div class="card tint" style="width:100%;text-align:left"><p>Skor terakhir: <b>${RS.last}/100</b></p><p>Hasil nyata: <b>${s.result.actual}/${s.result.max}</b> (setara <b>${s.result.pct}/100</b>)</p>
    <p class="small muted" style="margin-top:6px">Selisih ${s.result.pct - RS.last >= 0 ? '+' : ''}${s.result.pct - RS.last} poin dipakai untuk menyesuaikan model skor.</p></div>
    <p class="muted">${RS.got ? `+${RS.got} poin untuk pelaporan hasil.` : ''}</p>
    <button class="btn primary" data-act="res-next">Lanjut ke tujuan berikutnya</button></div></div>`;
  return `<div class="quiz"><div class="page-head"><div><h1>Apa tujuan berikutnya?</h1><p>Siklus belajarmu belum selesai, lanjutkan dengan ujian lain atau bantu orang lain.</p></div></div>
    <div class="card"><div class="chips">${Object.entries(D.TARGETS).filter(([k]) => k !== s.target).map(([k, v]) => `<button class="chip" data-act="res-goal" data-k="${k}">${v.label}</button>`).join('')}</div></div>
    <div class="card"><h2>Jadi mentor Kating Squad</h2><p class="muted">Alumni 18+ terverifikasi membimbing squad dan mendapat hari premium.</p>
    <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="res-mentor" ${s.kating ? 'disabled' : ''}>${s.kating ? 'Terdaftar' : 'Daftar sebagai mentor'}</button><a class="btn" href="#/passport">Lihat Passport</a></div></div></div>`;
}

/* ------------------------------------------------------------------ ONBOARDING */
const OB = { step: 0, target: 'UTBK', date: '', i: 0, picked: null, wrong: [], name: '' };
function obQuestions() { const b = cfg2(OB.target).bank; return D.DIAG_IDX[b].map((k) => D.BANKS[b][k]); }
const cfg2 = (t) => D.TARGETS[t];
function viewOnboarding() {
  if (OB.step === 0) {
    const t = cfg2(OB.target); if (!OB.date) OB.date = toISO(addDays(today(), t.days));
    return `<div class="quiz" style="margin:0 auto"><div class="page-head"><div><h1>Selamat datang di Terang Score</h1><p>Mulai dengan memilih target ujianmu. Belum perlu akun.</p></div></div>
      <div class="card"><div class="label" style="margin-bottom:8px">Target ujian</div><div class="chips">${Object.entries(D.TARGETS).map(([k, v]) => `<button class="chip" data-act="ob-target" data-k="${k}" aria-pressed="${OB.target === k}">${v.label}</button>`).join('')}</div>
      <div class="field" style="margin-top:16px"><label for="ob-date">Tanggal ujian</label><input id="ob-date" type="date" value="${OB.date}" data-change="ob-date"></div>
      <button class="btn primary" data-act="ob-start">Mulai diagnostik 5 menit</button></div></div>`;
  }
  if (OB.step === 1) {
    const qs = obQuestions(), q = qs[OB.i]; const L = ['A', 'B', 'C', 'D'];
    return `<div class="quiz" style="margin:0 auto"><div class="page-head"><div><h1>Diagnostik</h1><p>Soal ${OB.i + 1} dari ${qs.length}</p></div></div>
      <div class="card"><div class="bar" style="margin-bottom:16px"><i style="width:${(OB.i + (OB.picked != null ? 1 : 0)) * 100 / qs.length}%"></i></div>
      ${q.p ? `<p class="passage">${esc(q.p)}</p>` : ''}<h2>${esc(q.q)}</h2>${q.o.map((o, i) => {
        const cls = OB.picked == null ? '' : i === q.a ? ' right' : i === OB.picked ? ' wrong' : '';
        return `<button class="opt${cls}" data-act="ob-pick" data-i="${i}" ${OB.picked != null ? 'disabled' : ''}><span class="key">${L[i]}</span><span>${esc(o)}</span></button>`; }).join('')}
      ${OB.picked != null ? `<div class="feedback"><p>${esc(q.e)}</p><div class="btn-row" style="margin-top:10px"><button class="btn primary" data-act="ob-next">${OB.i === qs.length - 1 ? 'Lihat hasil' : 'Berikutnya'}</button></div></div>` : ''}</div></div>`;
  }
  const t = cfg2(OB.target);
  return `<div class="quiz" style="margin:0 auto"><div class="card ring-card">${ringSVG({ mode: 'calibrating' })}
    <h1>Hasil awalmu sudah siap</h1><p class="ring-line">Skor makin akurat seiring latihanmu. Kami tidak menampilkan angka sebelum datanya layak dipercaya.</p>
    ${OB.wrong.length ? `<p class="small">Topik yang perlu dilatih: <b>${[...new Set(OB.wrong)].map(esc).join(', ')}</b></p>` : '<p class="small">Mantap, belum ada kesenjangan besar terdeteksi.</p>'}
    <div class="field" style="width:100%;text-align:left"><label for="ob-name">Simpan progres: siapa namamu? (opsional)</label><input id="ob-name" type="text" maxlength="30" autocomplete="given-name"></div>
    <button class="btn primary" data-act="ob-save">Simpan & lihat Beranda</button></div></div>`;
}

/* ------------------------------------------------------------------ PROFIL */
function viewProfile() {
  const s = S(); const minor = s.age !== '18+';
  const sw = Object.entries(D.PALETTES).map(([k, p]) => `<button class="sw" data-act="palette" data-k="${k}" aria-pressed="${s.palette === k}"><i><b style="background:${p.blue}"></b><b style="background:${p.strong}"></b><b style="background:#F5B82E"></b><b style="background:#F28A1A"></b></i>
    <b>${p.label}</b><span class="small muted">${p.note}</span></button>`).join('');
  return `<div class="page-head"><div><h1>Profil & Pengaturan</h1><p>Privasi, pengingat, dan tampilan</p></div></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start"><div class="card"><h2 style="margin-bottom:12px">Profil</h2>
      <div class="field"><label for="p-name">Nama</label><input id="p-name" type="text" value="${esc(s.name)}" maxlength="30" data-change="set-name"></div>
      <div class="field"><label for="p-target">Target ujian</label><select id="p-target" data-change="set-target">${Object.entries(D.TARGETS).map(([k, v]) => `<option value="${k}" ${k === s.target ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      <div class="field"><label for="p-date">Tanggal ujian</label><input id="p-date" type="date" value="${s.examDate}" data-change="set-date"></div>
      <div class="field"><label for="p-age">Kelompok usia</label><select id="p-age" data-change="set-age"><option value="u16" ${s.age === 'u16' ? 'selected' : ''}>Di bawah 16</option><option value="16-17" ${s.age === '16-17' ? 'selected' : ''}>16–17</option><option value="18+" ${s.age === '18+' ? 'selected' : ''}>18 ke atas</option></select>
      <span class="small muted">Fitur sosial dibuka bertahap menurut usia (PP Tunas, UU PDP Pasal 25).</span></div></div>
    <div class="card"><h2 style="margin-bottom:12px">Pengingat & aksesibilitas</h2>
      <div class="field"><label for="p-hour">Jam belajar biasa</label><select id="p-hour" data-change="set-hour">${[6, 12, 16, 19, 21].map((h) => `<option value="${h}" ${h === s.reminderHour ? 'selected' : ''}>${String(h).padStart(2, '0')}.00</option>`).join('')}</select></div>
      <div class="field"><label for="p-ch">Kanal pengingat</label><select id="p-ch" data-change="set-channel"><option value="inapp" ${s.channel === 'inapp' ? 'selected' : ''}>Notifikasi dalam aplikasi</option><option value="wa" ${s.channel === 'wa' ? 'selected' : ''} ${minor ? 'disabled' : ''}>WhatsApp (pengguna dewasa)</option></select></div>
      <label class="check"><input type="checkbox" data-change="set-motion" ${s.reduceMotion ? 'checked' : ''}><span>Kurangi gerakan (animasi dimatikan)</span></label></div></div>
    <div class="card"><h2 style="margin-bottom:4px">Palet warna</h2><p class="small muted" style="margin-bottom:12px">Token usulan, perlu dicocokkan dengan brand kit resmi Terang AI.</p><div class="swatches">${sw}</div></div>
    <div class="demo"><h2 style="margin-bottom:4px">Panel demo</h2><p class="small muted" style="margin-bottom:12px">Untuk mencoba keadaan layar tanpa menunggu. Hanya ada di prototipe.</p>
      <div class="label small" style="margin-bottom:6px">Keadaan skor</div><div class="seg" role="group" aria-label="Keadaan skor">${[['calibrating', 'Calibrating'], ['terukur', 'Terukur'], ['terkalibrasi', 'Terkalibrasi']].map(([k, l]) => `<button data-act="demo-state" data-k="${k}" aria-pressed="${s.scoreState === k}">${l}</button>`).join('')}</div>
      <div class="btn-row" style="margin-top:14px"><button class="btn small" data-act="demo-risk">${s.forceRisk ? 'Matikan' : 'Simulasikan'} streak terancam</button>
      <button class="btn small" data-act="demo-exam">Simulasikan ujian sudah lewat</button><button class="btn small" data-act="demo-near">Simulasikan ujian 10 hari lagi</button>
      <button class="btn small" data-act="demo-squad">Squad selesai semua</button><button class="btn small" data-act="demo-onboard">Ulangi onboarding</button><button class="btn small" data-act="demo-reset">Reset data demo</button></div></div></div>`;
}

/* ------------------------------------------------------------------ router & render */
const VIEWS = { beranda: viewHome, laporan: viewReport, daily: viewDaily, 'lapor-hasil': viewResult, squad: viewSquad, poin: viewPoints, passport: viewPassport, profil: viewProfile, onboarding: viewOnboarding };
let current = 'beranda';
function render(keepScroll) {
  const [path, qs] = (location.hash.replace(/^#\//, '') || 'beranda').split('?');
  current = VIEWS[path] ? path : 'beranda';
  if (!S().onboarded && current !== 'onboarding') { location.hash = '#/onboarding'; return; }
  const main = $('#main'); const y = window.scrollY;
  main.innerHTML = VIEWS[current](new URLSearchParams(qs || ''));
  renderNav(current);
  document.title = `Terang Score — ${NAV.find((n) => n[0] === current)?.[1] || (current === 'laporan' ? 'Weekly Report' : current === 'daily' ? 'Daily 10' : 'Dashboard')}`;
  requestAnimationFrame(() => {
    $$('.ring-val').forEach((c) => { c.style.strokeDasharray = `${c.dataset.target} 100`; });
    if (current === 'squad') { tickRoom(); if (!SQ.timer) SQ.timer = setInterval(tickRoom, 1000); }
  });
  if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#/daily')) Q = null; // keluar dari Daily 10 = sesi kuis dibersihkan
  if (!location.hash.startsWith('#/lapor-hasil')) RS.step = 1;
  render(); $('#main').focus({ preventScroll: true });
});

/* ------------------------------------------------------------------ aksi */
const ACT = {
  'dlg-close': () => closeDlg(),
  'ring-detail': () => {
    const info = scoreInfo(), s = S();
    if (s.scoreState === 'calibrating') return openDlg('Skor sedang Calibrating', `<p>Skormu belum ditampilkan sebagai angka karena data latihan belum cukup untuk garis dasar. Skor makin akurat seiring latihanmu.</p>
      <p class="small muted">Ambang data Calibrating → Terukur ditetapkan tim data. Di prototipe ini: tiga Daily 10.</p><a class="btn primary" href="#/daily" data-act="dlg-close">Kerjakan Daily 10</a>`);
    const top = info.now.slice(0, 3);
    openDlg(`Readiness Score ${info.score}`, `<p><span class="pill band-${info.band}">${icon(BAND_META[info.band].icon)} ${BAND_META[info.band].label}</span></p>
      <p class="muted">Topik yang paling memengaruhi skormu:</p>${top.map((t) => `<div class="item"><div><b>${esc(t.name)}</b><p class="small muted">Naik ke 75 menambah sekitar ${Math.max(0, Math.round((75 - t.v) / cfg().topics.length))} poin</p></div>${bandPill(t.v)}</div>`).join('')}
      <a class="btn primary" href="#/daily?topic=${encodeURIComponent(top[0].name)}" data-act="dlg-close">Daily 10 untuk ${esc(top[0].name)}</a>
      <p class="small muted">Ambang pita status masih sementara (ditetapkan tim data). Skor bukan jaminan hasil ujian.</p>`);
  },
  train: (el) => { location.hash = `#/daily?topic=${encodeURIComponent(el.dataset.topic)}`; Q = null; },
  'rest-pass': () => { const s = S(); if (s.restPasses < 1) return; s.restPasses -= 1; s.restDates.push(toISO(today())); s.forceRisk = false; St.save(); ribbon('Rest Day Pass dipakai. Streak aman.'); render(true); },
  pick: (el) => {
    if (Q.picked != null) return; const q = Q.list[Q.i]; Q.picked = +el.dataset.i;
    if (Q.picked === q.a) Q.right++; else Q.wrong.push(topicOf(q));
    render(true);
  },
  next: () => { if (Q.i === 9) finishDaily(); else { Q.i++; Q.picked = null; } render(); },
  'share-squad': () => { ribbon('Dibagikan ke squad'); },
  'quiz-exit': () => { Q = null; },
  'filter-topic': (el) => { RP.topic = el.dataset.topic; render(true); },
  'toggle-table': () => { RP.table = !RP.table; render(true); },
  'sq-filter': (el) => { SQ.filter = el.dataset.k; render(true); },
  'sq-sort': (el) => { SQ.sort = el.dataset.k; render(true); },
  member: (el) => {
    const m = squad().members.find((x) => x.id === +el.dataset.id);
    const badges = D.BADGES.slice(0, 1 + (m.streak % 4));
    openDlg(esc(m.name) + (m.me ? ' (kamu)' : ''), `<p><span class="pill tint">${icon('flame', 16)} Streak ${m.streak} hari</span></p>
      <div class="chips">${badges.map((b) => `<span class="pill gold">${esc(b)}</span>`).join('')}</div>
      <p class="small muted">Kartu ringkas hanya menampilkan kehadiran dan Streak, bukan skor.</p>
      ${m.me ? '' : `<div class="label">Kirim semangat</div>${D.CHEERS.map((c, i) => `<button class="btn block" style="margin-top:6px;justify-content:flex-start;text-align:left" data-act="cheer" data-n="${esc(m.name)}">${esc(c)}</button>`).join('')}`}`);
  },
  cheer: (el) => { closeDlg(); ribbon(`Semangat terkirim ke ${el.dataset.n}`); },
  'room-toggle': () => { S().room = !S().room; St.save(); render(true); },
  redeem: (el) => {
    const it = D.CATALOG.find((c) => c.id === el.dataset.id), s = S(); if (!it || s.points < it.cost) return;
    s.points -= it.cost; s.ledger.unshift({ t: `Tukar: ${it.name}`, p: -it.cost, d: toISO(today()) }); St.save(); ribbon(`Berhasil ditukar: ${it.name}`); render(true);
  },
  'pb-open': (el) => { const p = D.PLAYBOOKS.find((x) => x.id === el.dataset.id); openDlg(esc(p.title), `<p class="small muted">${esc(p.by)} · ditinjau tim Terang sebelum terbit · contoh konten</p><ul class="list-plain">${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`); },
  'pb-all': () => { RP.allPb = !RP.allPb; render(true); },
  'share-open': () => shareDialog(),
  'share-create': () => {
    const s = S(); const type = $('#sh-type').value, days = +$('#sh-exp').value;
    const sh = { id: Date.now(), type, label: $('#sh-label').value.trim() || 'Penerima tanpa nama', expires: toISO(addDays(today(), days)), revoked: false,
      url: `https://terang.example/passport/${Math.random().toString(36).slice(2, 10)}` };
    s.shares.unshift(sh); St.save(); closeDlg(); render(true);
    if (type === 'pdf') printPassport(); else ribbon('Tautan dibuat. Kamu bisa mencabutnya kapan saja.');
  },
  'share-revoke': (el) => { const sh = S().shares.find((x) => x.id === +el.dataset.id); if (sh) sh.revoked = true; St.save(); ribbon('Akses dicabut'); render(true); },
  palette: (el) => { S().palette = el.dataset.k; St.save(); applyTheme(); render(true); },
  'demo-state': (el) => {
    const s = S(); s.scoreState = el.dataset.k;
    if (el.dataset.k === 'terkalibrasi' && !s.result) s.result = { actual: 620, max: 800, pct: 78 };
    St.save(); render(true);
  },
  'demo-risk': () => { S().forceRisk = !S().forceRisk; St.save(); render(true); },
  'demo-exam': () => { S().examDate = toISO(addDays(today(), -1)); St.save(); ribbon('Tanggal ujian diset kemarin. Cek Beranda.'); render(true); },
  'demo-near': () => { S().examDate = toISO(addDays(today(), 10)); St.save(); ribbon('Ujian 10 hari lagi. Cek Beranda.'); render(true); },
  'demo-squad': () => { S().squadAllDone = true; St.save(); location.hash = '#/squad'; render(); if (checkSquadGoal()) { render(true); } setTimeout(celebrate, 150); },
  'demo-onboard': () => { St.S.onboarded = false; Object.assign(OB, { step: 0, target: 'UTBK', date: '', i: 0, picked: null, wrong: [] }); St.save(); location.hash = '#/onboarding'; render(); },
  'demo-reset': () => { St.replaceState(St.fresh()); Q = null; applyTheme(); ribbon('Data demo direset'); location.hash = '#/beranda'; render(); },
  'ob-target': (el) => { OB.target = el.dataset.k; OB.date = toISO(addDays(today(), cfg2(OB.target).days)); render(true); },
  'ob-start': () => { OB.step = 1; OB.i = 0; OB.picked = null; OB.wrong = []; render(); },
  'ob-pick': (el) => { if (OB.picked != null) return; const q = obQuestions()[OB.i]; OB.picked = +el.dataset.i; if (OB.picked !== q.a) OB.wrong.push(cfg2(OB.target).cat[q.cat]); render(true); },
  'ob-next': () => { if (OB.i === obQuestions().length - 1) OB.step = 2; else { OB.i++; OB.picked = null; } render(); },
  'ob-save': () => {
    const name = ($('#ob-name').value || '').trim();
    const keep = { palette: S().palette, reduceMotion: S().reduceMotion };
    St.replaceState(St.fresh({ ...keep, name, target: OB.target, examDate: OB.date, scoreState: 'calibrating', streak: 0, bestStreak: 0, studyDates: [], userDays: 0,
      sessions: 0, points: 0, earnedMonth: 0, ledger: [], flagged: [...new Set(OB.wrong)], restPasses: 2 }));
    addPoints(10, 'Diagnostik selesai'); St.save(); Q = null; location.hash = '#/beranda'; render();
  },
  'res-submit': () => {
    const a = parseFloat($('#r-act').value), m = parseFloat($('#r-max').value);
    if (!(a >= 0) || !(m > 0) || a > m) { $('#r-err').textContent = 'Isi skor resmi (tidak lebih dari skor maksimum) agar bisa dikalibrasi.'; return; }
    const s = S(); RS.last = scoreInfo().score;
    s.result = { actual: a, max: m, pct: Math.round((a / m) * 100) }; s.scoreState = 'terkalibrasi';
    RS.got = s.resultRewarded ? 0 : addPoints(100, 'Melaporkan hasil ujian'); s.resultRewarded = true; St.save(); RS.step = 2; render();
  },
  'res-next': () => { RS.step = 3; render(); },
  'res-mentor': () => { S().kating = true; St.save(); ribbon('Terima kasih! Tim kami akan memverifikasi statusmu.'); render(true); },
  'res-goal': (el) => {
    const k = el.dataset.k; const keep = { palette: S().palette, reduceMotion: S().reduceMotion, name: S().name, points: S().points, earnedMonth: S().earnedMonth, ledger: S().ledger, age: S().age };
    St.replaceState(St.fresh({ ...keep, target: k, scoreState: 'calibrating', streak: 0, bestStreak: 0, studyDates: [], userDays: 0, sessions: 0, flagged: [] }));
    RS.step = 1; Q = null; ribbon(`Target baru: ${D.TARGETS[k].label}. Skor mulai dari Calibrating.`); location.hash = '#/beranda'; render();
  },
};
const CHG = {
  'set-name': (el) => { S().name = el.value.trim().slice(0, 30); St.save(); },
  'set-target': (el) => { const s = S(); s.target = el.value; s.examDate = toISO(addDays(today(), D.TARGETS[el.value].days)); s.flagged = []; St.save(); Q = null; render(true); },
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
  area.innerHTML = `<h1>Terang Passport</h1><p>Target: ${esc(cfg().label)}</p><p>Status skor: ${s.scoreState === 'calibrating' ? 'Calibrating' : `${info.score}/100 · ${BAND_META[info.band].label}`}</p>
    <p>Streak: ${s.streak} hari</p><p>Dibuat ${longDate(today())}. Dibagikan dengan persetujuan pemilik. Skor bukan jaminan hasil ujian.</p>`;
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
