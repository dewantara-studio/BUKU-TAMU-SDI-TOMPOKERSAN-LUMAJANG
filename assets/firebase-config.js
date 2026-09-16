/* ============================================================
   GANTI seluruh isi objek di bawah ini dengan konfigurasi
   Firebase project milik sekolah (Project Settings > General
   > Your apps > SDK setup and configuration > Config).
   Lihat README.md langkah 1-3 untuk cara membuatnya (gratis).
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyAVhpDeLtZmvU6kNOMWl_Mx2JaOyvOmXqg",
  authDomain: "bukutamu-sdi-tompokersan.firebaseapp.com",
  projectId: "bukutamu-sdi-tompokersan",
  storageBucket: "bukutamu-sdi-tompokersan.firebasestorage.app",
  messagingSenderId: "362345784411",
  appId: "1:362345784411:web:6cf9999a72dfe59095cb7e",
  measurementId: "G-JS2LWNBFL5"
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
  "izalainufar@sditompokersan.sch.id"
];
