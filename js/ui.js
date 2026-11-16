// Helper UI bersama (dipakai app.js dan modul fitur).
import { icon } from './icons.js';
import { esc } from './state.js';

export { esc };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const rp = (n) => `Rp${n.toLocaleString('id-ID')}`;
export const initial = (n) => esc((n || '?').trim().charAt(0).toUpperCase());

// app.js mengisi hooks.render supaya modul fitur bisa merender ulang tanpa impor melingkar.
export const hooks = { render: () => {} };

export function ribbon(text) {
  const el = document.createElement('div');
  el.textContent = text;
  $('#ribbon').appendChild(el);
  setTimeout(() => el.remove(), 3700);
}
export function openDlg(title, body) {
  $('#dlg').innerHTML = `<div class="dlg-body"><div class="dlg-head"><h2 id="dlg-title">${title}</h2>
    <button class="icon-btn" data-act="dlg-close" aria-label="Tutup">${icon('close')}</button></div>${body}</div>`;
  if (!$('#dlg').open) $('#dlg').showModal();
}
export const closeDlg = () => { if ($('#dlg').open) $('#dlg').close(); };

// Teks bantuan "Premium" yang dipakai berulang.
export const lockChip = (text = 'Premium') => `<span class="pill gold lock-chip">${icon('lock', 14)} ${text}</span>`;
