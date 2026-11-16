// "Eksplor Kategori Lain": Terang AI untuk belajar di luar ujian, tanya alumni, dan fitur Premium (terkunci).
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc, today, addDays, toISO, premiumLeft } from './state.js';
import { ribbon, openDlg, closeDlg, hooks, lockChip } from './ui.js';

export const isPremium = () => premiumLeft() > 0;

export const CATEGORIES = [
  { id: 'umum', ic: 'book', name: 'Mapel Umum', desc: 'Matematika, IPA, bahasa, dan IPS dari SD sampai SMA. Nggak lagi ujian pun tetap seru buat dipelajari.', topics: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Indonesia', 'Bahasa Inggris', 'Ekonomi'] },
  { id: 'kuliah', ic: 'grad', name: 'Mata Kuliah', desc: 'Bingung sama materi kuliah? Minta dijelasin pelan-pelan, lengkap sama contoh soal.', topics: ['Kalkulus', 'Statistika', 'Pengantar Akuntansi', 'Algoritma', 'Ekonomi Mikro', 'Fisika Dasar'] },
  { id: 'karier', ic: 'doc', name: 'Karier & Seleksi Kerja', desc: 'Dari CV dan surat lamaran sampai latihan wawancara kerja.', topics: ['CV', 'Surat Lamaran', 'Wawancara Kerja', 'Psikotes'] },
  { id: 'beasiswa', ic: 'trophy', name: 'Beasiswa Lain', desc: 'Esai, rencana studi, dan wawancara buat beasiswa di luar LPDP.', topics: ['Esai Motivasi', 'Rencana Studi', 'Wawancara Beasiswa'] },
  { id: 'harian', ic: 'sparkle', name: 'Aktivitas Harian', desc: 'Merangkum bacaan, bikin jadwal, nyiapin presentasi, sampai nulis laporan.', topics: ['Rangkum Bacaan', 'Jadwal Belajar', 'Presentasi', 'Menulis Laporan'] },
];

// Alumni contoh. Nama dan cerita fiktif untuk prototipe.
export const ALUMNI = [
  {
    id: 'jerome', name: 'Jerome', tag: '#TerangiBersamaJerome', role: 'Mahasiswa Teknik Sipil, penerima beasiswa (contoh)',
    subjects: ['Kalkulus', 'Fisika Dasar', 'Statistika'],
    qa: [
      { q: 'Gimana cara belajar kalkulus biar nggak panik?', a: 'Mulai dari konsep, bukan rumus. Gambar grafiknya dulu, baru hitung. Habis itu kerjain soal dari yang paling gampang, dan jangan skip langkah kecil.' },
      { q: 'Dosen jelasin cepet banget, aku ketinggalan. Gimana?', a: 'Rekam penjelasannya kalau boleh, lalu ulangi materinya malam itu juga. Dua puluh menit review di hari yang sama lebih ampuh daripada dua jam sebelum ujian.' },
    ],
  },
  {
    id: 'alya', name: 'Alya', tag: '#TerangiBersamaAlya', role: 'Alumni beasiswa luar negeri (contoh)',
    subjects: ['Esai Motivasi', 'Bahasa Inggris', 'Wawancara Beasiswa'],
    qa: [
      { q: 'Esai motivasiku terasa datar. Mulai dari mana?', a: 'Mulai dari satu momen nyata, bukan kalimat besar. Ceritakan apa yang terjadi, apa yang kamu rasakan, lalu apa yang kamu putuskan buat lakukan.' },
      { q: 'Gimana biar nggak gugup pas wawancara?', a: 'Latihan bersuara, bukan cuma di kepala. Rekam dirimu, dengar ulang, dan siapkan tiga cerita yang bisa dipakai buat banyak pertanyaan.' },
    ],
  },
  {
    id: 'raka', name: 'Raka', tag: '#TerangiBersamaRaka', role: 'ASN, lolos SKD (contoh)',
    subjects: ['TIU', 'TWK', 'Manajemen Waktu'],
    qa: [
      { q: 'TIU numerik bikin waktuku habis. Saran?', a: 'Tandai soal yang butuh lebih dari satu setengah menit, lompat dulu, balik di akhir. Dan latihan deret serta persen tiap hari, karena itu soal yang paling bisa dipercepat.' },
      { q: 'Berapa lama belajar yang ideal buat SKD?', a: 'Buatku sekitar dua sampai tiga bulan dengan ritme konsisten lebih ampuh daripada maraton sebulan. Sepuluh soal tiap hari itu udah banyak banget kalau rutin.' },
    ],
  },
];

export const PREMIUM_FEATURES = [
  { id: 'alumni-chat', ic: 'chat', name: 'Ngobrol Bareng Alumni', desc: 'Tanya jawab langsung dan detail sama alumni yang udah lolos, lewat seri #TerangiBersama.' },
  { id: 'voice', ic: 'headset', name: 'Voice Channel Belajar', desc: 'Ruang belajar bersuara bareng squad. Audio saja, dimoderasi, khusus 18+.', tag: 'Khusus 18+' },
  { id: 'live-class', ic: 'video', name: 'Kelas Live Bareng Alumni', desc: 'Sesi mingguan buat bahas soal, strategi, dan tanya jawab langsung.' },
  { id: 'ai-voice', ic: 'wave', name: 'AI Interview Mendalam', desc: 'Jawab pakai suara, lalu dapat analisis jeda, kejelasan, dan struktur jawabanmu.' },
  { id: 'doc-deep', ic: 'doc', name: 'Review Dokumen Mendalam', desc: 'Masukan per kalimat dan skor detail buat esai, CV, dan surat lamaran.' },
  { id: 'tryout-vip', ic: 'trophy', name: 'Tryout Eksklusif + Pembahasan Video', desc: 'Paket tryout terbatas dengan pembahasan video langkah demi langkah.' },
];

export function claimTrial() {
  const s = St.S; if (s.trialClaimed) return false;
  s.trialClaimed = true; s.premiumUntil = toISO(addDays(today(), 7));
  s.ledger.unshift({ t: 'Klaim: Coba Gratis Premium 7 Hari', p: 0, d: toISO(today()) });
  St.save(); ribbon('Premium 7 hari aktif! Selamat nyobain semuanya.');
  return true;
}

export function lockDialog(id) {
  const f = PREMIUM_FEATURES.find((x) => x.id === id) || { name: 'Fitur Premium', desc: 'Fitur ini khusus pengguna Premium.' };
  openDlg(`${icon('lock', 20)} ${esc(f.name)}`, `${say('cheer', `<b>Wah, ini khusus Premium.</b><br>${esc(f.desc)}`, 64)}
    <p class="small muted">Premium mulai Rp59.000/bulan (harga contoh, belum final). Kamu juga bisa dapetin akses lewat poin.</p>
    <div class="btn-row">${St.S.trialClaimed
    ? '<a class="btn primary" href="#/poin" data-act="dlg-close">Lihat paket Premium</a>'
    : '<button class="btn primary" data-act="claim-trial">Coba gratis 7 hari</button><a class="btn" href="#/poin" data-act="dlg-close">Lihat paket</a>'}</div>
    ${St.S.trialClaimed ? '' : '<p class="small muted">Tanpa kartu, tanpa ribet.</p>'}`);
}

function lockedCard(f) {
  const open = isPremium();
  return `<div class="feat${open ? '' : ' locked'}"><span class="stat-ic gold">${icon(f.ic, 20)}</span>
    <div><b>${esc(f.name)}</b> ${f.tag ? `<span class="tag">${esc(f.tag)}</span>` : ''}<p class="small muted">${esc(f.desc)}</p></div>
    <button class="btn small ${open ? '' : 'lock-btn'}" data-act="feat-open" data-id="${f.id}">${open ? 'Buka' : `${icon('lock', 14)} Unlock`}</button></div>`;
}

export function viewExploreTab() {
  const cats = CATEGORIES.map((c) => `<div class="card cat"><div class="card-head"><span class="stat-ic">${icon(c.ic, 20)}</span><h3 style="flex:1;margin-left:10px">${esc(c.name)}</h3></div>
    <p class="small muted">${esc(c.desc)}</p><div class="chips" style="margin:10px 0">${c.topics.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="btn-row"><button class="btn small" data-act="cat-ask" data-id="${c.id}">${icon('chat', 16)} Tanya AI</button></div></div>`).join('');
  const alumni = ALUMNI.map((a) => `<div class="card alum"><div class="say"><span class="avatar big">${esc(a.name[0])}</span><div><b>${esc(a.tag)}</b>
    <p class="small muted">${esc(a.role)}</p></div></div><div class="chips" style="margin:10px 0">${a.subjects.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <div class="btn-row"><button class="btn small" data-act="alumni-qa" data-id="${a.id}">Baca tanya-jawab</button>
    <button class="btn small ${isPremium() ? '' : 'lock-btn'}" data-act="alumni-chat" data-id="${a.id}">${isPremium() ? 'Ngobrol langsung' : `${icon('lock', 14)} Ngobrol langsung`}</button></div></div>`).join('');
  return `<div class="stack">
    <div class="card tint"><div class="say">${mascot('cheer', 72)}<div><h2>Terang AI nggak cuma buat ujian</h2>
      <p class="muted">Pilih kategori yang kamu butuhin. Mau ngerjain tugas kuliah, ngerapihin CV, atau sekadar ngerangkum bacaan, semuanya bisa.</p></div></div></div>
    <div><h2 style="margin-bottom:10px">Eksplor Kategori Lain</h2><div class="grid cols-3 cats">${cats}</div></div>
    <div><h2>Tanya Alumni <span class="tag">#TerangiBersama</span></h2><p class="small muted" style="margin:4px 0 10px">Jawaban yang lebih detail dari kakak-kakak yang udah ngelewatin. Tanya-jawab terbuka buat semua, ngobrol langsungnya khusus Premium.</p>
      <div class="grid cols-3">${alumni}</div></div>
    <div><h2 style="display:flex;gap:8px;align-items:center">Fitur Advance ${isPremium() ? '<span class="pill gold">Premium aktif</span>' : lockChip('Khusus Premium')}</h2>
      <p class="small muted" style="margin:4px 0 10px">${isPremium() ? 'Semua fitur ini kebuka buat kamu selama Premium aktif.' : 'Buka semuanya lewat Premium. Mau nyoba dulu? Ada trial gratis 7 hari.'}</p>
      <div class="feats">${PREMIUM_FEATURES.map(lockedCard).join('')}</div></div></div>`;
}

export const acts = {
  'claim-trial': () => { claimTrial(); closeDlg(); hooks.render(true); },
  'cat-ask': (el) => { location.hash = `#/tanya?cat=${el.dataset.id}`; },
  'alumni-qa': (el) => {
    const a = ALUMNI.find((x) => x.id === el.dataset.id);
    openDlg(esc(a.tag), `<p class="small muted">${esc(a.role)} · jawaban contoh buat prototipe</p>${a.qa.map((x) => `<div class="qa"><b>${esc(x.q)}</b><p>${esc(x.a)}</p></div>`).join('')}
      <button class="btn small ${isPremium() ? '' : 'lock-btn'}" data-act="alumni-chat" data-id="${a.id}">${isPremium() ? 'Ngobrol langsung' : `${icon('lock', 14)} Mau tanya langsung? Unlock`}</button>`);
  },
  'alumni-chat': (el) => { if (!isPremium()) return lockDialog('alumni-chat'); closeDlg(); location.hash = `#/tanya?persona=${el.dataset.id}`; },
  'feat-open': (el) => {
    const f = PREMIUM_FEATURES.find((x) => x.id === el.dataset.id);
    if (!isPremium()) return lockDialog(f.id);
    if (f.id === 'alumni-chat') { location.hash = '#/tanya?persona=jerome'; return; }
    openDlg(esc(f.name), `${say('proud', `<b>Aktif buat Premium-mu.</b><br>${esc(f.desc)}`, 64)}<p class="small muted">Di prototipe ini tampilan lengkapnya belum dibuat, tapi di versi final fitur ini langsung bisa kamu pakai.</p>`);
  },
};
