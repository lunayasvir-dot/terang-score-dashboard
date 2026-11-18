# Panduan Copywriting Terang AI

Dipakai untuk notifikasi, pengingat, pesan maskot, dan microcopy di seluruh aplikasi.
Semua contoh di prototipe ada di `js/copy.js` dan dirender di Beranda, pusat notifikasi (ikon lonceng), dan Profil › "Contoh pengingat dari Terang".

**Catatan:** nada ini terinspirasi gaya aplikasi konsumen yang santai dan hangat (seperti Gojek), tapi semua kalimat ditulis ulang khusus untuk Terang. Belum ada riset resmi atas materi kampanye Gojek; kalau tim ingin benchmark yang lebih ketat, kumpulkan contoh aslinya dulu.

## Prinsip

1. **Ngobrol, bukan ceramah.** Pakai "kamu", kalimat pendek, bahasa sehari-hari. Hindari "Anda" dan kalimat birokratis.
2. **Satu pesan, satu ajakan.** Judul menangkap perhatian, isi menjelaskan, tombol bilang apa yang terjadi.
3. **Menyemangati, tidak menghukum.** Brief produk melarang rasa dihukum: tidak ada merah, tidak ada "kamu gagal", tidak ada hitung mundur yang menakutkan. Api Belajar yang hampir padam diberi jalan keluar (satu misi atau Tiket Libur).
4. **Jujur soal data.** Skor yang belum layak ditampilkan disebut "Lagi Kenalan". Tidak ada janji "pasti lolos".
5. **Jenaka secukupnya.** Satu candaan ringan per pesan paling banyak. Jangan melucu saat pengguna sedang gagal atau cemas.
6. **Hemat emoji.** Maksimal satu, dan hanya di notifikasi push. Tidak di layar utama.

## Istilah baku

| Jangan | Pakai |
|---|---|
| Readiness Score | Skor Siap |
| Calibrating | Lagi Kenalan |
| Terkalibrasi | Sudah Pas |
| On track / Close / Needs work | Di Jalur / Dikit Lagi / Perlu Diasah |
| Weekly Score Report | Rapor Mingguan |
| Daily 10 | Misi Harian |
| Streak | Api Belajar |
| Rest Day Pass | Tiket Libur |
| Silent Study Room | Ruang Belajar Hening |
| Buddy | Teman Belajar |
| Playbooks | Jurus Alumni |
| Peta kesenjangan | Radar Skill |

Nama fitur AI mengikuti produk yang sudah ada: Tanya AI, AI Interview, Review Dokumen.

## Contoh pengingat

| Situasi | Judul | Isi |
|---|---|---|
| Jam belajar biasa | Waktunya 10 soal ✨ | Cuma sepuluh menit. Api Belajarmu bakal makasih. |
| Api Belajar hampir padam | Eh, apinya kedip-kedip | Satu misi aja cukup. Atau pakai Tiket Libur kalau lagi capek. |
| Teman belajar sudah selesai | Bella udah beres nih | Giliran kamu. Tos virtual nunggu di ujung misi. |
| Ujian 7 hari lagi | Seminggu lagi, kamu siap! | Latihan ringan hari ini, istirahat cukup nanti malam. |
| Setelah ujian | Gimana tadi? | Cerita ke kita yuk. Skormu bisa makin pas, kamu juga dapet 100 poin. |
| Trial Premium hampir habis | Premium-mu tinggal 2 hari | Puas-puasin dulu. Mau lanjut? Ada Pass Ujian sekali bayar, mulai Rp49.000. |

## Momen berkesan

- **Sapaan menurut jam** (pagi, siang, sore, malam, larut) di Beranda.
- **Maskot** ganti ekspresi: berpikir saat skor Lagi Kenalan, menyemangati saat Api Belajar terancam, bangga saat misi selesai.
- **Kilas pencapaian** untuk Api Belajar 3, 7, 14, dan 30 hari.
- **Ruang kosong ramah:** tidak ada grafik kosong, selalu ada ajakan berikutnya.

## Yang perlu dicek sebelum rilis

- Harga yang disebut di pengingat (Rp49.000, Rp25.000) adalah contoh dan harus mengikuti harga final.
- Pengingat WhatsApp hanya untuk pengguna dewasa; pengguna di bawah 18 hanya menerima notifikasi dalam aplikasi.
- Pengguna harus bisa mengatur jam dan kanal pengingat (sudah ada di Profil).
