# Terang Score — Dashboard

Prototipe dashboard **Terang Score** (Terang AI) berdasarkan dokumen *Product Requirement & UI Guideline* dan *Activation & Retention Solution (#SquadTerang)*, digabung dengan menu Terang AI yang sudah ada (Tanya AI, AI Interview, Review Dokumen, Kartu Ujian).

Siklusnya: kenali posisimu → susun rencana → belajar bareng squad → buktikan hasilnya.

## Menjalankan di localhost

Tanpa build step dan tanpa dependensi. Cukup server statis (modul ES butuh `http://`, bukan `file://`):

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Lalu buka <http://localhost:5173>.

## Isi

| Menu | Yang ada |
|---|---|
| **Beranda** | Sapaan sesuai jam + maskot, Skor Siap (Lagi Kenalan / Terukur / Sudah Pas), **Radar Skill**, Misi Harian, Api Belajar + Tiket Libur, peringatan tenggat, lapor hasil ujian |
| **Artificial Intelligence** | **Tanya AI** (kategori luas, kredit AI), **AI Interview**, **Review Dokumen** |
| **Kartu Ujian** | Pilih kartu per ujian (UTBK 10, LPDP 16, CPNS 4) dengan harga, Ujian Saya, Riwayat Pembayaran |
| **#SquadTerang** | Papan tujuan bareng (tanpa peringkat, tanpa skor), kirim semangat, Ruang Belajar Hening, Teman Belajar |
| **Poin & Jurus** | Poin, katalog hadiah (Coba Gratis Premium 7 hari, Premium 1/3 hari, voucher), paket Premium 1/3/6 bulan, kode ajak teman, Jurus Alumni |
| **Paspor** | Ringkasan, riwayat, bagikan dengan persetujuan eksplisit, cabut akses |
| **Profil** | Tab **Pengaturan** (target ujian CPNS/UTBK/LPDP, mode terang/gelap, pengingat, Panel Demo) dan tab **Eksplor Kategori Lain** (mapel umum, mata kuliah, karier, tanya alumni `#TerangiBersama…`, fitur Premium terkunci) |
| Notifikasi | Ikon lonceng di topbar; isinya dibangun dari keadaan pengguna |

Fitur **Premium** (ngobrol bareng alumni, Voice Channel, kelas live, AI Interview/Review Dokumen mendalam, tryout eksklusif) tampil **terkunci** dan terbuka kalau Premium aktif (klaim trial 7 hari di Poin & Jurus, atau lewat Panel Demo).

## Prinsip dari brief yang diterapkan

- Skor jujur: pengguna baru melihat "Lagi Kenalan", bukan angka. Tidak ada klaim probabilitas lulus.
- Tidak ada warna merah untuk kegagalan; "belum siap" memakai oranye. Warna selalu disertai ikon dan kata.
- Satu CTA Light Blue penuh per layar; teks di atasnya Solid Black. Aksen Premium memakai Golden Yellow.
- Mode gelap memakai token "Fokus Malam". Animasi mengikuti "kurangi gerakan".
- Tidak ada leaderboard individual; Squad Board hanya menampilkan tujuan bersama.

## Catatan penting (baca sebelum dipakai presentasi)

- **Semua angka dan konten adalah data ilustrasi.** Jawaban Tanya AI adalah teks contoh; penilaian AI Interview dan Review Dokumen memakai aturan sederhana (hitung kata, kalimat, dll), **bukan AI sungguhan**.
- Materi latihan contoh adalah soal penalaran (verbal, numerik, logika) gaya TIU. Target UTBK dan LPDP memakai materi yang sama, dengan label subtes TPS dan TBS.
- **Harga paket Premium (Rp59.000 / Rp149.000 / Rp269.000) hanya contoh.** Nama paket kartu selain "(Gratis)" dan "Ambis 2026 #n", serta durasi UTBK dan CPNS, juga contoh. Rp0 dan Rp15.000 mengikuti halaman Ujian Tersedia. Pembayaran belum tersambung.
- Alumni (`#TerangiBersamaJerome`, Alya, Raka) dan semua tanya-jawab mereka fiktif.
- Ambang pita status (Di Jalur ≥ 75, Dikit Lagi ≥ 60) dan ambang Lagi Kenalan → Terukur (3 misi harian) adalah nilai sementara; keduanya pertanyaan terbuka untuk tim data.
- Maskot adalah rancangan orisinal terinspirasi logo Terang AI. Ganti `mascot()` di `js/icons.js` dengan aset resmi bila ada.
- State disimpan di `localStorage` browser. Gunakan *Reset data demo* di Profil untuk mengulang.

## Copywriting

Panduan nada, istilah baku, dan contoh pengingat ada di [docs/COPYWRITING.md](docs/COPYWRITING.md).

## Struktur

```
index.html
css/styles.css      token warna + komponen
js/data.js          target, bank soal, katalog & paket, data squad
js/state.js         state, persistensi, nilai turunan
js/charts.js        ring Skor Siap, grafik garis
js/icons.js         ikon SVG + maskot
js/ui.js            helper bersama (dialog, ribbon)
js/copy.js          copywriting: sapaan, pesan maskot, notifikasi, pengingat
js/ai.js            Tanya AI, AI Interview, Review Dokumen
js/kartu.js         Kartu Ujian, Ujian Saya, Riwayat Pembayaran
js/explore.js       Eksplor Kategori Lain, alumni, fitur Premium terkunci
js/app.js           tampilan inti, router, aksi
docs/COPYWRITING.md panduan copywriting
```
