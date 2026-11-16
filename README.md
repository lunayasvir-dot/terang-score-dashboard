# Terang Score — Dashboard

Prototipe dashboard **Terang Score** (Terang AI) berdasarkan dokumen *Product Requirement & UI Guideline* dan *Activation & Retention Solution (#SquadTerang)*.

Siklusnya: kenali posisimu → susun rencana → belajar bareng squad → buktikan hasilnya.
Contoh ujian: **SKD CPNS, subtes TIU**.

## Menjalankan di localhost

Tanpa build step dan tanpa dependensi. Cukup server statis (modul ES butuh `http://`, bukan `file://`):

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Lalu buka <http://localhost:5173>.

## Isi

| Menu | Yang ada |
|---|---|
| **Beranda** | Skor Siap (ring 3/4; Lagi Kenalan / Terukur / Sudah Pas; pita Di Jalur, Dikit Lagi, Perlu Diasah), **Radar Skill** (peta kesenjangan topik TIU), Misi Harian, Api Belajar + Tiket Libur, peringatan tenggat, lapor hasil ujian |
| Rapor Mingguan | Grafik garis interaktif, filter topik, penanda topik terjago/terlemah, garis tanggal ujian, tabel alternatif |
| Misi Harian / Cek Posisi | Kuis 10 soal TIU dengan umpan balik langsung; onboarding 5 soal tanpa akun |
| **#SquadTerang** | Papan tujuan bareng (tanpa peringkat, tanpa skor), kartu anggota, kirim semangat, Ruang Belajar Hening dengan timer bareng, Teman Belajar |
| **Poin & Jurus** | Saldo & batas poin bulanan, katalog hadiah (Coba Gratis Premium 7 hari, Premium 1/3 hari, voucher), **paket Premium 1/3/6 bulan**, Jurus Alumni |
| **Paspor** | Ringkasan, riwayat lintas platform, bagikan dengan persetujuan eksplisit, cabut akses |
| Profil | Mode terang/gelap, kurangi gerakan, pengingat, mode usia, **Panel Demo** |

Maskot ada di brand, sapaan Beranda, umpan balik soal, dan layar selesai. Semuanya lewat fungsi `mascot()` di `js/icons.js`; tinggal diganti kalau aset maskot resmi sudah ada.

## Prinsip dari brief yang diterapkan

- Skor jujur: pengguna baru melihat "Lagi Kenalan", bukan angka. Tidak ada klaim probabilitas lulus.
- Tidak ada warna merah untuk kegagalan; "belum siap" memakai oranye. Warna selalu disertai ikon dan kata.
- Satu CTA Light Blue penuh per layar; teks di atasnya Solid Black.
- Cincin dan garis di atas putih memakai Blue Strong (kontras ≥ 3:1). Mode gelap memakai token "Fokus Malam".
- Animasi mengikuti "kurangi gerakan" (OS maupun toggle di Profil).

## Catatan penting

- **Semua angka adalah data ilustrasi**, bukan data pengguna. Skor mingguan dibangkitkan deterministik.
- Ambang pita status (Di Jalur ≥ 75, Dikit Lagi ≥ 60) dan ambang Lagi Kenalan → Terukur (3 misi harian) adalah nilai **sementara**; keduanya pertanyaan terbuka untuk tim data.
- **Harga paket Premium (Rp59.000 / Rp149.000 / Rp269.000) hanya contoh**, belum ditetapkan tim produk. Pembayaran belum tersambung.
- Kode warna adalah token usulan; perlu dicocokkan dengan brand kit resmi. Keluarga huruf belum ditetapkan, dipakai font sistem.
- Konten Jurus Alumni, hadiah mitra, dan tautan Paspor (`terang.example`) hanya contoh.
- State disimpan di `localStorage` browser. Gunakan *Reset data demo* di Profil untuk mengulang.

## Struktur

```
index.html
css/styles.css      token warna + komponen
js/data.js          ujian contoh, bank soal TIU, katalog & paket, data squad
js/state.js         state, persistensi, nilai turunan
js/charts.js        ring Skor Siap, grafik garis
js/icons.js         ikon SVG + maskot
js/app.js           tampilan, router, aksi
```
