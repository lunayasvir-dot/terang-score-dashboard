// Data & konfigurasi demo Terang Score.
// Semua angka di sini adalah DATA ILUSTRASI untuk prototipe, bukan data pengguna.

// Ambang pita status masih pertanyaan terbuka (tim data) → nilai sementara.
export const BANDS = { onTrack: 75, close: 60 };

// Target ujian. Materi latihan contoh selalu soal penalaran (TIU/TPS/TBS mirip jenisnya):
// verbal, numerik, dan logika. Skor maksimum subtes selain TIU belum pasti, bisa diubah saat lapor hasil.
export const TARGETS = {
  CPNS: { label: 'CPNS · SKD', short: 'CPNS', subtes: 'TIU', days: 52, max: 175, squad: 'Squad SKD CPNS #4' },
  UTBK: { label: 'UTBK-SNBT', short: 'UTBK', subtes: 'TPS', days: 38, max: 100, squad: 'Squad UTBK-SNBT #12' },
  LPDP: { label: 'LPDP', short: 'LPDP', subtes: 'TBS', days: 64, max: 100, squad: 'Squad LPDP #7' },
};
export const TOPICS = [
  ['Sinonim & Antonim', 78], ['Analogi Verbal', 71], ['Hitungan & Persen', 62],
  ['Deret Angka', 58], ['Silogisme', 74], ['Penalaran Analitis', 66],
];

// Bank soal TIU. Urutannya selang-seling antar topik (6 topik × 2 soal) supaya
// 10 soal pertama selalu menyentuh semua topik.
export const BANK = [
  { topic: 'Sinonim & Antonim', q: 'Sinonim kata "esensial" adalah …', o: ['Mendasar', 'Tambahan', 'Mewah', 'Sementara'], a: 0, e: '"Esensial" berarti sangat penting atau mendasar.' },
  { topic: 'Analogi Verbal', q: 'Dokter : Rumah Sakit = Guru : …', o: ['Sekolah', 'Buku', 'Murid', 'Kapur'], a: 0, e: 'Dokter bekerja di rumah sakit, guru bekerja di sekolah. Hubungannya sama: profesi dan tempat kerja.' },
  { topic: 'Hitungan & Persen', q: 'Harga buku Rp40.000 didiskon 25%. Berapa harga setelah diskon?', o: ['Rp25.000', 'Rp30.000', 'Rp32.000', 'Rp35.000'], a: 1, e: 'Diskon 25% dari Rp40.000 = Rp10.000, jadi harganya Rp30.000.' },
  { topic: 'Deret Angka', q: 'Lanjutkan deret: 2, 6, 12, 20, 30, …', o: ['40', '42', '44', '46'], a: 1, e: 'Selisihnya naik terus: 4, 6, 8, 10, lalu 12. Jadi 30 + 12 = 42.' },
  { topic: 'Silogisme', q: 'Semua ASN wajib bersikap netral. Budi adalah seorang ASN. Kesimpulan yang pasti benar adalah …', o: ['Budi wajib bersikap netral', 'Budi tidak wajib bersikap netral', 'Semua orang netral adalah ASN', 'Budi belum tentu netral'], a: 0, e: 'Budi termasuk kelompok ASN, dan semua ASN wajib netral. Maka Budi wajib netral.' },
  { topic: 'Penalaran Analitis', q: 'Ani lebih tinggi dari Budi, dan Citra lebih rendah dari Budi. Pernyataan yang pasti benar adalah …', o: ['Citra lebih tinggi dari Ani', 'Ani lebih tinggi dari Citra', 'Budi yang paling tinggi', 'Ani dan Citra sama tinggi'], a: 1, e: 'Urutannya Ani > Budi > Citra, jadi Ani pasti lebih tinggi dari Citra.' },
  { topic: 'Sinonim & Antonim', q: 'Antonim kata "transparan" adalah …', o: ['Jernih', 'Bening', 'Buram', 'Cair'], a: 2, e: '"Transparan" berarti tembus pandang, lawan katanya buram (tidak tembus pandang).' },
  { topic: 'Analogi Verbal', q: 'Panas : Dingin = Terang : …', o: ['Redup', 'Gelap', 'Silau', 'Lampu'], a: 1, e: 'Panas berlawanan dengan dingin, sama seperti terang berlawanan dengan gelap.' },
  { topic: 'Hitungan & Persen', q: 'Sebuah mobil menempuh 120 km dalam 2 jam. Dengan kecepatan yang sama, berapa jarak yang ditempuh dalam 5 jam?', o: ['240 km', '280 km', '300 km', '360 km'], a: 2, e: 'Kecepatan = 120 : 2 = 60 km/jam. Dalam 5 jam: 60 × 5 = 300 km.' },
  { topic: 'Deret Angka', q: 'Lanjutkan deret: 3, 6, 12, 24, …', o: ['36', '42', '48', '54'], a: 2, e: 'Setiap angka dikali 2. Jadi 24 × 2 = 48.' },
  { topic: 'Silogisme', q: 'Jika hujan turun, jalan menjadi basah. Jalan tidak basah. Kesimpulannya …', o: ['Hujan turun', 'Hujan tidak turun', 'Jalan kering karena panas', 'Tidak dapat disimpulkan'], a: 1, e: 'Jalan tidak basah berarti syarat "hujan turun" tidak terpenuhi, jadi hujan tidak turun.' },
  { topic: 'Penalaran Analitis', q: 'Empat orang (A, B, C, D) mengantre. D paling depan. A berada di depan B, dan C berada di belakang B. Siapa yang berdiri di urutan ketiga?', o: ['A', 'B', 'C', 'D'], a: 1, e: 'Urutannya D, A, B, C. Jadi urutan ketiga adalah B.' },
];

// 5 soal diagnostik (indeks ke BANK), sebaran lima topik berbeda.
export const DIAG_IDX = [0, 1, 2, 3, 5];

export const SQUAD_NAMES = [
  'Aditya', 'Bella', 'Citra', 'Dimas', 'Eka', 'Farhan', 'Gita', 'Hana', 'Indra', 'Jasmine',
  'Kevin', 'Laras', 'Mira', 'Naufal', 'Oki', 'Putri', 'Qori', 'Raka', 'Salsa',
];
export const SQUAD_DAYS = [4, 4, 3, 4, 2, 4, 1, 4, 3, 4, 4, 2, 4, 0, 4, 3, 4, 2, 4];
export const SQUAD_ACTIVE_MIN = [12, 45, 8, 130, 300, 22, 1500, 5, 60, 15, 90, 600, 33, 2900, 3, 75, 180, 420, 18];
export const SQUAD_STREAK = [12, 21, 5, 9, 3, 30, 1, 17, 6, 14, 8, 2, 25, 0, 11, 4, 19, 3, 40];
export const BADGES = ['Topik Dikuasai', 'Skor Naik 10', 'Api 7 Hari', 'Tujuan Squad', 'Hasil Dilaporkan'];

export const CHEERS = [
  'Semangat! Satu misi harian aja cukup hari ini.',
  'Kita bareng-bareng sampai tujuan squad tercapai!',
  'Kamu pasti bisa, sepuluh soal kecil dulu ya.',
  'Seneng belajar bareng kamu, yuk lanjut!',
];

// Hadiah yang bisa ditukar dengan poin. `days` = tambahan hari Premium.
export const CATALOG = [
  { id: 'trial', name: 'Coba Gratis Premium 7 Hari', cost: 0, days: 7, once: true, desc: 'Buka semua latihan dan rapor tanpa batas selama seminggu. Sekali per akun, tanpa kartu.' },
  { id: 'p1', name: 'Premium 1 Hari', cost: 300, days: 1, desc: 'Tambah satu hari akses penuh, cocok buat maraton latihan.' },
  { id: 'p3', name: 'Premium 3 Hari', cost: 800, days: 3, desc: 'Lebih hemat dibanding beli per hari. Pas buat sprint sebelum ujian.' },
  { id: 'room', name: 'Slot Ruang Belajar Hening 2 Jam', cost: 150, desc: 'Perpanjang sesi dari 25 menit jadi 2 jam non-stop.' },
  { id: 'voucher', name: 'Voucher Diskon Pass 20% (contoh)', cost: 500, voucher: true, desc: 'Potongan buat Pass Ujian atau Premium Bulanan. Nilai dan syarat belum final.' },
];


export const EARN_RULES = [
  ['Menyelesaikan Misi Harian', '+20'],
  ['Skor mingguan naik', '+30'],
  ['Squad mencapai tujuan bersama', '+50'],
  ['Melaporkan hasil ujian nyata', '+100'],
  ['Jurus alumni yang lolos tinjauan', '+40'],
];
export const MONTH_CAP = 600;

// "Jurus Alumni": panduan singkat how-I-passed. Konten contoh, bukan dari alumni sungguhan.
export const PLAYBOOKS = [
  {
    id: 'pb1', exam: 'CPNS', title: 'Lolos passing grade TIU: strategi 8 minggu',
    by: 'Alumni SKD CPNS (contoh)', min: 5,
    points: ['Minggu 1–2: ikut diagnostik, catat tiga topik paling lemah di Radar Skill.', 'Minggu 3–6: satu topik lemah per minggu lewat misi harian.', 'Minggu 7–8: latihan penuh berwaktu, lalu bedah soal yang salah.', 'Deret angka dan hitungan itu soal latihan, makin sering dikerjain makin cepat.'],
  },
  {
    id: 'pb2', exam: 'CPNS', title: 'Atur waktu SKD: TIU, TWK, dan TKP',
    by: 'Alumni SKD CPNS (contoh)', min: 4,
    points: ['Kerjain TIU numerik lebih dulu selagi kepala masih segar.', 'Kasih batas sekitar 90 detik per soal, tandai lalu lanjut.', 'Sisakan 10 menit terakhir buat soal yang ditandai.', 'Di TKP, pilih jawaban yang paling sesuai nilai pelayanan publik.'],
  },
  {
    id: 'pb3', exam: 'Umum', title: 'Tiga hari sebelum hari H: rutinitas biar nggak panik',
    by: 'Alumni (contoh)', min: 3,
    points: ['H-3: latihan ringan saja, fokus ke topik yang sudah kamu kuasai.', 'H-2: cek lokasi tes, dokumen, dan perlengkapan.', 'H-1: istirahat cukup. Pakai Tiket Libur kalau perlu, Api Belajar tetap aman.', 'Pagi H: sarapan, datang lebih awal, tarik napas dalam sebelum mulai.'],
  },
  {
    id: 'pb4', exam: 'UTBK', title: 'Atur ritme belajar 60 hari jelang UTBK',
    by: 'Alumni UTBK (contoh)', min: 4,
    points: ['Bagi hari jadi blok: 2 hari penalaran, 1 hari literasi, 1 hari ulasan.', 'Pakai Misi Harian buat jaga ritme, tryout penuh cukup seminggu sekali.', 'Catat soal yang salah dan ulangi tiga hari kemudian.', 'Tidur cukup itu bagian dari strategi, bukan hadiah.'],
  },
  {
    id: 'pb5', exam: 'LPDP', title: 'Esai kontribusi: dari cerita pribadi ke rencana nyata',
    by: 'Alumni LPDP (contoh)', min: 5,
    points: ['Mulai dari satu masalah nyata di sekitarmu, bukan cita-cita yang terlalu umum.', 'Tulis tiga bagian: latar, rencana, dan dampak yang bisa diukur.', 'Minta dua orang membaca, lalu cek lewat Review Dokumen.', 'Sisakan waktu sehari penuh buat merapikan sebelum kirim.'],
  },
];

export const WEB_HISTORY = [
  { src: 'Web', text: 'Tryout TBS LPDP (web): 212 dari 300', ago: 40 },
  { src: 'Web', text: 'Latihan soal di web, 12 sesi', ago: 21 },
  { src: 'Web', text: 'AI Interview di web, 2 sesi', ago: 18 },
];
export const PASSPORT_LOG = [
  { src: 'Web', text: 'Diagnostik pertama diselesaikan', ago: 56 },
  { src: 'Aplikasi', text: 'Misi harian selesai, 24 kali dalam 8 minggu', ago: 3 },
  { src: 'Simulasi AI', text: 'Simulasi tryout SKD (sesi ke-3)', ago: 14 },
  { src: 'Aplikasi', text: 'Rapor Mingguan minggu ke-7 dibuka', ago: 7 },
];

/* ===================== IELTS & TOEFL (pilot) ===================== */
TARGETS.IELTS = { label: 'IELTS Academic', short: 'IELTS', subtes: '4 skill', days: 45, max: 9, squad: 'Squad IELTS #3', bank: 'eng', pilot: true,
  topics: [['Reading', 72], ['Listening', 68], ['Writing', 61], ['Speaking', 57]] };
TARGETS.TOEFL = { label: 'TOEFL iBT', short: 'TOEFL', subtes: '4 skill', days: 40, max: 120, squad: 'Squad TOEFL #5', bank: 'eng', pilot: true,
  topics: [['Reading', 74], ['Listening', 66], ['Speaking', 59], ['Writing', 63]] };
// Skill yang butuh suara asli (audio & mikrofon) = fitur Premium.
export const VOICE_TOPICS = ['Listening', 'Speaking'];
export const WA_CHANNEL = 'https://whatsapp.com/channel/0029VaqSaX6DTkK2qxC3eR3T';

const P1 = 'Researchers found that students who slept eight hours scored higher on memory tests than those who slept only five. The difference was largest for tasks that required recalling new information.';
const P2 = 'Urban gardens are spreading across many cities. Besides providing fresh food, they give residents a place to meet, and studies suggest they can lower summer temperatures in crowded neighbourhoods.';
// Bank soal bahasa Inggris: Reading (dengan bacaan) dan Writing (grammar & kosakata). Selang-seling per topik.
export const ENG_BANK = [
  { topic: 'Reading', p: P1, q: 'What is the main idea of the passage?', o: ['Sleep improves memory, especially for new information', 'Students should study for eight hours', 'Memory tests are too difficult', 'Five hours of sleep is enough'], a: 0, e: 'Inti bacaan: tidur lebih lama meningkatkan memori, terutama untuk informasi baru.' },
  { topic: 'Writing', q: 'Choose the correct sentence.', o: ['She go to campus every day.', 'She goes to campus every day.', 'She going to campus every day.', 'She gone to campus every day.'], a: 1, e: 'Subjek orang ketiga tunggal di simple present pakai "goes".' },
  { topic: 'Reading', p: P1, q: 'Which students scored higher?', o: ['Those who slept five hours', 'Those who slept eight hours', 'Those who did not sleep', 'Those who studied longer'], a: 1, e: 'Teks menyebut siswa yang tidur delapan jam dapat skor lebih tinggi.' },
  { topic: 'Writing', q: 'If I ___ more time, I would join the debate club.', o: ['have', 'had', 'will have', 'having'], a: 1, e: 'Conditional type 2: if + past simple, would + verb.' },
  { topic: 'Reading', p: P2, q: 'According to the passage, urban gardens can…', o: ['replace supermarkets', 'lower summer temperatures', 'increase traffic', 'raise house prices'], a: 1, e: 'Kalimat terakhir menyebut kebun kota bisa menurunkan suhu musim panas.' },
  { topic: 'Writing', q: 'The closest meaning of "reluctant" is…', o: ['unwilling', 'eager', 'careful', 'tired'], a: 0, e: '"Reluctant" berarti enggan.' },
  { topic: 'Reading', p: P2, q: 'The word "residents" refers to…', o: ['tourists', 'people who live in the area', 'farmers', 'researchers'], a: 1, e: '"Residents" = orang yang tinggal di daerah itu.' },
  { topic: 'Writing', q: 'The report ___ by the team yesterday.', o: ['finished', 'was finished', 'has finished', 'finishing'], a: 1, e: 'Pasif lampau: was/were + past participle.' },
  { topic: 'Reading', p: P1, q: 'The difference was largest for tasks that required…', o: ['solving math problems', 'physical exercise', 'recalling new information', 'reading quickly'], a: 2, e: 'Disebut di kalimat terakhir bacaan.' },
  { topic: 'Writing', q: '"Mitigate" means to…', o: ['worsen', 'reduce the severity of', 'ignore', 'celebrate'], a: 1, e: '"Mitigate" = mengurangi tingkat keparahan.' },
  { topic: 'Reading', p: P2, q: 'What is the writer\'s attitude towards urban gardens?', o: ['Negative', 'Positive', 'Uncertain', 'Angry'], a: 1, e: 'Penulis menyebut banyak manfaat, jadi sikapnya positif.' },
  { topic: 'Writing', q: 'Neither of the answers ___ correct.', o: ['are', 'is', 'were', 'be'], a: 1, e: '"Neither of" diikuti verba tunggal dalam bahasa formal.' },
];
export const ENG_DIAG_IDX = [0, 1, 2, 3, 4];
export const bankOf = (target) => (TARGETS[target] && TARGETS[target].bank === 'eng' ? ENG_BANK : BANK);
export const diagOf = (target) => (TARGETS[target] && TARGETS[target].bank === 'eng' ? ENG_DIAG_IDX.map((k) => ENG_BANK[k]) : DIAG_IDX.map((k) => BANK[k]));

PLAYBOOKS.push(
  { id: 'pb6', exam: 'IELTS', title: 'Dari band 6 ke 7.5: fokus ke Writing Task 2', by: 'Alumni IELTS (contoh)', min: 5,
    points: ['Pakai struktur 4 paragraf: intro, dua body, kesimpulan.', 'Tiap body paragraf: satu ide, satu contoh nyata.', 'Latih Speaking tiap hari 10 menit, rekam lalu dengar ulang.', 'Listening: biasakan aksen British dan Australia, bukan cuma Amerika.'] },
  { id: 'pb7', exam: 'TOEFL', title: 'TOEFL iBT 100+: atur energi di 4 section', by: 'Alumni TOEFL (contoh)', min: 4,
    points: ['Reading: baca pertanyaan dulu, baru scan teks.', 'Listening: catat kata kunci, jangan tulis kalimat lengkap.', 'Speaking: pakai template 15 detik persiapan → jawaban 45 detik.', 'Writing: sisakan 3 menit buat cek grammar.'] },
);
