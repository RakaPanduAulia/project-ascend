# Project Ascend

App glow-up gamifikasi — papan misi harian ala RPG. Centang misi, EXP naik, (nanti) level & stat ikut naik. Terinspirasi app "Life Reset".

Tema warna: Sung Jin-Woo (Solo Leveling) — gelap + biru elektrik.

## Status
- **Tahap 1:** papan misi + EXP bar, disimpan di browser (localStorage).
- **Tahap 2:** tambah 4 stat (Body / Mind / Looks / Discipline) yang naik-turun sesuai misi.
- **Tahap 3:** riwayat harian, streak 🔥, dan hitungan Day X/66.
- **Tahap 4:** poles tampilan — animasi naik level, efek pop saat centang, EXP bar berdenyut, hormati reduced-motion.
- **Tahap 5:** sistem Achievement — 8 lencana yang ke-unlock saat capai milestone (level, streak, stat, hari produktif), dengan notifikasi toast.
- **Tahap 6:** misi lebih spesifik & terukur (gerakan rumahan realistis: push up 15x, squat 20x, plank 1 menit, dll), dikelompokkan per kategori (Fisik / Perawatan / Mental / Build).
- **Tahap 7:** ekonomi — 💎 Poin (dari misi + daily login), Shop & Item (Streak Freeze, EXP Boost, Tema Emas). EXP tetap mata uang level, Poin buat belanja.
- **Tahap 8:** Skill tree — 5 skill di-learn pakai Poin, syaratnya dari stat/level/achievement (Momentum, Iron Body, Deep Focus, Unbreakable, Ascendant). Efek pasif permanen (bonus EXP/Poin, freeze gratis).
- **Tahap 9:** Pemantauan Gizi — lacak kalori / protein / air harian (input manual +/-), bar progress menuju target, bonus Poin saat target protein tercapai. Reset tiap hari.
- **Tahap 10 (sekarang):** Touch-up + multi-halaman — tiap bagian jadi kartu rapi, variabel warna terpusat, DAN navigasi tab bawah (SPA): Home (stat/EXP/poin/streak + misi utama), Gizi, Skill, Shop, Lainnya (achievement + riwayat). 1 file HTML, halaman diganti via JS.

## Opsional ke depan
- **Tahap 12:** Grafik progres — garis EXP total naik dari hari ke hari (SVG murni, tanpa library), di tab Lainnya. History tiap hari sekarang menyimpan snapshot level + total EXP.
- **Tahap 13:** Jurnal harian — tulis 1 catatan refleksi per hari di Home, bonus +5 💎 pertama kali nulis. Catatan ikut diarsipkan ke riwayat (teks user di-escape biar aman).
- **Tahap 14:** Misi mingguan (challenge) — 3 challenge target 7 hari (Konsisten Fisik, Otak Terasah, Produktif Total), progress naik otomatis tiap misi harian kelar, hadiah Poin + EXP besar saat target tercapai. Reset tiap Senin.
- **Tahap 15:** Reminder harian — toggle + set jam di tab Lainnya, notifikasi browser (Notification API) + toast kalau masih ada misi belum kelar. Catatan: ini reminder dalam-app (butuh tab kebuka/background); notif push walau app ketutup butuh PWA + server (tahap PWA nanti).
- **Tahap 16:** Edit misi sendiri — bagian "Atur Misi Sendiri" di Home. User bisa tambah misi baru (nama, kategori, EXP), hapus misi apa pun (bawaan maupun buatan sendiri), dan pulihkan ke default. Misi disimpan di `state.missions` (default jadi salinan awal lewat `misiAktif()`); misi custom otomatis ikut dihitung challenge mingguan sesuai kategorinya.
- **Tahap 18:** Backup & restore data — bagian "Backup Data" di tab Lainnya. Export semua data (`state`) ke file `ascend-backup-YYYY-MM-DD.json`; import baca file, validasi (cek `app:"ascend"` + field `level`), tulis ke localStorage, lalu `location.reload()` biar `load()` pasang + backfill fresh. Tanpa server.
- **Tahap 17:** Profil & avatar — strip profil di header Home (avatar emoji + nama + gelar per level). Ketuk buka modal edit: pilih 1 dari 12 avatar + ubah nama. Gelar otomatis naik ikut level (Pemula → Monarch). Disimpan di `state.profil`.
- **Tahap 19:** Tab Info — tab ke-6 "Info" (nav bar jadi 6). Dashboard ringkas: misi kelar, gizi %, poin, streak, level, skill, plus kartu "Fokus Sekarang" (misi terdekat yang belum kelar). Semua angka dibaca dari `state` (gak nyimpen ganda).
- **Tahap 20:** Suara & getar — bunyi kecil (Web Audio API, nada dibuat dari kode, tanpa file) + getar HP (`navigator.vibrate`) pas misi kelar / naik level. Toggle on/off di tab Lainnya (`state.suaraOn`). Aman kalau browser gak dukung (diguard).
- **Tahap 21:** PWA (install di HP) — `manifest.json` + `sw.js` (service worker, cache-first) + `icon.svg`. App bisa di-"install" ke layar HP & jalan offline. Registrasi SW diguard (gagal → app tetap jalan). Butuh diakses via HTTPS (GitHub Pages), bukan `file://`.

### Blok A (Tahap 22-26)
- **Tahap 22:** Onboarding — layar sambutan sekali di awal (nama + avatar), flag `state.sudahOnboard`.
- **Tahap 23:** Statistik mendalam — tab Info: total misi, hari tercatat, rata/hari, EXP total, hari paling produktif.
- **Tahap 24:** Tema warna — biru/ungu/hijau/merah, override `--accent`/`--accent-2` + latar; terpisah dari tema emas item. `state.tema`.
- **Tahap 25:** Mood harian — catat 1 dari 5 emoji per tanggal (`state.mood`), tampil di Home.
- **Tahap 26:** Kutipan motivasi — 1 kutipan/hari, dipilih deterministik dari tanggal (tetap sepanjang hari).

### Blok B (Tahap 27-31)
- **Tahap 27:** Kategori kustom — user bisa tambah/hapus kategori (`state.kategori`, max 8). Kategori bawaan gak bisa dihapus; kategori berisi misi gak bisa dihapus. `kategoriAktif()`.
- **Tahap 28:** Misi terjadwal — misi punya field `hari` (0=Min..6=Sab); kosong = tiap hari. `misiHariIni()` filter papan misi + ringkasan + reminder.
- **Tahap 29:** Target jangka panjang — `state.goals` [{nama,target,nilai}], bar progres +/−, di tab Info.
- **Tahap 30:** Catatan per misi — `state.misiNote[id]`, edit via tombol 📝 di editor, tampil di bawah nama misi.
- **Tahap 31:** Mode gelap/terang — `state.mode`, flip variabel CSS `--bg/--card/--text/--border` + surface utama.

### Blok C (Tahap 32-36)
- **Tahap 32:** Animasi halus — transisi halaman (slide-up+fade) + kartu misi masuk; hormati reduced-motion.
- **Tahap 33:** Empty state ramah — pesan + gaya dashed buat grafik/riwayat/goals kosong.
- **Tahap 34:** Undo hapus misi — toast dengan tombol URUNGKAN (5 detik), kembalikan misi ke posisi semula.
- **Tahap 35:** Share kartu progres — canvas 600×800 gambar Day/Level/streak/avatar, download PNG.
- **Tahap 36:** Polish & audit — konsistensi penamaan, komentar per bagian, cek integrasi (no dup fn, 6 page=6 nav, semua ID terhubung).

### Blok D (Tahap 37-41) — rapihin
- **37:** Full recolor — semua warna hardcoded → variabel CSS; tema & mode terang jadi total.
- **38:** Konsistensi spasi — inline margin → kelas (`.page-title.sub`).
- **39:** Splash/loading anti-kedip saat buka app.
- **40:** Aksesibilitas — aria-label, `:focus-visible`, misi bisa Enter/Spasi.
- **41:** Empty state misi kosong + seragam (pakai variabel).

### Blok E (Tahap 42-46) — fitur isi
- **42:** Riwayat mood 7 hari (baris emoji, tab Info).
- **43:** Cari/filter riwayat jurnal.
- **44:** Ekspor ringkasan mingguan ke PNG (canvas, tanpa library).
- **45:** Notifikasi + bunyi pas goal tercapai.
- **46:** Pengingat per-misi (field `jam`, tombol ⏰ di editor).

### Blok F (Tahap 47-51) — pro & tahan lama
- **47:** Mulai babak baru (arsip progres + reset; riwayat & misi disimpan).
- **48:** Multi-profil (data per profil di key localStorage terpisah; utama tetap `ascend`).
- **49:** Kalender kontribusi 3 bulan (warna by jumlah misi).
- **50:** Tips pintar harian berdasar pola (streak/stat/gizi/jurnal).
- **51:** Audit akhir + test menyeluruh.

## Opsional lanjut
- AI API untuk generate/nilai misi otomatis. Butuh backend + API key berbayar — ditunda sampai app siap online/PWA.

## Cara buka
Buka `index.html` di browser. Gak perlu install apa-apa.

## Struktur
- `index.html` — struktur halaman
- `style.css` — tampilan (tema gelap biru)
- `app.js` — logika (misi, EXP, level, simpan data)

## Roadmap
Lihat catatan roadmap di Obsidian: `Ascend - Roadmap App`.
