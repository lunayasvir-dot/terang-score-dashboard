// Demo interaktif di landing: "Lihat Terang AI bekerja".
// Pemutar bergaya story: tiap bab satu fitur, jalan otomatis, bisa dijeda, dan tiap layar bisa disentuh.
// Isi fitur mengikuti terang.ai (Kartu Ujian, latihan + hint AI, Flashcard, simulasi ujian, pembahasan +
// konsultan AI, wawancara suara bersama Professor Terra, Smart Performance Insights) + lapisan Terang Score.
// Semua tampilan di sini simulasi, bukan rekaman aplikasi asli.
import { icon, mascot } from './icons.js';
import { esc } from './state.js';
import { $, $$ } from './ui.js';

export const CHAPTERS = [
  { id: 'kartu', ic: 'ticket', name: 'Pilih Kartu Ujian', short: 'Kartu Ujian', url: 'my-exams', go: '#/kartu', blurb: 'Pilih paket simulasi. Tiap kartu jelas isinya: subtes, jumlah soal, passing grade, dan waktunya.' },
  { id: 'hint', ic: 'sparkle', name: 'Latihan + Hint AI', short: 'Hint AI', url: 'latihan', go: '#/daily', blurb: 'Latihan dulu sebelum simulasi. Mentok? Minta hint ke AI, bukan langsung kunci jawaban.' },
  { id: 'flash', ic: 'book', name: 'Flashcard Interaktif', short: 'Flashcard', url: 'flashcard', go: '#/daily', blurb: 'Mau SKS? Santai. Tap buat balik kartu, geser buat lanjut. Belajar kinestetik di mana aja.' },
  { id: 'ujian', ic: 'clock', name: 'Ujian Simulasi', short: 'Simulasi', url: 'ujian', go: '#/kartu?sub=saya', blurb: 'Suasananya dibuat mirip ujian asli. Timer jalan terus dan nggak bisa di-pause.' },
  { id: 'bahas', ic: 'chat', name: 'Pembahasan + Konsultan AI', short: 'Pembahasan', url: 'pembahasan', go: '#/tanya', blurb: 'Pembahasan lengkap tiap soal. Masih bingung? Tanya konsultan AI saat itu juga.' },
  { id: 'voice', ic: 'wave', name: 'Wawancara Suara · Professor Terra', short: 'AI Interview', url: 'ai-interview', go: '#/interview', blurb: 'Ngobrol langsung pakai suara dengan Professor Terra, pewawancara AI yang paham bahasa Indonesia.' },
  { id: 'insight', ic: 'chart', name: 'Smart Performance Insights', short: 'Insights', url: 'insights', go: '#/laporan', blurb: 'Skor performa, rekomendasi belajar, dan materi yang dipilihkan khusus buat kamu.' },
  { id: 'score', ic: 'target', name: 'Terang Score & Jalur Belajar', short: 'Terang Score', url: 'beranda', go: '#/beranda', blurb: 'Lapisan baru: Skor Siap, Misi Harian 10 soal, Api Belajar, dan belajar bareng #SquadTerang.' },
];

const DM = { i: 0, playing: true, sel: 0, hint: false, pick: null, flip: false, card: 0, asked: false, talk: false };
const FLASH = [['Sinonim: "esensial"', 'Mendasar. Sangat penting, inti dari sesuatu.'], ['Deret: 3, 6, 12, 24, …', '48. Tiap angka dikali 2.'], ['Silogisme', 'Dua pernyataan → satu kesimpulan. Gambar himpunannya!']];
const KARTU = [['Penalaran Verbal', 23, 56, 115], ['Penalaran Kuantitatif', 25, 56, 125], ['Pemecahan Masalah', 12, 30, 60]];

function scene(id) {
  if (id === 'kartu') return `<div class="dm-head"><span class="pill outline"><i class="dot-o"></i> LPDP</span><b>Kartu Ujian LPDP · TBS</b></div>
    <div class="dm-rows">${KARTU.map(([n, s, p, m], i) => `<button class="dm-row${DM.sel === i ? ' on' : ''}" data-act="dm-sel" data-i="${i}"><span><b>${n}</b><small>${s} soal</small></span><span class="small">Pass ${p} · Maks ${m}</span>${icon('chevron', 16)}</button>`).join('')}</div>
    <div class="dm-tot"><span>Total <b>60 soal</b></span><span><b>90 menit</b></span><span>Skor maks <b>300</b></span></div>
    <p class="small muted">Dipilih: <b>${KARTU[DM.sel][0]}</b>. Ketuk subtes lain buat lihat rinciannya.</p>`;
  if (id === 'hint') {
    const o = ['Sekolah', 'Buku', 'Murid', 'Kapur'];
    return `<span class="qz-label">Latihan · Analogi Verbal</span><h3 class="dm-q">Dokter : Rumah Sakit = Guru : …</h3>
      <div class="dm-opts">${o.map((x, i) => `<button class="opt${DM.pick == null ? '' : i === 0 ? ' right' : i === DM.pick ? ' wrong' : ''}" data-act="dm-pick" data-i="${i}" ${DM.pick != null ? 'disabled' : ''}><span class="key">${'ABCD'[i]}</span><span>${x}</span></button>`).join('')}</div>
      ${DM.hint ? `<div class="dm-hint">${mascot('think', 36)}<p><b>Hint AI:</b> pikirin hubungan "orang dan tempat kerjanya". Dokter kerja di rumah sakit, guru kerja di…?</p></div>` : `<button class="btn small" data-act="dm-hint">${icon('sparkle', 16)} Minta hint AI</button>`}
      ${DM.pick != null ? `<p class="small" style="margin-top:8px">${DM.pick === 0 ? '<b>Tepat!</b>' : '<b>Belum pas.</b>'} Profesi dan tempat kerjanya.</p>` : ''}`;
  }
  if (id === 'flash') {
    const [f, b] = FLASH[DM.card % FLASH.length];
    return `<div class="fc-wrap"><div class="fc-stack"><span class="fc-ghost g2"></span><span class="fc-ghost"></span>
      <button class="fc${DM.flip ? ' flip' : ''}" data-act="dm-flip" aria-label="Balik kartu"><span class="fc-face front"><small>Kartu ${DM.card % FLASH.length + 1}/${FLASH.length}</small><b>${esc(f)}</b><small>Tap buat lihat jawaban</small></span>
      <span class="fc-face back"><small>Jawaban</small><b>${esc(b)}</b></span></button></div>
      <div class="btn-row" style="justify-content:center"><button class="btn small" data-act="dm-next-card" data-k="lagi">Ulangi nanti</button><button class="btn small primary" data-act="dm-next-card" data-k="hafal">${icon('check', 16)} Udah hafal</button></div></div>`;
  }
  if (id === 'ujian') return `<div class="dm-head"><b>Simulasi TBS LPDP</b><span class="pill gold">${icon('clock', 14)} <span data-tick="down">89:52</span></span></div>
    <p class="small muted">${icon('lock', 14)} Nggak bisa di-pause. Pastiin siap jiwa dan raga.</p>
    <div class="dm-grid">${Array.from({ length: 60 }, (_, i) => `<i class="${i < 11 ? 'a' : i === 11 ? 'c' : ''}">${i + 1}</i>`).join('')}</div>
    <p class="small">Soal 12 dari 60 · 11 terjawab</p>`;
  if (id === 'bahas') return `<div class="dm-hint" style="background:var(--surface-2)">${icon('book', 22)}<p><b>Pembahasan:</b> Diskon 25% dari Rp40.000 = Rp10.000, jadi harganya Rp30.000. Trik cepat: 25% itu seperempat.</p></div>
    <div class="l-chat" style="margin-top:10px">${DM.asked ? `<div class="msg me" style="opacity:1;transform:none"><div class="bubble2"><p>Kalau diskonnya 15% gimana?</p></div></div>
      <div class="msg ai" style="opacity:1;transform:none">${mascot('happy', 30)}<div class="bubble2"><p>10% = 4.000, 5% = 2.000. Jadi diskonnya 6.000, harganya <b>Rp34.000</b>.</p></div></div>`
    : `<button class="btn small" data-act="dm-ask">${icon('chat', 16)} Tanya konsultan AI: "Kalau 15%?"</button>`}</div>
    <p class="small muted" style="margin-top:8px">Bisa juga tanya ke channel WhatsApp Terang.</p>`;
  if (id === 'voice') return `<div class="dm-head"><b>Simulasi Wawancara LPDP</b><span class="pill live">● LIVE</span></div>
    <div class="terra"><div class="terra-av${DM.talk ? ' talk' : ''}"><span>PT</span></div><div><b>Professor Terra</b><small>AI Interview Specialist</small></div></div>
    <div class="wave${DM.talk ? ' on' : ''}" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<i style="--d:${(i * 37) % 10}"></i>`).join('')}</div>
    <p class="dm-quote">"Selamat pagi! Saya Professor Terra. Mari kita mulai dengan perkenalan diri kamu."</p>
    <div class="dm-head"><span class="small muted"><span data-tick="up">00:01</span> / 45:00</span>
    <button class="btn small ${DM.talk ? '' : 'primary'}" data-act="dm-talk">${icon('wave', 16)} ${DM.talk ? 'Selesai bicara' : 'Tekan & bicara'}</button></div>`;
  if (id === 'insight') return `<div class="dm-head"><b>Hasil wawancara</b><span class="dm-big">82<small>/100</small></span></div>
    ${[['Struktur jawaban', 86], ['Kejelasan', 78], ['Relevansi', 88], ['Kepercayaan diri', 72]].map(([n, v]) => `<div class="gap-row"><span class="gap-name">${n}</span><span class="gap-val">${v}</span><div class="bar ${v >= 75 ? '' : 'gold'}"><i class="grow" style="width:${v}%"></i></div></div>`).join('')}
    <p class="small" style="margin-top:8px"><b>Jalur belajar dari AI:</b></p><div class="chips"><span class="tag">Latihan STAR</span><span class="tag">Kontribusi pasca-studi</span><span class="tag">Kurangi kata pengisi</span></div>`;
  return `<div class="dm-score"><div class="ring-sm">${'<svg class="ring" viewBox="0 0 200 200" width="130" height="130"><circle cx="100" cy="100" r="80" pathLength="100" transform="rotate(135 100 100)" stroke-dasharray="75 100" fill="none" stroke="var(--line)" stroke-width="16" stroke-linecap="round"/><circle class="grow-ring" cx="100" cy="100" r="80" pathLength="100" transform="rotate(135 100 100)" stroke-dasharray="51 100" fill="none" stroke="var(--gold)" stroke-width="16" stroke-linecap="round"/><text x="100" y="112" text-anchor="middle" class="ring-num">68</text></svg>'}</div>
    <div><span class="pill band-close">${icon('half', 14)} Dikit Lagi</span><p class="small" style="margin-top:6px">${icon('flame', 14)} Api Belajar 6 hari<br>${icon('users', 14)} Squad 11/20 udah 4 hari</p></div></div>
    <div class="dm-path">${['done', 'done', 'cur', 'lock', 'lock'].map((s, i) => `<i class="${s}" style="--o:${[0, 30, 46, 30, 0][i]}">${icon(s === 'done' ? 'check' : s === 'cur' ? 'zap' : 'lock', 18)}</i>`).join('')}</div>`;
}

function playerHTML() {
  const c = CHAPTERS[DM.i];
  return `<div class="dm-bars" role="tablist" aria-label="Bab demo">${CHAPTERS.map((x, i) => `<button class="dm-bar" role="tab" aria-selected="${i === DM.i}" aria-label="${x.name}" data-act="dm-go" data-i="${i}"><i class="${i < DM.i ? 'full' : i === DM.i ? 'run' : ''}${DM.playing ? '' : ' paused'}"></i></button>`).join('')}</div>
    <div class="dm-stage"><div class="dm-copy"><span class="l-kicker">Bab ${DM.i + 1} dari ${CHAPTERS.length}</span><h3>${icon(c.ic, 22)} ${c.name}</h3><p class="muted">${c.blurb}</p>
      <div class="btn-row"><button class="btn primary" data-act="land-go" data-to="${c.go}">Coba fitur ini</button></div>
      <div class="dm-ctrl"><button class="icon-btn" data-act="dm-prev" aria-label="Bab sebelumnya">${icon('chevron', 20).replace('M9 5l7 7-7 7', 'M15 5l-7 7 7 7')}</button>
      <button class="icon-btn play" data-act="dm-play" aria-label="${DM.playing ? 'Jeda demo' : 'Putar demo'}">${DM.playing ? '<b>❚❚</b>' : '<b>▶</b>'}</button>
      <button class="icon-btn" data-act="dm-next" aria-label="Bab berikutnya">${icon('chevron', 20)}</button><span class="small muted">Sentuh layar di samping, semuanya bisa dicoba.</span></div></div>
    <div class="dm-device"><div class="dm-top"><span class="dots"><i></i><i></i><i></i></span><span class="dm-url">terang.ai/${c.url}</span></div>
      <div class="dm-screen" key="${c.id}">${scene(c.id)}</div></div></div>`;
}

export function demoSection() {
  return `<section class="l-wrap l-demo-sec" id="demo"><div class="l-center"><span class="l-kicker">Live demo</span><h2>Lihat Terang AI bekerja</h2>
    <p class="muted">Delapan fitur dalam dua menit. Jalan sendiri, atau sentuh dan coba langsung.</p></div>
    <div class="dm io" id="demo-player">${playerHTML()}</div></section>`;
}

const FEATS = [
  ['chat', 'Tanya AI', 'Tanya pembahasan soal apa aja, kapan aja.', 4, '#/tanya'],
  ['wave', 'AI Interview', 'Wawancara suara bareng Professor Terra, 45–60 menit.', 5, '#/interview'],
  ['doc', 'Review Dokumen', 'Cek esai, CV, dan surat lamaran sebelum dikirim.', null, '#/review'],
  ['ticket', 'Kartu Ujian', 'UTBK, LPDP, CPNS. Mulai dari yang gratis.', 0, '#/kartu'],
  ['sparkle', 'Latihan + Hint AI', '50+ soal terkurasi, diimprove akademisi terpilih.', 1, '#/daily'],
  ['book', 'Flashcard', 'Tap dan geser buat latihan di mana aja.', 2, '#/daily'],
  ['chart', 'Skill Insights', 'Skor performa dan rekomendasi belajar personal.', 6, '#/laporan'],
  ['book', 'English Lab (IELTS/TOEFL)', 'Pilot: Reading & Writing gratis, Listening & Speaking suara asli.', null, '#/english'],
  ['grad', 'LPDP Navigator 2026', 'Cari, simpan, dan bandingkan program studi tujuan.', null, 'https://terang.ai/'],
  ['users', '#SquadTerang', 'Belajar bareng tanpa peringkat, plus Ruang Belajar Hening.', 7, '#/squad'],
  ['target', 'Terang Score', 'Skor Siap, Misi Harian, dan Jalur Belajar.', 7, '#/beranda'],
  ['gift', 'Poin & Referral', 'Kumpulin poin, ajak teman, tukar Premium.', null, '#/poin'],
  ['passport', 'Paspor Belajar', 'Satu catatan belajar, bisa dibagikan dengan izinmu.', null, '#/passport'],
];
export function featureGrid() {
  return `<section class="l-wrap l-feats"><div class="l-center"><span class="l-kicker">Semua dalam satu aplikasi</span><h2>Mau mulai dari mana?</h2>
    <p class="muted">Pilih fitur yang kamu butuhin, langsung kami antar ke sana.</p></div>
    <div class="feat-grid">${FEATS.map(([ic, n, d, ch, to], k) => `<div class="fg" style="--k:${k}"><span class="stat-ic">${icon(ic, 22)}</span><h3>${n}</h3><p class="small muted">${d}</p>
      <div class="btn-row">${ch != null ? `<button class="btn small" data-act="dm-jump" data-i="${ch}">Lihat demo</button>` : ''}${to.startsWith('http')
    ? `<a class="btn small" href="${to}" target="_blank" rel="noopener">Buka di terang.ai ↗</a>` : `<button class="btn small primary" data-act="land-go" data-to="${to}">Buka</button>`}</div></div>`).join('')}</div></section>`;
}

function repaint() { const p = $('#demo-player'); if (p) p.innerHTML = playerHTML(); }
function go(i) { DM.i = (i + CHAPTERS.length) % CHAPTERS.length; Object.assign(DM, { hint: false, pick: null, flip: false, asked: false, talk: false }); repaint(); }
const hold = () => { DM.playing = false; }; // interaksi = jeda otomatis supaya pengguna bisa mencoba

export const acts = {
  'dm-go': (el) => go(+el.dataset.i),
  'dm-next': () => go(DM.i + 1),
  'dm-prev': () => go(DM.i - 1),
  'dm-play': () => { DM.playing = !DM.playing; repaint(); },
  'dm-jump': (el) => { DM.playing = false; go(+el.dataset.i); $('#demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  'dm-sel': (el) => { hold(); DM.sel = +el.dataset.i; repaint(); },
  'dm-hint': () => { hold(); DM.hint = true; repaint(); },
  'dm-pick': (el) => { hold(); DM.pick = +el.dataset.i; repaint(); },
  'dm-flip': () => { hold(); DM.flip = !DM.flip; repaint(); },
  'dm-next-card': (el) => {
    hold(); const fc = $('.fc');
    if (fc) { fc.classList.add(el.dataset.k === 'hafal' ? 'out-r' : 'out-l'); setTimeout(() => { DM.card += 1; DM.flip = false; repaint(); }, 280); }
  },
  'dm-ask': () => { hold(); DM.asked = true; repaint(); },
  'dm-talk': () => { hold(); DM.talk = !DM.talk; repaint(); },
};

// Bab berikutnya otomatis saat bilah progres bab aktif selesai.
document.addEventListener('animationend', (e) => {
  if (e.target.matches && e.target.matches('.dm-bar i.run') && DM.playing) go(DM.i + 1);
});
// Timer hidup di layar simulasi & wawancara.
let t0 = Date.now();
setInterval(() => {
  const els = $$('[data-tick]'); if (!els.length) { t0 = Date.now(); return; }
  const s = Math.floor((Date.now() - t0) / 1000);
  els.forEach((el) => {
    const v = el.dataset.tick === 'down' ? 89 * 60 + 52 - s : s + 1;
    el.textContent = `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
  });
}, 1000);
