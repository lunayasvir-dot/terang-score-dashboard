// State aplikasi (disimpan di localStorage) dan nilai turunan.
import { TARGETS, TOPICS, BANDS, SQUAD_NAMES, SQUAD_DAYS, SQUAD_ACTIVE_MIN, SQUAD_STREAK, MONTH_CAP } from './data.js';

const KEY = 'terang-score-v3';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const daysBetween = (a, b) => Math.round((b - a) / 86400000);
export const longDate = (d) => d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function fresh(over = {}) {
  const t = today();
    return {
    onboarded: true, name: '', target: over.target || 'CPNS', examDate: toISO(addDays(t, TARGETS[over.target || 'CPNS'].days)),
    scoreState: 'terukur', theme: 'light', reduceMotion: false, age: '18+',
    premiumUntil: null, trialClaimed: false, vouchers: 0,
    credits: 2000, cards: [], payments: [], notifSeen: [], interviews: 0, reviews: 0,
    pathStep: 9, dailyMin: 30, squadJoined: true, joinedAt: toISO(addDays(t, -2)), webImported: false, history: [], prevSquads: [], status: null, source: null, general: false,
    refCode: 'TERANG-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    reminderHour: 19, channel: 'inapp',
    doneDate: null, streak: 6, bestStreak: 9, restPasses: 2, restDates: [],
    studyDates: Array.from({ length: 6 }, (_, i) => toISO(addDays(t, -(6 - i)))),
    sessions: 24, flagged: [], userDays: 2, squadAllDone: false, celebrated: false,
    points: 1240, earnedMonth: 340, ledger: [
      { t: 'Misi harian selesai', p: 20, d: toISO(addDays(t, -1)) },
      { t: 'Skor mingguan naik', p: 30, d: toISO(addDays(t, -4)) },
      { t: 'Tukar: Slot Ruang Belajar Hening', p: -150, d: toISO(addDays(t, -9)) },
    ],
    shares: [], result: null, resultRewarded: false, kating: false, forceRisk: false, room: false,
    ...over,
  };
}

export let S = fresh();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    // Pertama kali buka: belum ada data → tampilkan landing + onboarding.
    S = raw ? { ...fresh(), ...JSON.parse(raw) } : fresh({ onboarded: false });
  } catch (e) { /* penyimpanan bisa diblokir; aplikasi tetap jalan tanpa persistensi */ }
  rollover();
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ } }
export function replaceState(next) { S = next; save(); }

// Streak putus bila ada hari terlewat tanpa belajar atau Rest Day Pass.
function rollover() {
  if (!S.studyDates.length) return;
  const last = fromISO([...S.studyDates, ...S.restDates].sort().pop());
  if (daysBetween(last, today()) > 1) S.streak = 0;
}

export const cfg = () => ({ bank: 'tps', ...TARGETS[S.target], topics: TARGETS[S.target].topics || TOPICS });
export const premiumLeft = () => (S.premiumUntil ? Math.max(0, daysBetween(today(), fromISO(S.premiumUntil))) : 0);
export const examDate = () => fromISO(S.examDate);
export const daysToExam = () => daysBetween(today(), examDate());
export const isDone = () => S.doneDate === toISO(today());
export const isRested = () => S.restDates.includes(toISO(today()));
export const streakAtRisk = () => !isDone() && !isRested() && S.streak > 0 && (S.forceRisk || new Date().getHours() >= S.reminderHour);

export const band = (v) => (v >= BANDS.onTrack ? 'on' : v >= BANDS.close ? 'close' : 'needs');

function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
}

// 8 minggu terakhir per topik, deterministik per target. Data ilustrasi.
export function weeklySeries() {
  const t = today(); const n = 8;
  const topics = cfg().topics.map(([name, end]) => {
    const r = rng(TARGETS[S.target].subtes + name);
    const start = end - (14 + Math.round(r() * 12));
    const vals = Array.from({ length: n }, (_, i) => {
      const base = start + ((end - start) * i) / (n - 1);
      const wig = i === n - 1 ? 0 : (r() - 0.5) * 5;
      return Math.max(0, Math.min(100, Math.round(base + wig)));
    });
    return { name, vals };
  });
  const overall = Array.from({ length: n }, (_, i) => Math.round(topics.reduce((s, tp) => s + tp.vals[i], 0) / topics.length));
  const weeks = Array.from({ length: n }, (_, i) => addDays(t, -(n - 1 - i) * 7));
  return { topics, overall, weeks };
}

export function scoreInfo() {
  const { topics, overall } = weeklySeries();
  const score = overall[overall.length - 1];
  const now = topics.map((tp) => ({ name: tp.name, v: tp.vals[tp.vals.length - 1] })).sort((a, b) => a.v - b.v);
  return { score, band: band(score), now, weak: now[0], strong: now[now.length - 1], prev: overall[overall.length - 2] };
}

export function squad() {
  const total = SQUAD_NAMES.length + 1;
  const members = SQUAD_NAMES.map((name, i) => ({
    id: i, name, days: S.squadAllDone ? 4 : SQUAD_DAYS[i], active: SQUAD_ACTIVE_MIN[i], streak: SQUAD_STREAK[i], me: false,
  }));
  members.push({ id: 99, name: S.name || 'Kamu', days: S.squadAllDone ? 4 : S.userDays, active: isDone() ? 0 : 60, streak: S.streak + (isDone() ? 0 : 0), me: true });
  const done = members.filter((m) => m.days >= 4).length;
  const t = new Date(); const idx = (t.getDay() + 6) % 7; // Senin = 0
  return { members, total, done, daysLeft: 6 - idx };
}

export function addPoints(n, text) {
  const room = Math.max(0, MONTH_CAP - S.earnedMonth);
  const give = Math.min(n, room);
  S.ledger.unshift({ t: give < n ? `${text} (batas bulanan tercapai)` : text, p: give, d: toISO(today()) });
  S.points += give; S.earnedMonth += give;
  return give;
}
