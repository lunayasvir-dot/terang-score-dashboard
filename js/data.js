// Data & konfigurasi demo Terang Score.
// Semua angka di sini adalah DATA ILUSTRASI untuk prototipe, bukan data pengguna.

// Ambang pita status masih pertanyaan terbuka (tim data) → nilai sementara.
export const BANDS = { onTrack: 75, close: 60 };

// Ujian contoh: SKD CPNS, fokus satu subtes (TIU = Tes Intelegensia Umum).
export const EXAM = {
  label: 'CPNS · SKD', subtes: 'TIU', days: 52, max: 175,
  squad: 'Squad SKD CPNS #4',
  topics: [
    ['Sinonim & Antonim', 78], ['Analogi Verbal', 71], ['Hitungan & Persen', 62],
    ['Deret Angka', 58], ['Silogisme', 74], ['Penalaran Analitis', 66],
  ],
};

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
  { id: 'voucher', name: 'Voucher Diskon Paket 20% (contoh)', cost: 500, voucher: true, desc: 'Potongan buat pembelian paket Premium. Nilai dan syarat belum final.' },
];

// Paket berbayar. Harga di bawah hanya CONTOH, belum ditetapkan tim produk.
export const PLANS = [
  { id: 'm1', name: '1 Bulan', months: 1, price: 59000, note: 'Cocok buat nyoba dulu.' },
  { id: 'm3', name: '3 Bulan', months: 3, price: 149000, popular: true, note: 'Pas banget buat persiapan SKD, durasinya sama kayak masa belajar ideal.' },
  { id: 'm6', name: '6 Bulan', months: 6, price: 269000, note: 'Buat yang mau nyiapin matang atau ikut seleksi lebih dari sekali.' },
];
export const PLAN_FEATURES = ['Latihan soal tanpa batas', 'Rapor Mingguan lengkap', 'Pembahasan AI tanpa batas', 'Ruang Belajar Hening sesi panjang'];

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
    id: 'pb1', title: 'Lolos passing grade TIU: strategi 8 minggu',
    by: 'Alumni SKD CPNS (contoh)', min: 5,
    points: ['Minggu 1–2: ikut diagnostik, catat tiga topik paling lemah di Radar Skill.', 'Minggu 3–6: satu topik lemah per minggu lewat misi harian.', 'Minggu 7–8: latihan penuh berwaktu, lalu bedah soal yang salah.', 'Deret angka dan hitungan itu soal latihan, makin sering dikerjain makin cepat.'],
  },
  {
    id: 'pb2', title: 'Atur waktu SKD: TIU, TWK, dan TKP',
    by: 'Alumni SKD CPNS (contoh)', min: 4,
    points: ['Kerjain TIU numerik lebih dulu selagi kepala masih segar.', 'Kasih batas sekitar 90 detik per soal, tandai lalu lanjut.', 'Sisakan 10 menit terakhir buat soal yang ditandai.', 'Di TKP, pilih jawaban yang paling sesuai nilai pelayanan publik.'],
  },
  {
    id: 'pb3', title: 'Tiga hari sebelum hari H: rutinitas biar nggak panik',
    by: 'Alumni SKD CPNS (contoh)', min: 3,
    points: ['H-3: latihan ringan saja, fokus ke topik yang sudah kamu kuasai.', 'H-2: cek lokasi tes, dokumen, dan perlengkapan.', 'H-1: istirahat cukup. Pakai Tiket Libur kalau perlu, Api Belajar tetap aman.', 'Pagi H: sarapan, datang lebih awal, tarik napas dalam sebelum mulai.'],
  },
];

export const PASSPORT_LOG = [
  { src: 'Web', text: 'Diagnostik pertama diselesaikan', ago: 56 },
  { src: 'Aplikasi', text: 'Misi harian selesai, 24 kali dalam 8 minggu', ago: 3 },
  { src: 'Simulasi AI', text: 'Simulasi tryout SKD (sesi ke-3)', ago: 14 },
  { src: 'Aplikasi', text: 'Rapor Mingguan minggu ke-7 dibuka', ago: 7 },
];
