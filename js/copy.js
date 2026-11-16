// Copywriting Terang AI. Panduan lengkap ada di docs/COPYWRITING.md.
// Nada: santai, hangat, singkat, kadang jenaka. Menyemangati, tidak menghakimi, tidak menekan.
import * as St from './state.js';
import { daysToExam, isDone, streakAtRisk, premiumLeft, scoreInfo, squad, esc } from './state.js';

const nm = () => (St.S.name ? `, ${esc(St.S.name)}` : '');

export function greeting() {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return `Pagi${nm()}! Sarapan dulu, abis itu 10 soal ya.`;
  if (h >= 11 && h < 15) return `Siang${nm()}! Istirahat sebentar, 10 soal cukup kok.`;
  if (h >= 15 && h < 19) return `Sore${nm()}! Masih ada waktu buat satu misi.`;
  if (h >= 19) return `Malem${nm()}! Santai aja, 10 soal doang.`;
  return `Udah larut${nm()}. Satu misi aja, abis itu bobo ya.`;
}

// Satu kalimat maskot di Beranda, ganti-ganti per hari biar nggak monoton.
const pick = (arr) => arr[new Date().getDate() % arr.length];
export function mascotLine({ calib, risk, done, weak, streak }) {
  if (calib) return pick([
    'Aku lagi kenalan sama kemampuanmu nih. Kerjain beberapa soal ya, biar skornya makin akurat!',
    'Belum kenal banget nih. Tiga misi lagi, aku udah bisa baca kekuatanmu.',
  ]);
  if (risk) return pick([
    'Api Belajarmu kedip-kedip nih! 10 soal aja udah cukup buat nyalain lagi.',
    'Tenang, belum telat kok. Satu misi, apinya aman.',
  ]);
  if (done) return pick([
    `Misi hari ini beres! Api Belajar ${streak} hari, keren banget.`,
    'Udah beres duluan. Sisa harinya buat kamu, istirahat yang enak ya.',
    'Tos dulu! Besok kita lanjut lagi.',
  ]);
  return pick([
    `Hai! Hari ini kita asah <b>${weak}</b> yuk. Cuma 10 soal kok.`,
    `<b>${weak}</b> lagi nunggu kamu nih. Sepuluh soal, sepuluh menit, kelar.`,
    `Yuk pelan-pelan beresin <b>${weak}</b>. Aku temenin.`,
  ]);
}

export function milestone(streak) {
  if (streak === 3) return 'Api Belajar 3 hari. Mulai kebiasaan nih!';
  if (streak === 7) return '7 hari berturut-turut! Api Belajarmu lagi on fire.';
  if (streak === 14) return '14 hari! Kamu udah jadi langganan Misi Harian.';
  if (streak === 30) return '30 hari. Serius, kamu luar biasa.';
  return '';
}

// Notifikasi dalam aplikasi. Dibangun dari keadaan pengguna, jadi selalu relevan.
export function notifications() {
  const s = St.S; const list = []; const d = daysToExam(); const info = scoreInfo(); const sq = squad();
  const left = premiumLeft();
  if (streakAtRisk()) list.push({ id: 'risk', ic: 'flame', title: 'Api Belajarmu kedip-kedip', body: '10 soal aja udah cukup buat nyalain lagi. Butuh rehat? Tiket Libur siap dipakai.', href: '#/daily', cta: 'Kerjain sekarang' });
  if (!isDone() && s.scoreState !== 'calibrating') list.push({ id: 'buddy', ic: 'heart', title: 'Bella udah beres hari ini', body: 'Tinggal kamu nih. Satu misi, abis itu tos virtual.', href: '#/daily', cta: 'Gas' });
  if (d > 0 && d <= 14) list.push({ id: 'near', ic: 'alert', title: `Ujian tinggal ${d} hari`, body: `Pelan tapi pasti. Kita rapihin ${esc(info.weak.name)} bareng-bareng ya.`, href: `#/daily?topic=${encodeURIComponent(info.weak.name)}`, cta: 'Asah topiknya' });
  if (d <= 0 && d >= -7 && s.scoreState !== 'terkalibrasi') list.push({ id: 'result', ic: 'trophy', title: 'Gimana ujiannya?', body: 'Cerita ke kita dong. Hasilnya bikin skormu makin pas, plus kamu dapet 100 poin.', href: '#/lapor-hasil', cta: 'Ceritain hasilnya' });
  if (left === 0 && !s.trialClaimed) list.push({ id: 'trial', ic: 'crown', title: 'Ada hadiah buat kamu', body: 'Premium 7 hari, gratis. Tanpa kartu, tanpa ribet. Tinggal klaim.', href: '#/poin', cta: 'Klaim sekarang' });
  if (left > 0 && left <= 2) list.push({ id: 'trialend', ic: 'crown', title: `Premium-mu tinggal ${left} hari`, body: 'Manfaatin dulu semuanya. Kalau cocok, ada paket mulai Rp59.000.', href: '#/poin', cta: 'Lihat paket' });
  list.push({ id: 'squad', ic: 'users', title: `${sq.done} dari ${sq.total} udah 4 hari`, body: 'Dikit lagi squad kita tuntas. Yuk bantu ngegas.', href: '#/squad', cta: 'Cek squad' });
  list.push({ id: 'newai', ic: 'sparkle', title: 'Baru: AI Interview & Review Dokumen', body: 'Latihan wawancara dan cek esai kapan aja, tanpa deg-degan.', href: '#/interview', cta: 'Coba dulu' });
  return list;
}

// Pratinjau pengingat (push / WhatsApp) per situasi. Panjang disengaja pendek.
export const REMINDERS = [
  { when: 'Jam belajar biasa', title: 'Waktunya 10 soal ✨', body: 'Cuma sepuluh menit. Api Belajarmu bakal makasih.' },
  { when: 'Api Belajar hampir padam', title: 'Eh, apinya kedip-kedip', body: 'Satu misi aja cukup. Atau pakai Tiket Libur kalau lagi capek.' },
  { when: 'Teman belajar sudah selesai', title: 'Bella udah beres nih', body: 'Giliran kamu. Tos virtual nunggu di ujung misi.' },
  { when: 'Ujian 7 hari lagi', title: 'Seminggu lagi, kamu siap!', body: 'Latihan ringan hari ini, istirahat cukup nanti malam.' },
  { when: 'Setelah ujian', title: 'Gimana tadi?', body: 'Cerita ke kita yuk. Skormu bisa makin pas, kamu juga dapet 100 poin.' },
  { when: 'Trial Premium hampir habis', title: 'Premium-mu tinggal 2 hari', body: 'Puas-puasin dulu. Kalau mau lanjut, ada paket mulai Rp59.000.' },
];
