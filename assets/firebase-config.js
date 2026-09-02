/* ============================================================
   GANTI seluruh isi objek di bawah ini dengan konfigurasi
   Firebase project milik sekolah (Project Settings > General
   > Your apps > SDK setup and configuration > Config).
   Lihat README.md langkah 1-3 untuk cara membuatnya (gratis).
   ============================================================ */
const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY",
  authDomain: "GANTI.firebaseapp.com",
  projectId: "GANTI_PROJECT_ID",
  storageBucket: "GANTI.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Simpan sesi login di perangkat (kios) agar operator tidak perlu
// login ulang setiap kali ada tamu baru — sesuai alur yang diminta.
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

/* Daftar email yang boleh membuka Dashboard Admin.
   Tambahkan email staf lain dengan koma di antaranya. */
const ADMIN_EMAILS = [
  "admin@sditompokersan.sch.id"
];
