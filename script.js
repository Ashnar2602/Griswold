"use strict";
const legacyGuidePages = {"fondamenti": "fondamenti.html", "limiti": "fondamenti.html", "quattro": "fondamenti.html", "ricette": "ricette.html", "prismi": "ricette.html", "protezione": "strategie.html", "percorsi": "strategie.html", "unici": "unici.html", "finitura": "finitura.html", "trasfigurazione": "finitura.html", "talismani": "talismani.html", "economia": "farming.html", "checklist": "checklist.html", "patch": "aggiornamenti.html", "changelog": "aggiornamenti.html", "known-issues": "aggiornamenti.html", "fonti": "fonti.html"};
const currentFile = location.pathname.split("/").pop();
const legacyTarget = legacyGuidePages[location.hash.slice(1)];
if ((!currentFile || currentFile === "index.html") && !location.pathname.includes("/simulatore/") && legacyTarget) {
  location.replace(legacyTarget + location.hash);
}
const menu = document.querySelector(".mobile-nav");
const sidebar = document.querySelector(".sidebar");
function closeMenu(returnFocus = false) {
  if (!sidebar || !menu) return;
  const wasOpen = sidebar.classList.contains("open");
  sidebar.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  if (returnFocus && wasOpen) menu.focus();
}
if (menu && sidebar) {
  menu.addEventListener("click", () => {
    const opened = sidebar.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(opened));
    if (opened) sidebar.querySelector("a")?.focus();
  });
  sidebar.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("click", event => { if (!sidebar.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(true); });
  window.matchMedia("(min-width: 901px)").addEventListener("change", () => closeMenu());
}
document.querySelectorAll(".table-wrap").forEach(wrapper => {
  wrapper.tabIndex = 0;
  wrapper.setAttribute("role", "region");
  const caption = wrapper.querySelector("caption");
  if (caption) wrapper.setAttribute("aria-label", caption.textContent);
});
