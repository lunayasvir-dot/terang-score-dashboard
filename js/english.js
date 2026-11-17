// English Lab (pilot IELTS & TOEFL): Reading & Writing gratis, Listening & Speaking suara asli = Premium.
// "Suara asli" di prototipe memakai Web Speech API bawaan browser (text-to-speech). Analisis suara di versi final.
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, cfg } from './state.js';
import { TARGETS } from './data.js';
import { $, ribbon, hooks } from './ui.js';
import { isPremium, lockDialog, ALUMNI } from './explore.js';

const S = () => St.S;
const EL = { lq: {}, played: false, sq: 0, talking: false, t: null, left: 120 };
const LISTEN = {
  script: 'Good morning, everyone. Before we start the campus tour, a quick reminder. The library closes at eight tonight, not at ten as usual, because of maintenance. If you need to print anything, please use the computer lab on the second floor.',
  qs: [
    { q: 'What time does the library close tonight?', o: ['Eight', 'Ten', 'Two', 'Nine'], a: 0 },
    { q: 'Where should students print documents?', o: ['In the library', 'In the computer lab', 'At the cafe', 'In the main hall'], a: 1 },
  ],
};
const SPEAK = ['Let\'s talk about your hometown. What do you like most about it?', 'Do you prefer studying alone or with friends? Why?', 'Describe a skill you would like to learn in the future.'];
const WRITE = 'Some people believe universities should focus on preparing students for jobs. Others think universities should focus on knowledge for its own sake. Discuss both views and give your opinion.';

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
function speak(text, onend) {
  if (!canSpeak()) { ribbon('Browser ini belum mendukung suara. Coba Chrome atau Edge.'); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = 0.95;
  if (onend) u.onend = onend;
  window.speechSynthesis.speak(u);
}

function skillCard(ic, name, tag, desc, body) {
  return `<div class="card skill"><div class="card-head"><h2>${icon(ic)} ${name}</h2>${tag}</div><p class="small muted">${desc}</p>${body}</div>`;
}
const free = '<span class="pill tint">Gratis</span>';
const prem = () => (isPremium() ? '<span class="pill gold">Premium aktif</span>' : `<span class="pill gold">${icon('lock', 14)} Premium</span>`);

export function viewEnglish() {
  const eng = cfg().bank === 'eng';
  const head = `<div class="page-head"><div><h1>English Lab <span class="pill gold">PILOT</span></h1><p>Persiapan IELTS & TOEFL: Reading, Listening, Writing, Speaking.</p></div></div>`;
  const switcher = eng ? '' : `<div class="card tint"><div class="say">${mascot('think', 56)}<div><b>Targetmu sekarang ${esc(cfg().label)}.</b><p class="small">Mau latihan bahasa Inggris? Ganti target dulu, materi lain tetap aman.</p>
    <div class="btn-row" style="margin-top:8px"><button class="btn small" data-act="set-target" data-k="IELTS">Ganti ke IELTS</button><button class="btn small" data-act="set-target" data-k="TOEFL">Ganti ke TOEFL</button></div></div></div></div>`;
  const reading = skillCard('book', 'Reading Test', free, 'Bacaan akademik singkat dengan soal pemahaman. Ada pembahasan di tiap soal.',
    `<a class="btn primary block" href="#/daily?topic=Reading">Mulai Reading Test</a>`);
  const writing = skillCard('pen', 'Writing Test', free, 'Latihan Task 2: tulis esai opini 250 kata, lalu cek di Review Dokumen.',
    `<p class="dm-quote small">${esc(WRITE)}</p><div class="btn-row" style="margin-top:10px"><a class="btn block" href="#/review">${icon('doc', 16)} Tulis & cek esaimu</a></div>`);
  let listening;
  if (!isPremium()) {
    listening = skillCard('headset', 'Listening · suara asli', prem(), 'Dengarkan audio penutur asli (aksen British), lalu jawab soalnya. Bisa diputar ulang dua kali.',
      `<div class="wave" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--d:${(i * 37) % 10}"></i>`).join('')}</div><button class="btn lock-btn block" data-act="feat-open" data-id="listening">${icon('lock', 16)} Unlock dengan Premium</button>`);
  } else {
    const qs = LISTEN.qs.map((q, i) => `<p class="small" style="margin:10px 0 6px"><b>${i + 1}. ${esc(q.q)}</b></p><div class="dm-opts">${q.o.map((o, j) => {
      const p = EL.lq[i]; const cls = p == null ? '' : j === q.a ? ' right' : j === p ? ' wrong' : '';
      return `<button class="opt${cls}" data-act="el-lpick" data-q="${i}" data-i="${j}" ${p != null || !EL.played ? 'disabled' : ''}><span class="key">${'ABCD'[j]}</span><span>${o}</span></button>`; }).join('')}</div>`).join('');
    listening = skillCard('headset', 'Listening · suara asli', prem(), 'Dengarkan pengumuman kampus, lalu jawab dua soal. Pakai earphone biar lebih fokus.',
      `<div class="wave${EL.playing ? ' on' : ''}" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--d:${(i * 37) % 10}"></i>`).join('')}</div>
      <button class="btn primary block" data-act="el-play">${icon('headset', 16)} ${EL.played ? 'Putar ulang audio' : 'Putar audio'}</button>${qs}
      ${EL.played ? '' : '<p class="small muted" style="margin-top:8px">Soal kebuka setelah audio diputar.</p>'}`);
  }
  let speaking;
  if (!isPremium()) {
    speaking = skillCard('wave', 'Speaking · Professor Terra', prem(), 'Professor Terra bertanya pakai suara, kamu jawab langsung. Dapat masukan soal kelancaran, kosakata, dan pelafalan.',
      `<div class="terra"><div class="terra-av"><span>PT</span></div><div><b>Professor Terra</b><small>AI Interview Specialist</small></div></div>
      <button class="btn lock-btn block" data-act="feat-open" data-id="speaking" style="margin-top:12px">${icon('lock', 16)} Unlock dengan Premium</button>`);
  } else {
    const m = Math.floor(EL.left / 60), s = EL.left % 60;
    speaking = skillCard('wave', 'Speaking · Professor Terra', prem(), `Part 1 · pertanyaan ${EL.sq + 1} dari ${SPEAK.length}. Dengarkan pertanyaannya, lalu jawab maksimal 2 menit.`,
      `<div class="terra"><div class="terra-av${EL.talking ? ' talk' : ''}"><span>PT</span></div><div><b>Professor Terra</b><small>"${esc(SPEAK[EL.sq])}"</small></div></div>
      <div class="wave${EL.talking ? ' on' : ''}" aria-hidden="true">${Array.from({ length: 22 }, (_, i) => `<i style="--d:${(i * 37) % 10}"></i>`).join('')}</div>
      <div class="dm-head"><span class="pill tint">${icon('clock', 14)} <span id="el-timer">${m}:${String(s).padStart(2, '0')}</span></span>
      <div class="btn-row"><button class="btn small" data-act="el-ask">${icon('headset', 16)} Dengar pertanyaan</button><button class="btn small primary" data-act="el-talk">${EL.talking ? 'Selesai jawab' : 'Mulai jawab'}</button></div></div>
      <p class="small muted">Prototipe: suaramu belum direkam atau dinilai. Versi final menganalisis kelancaran dan pelafalan.</p>`);
  }
  const alumni = ALUMNI.filter((a) => a.exam === 'IELTS' || a.exam === 'TOEFL').map((a) => `<div class="item"><div><b>${esc(a.tag)}</b><p class="small muted">${esc(a.role)}</p></div><button class="btn small" data-act="alumni-qa" data-id="${a.id}">Baca insight</button></div>`).join('');
  return `${head}<div class="stack">${switcher}
    <div class="card tint"><div class="say">${mascot('cheer', 64)}<div><b>Reading dan Writing gratis.</b> Listening dan Speaking pakai suara asli, jadi khusus Premium. Mau nyoba? Ada trial 7 hari di Poin & Jurus.</div></div></div>
    <div class="grid cols-2" style="align-items:start">${reading}${listening}${writing}${speaking}</div>
    <div class="card"><h2 style="margin-bottom:6px">Insight alumni</h2><p class="small muted" style="margin-bottom:6px">Cerita singkat dari yang udah ngelewatin. Konten contoh.</p>${alumni}</div></div>`;
}

export const acts = {
  'el-play': () => {
    EL.playing = true; EL.played = true; hooks.render(true);
    speak(LISTEN.script, () => { EL.playing = false; hooks.render(true); });
  },
  'el-lpick': (el) => { EL.lq[+el.dataset.q] = +el.dataset.i; hooks.render(true); },
  'el-ask': () => speak(SPEAK[EL.sq]),
  'el-talk': () => {
    if (EL.talking) {
      EL.talking = false; clearInterval(EL.t); EL.sq = (EL.sq + 1) % SPEAK.length; EL.left = 120;
      ribbon('Jawaban tercatat. Lanjut ke pertanyaan berikutnya!'); hooks.render(true); speak(SPEAK[EL.sq]); return;
    }
    EL.talking = true; EL.left = 120; hooks.render(true);
    clearInterval(EL.t);
    EL.t = setInterval(() => {
      const el = $('#el-timer'); if (!el || !EL.talking) { clearInterval(EL.t); return; }
      EL.left = Math.max(0, EL.left - 1); el.textContent = `${Math.floor(EL.left / 60)}:${String(EL.left % 60).padStart(2, '0')}`;
      if (!EL.left) acts['el-talk']();
    }, 1000);
  },
};
export const isVoiceTopic = (t) => t === 'Listening' || t === 'Speaking';
export { TARGETS };
