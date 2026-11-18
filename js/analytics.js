// Pencatat event demo (tanpa backend). Disimpan di localStorage, hanya terlihat di panel "Data demo"
// yang tersembunyi: aktifkan dengan ?dev=1 di URL. Tidak pernah tampil ke pelajar.
const KEY = 'terang-demo-events';
export const EVENTS = ['first_score_time', 'diagnostic_completed', 'daily_mission_done', 'squad_joined', 'outcome_reported', 'next_goal_chosen', 'pass_viewed', 'ticket_viewed'];

export function track(name, props = {}) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    list.push({ name, props, at: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(-200)));
  } catch (e) { /* penyimpanan diblokir: abaikan */ }
}
export function events() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
export function clearEvents() { try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ } }
export function devOn() {
  try {
    if (new URLSearchParams(location.search).get('dev') === '1') localStorage.setItem('terang-dev', '1');
    return localStorage.getItem('terang-dev') === '1';
  } catch (e) { return false; }
}
