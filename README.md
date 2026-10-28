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
- **Tahap 11 (opsional):** AI API untuk generate/nilai misi otomatis. Butuh backend + API key berbayar — ditunda sampai app siap online/PWA.

## Cara buka
Buka `index.html` di browser. Gak perlu install apa-apa.

## Struktur
- `index.html` — struktur halaman
- `style.css` — tampilan (tema gelap biru)
- `app.js` — logika (misi, EXP, level, simpan data)

## Roadmap
Lihat catatan roadmap di Obsidian: `Ascend - Roadmap App`.
