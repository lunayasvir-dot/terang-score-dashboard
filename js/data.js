// Data & konfigurasi demo Terang Score.
// Semua angka di sini adalah DATA ILUSTRASI untuk prototipe, bukan data pengguna.

export const PALETTES = {
  klasik:  { label: 'Terang Klasik',  note: 'Direkomendasikan',        blue: '#4DA3E8', strong: '#1B74C0' },
  langit:  { label: 'Langit Pagi',    note: 'Siswa SMA & UTBK',        blue: '#5BB6F0', strong: '#1A6FB5' },
  samudra: { label: 'Samudra',        note: 'IELTS, TOEFL, mahasiswa', blue: '#38B2D8', strong: '#0E6F94' },
  malam:   { label: 'Fokus Malam',    note: 'Mode gelap',              blue: '#66B5F5', strong: '#8FCBFF' },
  indigo:  { label: 'Indigo Formal',  note: 'CPNS & LPDP',             blue: '#6C9BF2', strong: '#2F5FC4' },
};

// Ambang pita status masih pertanyaan terbuka (tim data) → nilai sementara.
export const BANDS = { onTrack: 75, close: 60 };

export const TARGETS = {
  UTBK: {
    label: 'UTBK-SNBT', days: 38, bank: 'tps', squad: 'Squad UTBK Saintek #12',
    topics: [
      ['Penalaran Umum', 78], ['Pengetahuan Kuantitatif', 58], ['Literasi Bahasa Indonesia', 82],
      ['Literasi Bahasa Inggris', 71], ['Penalaran Matematika', 66],
    ],
    cat: { logika: 'Penalaran Umum', numerik: 'Pengetahuan Kuantitatif', verbal: 'Literasi Bahasa Indonesia' },
  },
  CPNS: {
    label: 'CPNS (SKD)', days: 52, bank: 'tps', squad: 'Squad CPNS Kemenkeu #4',
    topics: [['TIU Verbal', 74], ['TIU Numerik', 61], ['TIU Logika', 70], ['TWK', 77], ['TKP', 83]],
    cat: { logika: 'TIU Logika', numerik: 'TIU Numerik', verbal: 'TIU Verbal' },
  },
  LPDP: {
    label: 'LPDP', days: 64, bank: 'tps', squad: 'Squad LPDP Reguler #7',
    topics: [['TBS Verbal', 72], ['TBS Numerik', 60], ['TBS Logika', 69], ['Esai Kontribusi', 66], ['Wawancara', 74]],
    cat: { logika: 'TBS Logika', numerik: 'TBS Numerik', verbal: 'TBS Verbal' },
  },
  IELTS: {
    label: 'IELTS', days: 45, bank: 'eng', squad: 'Squad IELTS Academic #3',
    topics: [['Listening', 72], ['Reading', 68], ['Writing', 57], ['Speaking', 64]],
    cat: { grammar: 'Writing', vocab: 'Reading', reading: 'Reading' },
  },
  TOEFL: {
    label: 'TOEFL', days: 40, bank: 'eng', squad: 'Squad TOEFL ITP #5',
    topics: [['Listening', 70], ['Structure', 59], ['Reading', 74], ['Vocabulary', 67]],
    cat: { grammar: 'Structure', vocab: 'Vocabulary', reading: 'Reading' },
  },
};

const PASSAGE = 'Sleep researchers found that students who slept eight hours scored higher on memory tests than those who slept only five. The difference was largest for tasks that required recalling new information.';

export const BANKS = {
  tps: [
    { cat: 'numerik', q: 'Jika 3x + 5 = 20, nilai x adalah …', o: ['3', '4', '5', '6'], a: 2, e: '3x = 20 − 5 = 15, sehingga x = 5.' },
    { cat: 'numerik', q: 'Harga buku Rp40.000 didiskon 25%. Berapa harga setelah diskon?', o: ['Rp25.000', 'Rp30.000', 'Rp32.000', 'Rp35.000'], a: 1, e: 'Diskon 25% = Rp10.000, jadi harganya Rp30.000.' },
    { cat: 'numerik', q: 'Rata-rata 4 bilangan adalah 12. Tiga bilangan di antaranya 10, 12, dan 14. Bilangan keempat adalah …', o: ['8', '10', '12', '14'], a: 2, e: 'Jumlah total = 4 × 12 = 48. Jumlah tiga bilangan = 36, sehingga yang keempat 48 − 36 = 12.' },
    { cat: 'logika', q: 'Semua mahasiswa rajin belajar. Dina adalah mahasiswa. Kesimpulan yang pasti benar adalah …', o: ['Dina rajin belajar', 'Dina tidak rajin belajar', 'Semua yang rajin belajar adalah mahasiswa', 'Dina belum tentu rajin belajar'], a: 0, e: 'Dina termasuk himpunan mahasiswa, dan semua mahasiswa rajin belajar.' },
    { cat: 'logika', q: 'Lanjutkan deret: 2, 6, 12, 20, 30, …', o: ['40', '42', '44', '46'], a: 1, e: 'Selisihnya 4, 6, 8, 10, lalu 12. Jadi 30 + 12 = 42.' },
    { cat: 'logika', q: 'Jika hujan turun, jalan basah. Jalan tidak basah. Kesimpulannya …', o: ['Hujan turun', 'Hujan tidak turun', 'Jalan kering karena panas', 'Tidak dapat disimpulkan'], a: 1, e: 'Jalan tidak basah berarti syarat "hujan turun" tidak terpenuhi (modus tollens).' },
    { cat: 'logika', q: 'A lebih tinggi dari B, dan C lebih rendah dari B. Pernyataan yang pasti benar adalah …', o: ['C lebih tinggi dari A', 'A lebih tinggi dari C', 'B yang tertinggi', 'A dan C sama tinggi'], a: 1, e: 'Urutannya A > B > C, sehingga A lebih tinggi dari C.' },
    { cat: 'verbal', q: 'Sinonim kata "esensial" adalah …', o: ['Mendasar', 'Tambahan', 'Mewah', 'Sementara'], a: 0, e: '"Esensial" berarti sangat penting atau mendasar.' },
    { cat: 'verbal', q: 'Antonim kata "transparan" adalah …', o: ['Jernih', 'Bening', 'Buram', 'Cair'], a: 2, e: '"Transparan" berarti tembus pandang, lawannya buram (tidak tembus pandang).' },
    { cat: 'verbal', q: 'Manakah kalimat yang efektif?', o: ['Para siswa-siswa mengerjakan soal itu.', 'Para siswa mengerjakan soal itu.', 'Siswa-siswa para mengerjakan soal itu.', 'Para siswa-siswa sedang mengerjakan soal-soal.'], a: 1, e: '"Para" sudah menyatakan jamak, jadi tidak perlu diulang dengan "siswa-siswa".' },
  ],
  eng: [
    { cat: 'grammar', q: 'She ___ to school every day.', o: ['go', 'goes', 'going', 'gone'], a: 1, e: 'Subjek orang ketiga tunggal dalam simple present memakai "goes".' },
    { cat: 'grammar', q: 'If I ___ more time, I would travel more.', o: ['have', 'had', 'will have', 'having'], a: 1, e: 'Conditional type 2: if + simple past, would + verb.' },
    { cat: 'grammar', q: 'The report ___ by the team yesterday.', o: ['finished', 'was finished', 'has finished', 'finishing'], a: 1, e: 'Kalimat pasif lampau memakai "was/were + past participle".' },
    { cat: 'grammar', q: 'Neither of the answers ___ correct.', o: ['are', 'is', 'were', 'be'], a: 1, e: '"Neither of" diikuti verba tunggal dalam penggunaan formal.' },
    { cat: 'vocab', q: 'The closest meaning of "reluctant" is …', o: ['unwilling', 'eager', 'careful', 'tired'], a: 0, e: '"Reluctant" berarti enggan atau tidak mau.' },
    { cat: 'vocab', q: '"Abundant" means …', o: ['scarce', 'plentiful', 'expensive', 'ancient'], a: 1, e: '"Abundant" berarti melimpah (plentiful).' },
    { cat: 'vocab', q: '"Mitigate" means to …', o: ['worsen', 'reduce the severity of', 'ignore', 'celebrate'], a: 1, e: '"Mitigate" berarti mengurangi tingkat keparahan.' },
    { cat: 'reading', p: PASSAGE, q: 'What is the main idea of the passage?', o: ['Sleep improves memory, especially for new information', 'Students should study for eight hours', 'Memory tests are too difficult', 'Five hours of sleep is enough'], a: 0, e: 'Inti bacaan: tidur lebih lama meningkatkan memori, terutama untuk informasi baru.' },
    { cat: 'reading', p: PASSAGE, q: 'Which students scored higher on memory tests?', o: ['Those who slept five hours', 'Those who slept eight hours', 'Those who did not sleep', 'Those who studied longer'], a: 1, e: 'Teks menyebut siswa yang tidur delapan jam mendapat skor lebih tinggi.' },
    { cat: 'reading', p: PASSAGE, q: 'The difference was largest for tasks that required …', o: ['solving math problems', 'physical exercise', 'recalling new information', 'reading quickly'], a: 2, e: 'Kalimat terakhir menyebut tugas yang menuntut mengingat informasi baru.' },
  ],
};

// 5 soal diagnostik (indeks ke bank) — sebaran kategori.
export const DIAG_IDX = { tps: [0, 3, 7, 1, 4], eng: [0, 4, 7, 2, 5] };

export const SQUAD_NAMES = [
  'Aditya', 'Bella', 'Citra', 'Dimas', 'Eka', 'Farhan', 'Gita', 'Hana', 'Indra', 'Jasmine',
  'Kevin', 'Laras', 'Mira', 'Naufal', 'Oki', 'Putri', 'Qori', 'Raka', 'Salsa',
];
export const SQUAD_DAYS = [4, 4, 3, 4, 2, 4, 1, 4, 3, 4, 4, 2, 4, 0, 4, 3, 4, 2, 4];
export const SQUAD_ACTIVE_MIN = [12, 45, 8, 130, 300, 22, 1500, 5, 60, 15, 90, 600, 33, 2900, 3, 75, 180, 420, 18];
export const SQUAD_STREAK = [12, 21, 5, 9, 3, 30, 1, 17, 6, 14, 8, 2, 25, 0, 11, 4, 19, 3, 40];
export const BADGES = ['Topik Dikuasai', 'Skor +10', 'Streak 7 Hari', 'Squad Goal', 'Hasil Dilaporkan'];

export const CHEERS = [
  'Semangat! Satu Daily 10 saja cukup hari ini.',
  'Kita bareng-bareng sampai tujuan squad tercapai.',
  'Kamu pasti bisa, sepuluh soal kecil dulu ya!',
  'Senang belajar bareng kamu, ayo lanjut.',
];

export const CATALOG = [
  { id: 'premium', name: '1 hari Premium', cost: 300, desc: 'Akses penuh latihan dan laporan tanpa batas selama 24 jam.' },
  { id: 'room', name: 'Slot Study Room 2 jam', cost: 150, desc: 'Perpanjang sesi Silent Study Room dari 25 menit menjadi 2 jam.' },
  { id: 'voucher', name: 'Voucher tes bahasa (contoh)', cost: 500, desc: 'Contoh hadiah dari mitra. Nilai dan mitra belum ditetapkan.' },
];

export const EARN_RULES = [
  ['Menyelesaikan Daily 10', '+20'],
  ['Skor mingguan naik', '+30'],
  ['Squad mencapai tujuan bersama', '+50'],
  ['Melaporkan hasil ujian nyata', '+100'],
  ['Playbook atau jawaban yang lolos tinjauan', '+40'],
];
export const MONTH_CAP = 600;

export const PLAYBOOKS = [
  {
    id: 'pb1', exam: 'LPDP', title: 'Wawancara LPDP: dari cerita pribadi ke rencana kontribusi',
    by: 'Alumni LPDP 2025 (contoh)', min: 6,
    points: ['Mulai dari satu masalah nyata di daerahmu, bukan dari cita-cita yang umum.', 'Siapkan tiga cerita: kegagalan, kepemimpinan, dan kontribusi.', 'Latihan dengan AI Interview minimal lima kali, lalu rekam dan dengarkan ulang.', 'Tutup setiap jawaban dengan dampak yang bisa diukur.'],
  },
  {
    id: 'pb2', exam: 'UTBK', title: 'UTBK: strategi 60 hari untuk Pengetahuan Kuantitatif',
    by: 'Alumni UTBK 2026 (contoh)', min: 5,
    points: ['Minggu 1–2: pemetaan, kerjakan diagnostik dan catat tiga topik terlemah.', 'Minggu 3–6: satu topik lemah per minggu lewat Daily 10.', 'Minggu 7–8: latihan penuh berwaktu, lalu analisis kesalahan.', 'Satu hari istirahat penuh setiap minggu; Rest Day Pass dipakai saat pekan ujian.'],
  },
  {
    id: 'pb3', exam: 'CPNS', title: 'SKD CPNS: mengatur waktu di TIU dan TKP',
    by: 'Alumni CPNS 2025 (contoh)', min: 4,
    points: ['Kerjakan TIU numerik lebih dulu saat pikiran masih segar.', 'TKP tidak ada jawaban salah mutlak, pilih yang paling sesuai nilai pelayanan publik.', 'Tetapkan batas 90 detik per soal, tandai lalu lanjut.', 'Sisakan 10 menit terakhir untuk soal yang ditandai.'],
  },
];

export const PASSPORT_LOG = [
  { src: 'Web', text: 'Diagnostik pertama diselesaikan', ago: 56 },
  { src: 'Aplikasi', text: 'Daily 10 selesai, 24 kali dalam 8 minggu', ago: 3 },
  { src: 'AI Interview', text: 'Simulasi wawancara (sesi ke-3)', ago: 14 },
  { src: 'Aplikasi', text: 'Weekly Score Report minggu ke-7 dibuka', ago: 7 },
];
