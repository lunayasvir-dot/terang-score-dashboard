# Terang Score — Dashboard

Prototipe dashboard **Terang Score** (Terang AI) berdasarkan dokumen *Product Requirement & UI Guideline* dan *Activation & Retention Solution (#SquadTerang)*.

Siklusnya: ukur kesiapan → susun rencana → berlatih bersama squad → buktikan hasilnya.

## Menjalankan di localhost

Tanpa build step dan tanpa dependensi. Cukup server statis (modul ES butuh `http://`, bukan `file://`):

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Lalu buka <http://localhost:5173>.

## Isi

| Menu | Yang ada |
|---|---|
| **Score & Plan** (Beranda) | Readiness Score (ring 3/4; Calibrating / Terukur / Terkalibrasi; pita On track, Close, Needs work), Peta Kesenjangan, kartu Daily 10, Streak + Rest Day Pass, peringatan tenggat, lapor hasil ujian |
| Weekly Score Report | Grafik garis interaktif, filter topik, penanda terkuat/terlemah, garis tanggal ujian, tabel alternatif |
| Daily 10 / Diagnostik | Kuis 10 soal dengan umpan balik langsung; onboarding diagnostik 5 soal tanpa akun |
| **#SquadTerang** | Papan tujuan bersama (tanpa peringkat, tanpa skor), filter dan urutan, kartu anggota, kirim semangat, Silent Study Room dengan timer bersama |
| **Points & Playbooks** | Saldo, batas poin bulanan, katalog hadiah, Playbooks alumni |
| **Terang Passport** | Ringkasan, riwayat lintas platform, bagikan dengan persetujuan eksplisit, cabut akses |
| Profil | Usia (tingkat fitur sosial), pengingat, kurangi gerakan, 5 pilihan palet, **panel demo** |

## Prinsip dari brief yang diterapkan

- Skor jujur: pengguna baru melihat "Calibrating", bukan angka. Tidak ada klaim probabilitas lulus.
- Tidak ada warna merah untuk kegagalan; "belum siap" memakai oranye. Warna selalu disertai ikon dan kata.
- Satu CTA Light Blue penuh per layar; teks di atasnya Solid Black.
- Cincin dan garis di atas putih memakai Blue Strong (kontras ≥ 3:1).
- Animasi mengikuti "kurangi gerakan" (OS maupun toggle di Profil).

## Catatan penting

- **Semua angka adalah data ilustrasi**, bukan data pengguna. Skor mingguan dibangkitkan deterministik per target ujian.
- Ambang pita status (On track ≥ 75, Close ≥ 60) dan ambang Calibrating → Terukur (3 Daily 10) adalah nilai **sementara**; keduanya pertanyaan terbuka untuk tim data.
- Kode warna adalah token usulan; perlu dicocokkan dengan brand kit resmi. Keluarga huruf belum ditetapkan, dipakai font sistem.
- Konten Playbooks, hadiah mitra, dan tautan Passport (`terang.example`) hanya contoh.
- State disimpan di `localStorage` browser. Gunakan *Reset data demo* di Profil untuk mengulang.

## Struktur

```
index.html
css/styles.css      token warna + komponen
js/data.js          konfigurasi target, bank soal, data squad
js/state.js         state, persistensi, nilai turunan
js/charts.js        ring Readiness Score, grafik garis
js/icons.js         ikon SVG
js/app.js           tampilan, router, aksi
```
