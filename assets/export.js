/* ============================================================
   Ekspor data buku tamu ke Excel (.xlsx), PDF, dan Word (.doc)
   ============================================================ */

function baruskanUntukEkspor(list) {
  return list.map((d, i) => ({
    "No": i + 1,
    "Hari": d.hari || "",
    "Tanggal": d.tanggal || "",
    "Kategori": labelKategori(d.kategori),
    "Dari / Instansi": d.kategori === "dinas" ? (d.dari || "")
      : d.kategori === "wali" ? `Wali dari ${d.waliDari || "-"} (${d.waliJenis || "-"})`
      : "-",
    "Nama": d.kategori === "wali" ? (d.waliDari ? `${d.waliJenis || "Wali"} dari ${d.waliDari}` : "") : (d.namaTamu || ""),
    "Jabatan": d.jabatan || "-",
    "Tujuan dan Keperluan": d.tujuan || "",
    "Pesan / Saran": d.pesan || "-",
    "Tanda Tangan": d.tandaTangan ? "Ada" : "Tidak ada",
    "Dicatat Oleh": d.dicatatOleh || "-",
  }));
}

function namaBerkas(ekstensi) {
  const t = new Date();
  const stempel = `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, "0")}${String(t.getDate()).padStart(2, "0")}`;
  return `buku-tamu-sdi-tompokersan-${stempel}.${ekstensi}`;
}

function eksporExcel(list) {
  const baris = baruskanUntukEkspor(list);
  const lembar = XLSX.utils.json_to_sheet(baris);
  lembar["!cols"] = [
    { wch: 4 }, { wch: 10 }, { wch: 16 }, { wch: 11 }, { wch: 26 },
    { wch: 22 }, { wch: 16 }, { wch: 32 }, { wch: 28 }, { wch: 10 }, { wch: 22 },
  ];
  const buku = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(buku, lembar, "Buku Tamu");
  XLSX.writeFile(buku, namaBerkas("xlsx"));
}

function eksporPDF(list) {
  const { jsPDF } = window.jspdf;
  const dok = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  dok.setFontSize(13);
  dok.text("Buku Tamu — SD Islam Tompokersan Lumajang", 40, 36);
  dok.setFontSize(9);
  dok.setTextColor(100);
  dok.text(`Diunduh: ${new Date().toLocaleString("id-ID")}`, 40, 52);

  const kolom = ["No", "Hari/Tgl", "Kategori", "Dari/Instansi", "Nama", "Jabatan", "Tujuan & Keperluan", "Pesan/Saran", "TTD"];
  const baris = list.map((d, i) => [
    i + 1,
    `${d.hari || ""}\n${d.tanggal || ""}`,
    labelKategori(d.kategori),
    d.kategori === "dinas" ? (d.dari || "") : d.kategori === "wali" ? `${d.waliJenis || "-"} dari ${d.waliDari || "-"}` : "-",
    d.kategori === "wali" ? "-" : (d.namaTamu || ""),
    d.jabatan || "-",
    d.tujuan || "",
    d.pesan || "-",
    d.tandaTangan ? "Ada" : "-",
  ]);

  dok.autoTable({
    head: [kolom],
    body: baris,
    startY: 66,
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [13, 61, 44], textColor: 255 },
    alternateRowStyles: { fillColor: [246, 243, 234] },
    columnStyles: { 0: { cellWidth: 24 }, 1: { cellWidth: 55 } },
  });

  dok.save(namaBerkas("pdf"));
}

function eksporWord(list) {
  const baris = baruskanUntukEkspor(list);
  const kolom = Object.keys(baris[0] || {
    No: "", Hari: "", Tanggal: "", Kategori: "", "Dari / Instansi": "", Nama: "",
    Jabatan: "", "Tujuan dan Keperluan": "", "Pesan / Saran": "", "Tanda Tangan": "", "Dicatat Oleh": "",
  });

  let tabelHtml = `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:Calibri,Arial;font-size:11px;width:100%;">
    <tr style="background:#0d3d2c;color:#fff;">${kolom.map((k) => `<th>${k}</th>`).join("")}</tr>`;
  baris.forEach((b) => {
    tabelHtml += `<tr>${kolom.map((k) => `<td>${(b[k] ?? "").toString().replace(/\n/g, "<br/>")}</td>`).join("")}</tr>`;
  });
  tabelHtml += "</table>";

  const htmlLengkap = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>Buku Tamu</title></head>
    <body>
      <h2 style="font-family:Calibri,Arial;color:#0d3d2c;">Buku Tamu — SD Islam Tompokersan Lumajang</h2>
      <p style="font-family:Calibri,Arial;font-size:11px;color:#555;">Diunduh: ${new Date().toLocaleString("id-ID")}</p>
      ${tabelHtml}
    </body></html>`;

  const blob = new Blob(["\ufeff", htmlLengkap], { type: "application/msword" });
  const tautan = document.createElement("a");
  tautan.href = URL.createObjectURL(blob);
  tautan.download = namaBerkas("doc");
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
}
