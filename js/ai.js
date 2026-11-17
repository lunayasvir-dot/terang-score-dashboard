// Menu "Artificial Intelligence": Tanya AI, AI Interview, Review Dokumen.
// CATATAN: ini PROTOTIPE. Jawaban Tanya AI adalah contoh tertulis, dan penilaian Interview/Review
// memakai aturan sederhana (hitung kata, kalimat, dll), bukan model AI sungguhan.
import { icon, mascot, say } from './icons.js';
import * as St from './state.js';
import { esc } from './state.js';
import { $, ribbon, openDlg, closeDlg, hooks } from './ui.js';
import { CATEGORIES, ALUMNI, isPremium, lockDialog } from './explore.js';

const S = () => St.S;
const fmt = (n) => n.toLocaleString('id-ID');
const COST = { tanya: 20, interview: 50, review: 40 };

function spend(kind) {
  const s = S();
  if (s.credits < COST[kind]) { topupDialog(); return false; }
  s.credits -= COST[kind]; St.save(); return true;
}
export function topupDialog() {
  openDlg('Kredit AI-mu habis', `${say('think', 'Kreditmu lagi kosong nih. Di versi final kamu bisa isi ulang, atau ambil Premium biar lebih lega.', 64)}
    <p class="small muted">Isi ulang belum tersambung di prototipe ini. Buat nyobain, tombol di bawah nambahin kredit demo.</p>
    <div class="btn-row"><button class="btn primary" data-act="topup-demo">Tambah 500 kredit (demo)</button><a class="btn" href="#/poin" data-act="dlg-close">Lihat Premium</a></div>`);
}

const creditChip = () => `<span class="pill tint" title="Kredit AI">${icon('coin', 16)} Kredit AI: ${fmt(S().credits)}</span>`;

/* ------------------------------------------------------------------ TANYA AI */
const KB = [
  { id: 'turunan', q: 'Jelasin turunan fungsi', k: ['turunan', 'derivatif', 'diferensial'], a: '<p>Turunan itu laju perubahan suatu fungsi. Aturan dasarnya: <b>d/dx xⁿ = n·xⁿ⁻¹</b>.</p><ul><li>f(x) = 3x² + 5x → f′(x) = 6x + 5</li><li>Turunan konstanta selalu 0</li><li>Aturan rantai: kalau f(g(x)), turunannya f′(g(x)) · g′(x)</li></ul><p>Mau aku bikinin satu soal latihan?</p>' },
  { id: 'persen', q: 'Cara cepet hitung persen', k: ['persen', 'diskon', '%'], a: '<p>Trik kilat:</p><ul><li>10% = geser koma satu angka (10% dari 450 = 45)</li><li>5% = setengahnya 10%</li><li>25% = seperempat, 50% = setengah</li><li>15% = 10% + 5%</li></ul><p>Contoh: 15% dari 240 → 24 + 12 = <b>36</b>.</p>' },
  { id: 'jadwal', q: 'Bikin jadwal belajar 4 minggu', k: ['jadwal', 'rencana belajar'], a: '<p>Template 4 minggu yang bisa kamu modif:</p><ul><li><b>Minggu 1:</b> petakan topik, kerjain diagnostik, catat tiga yang paling lemah</li><li><b>Minggu 2–3:</b> satu topik lemah per beberapa hari, 10 soal tiap hari</li><li><b>Minggu 4:</b> latihan penuh berwaktu, lalu bedah soal yang salah</li></ul><p>Sisakan satu hari libur tiap minggu. Istirahat itu bagian dari rencana.</p>' },
  { id: 'esai', q: 'Struktur esai beasiswa', k: ['esai', 'motivasi'], a: '<p>Struktur yang aman buat esai beasiswa:</p><ul><li><b>Pembuka:</b> satu momen nyata yang bikin kamu tergerak</li><li><b>Masalah:</b> apa yang kamu lihat dan kenapa penting</li><li><b>Rencana:</b> langkah konkret dan dampak yang bisa diukur</li><li><b>Kenapa kamu:</b> bukti dari pengalamanmu</li><li><b>Penutup:</b> satu kalimat yang berkesan</li></ul><p>Udah punya draf? Coba tempel di <a href="#/review">Review Dokumen</a>.</p>' },
  { id: 'cond', q: 'Bedanya if type 1 dan type 2', k: ['if', 'conditional', 'pengandaian'], a: '<ul><li><b>Type 1</b> (kemungkinan nyata): If + present simple, will + V1 → <i>If it rains, I will stay home.</i></li><li><b>Type 2</b> (pengandaian): If + past simple, would + V1 → <i>If I had more time, I would travel.</i></li></ul><p>Kuncinya: type 1 masih mungkin terjadi, type 2 cuma andai-andai.</p>' },
  { id: 'skd', q: 'Tips ngatur waktu SKD', k: ['skd', 'cpns'], a: '<p>SKD itu 110 soal dalam 100 menit, jadi targetkan sekitar <b>55 detik per soal</b>.</p><ul><li>TIU numerik biasanya paling makan waktu, TKP lebih cepat</li><li>Soal yang bikin mentok lebih dari 90 detik, tandai lalu lanjut</li><li>Sisakan 10 menit terakhir buat balik ke soal yang ditandai</li></ul>' },
  { id: 'silogisme', q: 'Apa itu silogisme?', k: ['silogisme', 'logika'], a: '<p>Silogisme itu penalaran dari dua pernyataan ke satu kesimpulan.</p><ul><li>Semua ASN wajib netral.</li><li>Budi adalah ASN.</li><li>∴ Budi wajib netral.</li></ul><p>Tips: gambar lingkaran himpunan, biasanya langsung kelihatan mana kesimpulan yang pasti benar.</p>' },
  { id: 'hafal', q: 'Cara hafal materi biar nggak lupa', k: ['hafal', 'lupa', 'ingat'], a: '<p>Tiga cara yang paling kebukti:</p><ul><li><b>Active recall:</b> tutup catatan, tulis ulang dari ingatan</li><li><b>Spaced repetition:</b> ulangi di hari ke-1, 3, lalu 7</li><li><b>Ajarin ke orang lain:</b> kalau bisa jelasin, berarti paham</li></ul>' },
  { id: 'mean', q: 'Jelasin mean, median, modus', k: ['mean', 'median', 'modus', 'rata-rata'], a: '<p>Contoh data: <b>2, 3, 3, 5, 7</b></p><ul><li><b>Mean</b> = jumlah ÷ banyak data = 20 ÷ 5 = 4</li><li><b>Median</b> = nilai tengah setelah diurutkan = 3</li><li><b>Modus</b> = yang paling sering muncul = 3</li></ul>' },
  { id: 'presentasi', q: 'Cara nyiapin presentasi', k: ['presentasi'], a: '<ul><li>Tentukan <b>satu pesan utama</b>, jangan lebih</li><li>Susun jadi tiga poin pendukung</li><li>Latihan tiga kali sambil pasang timer</li><li>Siapkan jawaban buat dua pertanyaan yang paling mungkin muncul</li></ul>' },
  { id: 'cv', q: 'Tips nulis CV yang menarik', k: ['cv', 'resume', 'lamaran'], a: '<ul><li>Satu halaman cukup kalau pengalamanmu belum banyak</li><li>Tulis <b>hasil</b>, bukan cuma tugas. Contoh: "Menaikkan peserta acara 40%"</li><li>Mulai tiap poin dengan kata kerja</li><li>Cek ulang ejaan, lalu minta satu orang baca</li></ul>' },
  { id: 'diri', q: 'Cara jawab "ceritakan tentang dirimu"', k: ['tentang dirimu', 'perkenalan', 'wawancara'], a: '<p>Pakai rumus <b>Sekarang – Dulu – Nanti</b>:</p><ul><li><b>Sekarang:</b> kamu lagi ngapain dan apa keahlianmu</li><li><b>Dulu:</b> satu pengalaman yang membentuk kamu</li><li><b>Nanti:</b> apa yang mau kamu capai dan kenapa posisi ini</li></ul><p>Cukup 60–90 detik. Latihan di <a href="#/interview">AI Interview</a> yuk.</p>' },
];
const SUGG = {
  ujian: ['skd', 'silogisme', 'persen'], umum: ['cond', 'persen', 'hafal'], kuliah: ['turunan', 'mean', 'hafal'],
  karier: ['cv', 'diri', 'jadwal'], beasiswa: ['esai', 'diri', 'cond'], harian: ['jadwal', 'presentasi', 'hafal'],
};
const CH = { key: '', msgs: [], cat: 'ujian', persona: null, typing: false };

function initChat(params) {
  const persona = params.get('persona'); const cat = params.get('cat') || 'ujian';
  const key = `${persona || ''}|${cat}`;
  if (key === CH.key) return;
  CH.key = key; CH.cat = cat; CH.persona = persona; CH.typing = false;
  if (persona) {
    const a = ALUMNI.find((x) => x.id === persona);
    CH.msgs = [{ who: 'ai', html: `<p>Hai! Aku ${esc(a.name)}. Tanya apa aja soal ${a.subjects.map(esc).join(', ')}, ya. Santai aja, nggak ada pertanyaan yang receh.</p>` }];
  } else {
    const c = CATEGORIES.find((x) => x.id === cat);
    CH.msgs = [{ who: 'ai', html: `<p>Hai! Aku Terang AI. ${c ? `Kita lagi di kategori <b>${esc(c.name)}</b>. ` : ''}Mau belajar apa hari ini? Tanya apa aja, atau pilih salah satu di bawah.</p>` }];
  }
}
function answer(text, id) {
  const t = text.toLowerCase(); let best = id ? KB.find((k) => k.id === id) : null; let score = best ? 99 : 0;
  if (!best) for (const it of KB) { const n = it.k.filter((w) => t.includes(w)).length; if (n > score) { score = n; best = it; } }
  if (CH.persona) {
    const a = ALUMNI.find((x) => x.id === CH.persona);
    const hit = a.qa.find((x) => x.q.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => t.includes(w)));
    if (hit) return `<p>${esc(hit.a)}</p>`;
    return '<p>Pertanyaan bagus! Coba ceritain lebih detail: kamu lagi mentok di bagian mana? (Di prototipe ini jawabanku masih contoh, di versi final aku jawab langsung.)</p>';
  }
  if (best) return best.a;
  return '<p>Hmm, aku belum punya jawaban contoh buat yang satu itu. Coba salah satu pertanyaan di bawah, atau tulis kata kunci seperti <i>turunan</i>, <i>persen</i>, atau <i>esai</i>. Di versi final, aku bisa jawab apa aja.</p>';
}
function sendQuestion(text, id) {
  text = text.trim(); if (!text || CH.typing) return;
  if (!CH.persona && !spend('tanya')) return;
  CH.msgs.push({ who: 'me', html: `<p>${esc(text)}</p>` }); CH.typing = true; hooks.render(true);
  setTimeout(() => {
    CH.msgs.push({ who: 'ai', html: answer(text, id), foot: !CH.persona }); CH.typing = false; hooks.render(true);
  }, 650);
}

export function viewTanya(params) {
  initChat(params);
  if (CH.persona && !isPremium()) {
    return `<div class="page-head"><div><h1>Ngobrol Bareng Alumni</h1></div></div><div class="card empty">${mascot('calm', 84)}<h2>Obrolan langsung ini khusus Premium</h2>
      <p class="muted">Kamu masih bisa baca tanya-jawab alumni dengan gratis.</p><button class="btn primary" data-act="alumni-chat" data-id="${esc(CH.persona)}">${icon('lock', 16)} Unlock</button></div>`;
  }
  const persona = CH.persona ? ALUMNI.find((x) => x.id === CH.persona) : null;
  const ids = SUGG[CH.cat] || SUGG.ujian;
  const sugg = persona ? '' : `<div class="chips sugg" aria-label="Contoh pertanyaan">${ids.map((id) => { const it = KB.find((k) => k.id === id); return `<button class="chip" data-act="tanya-ask" data-id="${it.id}" data-q="${esc(it.q)}">${esc(it.q)}</button>`; }).join('')}</div>`;
  const cats = persona ? '' : `<div class="chips" role="group" aria-label="Kategori">${[{ id: 'ujian', name: 'Ujian' }, ...CATEGORIES].map((c) => `<button class="chip" data-act="tanya-cat" data-id="${c.id}" aria-pressed="${CH.cat === c.id}">${esc(c.name)}</button>`).join('')}</div>`;
  const msgs = CH.msgs.map((m) => `<div class="msg ${m.who}">${m.who === 'ai' ? (persona ? `<span class="avatar">${esc(persona.name[0])}</span>` : mascot('happy', 36)) : ''}<div class="bubble2">${m.html}${m.foot ? `<p class="small muted foot">Butuh jawaban yang lebih detail? <button class="btn link small" data-act="alumni-chat" data-id="jerome">${icon('lock', 12)} Ngobrol bareng alumni</button></p>` : ''}</div></div>`).join('');
  return `<div class="page-head"><div><h1>${persona ? esc(persona.tag) : 'Tanya AI'}</h1><p>${persona ? esc(persona.role) : 'Tanya apa aja, dari ujian sampai tugas kuliah dan urusan harian.'}</p></div>${persona ? '<span class="pill gold">Premium</span>' : creditChip()}</div>
    <div class="stack"><div class="card chat">${cats}<div class="msgs" id="msgs" aria-live="polite">${msgs}${CH.typing ? `<div class="msg ai"><span class="mascot-wrap">${mascot('think', 36)}</span><div class="bubble2 typing"><span></span><span></span><span></span></div></div>` : ''}</div>${sugg}
      <form class="composer" data-submit="tanya-send"><label class="sr" for="tq">Pertanyaanmu</label><input id="tq" type="text" placeholder="${persona ? 'Tanya ke ' + esc(persona.name) + '…' : 'Tulis pertanyaanmu…'}" autocomplete="off" maxlength="200"><button class="btn primary" type="submit">${icon('send', 18)} Kirim</button></form>
      <p class="small muted">${persona ? 'Jawaban contoh buat prototipe.' : `Jawaban di prototipe ini adalah contoh tertulis, bukan AI sungguhan. Tiap jawaban pakai ${COST.tanya} kredit.`}</p></div></div>`;
}

/* ------------------------------------------------------------------ AI INTERVIEW */
const IV_TYPES = {
  beasiswa: { name: 'Wawancara Beasiswa', ic: 'grad', qs: ['Ceritakan tentang dirimu dan kenapa kamu pantas mendapat beasiswa ini.', 'Ceritakan satu kegagalan yang paling mengajarimu sesuatu.', 'Apa rencana kontribusimu setelah lulus?'] },
  kerja: { name: 'Wawancara Kerja', ic: 'doc', qs: ['Ceritakan pengalaman kerja atau organisasi yang paling kamu banggakan.', 'Gimana caramu menghadapi tekanan atau tenggat yang mepet?', 'Kenapa kamu tertarik dengan posisi ini?'] },
  presentasi: { name: 'Presentasi Singkat', ic: 'sparkle', qs: ['Jelaskan satu topik yang kamu kuasai dalam satu menit, seolah ke orang awam.', 'Apa pesan utama yang mau kamu tinggalkan ke audiens?', 'Gimana kamu menjawab pertanyaan sulit saat sesi tanya jawab?'] },
};
const IV = { type: null, i: 0, answers: [], done: false };

function scoreText(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sents = text.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
  const avg = sents.length ? words / sents.length : words;
  const struktur = sents.length >= 3 ? 1 : sents.length === 2 ? 0.6 : 0.3;
  const detail = words >= 60 ? 1 : words >= 35 ? 0.7 : words >= 15 ? 0.4 : 0.15;
  const dampak = /\d|hasil|dampak|berhasil|meningkat|akhirnya|belajar/i.test(text) ? 1 : 0.35;
  const jelas = avg <= 22 ? 1 : avg <= 30 ? 0.7 : 0.45;
  return { struktur, detail, dampak, jelas, words };
}
export function viewInterview() {
  const head = `<div class="page-head"><div><h1>AI Interview <span class="pill gold">BARU</span></h1><p>Latihan wawancara dan presentasi kapan aja, tanpa deg-degan.</p></div>${creditChip()}</div>`;
  if (!IV.type) {
    return `${head}<div class="stack"><div class="card tint"><div class="say">${mascot('cheer', 72)}<div><h2>Pilih latihannya</h2><p class="muted">Tiga pertanyaan, jawab dengan tulisan. Habis itu kamu dapat masukan. Satu sesi pakai ${COST.interview} kredit.</p></div></div></div>
      <div class="grid cols-3">${Object.entries(IV_TYPES).map(([k, v]) => `<div class="card"><span class="stat-ic">${icon(v.ic, 20)}</span><h3 style="margin:10px 0 4px">${v.name}</h3><p class="small muted">3 pertanyaan · sekitar 10 menit</p>
        <button class="btn primary block" style="margin-top:12px" data-act="iv-start" data-k="${k}">Mulai latihan</button></div>`).join('')}</div>
      <div class="card feat locked"><span class="stat-ic gold">${icon('wave', 20)}</span><div><b>Jawab pakai suara</b><p class="small muted">Analisis jeda, kejelasan, dan struktur jawabanmu. Khusus Premium.</p></div>
      <button class="btn small ${isPremium() ? '' : 'lock-btn'}" data-act="feat-open" data-id="ai-voice">${isPremium() ? 'Buka' : `${icon('lock', 14)} Unlock`}</button></div></div>`;
  }
  const t = IV_TYPES[IV.type];
  if (!IV.done) {
    return `${head}<div class="card" style="max-width:720px"><div class="bar" style="margin-bottom:14px"><i style="width:${(IV.i / 3) * 100}%"></i></div>
      <div class="say" style="margin-bottom:12px">${mascot('happy', 56)}<div class="bubble"><span class="small muted">${t.name} · ${IV.i + 1} dari 3</span><br><b>${esc(t.qs[IV.i])}</b></div></div>
      <form data-submit="iv-next"><label class="sr" for="iv-ans">Jawabanmu</label><textarea id="iv-ans" rows="6" placeholder="Tulis jawabanmu di sini. Santai aja, ini cuma latihan." maxlength="1500"></textarea>
      <p id="iv-err" class="small" style="color:var(--orange-strong)" role="alert"></p>
      <div class="btn-row"><button class="btn primary" type="submit">${IV.i === 2 ? 'Selesai & lihat masukan' : 'Jawaban berikutnya'}</button><button type="button" class="btn" data-act="iv-reset">Batal</button></div></form></div>`;
  }
  const sc = IV.answers.map(scoreText);
  const avg = (k) => Math.round((sc.reduce((a, x) => a + x[k], 0) / sc.length) * 100);
  const asp = [['Struktur jawaban', avg('struktur'), 'Jawab dalam beberapa kalimat dengan alur jelas: konteks, tindakan, hasil.'], ['Kelengkapan detail', avg('detail'), 'Tambahin contoh nyata, nama kegiatan, atau angka.'], ['Dampak & hasil', avg('dampak'), 'Sebut hasilnya: apa yang berubah karena tindakanmu.'], ['Kejelasan kalimat', avg('jelas'), 'Pecah kalimat panjang jadi dua biar enak didengar.']];
  const low = [...asp].sort((a, b) => a[1] - b[1]).slice(0, 2);
  return `${head}<div class="stack" style="max-width:720px"><div class="card done-ring">${mascot(low[0][1] >= 70 ? 'proud' : 'cheer', 90)}<h2>Latihan selesai, keren!</h2><p class="muted">${t.name} · 3 jawaban</p></div>
    <div class="card"><h3 style="margin-bottom:8px">Masukan buat kamu</h3>${asp.map(([n, v]) => `<div class="gap-row"><span class="gap-name">${n}</span><span class="gap-val">${v}%</span><div class="bar ${v >= 75 ? '' : v >= 55 ? 'gold' : 'orange'}"><i style="width:${v}%"></i></div></div>`).join('')}
      <p style="margin-top:10px"><b>Yang bisa diasah dulu:</b></p><ul class="list-plain">${low.map((x) => `<li>${esc(x[2])}</li>`).join('')}</ul>
      <p class="small muted" style="margin-top:10px">Penilaian di prototipe ini pakai aturan sederhana, bukan AI sungguhan. Versi final lebih detail.</p></div>
    <div class="btn-row"><button class="btn primary" data-act="iv-reset">Latihan lagi</button><a class="btn" href="#/review">Cek dokumenmu juga</a></div></div>`;
}

/* ------------------------------------------------------------------ REVIEW DOKUMEN */
const RV_TYPES = { esai: 'Esai Beasiswa', cv: 'CV / Ringkasan Diri', surat: 'Surat Lamaran', tulisan: 'Tulisan Lainnya' };
const RV = { type: 'esai', text: '', result: null };
function analyze(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sents = text.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean);
  const paras = text.split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean);
  const avg = sents.length ? words.length / sents.length : words.length;
  const saya = (text.match(/\bsaya\b/gi) || []).length;
  const filler = (text.match(/\b(sangat|banget|sekali|dll|dsb)\b/gi) || []).length;
  const checks = [
    { ok: words.length >= 80 && words.length <= 700, name: 'Panjang tulisan', good: `${words.length} kata, pas.`, tip: words.length < 80 ? `Baru ${words.length} kata. Tambahin contoh dan detail.` : `${words.length} kata, cukup panjang. Coba padatkan.` },
    { ok: paras.length >= 3, name: 'Struktur paragraf', good: `${paras.length} paragraf, rapi.`, tip: 'Pecah jadi minimal tiga paragraf: pembuka, isi, penutup.' },
    { ok: avg <= 25, name: 'Panjang kalimat', good: `Rata-rata ${Math.round(avg)} kata per kalimat, enak dibaca.`, tip: `Rata-rata ${Math.round(avg)} kata per kalimat. Pecah kalimat yang panjang.` },
    { ok: !sents.length || saya / sents.length <= 0.6, name: 'Variasi awal kalimat', good: 'Awal kalimatnya bervariasi.', tip: `Kata "saya" muncul ${saya} kali. Coba variasikan awal kalimat.` },
    { ok: /\d/.test(text), name: 'Bukti konkret', good: 'Ada angka atau data yang menguatkan.', tip: 'Tambahin angka atau hasil nyata, misalnya "menaikkan peserta 40%".' },
    { ok: filler < 4, name: 'Kata pengisi', good: 'Minim kata pengisi.', tip: `Ada ${filler} kata pengisi (sangat, banget, sekali). Hapus yang nggak perlu.` },
  ];
  return { words: words.length, checks, score: Math.round((checks.filter((c) => c.ok).length / checks.length) * 100) };
}
export function viewReview() {
  const head = `<div class="page-head"><div><h1>Review Dokumen <span class="pill gold">BARU</span></h1><p>Tempel tulisanmu, dapat masukan cepat sebelum dikirim.</p></div>${creditChip()}</div>`;
  const form = `<div class="card"><form data-submit="rv-run"><div class="field"><label for="rv-type">Jenis dokumen</label><select id="rv-type">${Object.entries(RV_TYPES).map(([k, v]) => `<option value="${k}" ${RV.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="field"><label for="rv-text">Tempel tulisanmu</label><textarea id="rv-text" rows="10" placeholder="Tempel teksnya di sini (minimal sekitar 50 kata). Kami nggak menyimpan tulisanmu." maxlength="6000">${esc(RV.text)}</textarea></div>
    <p id="rv-err" class="small" style="color:var(--orange-strong)" role="alert"></p>
    <div class="btn-row"><button class="btn primary" type="submit">${icon('sparkle', 18)} Review sekarang · ${COST.review} kredit</button></div>
    <p class="small muted" style="margin-top:8px">Penilaian di prototipe ini pakai aturan sederhana. Versi final jauh lebih detail.</p></form></div>`;
  if (!RV.result) return `${head}<div class="stack"><div class="card tint"><div class="say">${mascot('happy', 64)}<div>Esai, CV, atau surat lamaran, semuanya boleh. Aku bacain, kamu tinggal rapihin.</div></div></div>${form}
    <div class="card feat locked"><span class="stat-ic gold">${icon('doc', 20)}</span><div><b>Review mendalam per kalimat</b><p class="small muted">Masukan detail dan skor lengkap. Khusus Premium.</p></div><button class="btn small ${isPremium() ? '' : 'lock-btn'}" data-act="feat-open" data-id="doc-deep">${isPremium() ? 'Buka' : `${icon('lock', 14)} Unlock`}</button></div></div>`;
  const r = RV.result;
  return `${head}<div class="stack"><div class="card done-ring">${mascot(r.score >= 70 ? 'proud' : 'cheer', 84)}<h2>Skor tulisanmu: ${r.score}/100</h2><p class="muted">${RV_TYPES[RV.type]} · ${r.words} kata</p></div>
    <div class="card">${r.checks.map((c) => `<div class="item"><div><b>${icon(c.ok ? 'check' : 'half', 16)} ${c.name}</b><p class="small ${c.ok ? 'muted' : ''}">${esc(c.ok ? c.good : c.tip)}</p></div><span class="pill ${c.ok ? 'tint' : 'neutral'}">${c.ok ? 'Oke' : 'Bisa diasah'}</span></div>`).join('')}</div>
    <div class="btn-row"><button class="btn primary" data-act="rv-edit">Revisi tulisan</button><button class="btn" data-act="rv-new">Dokumen baru</button></div></div>`;
}

/* ------------------------------------------------------------------ HUB (seluler) */
export function viewAi() {
  return `<div class="page-head"><div><h1>Artificial Intelligence</h1><p>Teman belajarmu, kapan aja kamu butuh.</p></div>${creditChip()}</div>
    <div class="stack"><div class="card tint"><div class="say">${mascot('cheer', 72)}<div>Mau ngapain hari ini? Tanya soal, latihan wawancara, atau cek esaimu.</div></div></div>
    <div class="grid cols-3">${[['tanya', 'Tanya AI', 'chat', 'Tanya apa aja, dari ujian sampai tugas kuliah.', ''], ['interview', 'AI Interview', 'wave', 'Latihan wawancara dan presentasi.', 'BARU'], ['review', 'Review Dokumen', 'doc', 'Cek esai, CV, dan surat lamaran.', 'BARU']].map(([id, n, ic, d, b]) =>
    `<a class="card linkcard" href="#/${id}"><span class="stat-ic">${icon(ic, 22)}</span><div><h3>${n} ${b ? `<span class="pill gold">${b}</span>` : ''}</h3><p class="small muted">${d}</p></div></a>`).join('')}</div>
    <a class="card linkcard" href="#/english"><span class="stat-ic">${icon('book', 22)}</span><div><h3>English Lab <span class="pill gold">PILOT</span></h3><p class="small muted">IELTS & TOEFL: Reading, Listening, Writing, Speaking.</p></div></a>
    <a class="card linkcard" href="#/profil?tab=eksplor"><span class="stat-ic">${icon('sparkle', 22)}</span><div><h3>Eksplor Kategori Lain</h3><p class="small muted">Mapel umum, mata kuliah, karier, dan tanya alumni.</p></div></a></div>`;
}

/* ------------------------------------------------------------------ aksi */
export const acts = {
  'topup-demo': () => { S().credits += 500; St.save(); closeDlg(); ribbon('+500 kredit (demo)'); hooks.render(true); },
  'tanya-ask': (el) => sendQuestion(el.dataset.q, el.dataset.id),
  'tanya-cat': (el) => { location.hash = `#/tanya?cat=${el.dataset.id}`; },
  'iv-start': (el) => { if (!spend('interview')) return; Object.assign(IV, { type: el.dataset.k, i: 0, answers: [], done: false }); hooks.render(); },
  'iv-reset': () => { Object.assign(IV, { type: null, i: 0, answers: [], done: false }); hooks.render(); },
  'rv-edit': () => { RV.result = null; hooks.render(); },
  'rv-new': () => { Object.assign(RV, { text: '', result: null }); hooks.render(); },
};
export const subs = {
  'tanya-send': () => { const el = $('#tq'); const v = el.value; el.value = ''; sendQuestion(v); },
  'iv-next': () => {
    const v = $('#iv-ans').value.trim();
    if (v.split(/\s+/).filter(Boolean).length < 5) { $('#iv-err').textContent = 'Tulis minimal beberapa kata dulu ya.'; return; }
    IV.answers.push(v);
    if (IV.i === 2) { IV.done = true; S().interviews += 1; St.save(); } else IV.i += 1;
    hooks.render();
  },
  'rv-run': () => {
    RV.type = $('#rv-type').value; RV.text = $('#rv-text').value;
    if (RV.text.trim().split(/\s+/).filter(Boolean).length < 30) { $('#rv-err').textContent = 'Tulisannya masih terlalu pendek. Tempel minimal sekitar 30 kata ya.'; return; }
    if (!spend('review')) return;
    RV.result = analyze(RV.text); S().reviews += 1; St.save(); hooks.render();
  },
};
export function after() { const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight; }
export { lockDialog };
