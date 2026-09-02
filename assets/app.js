/* ============================================================
   Fungsi bersama: penjaga login, format tanggal, dan akses
   koleksi Firestore "buku_tamu".
   ============================================================ */

const KOLEKSI = "buku_tamu";

/** Redirect ke login.html jika belum login. Panggil di halaman terkunci. */
function wajibLogin(jalankanJikaLogin) {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      jalankanJikaLogin(user);
    }
  });
}

/** Jika sudah login dan berada di halaman login, langsung lempar ke welcome. */
function lewatiJikaSudahLogin() {
  auth.onAuthStateChanged((user) => {
    if (user) window.location.href = "welcome.html";
  });
}

function keluarAkun() {
  auth.signOut().then(() => (window.location.href = "index.html"));
}

function namaHariIndonesia(tanggal) {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return hari[tanggal.getDay()];
}

function formatTanggalIndonesia(tanggal) {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${tanggal.getDate()} ${bulan[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

/** Simpan satu entri tamu ke Firestore. data: objek field sesuai kategori. */
function simpanTamu(data, user) {
  return db.collection(KOLEKSI).add({
    ...data,
    dicatatOleh: user ? user.email : null,
    waktuInput: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/** Ambil semua entri, terbaru dahulu. Mengembalikan Promise<Array>. */
async function ambilSemuaTamu() {
  const snap = await db.collection(KOLEKSI).orderBy("waktuInput", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Hapus satu atau beberapa entri tamu berdasarkan id dokumen Firestore. */
async function hapusTamu(idList) {
  const batch = db.batch();
  idList.forEach((id) => batch.delete(db.collection(KOLEKSI).doc(id)));
  return batch.commit();
}

function labelKategori(kat) {
  return { dinas: "Dinas", umum: "Umum", wali: "Wali Murid" }[kat] || kat;
}
