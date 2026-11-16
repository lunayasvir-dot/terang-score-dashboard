// Ikon SVG inline (stroke mengikuti currentColor).
const P = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7"/><path d="M18.5 14.3c1.9.8 3 2.8 3 5.7"/>',
  gift: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v8h14v-8"/><path d="M12 8v12"/><path d="M12 8c-1-3-5-4-5-1.5S10 8 12 8zM12 8c1-3 5-4 5-1.5S14 8 12 8z"/>',
  passport: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8.5 17h7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  flame: '<path d="M12 2c1 4 5 6 5 11a5 5 0 01-10 0c0-2 1-3.200 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" fill="currentColor"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  half: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 010 16z" fill="currentColor"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4"/><path d="M12 17v.5"/>',
  dots: '<circle cx="6" cy="12" r="1.500" fill="currentColor"/><circle cx="12" cy="12" r="1.500" fill="currentColor"/><circle cx="18" cy="12" r="1.500" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  share: '<circle cx="6" cy="12" r="2.500"/><circle cx="18" cy="6" r="2.500"/><circle cx="18" cy="18" r="2.500"/><path d="M8.200 11l7.600-4M8.200 13l7.600 4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 15l4-5 3 3 5-7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
  moon: '<path d="M20 14.500A8 8 0 019.500 4 8 8 0 1020 14.500z"/>',
  heart: '<path d="M12 20s-8-4.800-8-10.500A4.500 4.500 0 0112 7a4.500 4.500 0 018 2.500C20 15.200 12 20 12 20z"/>',
  link: '<path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 00-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 00-5.700 0l-3 3A4 4 0 0011 18.700l1-1"/>',
  pdf: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9 14h6M9 17h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/>',
  crown: '<path d="M3 8l4.500 4L12 5l4.500 7L21 8l-2 11H5z"/>',
  zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4"/><path d="M12 13v4M8 21h8M10 17h4"/>',
  ticket: '<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  chat: '<path d="M21 12a8 8 0 01-11.600 7.100L4 20l1.100-4.600A8 8 0 1121 12z"/><path d="M8.500 12h.01M12 12h.01M15.500 12h.01"/>',
  wave: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h3"/>',
  sparkle: '<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/><path d="M19 17l.7 1.800L21.500 19.500l-1.800.7L19 22l-.7-1.800-1.800-.7 1.800-.7z"/>',
  bell: '<path d="M6 16V11a6 6 0 0112 0v5l1.500 2h-15z"/><path d="M10 21h4"/>',
  send: '<path d="M4 12L20 4l-5 16-3.500-6.500z"/><path d="M11.500 13.500L20 4"/>',
  grad: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c0 1.500 2.700 3 6 3s6-1.500 6-3v-4.500"/>',
  building: '<path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M3 10l9-6 9 6"/>',
  headset: '<path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.500"/><rect x="17" y="14" width="4" height="6" rx="1.500"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  pen: '<path d="M4 20l4-1L19 8a2.100 2.100 0 00-3-3L5 16z"/><path d="M14 7l3 3"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.500 9.500h4a1.500 1.500 0 010 3h-3a1.500 1.500 0 000 3h4"/>',
  gift2: '<rect x="3" y="9" width="18" height="11" rx="2"/><path d="M12 9v11M3 13h18"/><path d="M12 9c-2-4-6-3-5 0 .5 1.500 3 1 5 0zM12 9c2-4 6-3 5 0-.5 1.500-3 1-5 0z"/>',
};

// Maskot Terang Score: bulat biru, helm putih, visor gelap, antena bintang emas.
// Terinspirasi logo Terang AI (lingkaran biru + siluet helm). Ganti fungsi ini
// dengan aset maskot resmi kalau sudah ada; semua tampilan memakai mascot().
const FACE = {
  happy: '<ellipse cx="39" cy="52" rx="4.2" ry="5.5" fill="#fff"/><ellipse cx="61" cy="52" rx="4.2" ry="5.5" fill="#fff"/><path d="M43 61 Q50 67 57 61" stroke="#fff" stroke-width="2.600" fill="none" stroke-linecap="round"/>',
  cheer: '<path d="M33.500 55 Q39 46 44.500 55M55.500 55 Q61 46 66.500 55" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M42 59.500 Q50 71 58 59.500z" fill="#fff"/>',
  think: '<ellipse cx="39" cy="52" rx="5" ry="6" fill="#fff"/><ellipse cx="61" cy="52" rx="5" ry="6" fill="#fff"/><circle cx="41" cy="50" r="2.600" fill="#111418"/><circle cx="63" cy="50" r="2.600" fill="#111418"/><path d="M46 62 H54" stroke="#fff" stroke-width="2.600" stroke-linecap="round"/><circle cx="74" cy="17" r="2.200" fill="#fff"/><circle cx="80" cy="11" r="2.800" fill="#fff"/><circle cx="87" cy="4" r="3.400" fill="#fff"/>',
  calm: '<path d="M33.500 52 Q39 58 44.500 52M55.500 52 Q61 58 66.500 52" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M44 62 Q50 66 56 62" stroke="#fff" stroke-width="2.600" fill="none" stroke-linecap="round"/>',
  proud: '<path d="M39 45 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M61 45 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#F5B82E"/><path d="M42 61 Q50 68 58 61" stroke="#fff" stroke-width="2.600" fill="none" stroke-linecap="round"/>',
};
// Animasi lewat CSS (styles.css › "Maskot animasi"): melayang, berkedip, antena goyang,
// lompat saat senang/bangga, miring saat mikir. Mati otomatis kalau "kurangi gerakan" aktif.
export function mascot(mood = 'happy', size = 64, extra = '') {
  const m = FACE[mood] ? mood : 'happy';
  return `<svg class="mascot mood-${m} ${extra}" viewBox="0 -8 100 108" width="${size}" height="${Math.round(size * 1.08)}" role="img" aria-label="Maskot Terang Score">
    <ellipse class="m-shadow" cx="50" cy="99" rx="26" ry="3.500" fill="#111418" opacity=".12"/>
    <g class="m-float">
      <g class="m-ant"><line x1="50" y1="5" x2="50" y2="-2" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <circle class="m-star" cx="50" cy="-4" r="4.800" fill="#F5B82E"/></g>
      <circle cx="50" cy="50" r="46" fill="var(--blue)"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="4.500"/>
      <rect x="23" y="37" width="54" height="33" rx="16.500" fill="#111418"/>
      <path d="M31 42 Q37 39.500 44 40" stroke="#fff" stroke-opacity=".35" stroke-width="2.500" fill="none" stroke-linecap="round"/>
      <g class="m-face">${FACE[m]}</g>
    </g></svg>`;
}

// Maskot + gelembung ucapan.
export function say(mood, html, size = 72) {
  return `<div class="say">${mascot(mood, size)}<div class="bubble">${html}</div></div>`;
}

export function icon(name, size = 18) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}
