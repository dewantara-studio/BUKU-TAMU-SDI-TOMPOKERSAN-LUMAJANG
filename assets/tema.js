/* ============================================================
   Mode Terang / Gelap — tombol mengambang di semua halaman,
   pilihan tersimpan di localStorage sehingga berlaku konsisten
   walau berpindah halaman atau menutup browser.
   ============================================================ */
(function () {
  const KUNCI = "temaBukuTamu";

  // Diterapkan sesegera mungkin (sebelum konten tampil) supaya
  // tidak ada "kedipan" warna saat halaman baru dimuat.
  const temaAwal = localStorage.getItem(KUNCI) || "terang";
  document.documentElement.setAttribute("data-tema", temaAwal);

  function ikon(mode) {
    return mode === "gelap"
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>`;
  }

  function terapkan(mode) {
    document.documentElement.setAttribute("data-tema", mode);
    localStorage.setItem(KUNCI, mode);
    const tombol = document.getElementById("tombolTema");
    if (tombol) tombol.innerHTML = ikon(mode);
  }

  function pasangTombol() {
    const tombol = document.createElement("button");
    tombol.id = "tombolTema";
    tombol.type = "button";
    tombol.className = "tombol-tema";
    tombol.setAttribute("aria-label", "Ganti mode terang/gelap");
    tombol.title = "Ganti mode terang/gelap";
    tombol.innerHTML = ikon(document.documentElement.getAttribute("data-tema"));
    document.body.appendChild(tombol);

    tombol.addEventListener("click", () => {
      const sekarang = document.documentElement.getAttribute("data-tema");
      terapkan(sekarang === "gelap" ? "terang" : "gelap");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pasangTombol);
  } else {
    pasangTombol();
  }
})();
