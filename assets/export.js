/* ============================================================
   Ekspor data buku tamu ke Excel (.xlsx), PDF, dan Word (.doc)
   — gambar tanda tangan ikut disematkan di ketiga format, bukan
   cuma keterangan "Ada/Tidak ada" saja.
   ============================================================ */

/** Normalkan satu entri tamu jadi field yang konsisten untuk semua ekspor. */
function normalkanTamu(d, nomor) {
  return {
    no: nomor,
    hari: d.hari || "",
    tanggal: d.tanggal || "",
    kategori: labelKategori(d.kategori),
    dariInstansi: d.kategori === "dinas" ? (d.dari || "")
      : d.kategori === "wali" ? `${d.waliJenis || "Wali"} dari ${d.waliDari || "-"}`
      : "-",
    nama: d.kategori === "wali" ? "-" : (d.namaTamu || ""),
    jabatan: d.jabatan || "-",
    tujuan: d.tujuan || "",
    pesan: d.pesan || "-",
    petugas: d.dicatatOleh || "-",
    tandaTangan: d.tandaTangan || null,
  };
}

function namaBerkas(ekstensi) {
  const t = new Date();
  const stempel = `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, "0")}${String(t.getDate()).padStart(2, "0")}`;
  return `buku-tamu-sdi-tompokersan-${stempel}.${ekstensi}`;
}

function unduhBlob(blob, nama) {
  const tautan = document.createElement("a");
  tautan.href = URL.createObjectURL(blob);
  tautan.download = nama;
  document.body.appendChild(tautan);
  tautan.click();
  document.body.removeChild(tautan);
  setTimeout(() => URL.revokeObjectURL(tautan.href), 4000);
}

/* ================= EXCEL (ExcelJS — mendukung gambar) ================= */
async function eksporExcel(list) {
  const buku = new ExcelJS.Workbook();
  buku.creator = "Buku Tamu Digital SDI Tompokersan";
  const lembar = buku.addWorksheet("Buku Tamu");

  lembar.columns = [
    { header: "No", key: "no", width: 5 },
    { header: "Hari", key: "hari", width: 10 },
    { header: "Tanggal", key: "tanggal", width: 16 },
    { header: "Kategori", key: "kategori", width: 11 },
    { header: "Dari / Instansi", key: "dariInstansi", width: 26 },
    { header: "Nama", key: "nama", width: 22 },
    { header: "Jabatan", key: "jabatan", width: 16 },
    { header: "Tujuan dan Keperluan", key: "tujuan", width: 34 },
    { header: "Pesan / Saran", key: "pesan", width: 28 },
    { header: "Tanda Tangan", key: "ttdKet", width: 16 },
    { header: "Dicatat Oleh", key: "petugas", width: 22 },
  ];

  const headerRow = lembar.getRow(1);
  headerRow.eachCell((sel) => {
    sel.font = { bold: true, color: { argb: "FFFFFFFF" } };
    sel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D3D2C" } };
    sel.alignment = { vertical: "middle" };
  });
  headerRow.height = 22;

  const kolomTtd = 10; // posisi kolom "Tanda Tangan" (1 = No)

  list.forEach((d, i) => {
    const n = normalkanTamu(d, i + 1);
    const baris = lembar.addRow({
      no: n.no, hari: n.hari, tanggal: n.tanggal, kategori: n.kategori,
      dariInstansi: n.dariInstansi, nama: n.nama, jabatan: n.jabatan,
      tujuan: n.tujuan, pesan: n.pesan,
      ttdKet: n.tandaTangan ? "" : "Tidak ada",
      petugas: n.petugas,
    });
    baris.alignment = { vertical: "middle", wrapText: true };
    baris.height = 58;

    if (n.tandaTangan) {
      try {
        const base64 = n.tandaTangan.split(",")[1];
        const idGambar = buku.addImage({ base64, extension: "png" });
        lembar.addImage(idGambar, {
          tl: { col: kolomTtd - 1 + 0.08, row: baris.number - 1 + 0.08 },
          ext: { width: 100, height: 44 },
        });
      } catch (e) {
        baris.getCell(kolomTtd).value = "Ada (gagal ditampilkan)";
      }
    }
  });

  const buffer = await buku.xlsx.writeBuffer();
  unduhBlob(new Blob([buffer], { type: "application/octet-stream" }), namaBerkas("xlsx"));
}

/* ================= PDF (jsPDF + autoTable) ================= */
function eksporPDF(list) {
  const { jsPDF } = window.jspdf;
  const dok = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  dok.setFontSize(13);
  dok.text("Buku Tamu — SD Islam Tompokersan Lumajang", 40, 36);
  dok.setFontSize(9);
  dok.setTextColor(100);
  dok.text(`Diunduh: ${new Date().toLocaleString("id-ID")}`, 40, 52);

  const kolom = ["No", "Hari/Tgl", "Kategori", "Dari/Instansi", "Nama", "Jabatan", "Tujuan & Keperluan", "Pesan/Saran", "TTD"];
  const indeksTtd = kolom.length - 1;

  const dataNormal = list.map((d, i) => normalkanTamu(d, i + 1));
  const baris = dataNormal.map((n) => [
    n.no, `${n.hari}\n${n.tanggal}`, n.kategori, n.dariInstansi, n.nama,
    n.jabatan, n.tujuan, n.pesan, n.tandaTangan ? "" : "-",
  ]);

  dok.autoTable({
    head: [kolom],
    body: baris,
    startY: 66,
    styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak", valign: "middle" },
    headStyles: { fillColor: [13, 61, 44], textColor: 255 },
    alternateRowStyles: { fillColor: [246, 243, 234] },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 55 },
      [indeksTtd]: { cellWidth: 60, minCellHeight: 34 },
    },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== indeksTtd) return;
      const n = dataNormal[data.row.index];
      if (n && n.tandaTangan) {
        try {
          dok.addImage(n.tandaTangan, "PNG", data.cell.x + 3, data.cell.y + 3, 50, Math.min(data.cell.height - 6, 26));
        } catch (e) { /* lewati jika format gambar bermasalah */ }
      }
    },
  });

  dok.save(namaBerkas("pdf"));
}

/* ================= WORD (.doc via HTML) ================= */
function eksporWord(list) {
  const dataNormal = list.map((d, i) => normalkanTamu(d, i + 1));
  const kolom = ["No", "Hari", "Tanggal", "Kategori", "Dari / Instansi", "Nama", "Jabatan", "Tujuan dan Keperluan", "Pesan / Saran", "Tanda Tangan", "Dicatat Oleh"];

  let tabelHtml = `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;font-family:Calibri,Arial;font-size:11px;width:100%;">
    <tr style="background:#0d3d2c;color:#fff;">${kolom.map((k) => `<th>${k}</th>`).join("")}</tr>`;

  dataNormal.forEach((n) => {
    const selTtd = n.tandaTangan
      ? `<img src="${n.tandaTangan}" width="110" style="display:block;" />`
      : "Tidak ada";
    tabelHtml += `<tr>
      <td>${n.no}</td>
      <td>${n.hari}</td>
      <td>${n.tanggal}</td>
      <td>${n.kategori}</td>
      <td>${n.dariInstansi}</td>
      <td>${n.nama}</td>
      <td>${n.jabatan}</td>
      <td>${(n.tujuan || "").replace(/\n/g, "<br/>")}</td>
      <td>${(n.pesan || "").replace(/\n/g, "<br/>")}</td>
      <td>${selTtd}</td>
      <td>${n.petugas}</td>
    </tr>`;
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

  unduhBlob(new Blob(["\ufeff", htmlLengkap], { type: "application/msword" }), namaBerkas("doc"));
}
