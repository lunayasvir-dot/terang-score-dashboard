// Terang Score — dashboard (vanilla JS, tanpa build step).
import * as D from './data.js';
import { ringSVG, lineChart, BAND_META, fmtDate } from './charts.js';
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, today, addDays, toISO, fromISO, longDate, cfg, examDate, daysToExam, isDone,
  streakAtRisk, band, weeklySeries, scoreInfo, squad, addPoints, premiumLeft } from './state.js';
import { $, $$, rp, initial, ribbon, openDlg, closeDlg, hooks, lockChip } from './ui.js';
import * as CP from './copy.js';
import * as AI from './ai.js';
import * as KT from './kartu.js';
import * as EX from './explore.js';
import * as OBD from './onboard.js';
import * as EN from './english.js';
import * as PS from './pass.js';

const S = () => St.S;

/* ------------------------------------------------------------------ utilitas UI */
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
// m = tampil di bilah bawah seluler; mo = hanya seluler (hub); tanpa flag = hanya desktop.
const NAV = [
  { items: [['beranda', 'Beranda', 'home', { m: 1 }]] },
  { items: [['ai', 'AI', 'sparkle', { mo: 1 }]] },
  { g: 'Artificial Intelligence', items: [['tanya', 'Tanya AI', 'chat'], ['interview', 'AI Interview', 'wave', { badge: 'BARU' }], ['review', 'Review Dokumen', 'doc', { badge: 'BARU' }]] },
  { g: 'Menu Utama', items: [['kartu', 'Kartu Ujian', 'ticket'], ['english', 'English Lab', 'book', { badge: 'PILOT' }]] },
  { g: 'Belajar Bareng', items: [['squad', '#SquadTerang', 'users', { m: 1 }]] },
  { g: 'Hadiah & Catatan', items: [['poin', 'Poin & Jurus', 'gift', { m: 1 }], ['passport', 'Paspor', 'passport']] },
  { items: [['profil', 'Profil', 'user', { m: 1 }]] },
];
const ALL_NAV = NAV.flatMap((g) => g.items);
const AI_ROUTES = ['tanya', 'interview', 'review'];
function renderNav(route) {
  const grp = { laporan: 'beranda', daily: 'beranda', 'lapor-hasil': 'beranda' }[route] || route;
  const s = S(); const dark = s.theme === 'dark'; const left = premiumLeft();
  $('#nav').hidden = route === 'onboarding';
  const links = NAV.map((g) => (g.g ? `<div class="nav-label desk-only">${g.g}</div>` : '') + g.items.map(([id, text, ic, o = {}]) => {
    const cur = id === grp || (id === 'ai' && AI_ROUTES.includes(route));
    return `<a class="${o.mo ? 'mob-only' : o.m ? '' : 'desk-only'}" href="#/${id}" ${cur ? 'aria-current="page"' : ''}>${icon(ic, 22)}<span>${text}</span>${o.badge ? `<em class="new">${o.badge}</em>` : ''}</a>`;
  }).join('')).join('');
  const card = `<div class="user-card desk-only"><div class="say" style="gap:10px"><span class="avatar">${initial(s.name || 'Kamu')}</span><div><b>${esc(s.name || 'Kamu')}</b><br><span class="pill ${left > 0 ? 'gold' : 'tint'}">${left > 0 ? 'PREMIUM' : 'GRATIS'}</span></div></div>
    <p class="small muted" style="margin:8px 0">Kredit AI: ${s.credits.toLocaleString('id-ID')} <button class="btn link small" data-act="topup" style="min-height:0;padding:0 4px">Isi Ulang</button></p>
    ${left > 0 ? `<a class="btn block small" href="#/poin">Premium sisa ${left} hari</a>` : `<a class="btn premium block small" href="#/poin">${icon('crown', 16)} Upgrade ke Premium</a>`}</div>`;
  $('#nav').innerHTML = `<a class="brand" href="#/beranda" aria-label="terang.ai, ke Beranda"><img src="assets/logo-terang-ai.svg" alt="terang.ai" class="brand-logo" width="132" height="31"></a>${links}<div class="spacer"></div>${card}` +
    `<button class="nav-link nav-desktop" data-act="theme-flip" aria-label="${dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}">${icon(dark ? 'sun' : 'moon', 22)}<span>${dark ? 'Mode Terang' : 'Mode Gelap'}</span></button>`;
}
const titleOf = (route) => TITLES[route] || ALL_NAV.find((n) => n[0] === route)?.[1] || 'Dashboard';
function renderTopbar(route) {
  const dark = S().theme === 'dark';
  const unseen = CP.notifications().filter((n) => !S().notifSeen.includes(n.id)).length;
  $('#topbar').hidden = route === 'onboarding';
  $('#topbar').innerHTML = `<span class="crumb">Terang AI <span class="muted">›</span> <b>${esc(titleOf(route))}</b></span>
    <div class="topbar-r"><span class="tstats"><a class="tstat fire" href="#/beranda" title="Api Belajar" aria-label="Api Belajar ${S().streak} hari">${icon('flame', 20)} ${S().streak}</a>
    <a class="tstat coin" href="#/poin" title="Poin" aria-label="${S().points} poin">${icon('coin', 20)} ${S().points.toLocaleString('id-ID')}</a></span><button class="icon-btn bell" data-act="notif" aria-label="Notifikasi, ${unseen} belum dibaca">${icon('bell')}${unseen ? `<i class="badge-n">${unseen}</i>` : ''}</button>
    <button class="icon-btn mob-only" data-act="theme-flip" aria-label="Ganti mode tampilan">${icon(dark ? 'sun' : 'moon')}</button></div>`;
}
function notifDialog() {
  const list = CP.notifications();
  openDlg('Notifikasi', list.map((n) => `<div class="notif"><span class="stat-ic">${icon(n.ic, 20)}</span><div><b>${esc(n.title)}</b><p class="small">${esc(n.body)}</p>
    ${n.href ? `<a class="btn small" href="${n.href}" data-act="dlg-close">${esc(n.cta)}</a>` : ''}</div></div>`).join(''));
  S().notifSeen = list.map((n) => n.id); St.save(); renderTopbar(current);
}
function quickLinks() {
  const third = cfg().bank === 'eng' ? ['#/english', 'book', 'English Lab', 'Reading, Listening, Writing, Speaking.'] : ['#/profil?tab=eksplor', 'sparkle', 'Eksplor Kategori Lain', 'Mapel umum, kuliah, dan karier.'];
  return `<div class="grid cols-3 quick">${[['#/tanya', 'chat', 'Tanya AI', 'Bingung sama soal? Tanya aja.'], ['#/kartu', 'ticket', 'Kartu Ujian', 'Simulasi ujian dan harganya.'], third]
    .map(([h, ic, t, d]) => `<a class="card linkcard" href="${h}"><span class="stat-ic">${icon(ic, 20)}</span><div><b>${t}</b><p class="small muted">${d}</p></div></a>`).join('')}</div>`;
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
      <span class="muted small">masih dikenali</span><div class="bar" style="opacity:.6"></div></div>`;
    const b = band(r.v);
    return `<div class="gap-row"><span class="gap-name">${esc(r.name)}${tag}</span>${bandPill(r.v)}
      <div class="bar ${b === 'close' ? 'gold' : b === 'needs' ? 'orange' : ''}" role="img" aria-label="${esc(r.name)} ${r.v} dari 100"><i style="width:${r.v}%"></i></div>
      ${i === 0 ? `<button class="btn small" data-act="train" data-topic="${esc(r.name)}" style="grid-column:1/-1;justify-self:start;margin-top:6px">${icon('zap', 16)} Asah topik ini</button>` : ''}</div>`;
  }).join('');
}

// Jalur belajar: tiap topik = 1 unit berisi 3 langkah latihan + 1 peti hadiah.
const PATH_O = [0, 45, 70, 45, 0, -45, -70, -45];
const PATH_ALL = { on: false };
const NODE_KINDS = [['Pemanasan', 'star'], ['Latihan', 'zap'], ['Uji Kilat', 'trophy'], ['Peti Hadiah', 'gift2']];
function pathHTML() {
  const step = S().pathStep || 0; const topics = cfg().topics.map((t) => t[0]);
  let g = 0; let out = '';
  topics.forEach((tp, u) => {
    const first = u * 4, last = u * 4 + 3;
    const uc = step > last ? 'done' : step >= first ? '' : 'locked';
    out += `<div class="unit ${uc}"><div><small>Unit ${u + 1} · ${uc === 'done' ? 'Tuntas' : uc === 'locked' ? 'Terkunci' : 'Lagi jalan'}</small><b>${esc(tp)}</b></div>${icon(uc === 'done' ? 'check' : uc === 'locked' ? 'lock' : 'book', 24)}</div>`;
    if (uc === 'done' && !PATH_ALL.on) { g += 4; return; } // unit tuntas diringkas biar nggak kebanyakan scroll
    NODE_KINDS.forEach(([label, ic], k) => {
      const idx = first + k; const o = PATH_O[g++ % PATH_O.length];
      const st = idx < step ? 'done' : idx === step ? 'current' : 'locked';
      const chest = k === 3;
      const bx = o === 0 ? 110 : -Math.sign(o) * 110;
      const buddy = st === 'current' ? `<span class="path-buddy" style="left:calc(50% + ${bx}px)">${mascot(S().scoreState === 'calibrating' ? 'think' : 'happy', 56)}</span>` : '';
      out += `<div class="node-wrap" style="--o:${o}">${st === 'current' ? `<span class="node-tip">${chest ? 'Buka!' : 'Mulai'}</span>` : ''}
        <button class="node ${st}${chest ? ' chest' : ''}" data-act="node" data-i="${idx}" data-topic="${esc(tp)}" aria-label="${esc(tp)}: ${label}, ${st === 'done' ? 'selesai' : st === 'current' ? 'langkah sekarang' : 'terkunci'}">${icon(st === 'done' && !chest ? 'check' : ic, 30)}</button>${buddy}</div>`;
    });
  });
  return out;
}

function viewHome() {
  const c = cfg(), d = daysToExam(), info = scoreInfo(), st = S().scoreState, calib = st === 'calibrating';
  const sq = squad(); const done = isDone(); const risk = streakAtRisk();
  const dayText = d > 0 ? `${d} hari lagi` : d === 0 ? 'hari ini' : `${-d} hari lalu`;
  const weak = info.weak.name;
  const mood = calib ? 'think' : risk ? 'cheer' : done ? 'proud' : 'happy';
  const msg = CP.mascotLine({ calib, risk, done, weak: esc(weak), streak: S().streak });
  const hero = `<div class="home-hero"><button class="mascot-btn" data-act="poke" aria-label="Sapa Nyala">${mascot(mood, 104)}<span class="name-tag sm">Nyala</span></button>
    <div><h1>${CP.greeting()}</h1><p class="small muted">Target ${esc(c.label)} (fokus ${c.subtes}) · ${longDate(examDate())} · ${dayText}</p>
    <div class="bubble" id="hero-line">${msg}</div></div></div>`;
  const warn = d > 0 && d <= 14 ? `<div class="card warn"><p class="warn-title">${icon('alert')} Ujian ${esc(c.label)} tinggal ${d} hari</p>
      <p>Waktunya latihan penuh dan fokus ke topik yang paling lemah. Kamu nggak sendirian, squad nemenin kamu.</p></div>` : '';
  const report = d <= 0 && d >= -7 && st !== 'terkalibrasi' ? `<div class="card tint"><div class="card-head"><h2>Udah ujian? Ceritain hasilnya, yuk!</h2></div>
      <p class="muted">Hasil resmi bikin skormu makin akurat dan dapet poin. Bukti pendukung sifatnya opsional.</p>
      <div class="btn-row" style="margin-top:12px"><a class="btn" href="#/lapor-hasil">${icon('trophy')} Lapor hasil · +100 poin</a></div></div>` : '';
  const ringBadge = st === 'terkalibrasi' ? `<span class="pill gold badge-cal">${icon('check', 16)} Sudah Pas</span>` : '';
  const ring = `<div class="card ring-card ring-sm"><h2>Skor Siap-mu</h2>
      <button class="ring-btn" data-act="ring-detail" aria-label="${calib ? 'Buka rincian skor, saat ini masih Lagi Kenalan' : `Buka rincian skor, Skor Siap ${info.score}, status ${BAND_META[info.band].label}`}">
        ${ringSVG({ mode: calib ? 'calibrating' : 'score', score: info.score, band: info.band, badge: ringBadge })}</button>
      <p class="ring-line small">${calib ? 'Skor makin akurat seiring latihanmu.' : BAND_META[info.band].line}</p>
      <p class="small muted">Skor ini bukan jaminan lolos ujian.</p></div>`;
  const daily = `<div class="card"><div class="card-head"><h2>Misi Harian</h2>${done ? `<span class="pill tint">${icon('check', 16)} Beres</span>` : `<span class="pill tint">${icon('clock', 14)} ${OBD.durLabel(S().dailyMin || 30)}/hari</span>`}</div>
      <div class="streak">${miniRing(done ? 1 : 0, done ? 'Misi harian selesai' : 'Misi harian belum dikerjakan', done ? '10/10' : '0/10')}
      <p>${done ? 'Satu misi udah cukup buat jaga Api Belajarmu hari ini. Kerja bagus!' : `10 soal${calib ? '' : `, fokus ke <b>${esc(weak)}</b>`}.`}</p></div>
      <div class="btn-row" style="margin-top:14px">${done
        ? `<a class="btn" href="#/laporan">${icon('chart')} Lihat Rapor Mingguan</a>`
        : `<a class="btn primary block" href="#/daily${calib ? '' : `?topic=${encodeURIComponent(weak)}`}">${icon('zap')} Mulai Misi Harian</a>`}</div></div>`;
  const streak = `<div class="card${risk ? ' warn' : ''}"><div class="streak"><div class="flame ${S().streak > 0 ? 'lit' : ''}" id="flame">${icon('flame', 30)}</div>
      <div><div class="streak-num">${S().streak} <span class="small muted" style="font-weight:700">hari Api Belajar</span></div>
      <p class="small muted">Rekor ${Math.max(S().bestStreak, S().streak)} hari · Tiket Libur: ${S().restPasses}</p></div></div>
      ${weekDots()}
      ${risk ? `<p class="warn-title" style="margin-top:12px">${icon('clock')} Jam belajarmu udah lewat nih</p><p class="small">Api Belajar ${S().streak} hari belum aman hari ini. Satu misi cukup, atau pakai Tiket Libur kalau lagi butuh istirahat.</p>
      <div class="btn-row" style="margin-top:10px"><a class="btn small" href="#/daily">Kerjain misi</a>
      <button class="btn small" data-act="rest-pass" ${S().restPasses < 1 ? 'disabled' : ''}>${icon('ticket', 16)} Pakai Tiket Libur</button></div>` : ''}</div>`;
  const pct = Math.round((sq.done / sq.total) * 100);
  const squadCard = `<div class="card"><div class="card-head"><h2>${esc(c.squad)}</h2><a class="btn link small" href="#/squad">Buka ${icon('chevron', 14)}</a></div>
      <p class="muted small">Tujuan bareng: semua anggota nyelesain misi 4 hari minggu ini.</p>
      <div class="bar" style="margin:10px 0 6px" role="img" aria-label="${sq.done} dari ${sq.total} anggota sudah 4 hari"><i style="width:${pct}%"></i></div>
      <p class="small"><b>${sq.done} dari ${sq.total}</b> anggota udah 4 hari · sisa ${sq.daysLeft} hari</p></div>`;
  const { overall } = weeklySeries();
  const delta = overall[7] - overall[6];
  const teaser = `<div class="card"><div class="card-head"><h2>Rapor Mingguan</h2><a class="btn link small" href="#/laporan">Buka ${icon('chevron', 14)}</a></div>
      <p class="finding small">${icon('chart')}<span>${calib ? 'Rapor mingguan muncul setelah dua minggu data latihan.'
        : `Skor minggu ini ${delta >= 0 ? 'naik' : 'turun'} <b>${Math.abs(delta)} poin</b>. Paling jago: <b>${esc(info.strong.name)}</b>.`}</span></p></div>`;
  const total = cfg().topics.length * 4;
  const path = `<div class="card path-card"><div class="card-head"><h2>Jalur Belajar ${c.subtes}</h2><span class="pill tint">${Math.min(S().pathStep || 0, total)}/${total} langkah</span></div>
      <p class="small muted">Tiap langkah satu misi kecil. Selesaikan berurutan, lalu buka peti hadiah di ujung unit.</p>
      ${(S().pathStep || 0) >= 4 ? `<button class="btn link small" data-act="path-all" style="padding:0">${PATH_ALL.on ? 'Ringkas unit yang tuntas' : 'Lihat langkah yang udah beres'}</button>` : ''}<div class="path">${pathHTML()}</div></div>`;
  const radar = `<div class="card"><div class="card-head"><h2>Radar Skill</h2><span class="pill tint">${icon('target', 16)} ${c.subtes}</span></div>${gapRows()}</div>`;
  return `<div class="stack">${hero}${quickLinks()}${warn}${report}
    <div class="home-layout"><div class="stack">${path}</div>
    <div class="side-col">${ring}${PS.recommendCard(S().target)}${daily}${streak}${radar}${squadCard}${teaser}</div></div></div>`;
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

/* ------------------------------------------------------------------ QUIZ (Misi Harian, jalur, simulasi) */
let Q = null;
const OK_LINES = ['Mantap!', 'Tepat banget!', 'Keren, lanjut!', 'Nah, gitu!', 'Jago!'];
function startQuiz(focus, mode, cardId, path) {
  let list = D.bankOf(S().target).slice();
  if (focus) list = [...list.filter((q) => q.topic === focus), ...list.filter((q) => q.topic !== focus)];
  const card = cardId ? KT.cardById(cardId) : null;
  Q = { list: list.slice(0, 10), i: 0, picked: null, wrong: [], right: 0, finished: false, focus, mode: mode === 'tryout' ? 'tryout' : 'daily',
    cardName: card ? card.name : '', path: !!path, combo: 0, t0: Date.now() };
}
function viewDaily(params) {
  if (!Q) startQuiz(params.get('topic'), params.get('mode'), params.get('card'), params.get('path'));
  if (Q.finished) return viewDailyDone();
  const q = Q.list[Q.i]; const tryout = Q.mode === 'tryout';
  const n = Q.i + (Q.picked != null ? 1 : 0);
  const opts = q.o.map((o, i) => {
    let cls = '';
    if (Q.picked != null) cls = i === q.a ? ' right' : i === Q.picked ? ' wrong' : '';
    return `<button class="opt${cls}" data-act="pick" data-i="${i}" ${Q.picked != null ? 'disabled' : ''}><span class="key">${i + 1}</span><span>${esc(o)}</span>
      ${Q.picked != null && i === q.a ? `<span class="sr">Jawaban benar</span>${icon('check')}` : ''}</button>`;
  }).join('');
  const ok = Q.picked === q.a;
  const sheet = Q.picked == null ? '' : `<div class="sheet ${ok ? 'ok' : 'no'}" role="status"><div class="sheet-in"><div class="sheet-msg">${mascot(ok ? 'cheer' : 'think', 60)}
      <div><h3>${ok ? OK_LINES[Q.i % OK_LINES.length] : 'Belum pas, nggak apa-apa.'}</h3><p class="small">${ok ? '' : `Jawaban benar: <b>${esc(q.o[q.a])}</b>. `}${esc(q.e)}</p>
      ${!ok && !tryout ? `<p class="small muted">${esc(q.topic)} masuk Radar Skill-mu buat diasah lagi.</p>` : ''}</div></div>
      <button class="btn primary" data-act="next">${Q.i === 9 ? 'Selesai' : 'Lanjut'}</button></div></div>`;
  const label = tryout ? `Simulasi · ${esc(Q.cardName)}` : Q.path ? `Jalur Belajar · ${esc(q.topic)}` : `Misi Harian · ${esc(q.topic)}`;
  return `<div class="qz"><div class="qz-top"><a class="qz-x" href="${tryout ? '#/kartu?sub=saya' : '#/beranda'}" aria-label="Keluar">${icon('close', 22)}</a>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${n}"><i style="width:${Math.max(3, n * 10)}%"></i></div>
      ${Q.combo >= 2 ? `<span class="qz-combo">${icon('flame', 18)} ${Q.combo}x</span>` : `<span class="small muted">${n}/10</span>`}</div>
    <span class="qz-label">${label}</span>${q.p ? `<p class="passage">${esc(q.p)}</p>` : ''}<h1 class="qz-q">${esc(q.q)}</h1>${opts}<p class="qz-hint">Tips: tekan 1–4 buat jawab, Enter buat lanjut.</p></div>${sheet}`;
}
function finishDaily() {
  Q.finished = true; Q.secs = Math.round((Date.now() - Q.t0) / 1000);
  const s = S();
  if (Q.mode === 'tryout') { Q.firstToday = false; return; } // simulasi tidak mengubah Api Belajar dan poin
  s.flagged = [...new Set([...s.flagged, ...Q.wrong])].slice(-4);
  if (Q.path) s.pathStep = (s.pathStep || 0) + 1;
  Q.firstToday = !isDone();
  if (Q.firstToday) {
    s.doneDate = toISO(today());
    s.streak += 1; s.bestStreak = Math.max(s.bestStreak, s.streak);
    if (!s.studyDates.includes(toISO(today()))) s.studyDates.push(toISO(today()));
    s.userDays = Math.min(4, s.userDays + 1); s.sessions += 1;
    const ms = CP.milestone(s.streak); if (ms) ribbon(ms);
    Q.got = addPoints(20, 'Misi harian selesai');
    if (s.scoreState === 'calibrating' && s.sessions >= 3) { s.scoreState = 'terukur'; ribbon('Skormu sekarang sudah Terukur!'); }
    checkSquadGoal();
  } else if (Q.path) {
    Q.got = addPoints(5, 'Langkah jalur belajar');
  }
  St.save();
}
function viewDailyDone() {
  const t = Q.secs || 0; const time = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  const tiles = (pts) => `<div class="stat-tiles"><div class="st gold"><b>Poin</b><span>${icon('coin', 18)} +${pts}</span></div>
    <div class="st blue"><b>Akurasi</b><span>${Q.right * 10}%</span></div><div class="st orange"><b>Waktu</b><span>${icon('clock', 18)} ${time}</span></div></div>`;
  if (Q.mode === 'tryout') return `<div class="done-screen"><div class="done-confetti" id="done-confetti"></div><div style="display:grid;justify-items:center;gap:8px">
      ${mascot(Q.right >= 7 ? 'proud' : 'cheer', 150)}<h1>Simulasi selesai!</h1><p class="muted">${esc(Q.cardName)}</p>${tiles(0)}
      <p class="small muted">Simulasi nggak mengubah Api Belajar dan poinmu. Santai, ini buat latihan.</p>
      <a class="btn primary xl" href="#/kartu?sub=saya">Kembali ke Kartu Ujian</a></div></div>`;
  return `<div class="done-screen"><div class="done-confetti" id="done-confetti"></div><div style="display:grid;justify-items:center;gap:8px">
      ${mascot(Q.right >= 7 ? 'proud' : 'cheer', 150)}<h1>${Q.path ? 'Langkah beres!' : 'Misi harian beres!'}</h1>
      <p class="muted">${Q.firstToday ? `Api Belajar ${S().streak} hari. Besok lanjut lagi ya!` : 'Latihan tambahan tercatat. Mantap!'}</p>${tiles(Q.got || 0)}
      ${Q.wrong.length ? `<p class="small muted">Masuk Radar Skill: ${[...new Set(Q.wrong)].map(esc).join(', ')}</p>` : '<p class="small muted">Semua jawabanmu tepat. Sempurna!</p>'}
      <div class="btn-row" style="justify-content:center"><button class="btn" data-act="share-squad">${icon('share')} Bagikan ke squad</button><a class="btn primary xl" href="#/beranda">Lanjut</a></div></div></div>`;
}
function confettiIn(box) {
  if (!box || S().reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['var(--gold)', 'var(--blue)', 'var(--orange)'];
  for (let i = 0; i < 36; i++) {
    const c = document.createElement('span'); c.className = 'confetti';
    c.style.left = `${Math.random() * 100}%`; c.style.background = colors[i % 3]; c.style.animationDelay = `${Math.random() * .8}s`;
    box.appendChild(c); setTimeout(() => c.remove(), 3200);
  }
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
      ${waCard()}${voiceCard()}<div class="card"><h2 style="margin-bottom:8px">Teman Belajar-mu</h2><p class="finding">${icon('heart')}<span><b>Bella</b> ${S().squadAllDone ? 'udah selesai hari ini.' : 'udah nyelesain 3 dari 4 hari.'} Kalian saling ngingetin, bukan saingan.</span></p></div></div></div></div>`;
}
function waCard() {
  return `<div class="card wa-card"><div class="say">${mascot('cheer', 56)}<div><h2>Join Channel Terang</h2><p class="small">Info tryout, tips belajar, dan pengumuman terbaru langsung di WhatsApp-mu.</p></div></div>
    <a class="btn wa block" href="${D.WA_CHANNEL}" target="_blank" rel="noopener" style="margin-top:12px">${icon('chat', 18)} Join WhatsApp Channel</a></div>`;
}
// Voice channel squad ala server komunitas (Premium, khusus 18+). Prototipe: tanpa audio sungguhan.
const VC = { on: null, mute: false };
const CHANNELS = [['ruang-fokus', 'Fokus bareng, mic nyala seperlunya', 6], ['bahas-soal', 'Diskusi soal yang bikin mentok', 3], ['pomodoro-malam', '25 menit fokus, 5 menit ngobrol', 9]];
function voiceCard() {
  const prem = EX.isPremium(); const adult = S().age === '18+'; const open = prem && adult;
  const list = CHANNELS.map(([n, d, k]) => `<button class="vc-ch${VC.on === n ? ' on' : ''}" data-act="vc-join" data-n="${n}" ${open ? '' : 'disabled'}>${icon('headset', 18)}<span class="vc-t"><b># ${n}</b><small>${d}</small></span><span class="vc-n">${icon('users', 14)} ${k + (VC.on === n ? 1 : 0)}</span></button>`).join('');
  const live = VC.on ? `<div class="vc-live"><p>${icon('wave', 18)} Tersambung ke <b>#${VC.on}</b> · mic ${VC.mute ? 'mati' : 'nyala'}</p><p class="small muted">Demo prototipe, belum ada suara sungguhan.</p>
    <div class="btn-row"><button class="btn small" data-act="vc-mute">${VC.mute ? 'Nyalakan mic' : 'Matikan mic'}</button><button class="btn small" data-act="vc-leave">Keluar channel</button></div></div>` : '';
  const foot = !prem ? `<button class="btn lock-btn block" data-act="feat-open" data-id="voice">${icon('lock', 16)} Unlock dengan Premium</button>`
    : !adult ? '<p class="small muted">Voice channel khusus pengguna 18 tahun ke atas.</p>' : '';
  return `<div class="card vc${open ? '' : ' vc-locked'}"><div class="card-head"><h2>${icon('headset')} Voice Channel Squad</h2>${prem ? '<span class="pill gold">Premium</span>' : lockChip()}</div>
    <p class="small muted">Belajar bareng sambil ngobrol pakai suara, kayak server komunitas. Dimoderasi dan khusus 18+.</p>
    <div class="vc-list">${list}</div>${live}${foot}</div>`;
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
  const list = D.PLAYBOOKS.filter((p) => p.exam === 'Umum' || p.exam === s.target).map((p) => `<div class="item"><div><b>${esc(p.title)}</b>
    <p class="small muted">${esc(p.by)} · ${p.min} menit baca · ditinjau tim Terang</p></div><button class="btn small" data-act="pb-open" data-id="${p.id}">Baca</button></div>`).join('');
  return `<div class="page-head"><div><h1>Poin & Jurus Alumni</h1><p>Poin dikasih buat kemajuan nyata, bukan lamanya kamu nongkrong di layar.</p></div></div>
    <div class="stack"><div class="grid cols-2" style="align-items:start">
      <div class="stack"><div class="card"><div class="say">${mascot('happy', 64)}<div><p class="muted">Saldo poin</p><div class="balance">${s.points.toLocaleString('id-ID')}</div></div></div>
        <p class="small muted" style="margin:10px 0 6px">Batas poin bulan ini: ${s.earnedMonth} dari ${D.MONTH_CAP}</p>
        <div class="bar gold" role="progressbar" aria-valuemin="0" aria-valuemax="${D.MONTH_CAP}" aria-valuenow="${s.earnedMonth}"><i style="width:${Math.min(100, (s.earnedMonth / D.MONTH_CAP) * 100)}%"></i></div></div>
        <div class="card">${premium}${s.vouchers ? `<p class="small" style="margin-top:8px">${icon('ticket', 16)} Voucher diskon 20%: ${s.vouchers} buah</p>` : ''}</div></div>
      <div class="card"><h2 style="margin-bottom:6px">Cara dapet poin</h2>${D.EARN_RULES.map(([a, b]) => `<div class="item"><span>${a}</span><span class="tag">${b}</span></div>`).join('')}</div></div>
    <div class="card"><h2 style="margin-bottom:6px">Katalog Hadiah</h2>${cat}<p class="small muted" style="margin-top:8px">Nggak ada hadiah uang tunai. Hadiah dari mitra masih contoh.</p></div>
    <div id="pass">${PS.passSection()}</div>
    <div class="card"><h2 style="margin-bottom:6px">Jurus Alumni</h2>${list}
      <p class="small muted" style="margin-top:8px">Konten contoh buat prototipe, bukan dari alumni sungguhan.</p></div>
    <div class="card"><div class="say">${mascot('cheer', 56)}<div><h2>Ajak Teman, Dapet Poin</h2><p class="small muted">Bagikan kodemu. Tiap teman yang gabung dan selesaiin cek posisi, kalian berdua dapet bonus poin (jumlahnya contoh).</p></div></div>
      <div class="btn-row" style="margin-top:12px"><span class="refcode">${esc(s.refCode)}</span><button class="btn small" data-act="copy-ref">${icon('link', 16)} Salin kode</button></div></div>
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

/* ------------------------------------------------------------------ PROFIL */
function viewProfile(params) {
  const s = S(); const minor = s.age !== '18+'; const tab = params.get('tab') === 'eksplor' ? 'eksplor' : 'pengaturan';
  const tabs = `<div class="chips tabs" role="tablist"><a class="chip tab${tab === 'pengaturan' ? ' on' : ''}" href="#/profil" role="tab" aria-selected="${tab === 'pengaturan'}">${icon('user', 16)} Pengaturan</a>
    <a class="chip tab${tab === 'eksplor' ? ' on' : ''}" href="#/profil?tab=eksplor" role="tab" aria-selected="${tab === 'eksplor'}">${icon('sparkle', 16)} Eksplor Kategori Lain</a></div>`;
  const head = `<div class="page-head"><div><h1>Profil</h1><p>Pengaturan, target ujian, dan jelajah Terang AI</p></div></div>`;
  if (tab === 'eksplor') return `${head}<div class="stack">${tabs}${EX.viewExploreTab()}</div>`;
  const reminders = CP.REMINDERS.map((r) => `<div class="item"><div><span class="tag">${esc(r.when)}</span><p style="margin-top:4px"><b>${esc(r.title)}</b></p><p class="small muted">${esc(r.body)}</p></div></div>`).join('');
  return `${head}<div class="stack">${tabs}<div class="grid cols-2" style="align-items:start"><div class="card"><h2 style="margin-bottom:12px">Profilmu</h2>
      <div class="field"><label for="p-name">Nama</label><input id="p-name" type="text" value="${esc(s.name)}" maxlength="30" data-change="set-name"></div>
      <div class="field"><label>Target ujian</label><div class="chips" role="group" aria-label="Target ujian">${Object.entries(D.TARGETS).map(([k, v]) => `<button class="chip" data-act="set-target" data-k="${k}" aria-pressed="${s.target === k}">${v.short}</button>`).join('')}</div>
      <span class="small muted">${esc(cfg().label)} · subtes ${cfg().subtes}. Mau belajar hal lain? Buka <a href="#/profil?tab=eksplor">Eksplor Kategori Lain</a>.</span></div>
      <div class="field"><label for="p-date">Tanggal ujian</label><input id="p-date" type="date" value="${s.examDate}" data-change="set-date"></div>
      <div class="field"><label for="p-age">Kelompok usia</label><select id="p-age" data-change="set-age"><option value="u16" ${s.age === 'u16' ? 'selected' : ''}>Di bawah 16</option><option value="16-17" ${s.age === '16-17' ? 'selected' : ''}>16–17</option><option value="18+" ${s.age === '18+' ? 'selected' : ''}>18 ke atas</option></select>
      <span class="small muted">Fitur sosial dibuka bertahap sesuai usia (PP Tunas, UU PDP Pasal 25).</span></div></div>
    <div class="stack"><div class="card"><h2 style="margin-bottom:12px">Tampilan</h2>
      <div class="seg theme-seg" role="group" aria-label="Mode tampilan"><button data-act="theme" data-k="light" aria-pressed="${s.theme !== 'dark'}">${icon('sun', 16)} Terang</button><button data-act="theme" data-k="dark" aria-pressed="${s.theme === 'dark'}">${icon('moon', 16)} Gelap</button></div>
      <label class="check" style="margin-top:14px"><input type="checkbox" data-change="set-motion" ${s.reduceMotion ? 'checked' : ''}><span>Kurangi gerakan (animasi dimatikan)</span></label></div>
    <div class="card"><h2 style="margin-bottom:12px">Pengingat</h2>
      <div class="field"><label for="p-hour">Jam belajar biasanya</label><select id="p-hour" data-change="set-hour">${[6, 12, 16, 19, 21].map((h) => `<option value="${h}" ${h === s.reminderHour ? 'selected' : ''}>${String(h).padStart(2, '0')}.00</option>`).join('')}</select></div>
      <div class="field"><label for="p-ch">Lewat mana?</label><select id="p-ch" data-change="set-channel"><option value="inapp" ${s.channel === 'inapp' ? 'selected' : ''}>Notifikasi di aplikasi</option><option value="wa" ${s.channel === 'wa' ? 'selected' : ''} ${minor ? 'disabled' : ''}>WhatsApp (khusus pengguna dewasa)</option></select></div></div>
    <div class="card"><h2 style="margin-bottom:4px">Menu lainnya</h2><div class="btn-row" style="margin-top:8px"><a class="btn small" href="#/kartu">${icon('ticket', 16)} Kartu Ujian</a><a class="btn small" href="#/passport">${icon('passport', 16)} Paspor Belajar</a><a class="btn small" href="#/laporan">${icon('chart', 16)} Rapor Mingguan</a></div>
      <p class="small muted" style="margin-top:10px">Kredit AI: ${s.credits.toLocaleString('id-ID')} · ${premiumLeft() > 0 ? `Premium sisa ${premiumLeft()} hari` : 'Paket Gratis'}</p></div></div></div>
    <div class="card"><h2 style="margin-bottom:4px">Contoh pengingat dari Terang</h2><p class="small muted" style="margin-bottom:8px">Pengingat selalu bisa kamu atur dan nggak pernah menyalahkan. Ini gambaran isinya.</p>${reminders}</div>
    <div class="demo"><h2 style="margin-bottom:4px">Panel Demo</h2><p class="small muted" style="margin-bottom:12px">Buat nyobain berbagai keadaan layar tanpa nunggu. Cuma ada di prototipe.</p>
      <div class="label small" style="margin-bottom:6px">Keadaan skor</div><div class="seg" role="group" aria-label="Keadaan skor">${['calibrating', 'terukur', 'terkalibrasi'].map((k) => `<button data-act="demo-state" data-k="${k}" aria-pressed="${s.scoreState === k}">${stateLabel(k)}</button>`).join('')}</div>
      <div class="btn-row" style="margin-top:14px"><button class="btn small" data-act="demo-risk">${s.forceRisk ? 'Matikan' : 'Simulasikan'} Api Belajar hampir padam</button>
      <button class="btn small" data-act="demo-exam">Simulasikan ujian udah lewat</button><button class="btn small" data-act="demo-near">Simulasikan ujian 10 hari lagi</button>
      <button class="btn small" data-act="demo-squad">Squad selesai semua</button><button class="btn small" data-act="demo-premium">${premiumLeft() > 0 ? 'Matikan' : 'Aktifkan'} Premium</button><button class="btn small" data-act="demo-onboard">Ulangi onboarding</button><button class="btn small" data-act="demo-reset">Reset data demo</button></div></div></div>`;
}

/* ------------------------------------------------------------------ router & render */
const VIEWS = {
  beranda: viewHome, laporan: viewReport, daily: viewDaily, 'lapor-hasil': viewResult, squad: viewSquad, poin: viewPoints, passport: viewPassport,
  profil: viewProfile, onboarding: OBD.viewOnboarding, mulai: OBD.viewLanding, tanya: AI.viewTanya, english: EN.viewEnglish, interview: AI.viewInterview, review: AI.viewReview, ai: AI.viewAi, kartu: KT.viewKartu,
};
const TITLES = { english: 'English Lab', mulai: 'Belajar Bareng Nyala', laporan: 'Rapor Mingguan', daily: 'Misi Harian', 'lapor-hasil': 'Lapor Hasil', onboarding: 'Selamat Datang', ai: 'Artificial Intelligence', passport: 'Paspor Belajar' };
let current = 'beranda';
const BARE_PUBLIC = ['mulai', 'onboarding']; // boleh dibuka sebelum onboarding
const BARE = ['mulai', 'onboarding', 'daily']; // layar fokus tanpa navigasi
function render(keepScroll) {
  const [path, qs] = (location.hash.replace(/^#\//, '') || 'beranda').split('?');
  current = VIEWS[path] ? path : 'beranda';
  if (!S().onboarded && !BARE_PUBLIC.includes(current)) { location.hash = '#/mulai'; return; }
  const bare = BARE.includes(current);
  document.body.dataset.bare = bare ? '1' : '0';
  const main = $('#main'); const y = window.scrollY;
  main.innerHTML = VIEWS[current](new URLSearchParams(qs || ''));
  renderNav(current); renderTopbar(current);
  $('#nav').hidden = bare; $('#topbar').hidden = bare;
  document.title = `Terang AI — ${titleOf(current)}`;
  requestAnimationFrame(() => {
    if (current !== 'mulai') $$('.ring-val').forEach((c) => { c.style.strokeDasharray = `${c.dataset.target} 100`; });
    OBD.after(current);
    if ($('#done-confetti') && !$('#done-confetti').dataset.done) { $('#done-confetti').dataset.done = '1'; confettiIn($('#done-confetti')); }
    if (current === 'squad') { tickRoom(); if (!SQ.timer) SQ.timer = setInterval(tickRoom, 1000); }
    AI.after();
    if (current === 'beranda' && !S().toured) tourStep(0);
  });
  if (keepScroll) window.scrollTo(0, y); else { window.scrollTo(0, 0); }
}
hooks.render = (keep) => render(keep);
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
  notif: () => notifDialog(),
  topup: () => AI.topupDialog(),
  'copy-ref': async () => { try { await navigator.clipboard.writeText(S().refCode); ribbon('Kode disalin. Tinggal bagikan!'); } catch (e) { ribbon(`Kodemu: ${S().refCode}`); } },
  'set-target': (el) => {
    const s = S(); s.target = el.dataset.k; s.examDate = toISO(addDays(today(), D.TARGETS[s.target].days)); s.flagged = []; St.save(); Q = null;
    ribbon(`Target diganti ke ${D.TARGETS[s.target].label}`); render(true);
  },
  'demo-premium': () => { const s = S(); if (premiumLeft() > 0) { s.premiumUntil = null; } else { s.premiumUntil = toISO(addDays(today(), 7)); s.trialClaimed = true; } St.save(); render(true); },
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
  train: (el) => { Q = null; if (EN.isVoiceTopic(el.dataset.topic)) { location.hash = '#/english'; return; } location.hash = `#/daily?topic=${encodeURIComponent(el.dataset.topic)}`; },
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
  'demo-onboard': () => { St.S.onboarded = false; Object.assign(OB, { step: 0, date: '', i: 0, picked: null, wrong: [], target: 'CPNS' }); St.save(); location.hash = '#/onboarding'; render(); },
  'demo-reset': () => { resetFor({}); Q = null; applyTheme(); ribbon('Data demo direset'); location.hash = '#/beranda'; render(); },
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
    resetFor({ target: s.target, name: s.name, points: s.points, earnedMonth: s.earnedMonth, ledger: s.ledger, age: s.age, premiumUntil: s.premiumUntil, trialClaimed: s.trialClaimed, vouchers: s.vouchers,
      credits: s.credits, cards: s.cards, payments: s.payments, refCode: s.refCode,
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
  'share-consent': () => { const ok = $('#sh-c1').checked && (!$('#sh-c2') || $('#sh-c2').checked); $('#sh-go').disabled = !ok; },
};
Object.assign(ACT, AI.acts, KT.acts, EX.acts, OBD.acts, EN.acts, PS.acts); // aksi dari modul fitur
Object.assign(CHG, OBD.changes);
ACT.poke = (el) => { OBD.acts.poke(el); const l = $('#hero-line'); if (l) l.innerHTML = CP.POKE[Math.floor(Math.random() * CP.POKE.length)]; };
ACT.node = (el) => {
  const i = +el.dataset.i; const step = S().pathStep || 0;
  if (i > step) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); ribbon('Selesaikan langkah sebelumnya dulu ya'); return; }
  Q = null;
  if (EN.isVoiceTopic(el.dataset.topic) && i % 4 !== 3) { if (i === step && EX.isPremium()) { S().pathStep = step + 1; St.save(); } location.hash = '#/english'; return; }
  if (i < step) { location.hash = `#/daily?topic=${encodeURIComponent(el.dataset.topic)}`; return; } // ulang latihan
  if (i % 4 === 3) { S().pathStep = step + 1; const got = addPoints(15, 'Peti hadiah jalur belajar'); St.save(); ribbon(`Peti dibuka! +${got} poin`); render(true); return; }
  location.hash = `#/daily?topic=${encodeURIComponent(el.dataset.topic)}&path=1`;
};
ACT['vc-join'] = (el) => { VC.on = el.dataset.n; VC.mute = false; ribbon(`Masuk #${VC.on}. Selamat belajar bareng!`); render(true); };
ACT['vc-mute'] = () => { VC.mute = !VC.mute; render(true); };
ACT['vc-leave'] = () => { VC.on = null; render(true); };
const TOUR = [
  ['cheer', () => `Hai${S().name ? ', ' + esc(S().name) : ''}! Aku <b>Nyala</b>.`, 'Aku bakal nemenin kamu sampai hari ujian. Yuk tur kilat 5 langkah, nggak sampai semenit.'],
  ['think', () => 'Ini Skor Siap-mu', 'Angka seberapa siap kamu. Kalau datanya belum cukup, aku bilang jujur: "Lagi Kenalan". Makin sering latihan, makin akurat.'],
  ['happy', () => 'Jalur Belajar & Misi Harian', 'Tiap hari, selesaikan satu langkah. Cuma 10 soal. Api Belajarmu nyala terus, dan ada peti hadiah di ujung tiap unit.'],
  ['cheer', () => 'Kamu nggak belajar sendirian', 'Di #SquadTerang ada teman dengan target yang sama, tanpa ranking. Gabung juga WhatsApp Channel Terang buat info terbaru.'],
  ['proud', () => 'Mentok? Ada AI', 'Tanya AI kapan aja, latihan wawancara bareng Professor Terra, atau cek esaimu di Review Dokumen. Siap? Gas!'],
];
function tourStep(i) {
  const [mood, title, body] = TOUR[i];
  openDlg(`${title()}`, `<div class="tour">${mascot(mood, 110)}<p>${body}</p>
    <div class="tour-dots">${TOUR.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="btn-row" style="justify-content:space-between;width:100%">${i < TOUR.length - 1 ? '<button class="btn" data-act="tour-skip">Lewati</button>' : '<span></span>'}
    ${i === 3 ? `<a class="btn" href="${D.WA_CHANNEL}" target="_blank" rel="noopener">Join WhatsApp</a>` : ''}
    <button class="btn primary" data-act="tour-next" data-i="${i + 1}">${i < TOUR.length - 1 ? 'Lanjut' : 'Ayo mulai!'}</button></div></div>`);
}
ACT['tour-next'] = (el) => { const i = +el.dataset.i; if (i >= TOUR.length) { S().toured = true; St.save(); closeDlg(); ribbon('Selamat belajar! Nyala nemenin terus.'); return; } tourStep(i); };
ACT['tour-skip'] = () => { S().toured = true; St.save(); closeDlg(); };
ACT['path-all'] = () => { PATH_ALL.on = !PATH_ALL.on; render(true); };
ACT['demo-onboard'] =() => { St.S.onboarded = false; OBD.resetOnboarding(); St.save(); location.hash = '#/mulai'; render(); };
document.addEventListener('keydown', (e) => {
  if (e.target.matches && e.target.matches('input, textarea, select')) {
    if (current === 'onboarding' && e.key === 'Enter' && e.target.id === 'ob-name') { e.preventDefault(); ACT['ob-next'](); }
    return;
  }
  if (current === 'onboarding') return OBD.onKey(e);
  if (current === 'daily' && Q && !Q.finished) {
    if (/^[1-4]$/.test(e.key) && Q.picked == null) { const b = $(`[data-act="pick"][data-i="${+e.key - 1}"]`); if (b) b.click(); }
    else if (e.key === 'Enter' && Q.picked != null) { e.preventDefault(); ACT.next(); }
  }
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-submit]');
  if (f && AI.subs[f.dataset.submit]) { e.preventDefault(); AI.subs[f.dataset.submit](); }
});
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
