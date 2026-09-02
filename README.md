# Buku Tamu Digital — SD Islam Tompokersan Lumajang

Website statis (HTML/CSS/JS, tanpa server) untuk buku tamu sekolah. Data
disimpan online di **Firebase** (Firestore + Authentication) sehingga bisa
diakses dari perangkat mana pun tanpa mengubah isi antar perangkat.

## Struktur berkas

```
index.html            → halaman login petugas
welcome.html           → halaman "Selamat Datang" (setelah login, tidak perlu login lagi)
isi-buku-tamu.html     → formulir input (beda field per kategori: Dinas/Umum/Wali Murid)
terima-kasih.html      → halaman terima kasih, otomatis kembali ke welcome.html
admin.html             → dasbor admin: lihat semua data + ekspor Excel/PDF/Word
assets/style.css       → tampilan
assets/app.js          → fungsi bersama (login guard, tanggal, simpan/ambil data)
assets/export.js       → fungsi ekspor Excel/PDF/Word
assets/firebase-config.js → KONFIGURASI FIREBASE — WAJIB DIISI (lihat langkah 1-3)
assets/logo.png         → logo sekolah yang diunggah
```

## Langkah 1 — Buat project Firebase (gratis)

1. Buka https://console.firebase.google.com → **Add project** → beri nama, misalnya `buku-tamu-sdi-tompokersan`.
2. Setelah project dibuat, klik ikon **`</>`  (Web)** untuk mendaftarkan aplikasi web. Beri nama app bebas, tidak perlu centang Firebase Hosting.
3. Firebase akan menampilkan objek `firebaseConfig`. Salin isinya ke berkas
   `assets/firebase-config.js`, menggantikan seluruh tulisan `GANTI_...`.

## Langkah 2 — Aktifkan Authentication

1. Di menu kiri konsol Firebase: **Build → Authentication → Get started**.
2. Tab **Sign-in method** → aktifkan **Email/Password**.
3. Tab **Users → Add user** → buat akun untuk setiap petugas piket/resepsionis
   (email + kata sandi). Akun inilah yang dipakai login di `index.html`.
4. Untuk akun yang boleh membuka **Dasbor Admin**, tambahkan emailnya ke
   daftar `ADMIN_EMAILS` di `assets/firebase-config.js`.

## Langkah 3 — Aktifkan Firestore Database

1. Menu kiri: **Build → Firestore Database → Create database**.
2. Pilih lokasi server terdekat (misal `asia-southeast2 (Jakarta)`), mode **Production**.
3. Buka tab **Rules**, ganti isinya dengan aturan berikut (hanya petugas yang
   login yang boleh membaca/menulis data buku tamu):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /buku_tamu/{dokumen} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Klik **Publish**.

## Langkah 4 — Coba jalankan

Buka `index.html` di browser (disarankan lewat server lokal, bukan `file://`,
agar semua fitur berjalan normal — misalnya ekstensi *Live Server* di VS Code,
atau `npx serve` di folder ini). Login dengan salah satu akun dari Langkah 2.

## Langkah 5 — Terbitkan online (opsional, gratis)

Unggah seluruh folder ini ke **GitHub Pages**, **Firebase Hosting**, atau
Netlify — sama seperti website sekolah lainnya, karena ini tetap situs
statis. Yang membuatnya "online" secara data adalah Firestore di atas, bukan
tempat hosting filenya.

## Catatan alur pemakaian

- **Login (index.html)** dipakai oleh *petugas piket*, satu kali per hari/shift.
  Setelah login, sesi tersimpan di perangkat (kios), sehingga tamu berikutnya
  bisa langsung menekan **Isi Buku Tamu** tanpa perlu login ulang.
- **Kategori tamu** menentukan field yang muncul:
  - **Dinas** → Dari (instansi/tempat tugas), Nama Tamu, Jabatan, Tujuan &
    Keperluan, Pesan/Saran, Tanda Tangan.
  - **Umum** → Nama, Tujuan & Keperluan, Pesan/Saran, Tanda Tangan.
  - **Wali Murid** → Wali dari (nama siswa), pilihan Ayah Kandung/Ibu
    Kandung/Wali, Tujuan & Keperluan, Pesan/Saran, Tanda Tangan.
- **Tanda tangan bersifat opsional** — tamu boleh melewatinya jika perangkat
  (misalnya PC dengan mouse) kurang nyaman untuk menandatangani di layar.
- **Dasbor Admin** (`admin.html`) hanya bisa dibuka oleh email yang terdaftar
  di `ADMIN_EMAILS`. Di sana admin bisa memfilter data dan mengunduhnya
  sebagai **Excel (.xlsx)**, **PDF**, atau **Word (.doc)**.

## Mengganti logo

Ganti berkas `assets/logo.png` dengan logo lain (nama file harus tetap
`logo.png`, atau ubah semua rujukan `assets/logo.png` di setiap halaman HTML).
