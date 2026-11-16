// Visual inti: gauge Readiness Score (progress ring 3/4) dan grafik garis Weekly Score Report.
import { icon } from './icons.js';

export const BAND_META = {
  on:    { label: 'On track',   color: 'var(--blue-strong)', icon: 'check', line: 'Kamu sudah di jalur yang tepat. Jaga ritmenya.' },
  close: { label: 'Close',      color: 'var(--gold)',        icon: 'half',  line: 'Sedikit lagi menuju target. Fokus ke topik terlemah.' },
  needs: { label: 'Needs work', color: 'var(--orange)',      icon: 'alert', line: 'Masih perlu dikerjakan. Mulai dari satu topik hari ini.' },
};

const R = 80;

export function ringSVG({ mode, score = 0, band = 'close', big = true, badge = '' }) {
  const calib = mode === 'calibrating';
  const meta = BAND_META[band];
  const size = big ? 220 : 120;
  const alt = calib
    ? 'Readiness Score sedang Calibrating, belum ada angka'
    : `Readiness Score ${score}, status ${meta.label}`;
  const track = calib
    ? `<path class="ring-track calib" d="M43.43 156.57 A80 80 0 1 1 156.57 156.57" pathLength="100" fill="none" stroke-width="6" stroke-dasharray="2.2 1.8" stroke-linecap="butt"/>`
    : `<circle class="ring-track" cx="100" cy="100" r="${R}" pathLength="100" transform="rotate(135 100 100)" stroke-dasharray="75 100" fill="none" stroke-width="16" stroke-linecap="round"/>`;
  const val = calib ? '' : `<circle class="ring-val" cx="100" cy="100" r="${R}" pathLength="100" transform="rotate(135 100 100)"
      stroke-dasharray="0 100" data-target="${(score * 0.75).toFixed(2)}" fill="none" stroke="${meta.color}" stroke-width="16" stroke-linecap="round"/>`;
  const center = calib
    ? `<text x="100" y="98" text-anchor="middle" class="ring-word">Calibrating</text>
       <text x="100" y="122" text-anchor="middle" class="ring-sub">skor belum ditampilkan</text>`
    : `<text x="100" y="112" text-anchor="middle" class="ring-num">${score}</text>
       <text x="100" y="132" text-anchor="middle" class="ring-sub">dari 100</text>`;
  return `<svg class="ring" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${alt}">
    ${track}${val}${center}</svg>
    <div class="ring-status">${calib
      ? `<span class="pill neutral">${icon('dots')} Calibrating</span>`
      : `<span class="pill band-${band}">${icon(meta.icon)} ${meta.label}</span>${badge}`}</div>`;
}

const fmt = (d) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
export const fmtDate = fmt;

/**
 * Grafik garis tunggal. data: [{label, date, value}], slots = jumlah slot x (termasuk masa depan).
 * examSlot = indeks slot tanggal ujian. marks = [{i, kind, label}] pada titik tertentu.
 */
export function lineChart({ data, slots, examSlot, examLabel, calibrating, marks = [], color = 'var(--blue-strong)' }) {
  const W = 640, H = 300, L = 40, Rm = 18, T = 28, B = 40;
  const vals = data.map((d) => d.value);
  const lo = Math.max(0, Math.floor((Math.min(...vals) - 8) / 10) * 10);
  const hi = 100;
  const x = (i) => L + (slots <= 1 ? 0 : (i * (W - L - Rm)) / (slots - 1));
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const ticks = [];
  for (let t = lo; t <= hi; t += 10) ticks.push(t);
  const grid = ticks.map((t) => `<line x1="${L}" x2="${W - Rm}" y1="${y(t)}" y2="${y(t)}" class="grid"/>
    <text x="${L - 8}" y="${y(t) + 4}" text-anchor="end" class="axis">${t}</text>`).join('');
  const step = slots > 9 ? 2 : 1;
  const xl = Array.from({ length: slots }, (_, i) => {
    if (i % step !== 0 && i !== examSlot) return '';
    const d = data[i];
    const label = d ? d.label : (i === examSlot ? examLabel : '');
    if (!label) return '';
    return `<text x="${x(i)}" y="${H - 14}" text-anchor="middle" class="axis">${label}</text>`;
  }).join('');
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');
  const exam = examSlot != null
    ? `<line x1="${x(examSlot)}" x2="${x(examSlot)}" y1="${T - 10}" y2="${H - B}" class="exam-line"/>
       <text x="${x(examSlot)}" y="${T - 14}" text-anchor="${x(examSlot) > W - 80 ? 'end' : 'middle'}" class="exam-label">Ujian ${examLabel}</text>` : '';
  const pts = data.map((d, i) => `<g class="pt" tabindex="0" data-i="${i}" role="button"
      aria-label="${d.label}, skor ${d.value}"><circle cx="${x(i)}" cy="${y(d.value)}" r="16" fill="transparent"/>
      <circle class="dot${calibrating ? ' calib' : ''}" cx="${x(i)}" cy="${y(d.value)}" r="4.5" /></g>`).join('');
  const mk = marks.map((m) => {
    const cx = x(m.i), cy = y(data[m.i].value);
    const up = m.kind === 'strong';
    const ty = up ? cy - 20 : cy + 30;
    const anchor = cx > W - 150 ? 'end' : 'start';
    const tx = anchor === 'end' ? cx - 10 : cx + 10;
    const shape = up
      ? `<circle cx="${cx}" cy="${cy}" r="6.5" class="mk-strong"/>`
      : `<path d="M${cx} ${cy - 13} L${cx + 13} ${cy} L${cx} ${cy + 13} L${cx - 13} ${cy} Z" class="mk-weak"/>`;
    return `${shape}<text x="${tx}" y="${ty}" text-anchor="${anchor}" class="mk-label ${up ? 'strong' : 'weak'}">${up ? '▲ Terkuat' : '▼ Terlemah'}: ${m.label}</text>`;
  }).join('');
  return `<svg class="line-chart" viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Grafik garis skor mingguan. Tabel data tersedia sebagai alternatif.">
    ${grid}${exam}
    <path d="${path}" fill="none" class="series${calibrating ? ' calib' : ''}" stroke="${calibrating ? 'var(--calib)' : color}"/>
    ${xl}${mk}${pts}</svg>`;
}
