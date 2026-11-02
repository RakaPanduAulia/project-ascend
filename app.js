// =====================================================================
//  ASCEND — Tahap 5
//  Papan misi + EXP + LEVEL + STAT + RIWAYAT + STREAK + Day X/66
//  + ACHIEVEMENT (lencana yang ke-unlock pas capai milestone).
// =====================================================================


// ---------------------------------------------------------------------
//  1) DAFTAR MISI
//  Tiap misi punya:
//    id    = penanda unik
//    name  = teks yang tampil
//    exp   = EXP kalau dicentang
//    stats = hadiah stat, mis. { body: 4, discipline: 2 }
//            (stat yang gak disebut berarti +0)
// ---------------------------------------------------------------------
// CATATAN TAHAP 16:
//   Daftar di bawah ini sekarang jadi DEFAULT (bukan lagi daftar kaku).
//   Misi yang BENERAN dipakai app disimpan di state.missions, dan user bisa
//   tambah / hapus / edit lewat halaman "Misi". Pertama kali app jalan, atau
//   pas user klik "Pulihkan default", daftar inilah yang dipasang.
const MISI_DEFAULT = [
  // --- 🔴 FISIK (gerakan rumahan, singkat, tanpa alat) ---
  { id: "stretch",   name: "🤸 Stretching / pemanasan 5 menit", exp: 8,  stats: { body: 2 },             cat: "Fisik" },
  { id: "pushup",    name: "💪 Push up 15x",               exp: 10, stats: { body: 3 },              cat: "Fisik" },
  { id: "squat",     name: "🦵 Squat 20x",                exp: 10, stats: { body: 3 },              cat: "Fisik" },
  { id: "plank",     name: "🧘 Plank 1 menit",             exp: 10, stats: { body: 3, discipline: 1 }, cat: "Fisik" },
  { id: "jalan",     name: "🚶 Jalan kaki 15 menit",        exp: 10, stats: { body: 3 },              cat: "Fisik" },

  // --- 🟢 PERAWATAN & RUTIN ---
  { id: "skincare",  name: "🧴 Skincare pagi + malam",     exp: 8,  stats: { looks: 3 },             cat: "Perawatan" },
  { id: "air",       name: "💧 Minum air ≥ 2 liter",       exp: 8,  stats: { body: 2 },              cat: "Perawatan" },
  { id: "makan",     name: "🥗 Makan 1 menu sehat",        exp: 8,  stats: { body: 2, looks: 1 },    cat: "Perawatan" },
  { id: "berangkat", name: "🌅 Berangkat kerja ≤ 07:15",   exp: 10, stats: { discipline: 2 },        cat: "Perawatan" },
  { id: "tidur",     name: "😴 Tidur ≥ 7 jam",             exp: 10, stats: { body: 2, mind: 1 },     cat: "Perawatan" },

  // --- 🔵 MENTAL ---
  { id: "jurnal",    name: "📓 Jurnaling 5 menit",         exp: 10, stats: { mind: 3 },              cat: "Mental" },
  { id: "inggris",   name: "🇬🇧 Belajar Inggris 15 menit",  exp: 12, stats: { mind: 3 },              cat: "Mental" },
  { id: "baca",      name: "📖 Baca 10 halaman",           exp: 10, stats: { mind: 3 },              cat: "Mental" },

  // --- 🟣 BUILD (side hustle: ngembangin app Ascend) ---
  { id: "build",     name: "💻 Ngoding app 30 menit",      exp: 15, stats: { mind: 3, discipline: 2 }, cat: "Build" },
  { id: "prompt",    name: "🤖 Latihan prompt AI 15 menit", exp: 10, stats: { mind: 2 },             cat: "Build" },
];


// Urutan kategori buat ditampilkan (misi dikelompokkan per kategori).
const CATEGORIES = ["Fisik", "Perawatan", "Mental", "Build"]; // default; aktif dibaca dari state.kategori

// Tahap 27: kategori yang BENERAN dipakai (bisa ditambah user). Fallback ke default.
function kategoriAktif() {
  if (!state.kategori || state.kategori.length === 0) return CATEGORIES;
  return state.kategori;
}


// ---------------------------------------------------------------------
//  1c) misiAktif()  — daftar misi yang BENERAN dipakai app.
//  Dulu kode baca 'MISSIONS' langsung. Mulai Tahap 16, misi disimpan di
//  state.missions (bisa diubah user), jadi semua tempat baca lewat sini.
//  Kalau karena suatu hal state.missions kosong, pakai default biar app
//  gak pernah tampil tanpa misi sama sekali.
// ---------------------------------------------------------------------
function misiAktif() {
  if (!state.missions || state.missions.length === 0) return MISI_DEFAULT;
  return state.missions;
}

// Tahap 28: misi yang muncul HARI INI. Misi tanpa jadwal (field 'hari' kosong)
// muncul tiap hari. Misi terjadwal cuma muncul kalau hari ini cocok.
// 'hari' pakai angka 0=Minggu ... 6=Sabtu (sama kayak Date.getDay()).
function misiHariIni() {
  const hariIni = new Date().getDay();
  return misiAktif().filter(m => !m.hari || m.hari.length === 0 || m.hari.includes(hariIni));
}


// Nama & warna tiap stat, buat ditampilkan. Urutannya ngikut ini.
const STAT_INFO = [
  { key: "body",       label: "💪 Body",       color: "#4d6bff" },
  { key: "mind",       label: "🧠 Mind",       color: "#1f47e8" },
  { key: "looks",      label: "✨ Looks",      color: "#6f8cff" },
  { key: "discipline", label: "🔥 Discipline", color: "#0a2bc2" },
];


// ---------------------------------------------------------------------
//  1b) DAFTAR ACHIEVEMENT
//  Tiap badge punya:
//    id    = penanda unik
//    icon  = emoji lencana
//    name  = judul
//    desc  = syarat (teks buat user)
//    cek   = fungsi yang nerima 'state' dan balik true kalau syarat tercapai
//  Pola 'cek(state)' ini fleksibel: nambah badge baru = nambah 1 baris,
//  gak perlu ubah logika pengecekannya.
// ---------------------------------------------------------------------
const ACHIEVEMENTS = [
  { id: "first_step", icon: "👟", name: "Langkah Pertama", desc: "Selesaikan 1 misi pertama",
    cek: s => totalMisiSepanjangMasa(s) >= 1 },
  { id: "level5", icon: "⭐", name: "Pendaki", desc: "Capai Level 5",
    cek: s => s.level >= 5 },
  { id: "streak7", icon: "🔥", name: "Seminggu Nyala", desc: "Streak 7 hari",
    cek: s => s.streak >= 7 },
  { id: "streak30", icon: "🌋", name: "Sebulan Tak Padam", desc: "Streak 30 hari",
    cek: s => s.streak >= 30 },
  { id: "body80", icon: "💪", name: "Raga Prima", desc: "Body capai 80",
    cek: s => s.stats.body >= 80 },
  { id: "mind80", icon: "🧠", name: "Pikiran Tajam", desc: "Mind capai 80",
    cek: s => s.stats.mind >= 80 },
  { id: "perfect_day", icon: "🏆", name: "Hari Produktif", desc: "Selesaikan 8 misi dalam sehari",
    cek: s => s.done.length >= 8 },
  { id: "day66", icon: "👑", name: "66 Hari", desc: "Bertahan sampai Day 66",
    cek: s => dayNumber() >= 66 },
];


// ---------------------------------------------------------------------
//  1d) SHOP — daftar item yang bisa dibeli pakai 💎 Poin.
//  Tiap item:
//    id    = penanda unik
//    icon  = emoji
//    name  = nama item
//    desc  = penjelasan efeknya
//    harga = berapa Poin
//    tipe  = "consumable" (habis sekali pakai) / "boost" (sekali sehari)
//            / "cosmetic" (dibeli sekali, nyala selamanya)
// ---------------------------------------------------------------------
const SHOP = [
  { id: "streak_freeze", icon: "🧊", name: "Streak Freeze", harga: 60,  tipe: "consumable",
    desc: "Lindungi streak 1 hari. Kalau sehari bolong, streak gak putus." },
  { id: "exp_boost",     icon: "⚡", name: "EXP Boost",     harga: 40,  tipe: "boost",
    desc: "Misi hari ini kasih EXP dobel. Aktif begitu dibeli." },
  { id: "theme_gold",    icon: "🏆", name: "Tema Emas",     harga: 150, tipe: "cosmetic",
    desc: "Ganti aksen app jadi emas. Dibeli sekali, nyala selamanya." },
];

// Berapa Poin didapat dari tiap sumber.
const POIN_PER_MISI  = 5;   // tiap misi kelar
const POIN_LOGIN     = 20;  // daily login (sekali per hari)


// ---------------------------------------------------------------------
//  1e) SKILLS — skill yang bisa di-LEARN pakai 💎 Poin.
//  Tiap skill:
//    id      = penanda unik
//    icon    = emoji
//    name    = nama skill
//    desc    = efek pasifnya (teks buat user)
//    harga   = biaya Poin buat learn
//    syarat  = fungsi(state) -> true kalau skill BISA di-learn (kebuka)
//    syaratTxt = teks syarat buat ditampilkan pas masih terkunci
//  Efek pasifnya dibaca di tempat lain (mis. hitung EXP misi), jadi di
//  sini cukup "didaftarkan". Pola data-driven, sama kayak achievement.
// ---------------------------------------------------------------------
const SKILLS = [
  { id: "momentum", icon: "🏃", name: "Momentum", harga: 50,
    desc: "+2 Poin bonus tiap misi kelar.",
    syaratTxt: "Level 3", syarat: s => s.level >= 3 },

  { id: "iron_body", icon: "💪", name: "Iron Body", harga: 80,
    desc: "Misi kategori Fisik kasih +50% EXP.",
    syaratTxt: "Body 65", syarat: s => s.stats.body >= 65 },

  { id: "deep_focus", icon: "🧠", name: "Deep Focus", harga: 80,
    desc: "Misi Mental & Build kasih +50% EXP.",
    syaratTxt: "Mind 65", syarat: s => s.stats.mind >= 65 },

  { id: "unbreakable", icon: "🔥", name: "Unbreakable", harga: 100,
    desc: "Dapat 1 Streak Freeze gratis tiap kali streak kelipatan 7.",
    syaratTxt: "Buka badge 'Seminggu Nyala'", syarat: s => s.unlocked.includes("streak7") },

  { id: "ascendant", icon: "👑", name: "Ascendant", harga: 200,
    desc: "SEMUA misi kasih +25% EXP.",
    syaratTxt: "Level 10 + badge '66 Hari'", syarat: s => s.level >= 10 && s.unlocked.includes("day66") },
];


// ---------------------------------------------------------------------
//  2) STATE (keadaan sekarang)
// ---------------------------------------------------------------------
let state = {
  exp: 0,
  level: 1,
  done: [],
  stats: { body: 50, mind: 50, looks: 50, discipline: 50 },
  date: today(),
  startDate: today(),
  streak: 0,
  history: [],
  unlocked: [],   // id achievement yang sudah kebuka
  totalDone: 0,   // total misi kelar sepanjang masa (buat badge "Langkah Pertama")
  poin: 0,            // 💎 mata uang buat belanja di Shop
  items: {},          // item yang dimiliki, mis. { streak_freeze: 2 }
  lastLogin: "",      // tanggal terakhir klaim daily login
  expBoostDate: "",   // tanggal aktif EXP Boost (misi hari itu dobel EXP)
  theme: "blue",      // tema aktif ("blue" default / "gold" dari item)
  skills: [],         // id skill yang sudah di-learn (efek pasif nyala)
  lastFreezeStreak: 0,// streak terakhir saat Unbreakable kasih freeze gratis
  gizi: { kalori: 0, protein: 0, air: 0 },          // asupan HARI INI
  giziTarget: { kalori: 2200, protein: 120, air: 2500 }, // target harian
  giziBonusDate: "",  // tanggal terakhir dapat bonus Poin dari protein
  jurnal: "",         // catatan jurnal HARI INI
  jurnalBonusDate: "",// tanggal terakhir dapat bonus Poin dari nulis jurnal
  weekly: { minggu: "", progress: {}, selesai: [] }, // challenge mingguan
  reminderOn: false,  // reminder harian nyala/mati
  reminderJam: "20:00", // jam reminder "HH:MM"
  reminderTanggal: "",  // tanggal terakhir reminder sudah bunyi (anti-dobel)
  profil: { nama: "Hunter", avatar: "🧑" }, // Tahap 17: nama + avatar emoji
  suaraOn: true,  // Tahap 20: bunyi + getar feedback nyala/mati
  sudahOnboard: false, // Tahap 22: layar sambutan sudah dilewati?
  mood: {},       // Tahap 25: mood per tanggal, mis. { "2026-11-01": "😄" }
  tema: "blue",   // Tahap 24: tema warna pilihan (blue/ungu/hijau/merah) — terpisah dari item emas
  kategori: ["Fisik", "Perawatan", "Mental", "Build"], // Tahap 27: kategori (bisa ditambah user)
  goals: [],      // Tahap 29: target jangka panjang [{id,nama,target,nilai}]
  mode: "gelap",  // Tahap 31: mode gelap / terang
  misiNote: {},   // Tahap 30: catatan kecil per misi { misiId: "teks" }
};


// Daftar avatar emoji yang bisa dipilih user (Tahap 17).
const AVATARS = ["🧑", "👨", "👩", "🧔", "👤", "🦸", "🥷", "🧙", "🐺", "🦁", "🔥", "⚡"];

// Gelar sesuai level (Tahap 17): makin tinggi level, makin keren gelarnya.
// Dipilih gelar dengan 'min' tertinggi yang <= level sekarang.
const GELAR = [
  { min: 1,  nama: "Pemula" },
  { min: 3,  nama: "Penempa Diri" },
  { min: 5,  nama: "Pendaki" },
  { min: 8,  nama: "Petarung" },
  { min: 12, nama: "Ksatria" },
  { min: 16, nama: "Elite" },
  { min: 20, nama: "Monarch" },
];

function gelarSekarang() {
  let hasil = GELAR[0].nama;
  for (const g of GELAR) {
    if (state.level >= g.min) hasil = g.nama;
  }
  return hasil;
}


// Langkah tambah/kurang tiap tombol gizi (biar input cepat).
const GIZI_STEP = { kalori: 100, protein: 10, air: 250 };
const GIZI_INFO = [
  { key: "kalori",  icon: "🔥", label: "Kalori",  unit: "kcal" },
  { key: "protein", icon: "🍗", label: "Protein", unit: "g" },
  { key: "air",     icon: "💧", label: "Air",     unit: "ml" },
];


// ---------------------------------------------------------------------
//  1f) WEEKLIES — challenge mingguan (target 7 hari, hadiah besar).
//  Tiap challenge:
//    id      = penanda unik
//    icon    = emoji
//    name    = nama
//    desc    = penjelasan
//    target  = angka yang harus dicapai minggu ini
//    poin    = hadiah Poin
//    exp     = hadiah EXP
//    hitung(mission) = true kalau misi harian yang dikelar menambah
//                      progress challenge ini. (streak dihitung terpisah)
//  Progress disimpan di state.weekly.progress[id], reset tiap Senin.
// ---------------------------------------------------------------------
const WEEKLIES = [
  { id: "fisik_15", icon: "🏋️", name: "Konsisten Fisik", target: 15, poin: 50, exp: 30,
    desc: "Kelar 15 misi Fisik minggu ini.",
    hitung: m => m.cat === "Fisik" },

  { id: "otak_12", icon: "🧠", name: "Otak Terasah", target: 12, poin: 50, exp: 30,
    desc: "Kelar 12 misi Mental / Build minggu ini.",
    hitung: m => m.cat === "Mental" || m.cat === "Build" },

  { id: "rajin_30", icon: "⭐", name: "Produktif Total", target: 30, poin: 60, exp: 40,
    desc: "Kelar 30 misi apa saja minggu ini.",
    hitung: m => true },
];


// ---------------------------------------------------------------------
//  1g) seninMingguIni()  — tanggal "YYYY-MM-DD" hari Senin minggu ini.
//  Dipakai sebagai "cap minggu": kalau cap berubah, berarti minggu baru
//  dan progress challenge di-reset. getDay(): 0=Minggu..6=Sabtu.
// ---------------------------------------------------------------------
function seninMingguIni() {
  const d = new Date(today());
  const hari = d.getDay();            // 0=Minggu, 1=Senin, ...
  const mundur = hari === 0 ? 6 : hari - 1; // mundur ke Senin
  d.setDate(d.getDate() - mundur);
  return d.toISOString().slice(0, 10);
}


// ---------------------------------------------------------------------
//  1c) totalMisiSepanjangMasa(s)  — total misi kelar seumur hidup app.
//  'totalDone' saja gak cukup kalau badge dicek pas belum nambah; jadi
//  kita jumlahkan juga yang kelar HARI INI.
// ---------------------------------------------------------------------
function totalMisiSepanjangMasa(s) {
  return s.totalDone;
}


// ---------------------------------------------------------------------
//  3) today()  — tanggal hari ini sebagai teks "YYYY-MM-DD".
// ---------------------------------------------------------------------
function today() {
  return new Date().toISOString().slice(0, 10);
}


// ---------------------------------------------------------------------
//  4) expNeeded(level)  — EXP buat naik level = level x 100.
// ---------------------------------------------------------------------
function expNeeded(level) {
  return level * 100;
}


// ---------------------------------------------------------------------
//  4b) expTerkumpul()  — total EXP sepanjang masa.
//  Level naik tiap kelipatan (level x 100), jadi EXP total =
//  semua EXP yang sudah "dipakai" buat naik level + EXP sisa sekarang.
//  Dipakai buat grafik progres (garis yang terus naik).
// ---------------------------------------------------------------------
function expTerkumpul() {
  let total = state.exp;
  for (let lv = 1; lv < state.level; lv++) {
    total += expNeeded(lv);
  }
  return total;
}


// ---------------------------------------------------------------------
//  5) save() / load()  — simpan & baca state dari localStorage browser.
// ---------------------------------------------------------------------
function save() {
  localStorage.setItem("ascend", JSON.stringify(state));
}


// ---------------------------------------------------------------------
//  5a) BACKUP & RESTORE (Tahap 18)
//  exportData() : ubah semua data (state) jadi file .json, lalu download.
//  importData() : baca file .json yang dipilih user, pasang balik, reload.
//  Kenapa reload? Biar load() jalan lagi dari awal -> semua backfill &
//  render fresh, gak ada sisa data lama nyangkut di memori.
// ---------------------------------------------------------------------
function exportData() {
  // Bungkus dengan sedikit info biar file-nya jelas & bisa dicek pas import.
  const bungkus = {
    app: "ascend",
    versi: 1,
    tanggal: new Date().toISOString(),
    data: state,
  };
  const teks = JSON.stringify(bungkus, null, 2);
  const blob = new Blob([teks], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Nama file: ascend-backup-2026-11-01.json
  const nama = "ascend-backup-" + today() + ".json";
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toastInfo("📥 Data di-backup ke " + nama);
}

// Dipanggil pas user milih file. 'file' = objek File dari <input type=file>.
function importData(file) {
  if (!file) return;
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const isi = JSON.parse(reader.result);

      // Cek file ini backup Ascend yang bener (jangan asal file .json).
      const data = (isi && isi.app === "ascend" && isi.data) ? isi.data : isi;
      if (!data || typeof data !== "object" || data.level === undefined) {
        toastInfo("⚠️ File ini bukan backup Ascend yang valid.");
        return;
      }

      if (!confirm("Ganti semua data sekarang dengan isi file backup? Data saat ini akan tertimpa.")) {
        return;
      }

      // Tulis ke localStorage, lalu reload biar load() yang pasang & backfill.
      localStorage.setItem("ascend", JSON.stringify(data));
      toastInfo("📤 Data dipulihkan! Memuat ulang…");
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      toastInfo("⚠️ File rusak atau bukan format JSON.");
    }
  };

  reader.onerror = () => toastInfo("⚠️ Gagal baca file.");
  reader.readAsText(file);
}

function load() {
  const saved = localStorage.getItem("ascend");
  if (saved) {
    state = JSON.parse(saved);
  }
  // Jaga-jaga data lama belum punya field baru (dari tahap sebelumnya).
  if (!state.stats)     state.stats = { body: 50, mind: 50, looks: 50, discipline: 50 };
  if (!state.startDate) state.startDate = state.date || today();
  if (state.streak === undefined) state.streak = 0;
  if (!state.history)   state.history = [];
  // Backfill: entri history lama cuma punya {date, kelar}. Kasih level &
  // expTotal default 0 biar grafik gak error baca field yang gak ada.
  state.history.forEach(h => {
    if (h.level === undefined)    h.level = 0;
    if (h.expTotal === undefined) h.expTotal = 0;
  });
  if (!state.unlocked)  state.unlocked = [];
  if (state.totalDone === undefined) state.totalDone = 0;
  if (state.poin === undefined) state.poin = 0;
  if (!state.items)     state.items = {};
  if (state.lastLogin === undefined) state.lastLogin = "";
  if (state.expBoostDate === undefined) state.expBoostDate = "";
  if (!state.theme)     state.theme = "blue";
  if (!state.skills)    state.skills = [];
  if (state.lastFreezeStreak === undefined) state.lastFreezeStreak = 0;
  if (!state.gizi)       state.gizi = { kalori: 0, protein: 0, air: 0 };
  if (!state.giziTarget) state.giziTarget = { kalori: 2200, protein: 120, air: 2500 };
  if (state.giziBonusDate === undefined) state.giziBonusDate = "";
  if (state.jurnal === undefined)        state.jurnal = "";
  if (state.jurnalBonusDate === undefined) state.jurnalBonusDate = "";
  if (!state.weekly) state.weekly = { minggu: "", progress: {}, selesai: [] };
  if (state.reminderOn === undefined)   state.reminderOn = false;
  if (!state.reminderJam)               state.reminderJam = "20:00";
  if (state.reminderTanggal === undefined) state.reminderTanggal = "";
  if (!state.profil)        state.profil = { nama: "Hunter", avatar: "🧑" };
  if (!state.profil.nama)   state.profil.nama = "Hunter";
  if (!state.profil.avatar) state.profil.avatar = "🧑";
  if (state.suaraOn === undefined) state.suaraOn = true;
  if (state.sudahOnboard === undefined) state.sudahOnboard = false;
  if (!state.mood) state.mood = {};
  if (!state.tema) state.tema = "blue";
  if (!state.kategori || state.kategori.length === 0) state.kategori = ["Fisik", "Perawatan", "Mental", "Build"];
  if (!state.goals) state.goals = [];
  if (!state.mode) state.mode = "gelap";
  if (!state.misiNote) state.misiNote = {};
  // Tahap 16: daftar misi yang bisa diedit user. Pertama kali = salinan
  // default (deep copy lewat JSON biar gak nyangkut ke MISI_DEFAULT asli).
  if (!state.missions || state.missions.length === 0) {
    state.missions = JSON.parse(JSON.stringify(MISI_DEFAULT));
  }

  // Reset challenge mingguan kalau sudah masuk minggu baru (cap Senin beda).
  cekResetMingguan();

  // Ganti hari -> arsipkan hari kemarin, hitung streak, reset centang.
  if (state.date !== today()) {
    rolloverDay();
  }
}


// ---------------------------------------------------------------------
//  5b) rolloverDay()
//  Dipanggil pas ketahuan hari sudah ganti. Tugasnya:
//    1. Simpan jumlah misi kelar KEMARIN ke 'history'.
//    2. Update streak: kalau kemarin kelar >= 1 misi, streak +1;
//       kalau kemarin kosong (0 misi), streak balik ke 0.
//    3. Reset centang buat hari baru (EXP, level, stat TETAP).
// ---------------------------------------------------------------------
function rolloverDay() {
  const kelarKemarin = state.done.length;

  // 1) Arsipkan hari kemarin — simpan snapshot lengkap biar bisa dibikin grafik:
  //    jumlah misi kelar, level, total EXP, dan catatan jurnal hari itu.
  state.history.push({
    date: state.date,
    kelar: kelarKemarin,
    level: state.level,
    expTotal: expTerkumpul(),
    jurnal: state.jurnal || "",
  });
  // Simpan paling banyak 60 hari terakhir biar gak kebanyakan.
  if (state.history.length > 60) {
    state.history = state.history.slice(-60);
  }

  // 2) Update streak.
  if (kelarKemarin >= 1) {
    state.streak += 1;
  } else if ((state.items.streak_freeze || 0) > 0) {
    // Punya Streak Freeze -> pakai 1, streak gak putus (tetap, gak nambah).
    state.items.streak_freeze -= 1;
    state._freezeDipakai = true; // penanda buat kasih tau user pas render
  } else {
    state.streak = 0;
  }

  // 3) Hari baru.
  state.done = [];
  state.date = today();
  state.gizi = { kalori: 0, protein: 0, air: 0 }; // asupan balik 0 tiap hari baru
  state.jurnal = ""; // catatan jurnal balik kosong tiap hari baru
  save();
}


// ---------------------------------------------------------------------
//  5c) dayNumber()
//  Hitung "hari ke berapa" sejak startDate (hari pertama = Day 1).
//  Selisih milidetik dibagi jumlah milidetik dalam 1 hari.
// ---------------------------------------------------------------------
function dayNumber() {
  const mulai = new Date(state.startDate);
  const sekarang = new Date(today());
  const satuHari = 1000 * 60 * 60 * 24; // ms dalam sehari
  const selisih = Math.round((sekarang - mulai) / satuHari);
  return selisih + 1; // +1 biar hari pertama = Day 1, bukan Day 0
}


// ---------------------------------------------------------------------
//  6) addExp(amount)  — tambah EXP, naik level kalau cukup.
//  Mengembalikan 'true' kalau SEMPAT naik level (buat memicu animasi).
// ---------------------------------------------------------------------
function addExp(amount) {
  const levelAwal = state.level;
  state.exp += amount;
  while (state.exp >= expNeeded(state.level)) {
    state.exp -= expNeeded(state.level);
    state.level += 1;
  }
  return state.level > levelAwal; // true kalau naik level
}


// ---------------------------------------------------------------------
//  6b) applyStats(stats, arah)
//  Naik/turunin stat sesuai hadiah misi.
//    arah = +1 (selesai) atau -1 (batal). Stat dijaga 0–100.
// ---------------------------------------------------------------------
function applyStats(stats, arah) {
  Object.keys(stats).forEach(key => {
    state.stats[key] += stats[key] * arah;
    if (state.stats[key] > 100) state.stats[key] = 100;
    if (state.stats[key] < 0) state.stats[key] = 0;
  });
}


// ---------------------------------------------------------------------
//  6c) punyaSkill(id) — true kalau skill sudah di-learn.
// ---------------------------------------------------------------------
function punyaSkill(id) {
  return state.skills.includes(id);
}


// ---------------------------------------------------------------------
//  6d) expUntukMisi(mission)
//  Hitung EXP akhir sebuah misi, gabungkan SEMUA bonus:
//    - EXP Boost (item): x2 kalau aktif hari ini
//    - Iron Body (skill): +50% kalau misi kategori Fisik
//    - Deep Focus (skill): +50% kalau misi Mental / Build
//    - Ascendant (skill): +25% semua misi
//  Pengali dijumlah dulu, baru dikali ke EXP dasar, lalu dibulatkan.
// ---------------------------------------------------------------------
function expUntukMisi(mission) {
  let pengali = 1;
  if (state.expBoostDate === today()) pengali += 1;               // Boost: +100%
  if (punyaSkill("iron_body") && mission.cat === "Fisik") pengali += 0.5;
  if (punyaSkill("deep_focus") && (mission.cat === "Mental" || mission.cat === "Build")) pengali += 0.5;
  if (punyaSkill("ascendant")) pengali += 0.25;
  return Math.round(mission.exp * pengali);
}


// ---------------------------------------------------------------------
//  6e) poinUntukMisi()
//  Poin per misi + bonus skill Momentum (+2).
// ---------------------------------------------------------------------
function poinUntukMisi() {
  let poin = POIN_PER_MISI;
  if (punyaSkill("momentum")) poin += 2;
  return poin;
}


// ---------------------------------------------------------------------
//  6f) learnSkill(id)
//  Learn skill kalau: belum punya, syarat terpenuhi, dan Poin cukup.
//  Efeknya pasif (dibaca di helper di atas), jadi di sini cukup catat.
// ---------------------------------------------------------------------
function learnSkill(id) {
  const skill = SKILLS.find(s => s.id === id);
  if (!skill || punyaSkill(id)) return;

  if (!skill.syarat(state)) {
    toastInfo(`🔒 Syarat belum terpenuhi: ${skill.syaratTxt}`);
    return;
  }
  if (state.poin < skill.harga) {
    toastInfo(`💎 Poin kurang. Butuh ${skill.harga}, punya ${state.poin}.`);
    return;
  }

  state.poin -= skill.harga;
  state.skills.push(id);
  save();
  render();
  toastInfo(`${skill.icon} Skill "${skill.name}" dipelajari!`);
}


// ---------------------------------------------------------------------
//  6g) cekUnbreakable()
//  Skill Unbreakable: tiap streak mencapai kelipatan 7 yang baru,
//  kasih 1 Streak Freeze gratis. 'lastFreezeStreak' mencegah dobel.
// ---------------------------------------------------------------------
function cekUnbreakable() {
  if (!punyaSkill("unbreakable")) return;
  if (state.streak > 0 && state.streak % 7 === 0 && state.streak !== state.lastFreezeStreak) {
    state.lastFreezeStreak = state.streak;
    state.items.streak_freeze = (state.items.streak_freeze || 0) + 1;
    save();
    toastInfo("🔥 Unbreakable: +1 Streak Freeze gratis!");
  }
}


// ---------------------------------------------------------------------
//  6h) cekResetMingguan()
//  Kalau cap minggu (Senin) sudah beda, mulai minggu baru:
//  progress challenge balik 0 dan daftar 'selesai' dikosongkan.
// ---------------------------------------------------------------------
function cekResetMingguan() {
  const minggu = seninMingguIni();
  if (state.weekly.minggu !== minggu) {
    state.weekly.minggu = minggu;
    state.weekly.progress = {};
    state.weekly.selesai = [];
    save();
  }
}


// ---------------------------------------------------------------------
//  6i) tambahProgressMingguan(mission, arah)
//  Dipanggil tiap misi harian dicentang/dibatalkan. Tambah/kurang
//  progress tiap challenge yang cocok. Kalau target kecapai & belum
//  diklaim, kasih hadiah (Poin + EXP) sekali.
//    arah = +1 (centang) / -1 (batal)
// ---------------------------------------------------------------------
function tambahProgressMingguan(mission, arah) {
  cekResetMingguan(); // jaga-jaga minggu berganti saat app kebuka lama

  WEEKLIES.forEach(w => {
    if (!w.hitung(mission)) return;

    const sekarang = state.weekly.progress[w.id] || 0;
    let baru = sekarang + arah;
    if (baru < 0) baru = 0;
    state.weekly.progress[w.id] = baru;

    // Target kecapai & belum pernah diklaim minggu ini -> kasih hadiah.
    const sudahKlaim = state.weekly.selesai.includes(w.id);
    if (!sudahKlaim && baru >= w.target) {
      state.weekly.selesai.push(w.id);
      state.poin += w.poin;
      addExp(w.exp);
      toastInfo(`${w.icon} Challenge "${w.name}" selesai! +${w.poin} 💎 +${w.exp} EXP`);
    }
  });
}


// ---------------------------------------------------------------------
//  8m) renderWeekly()  — gambar daftar challenge mingguan + progress bar.
// ---------------------------------------------------------------------
function renderWeekly() {
  const box = document.getElementById("weekly-list");
  if (!box) return;
  box.innerHTML = "";

  WEEKLIES.forEach(w => {
    const nilai = state.weekly.progress[w.id] || 0;
    const selesai = state.weekly.selesai.includes(w.id);
    const persen = Math.min(100, Math.round((nilai / w.target) * 100));

    const row = document.createElement("div");
    row.className = "weekly-item" + (selesai ? " selesai" : "");
    row.innerHTML = `
      <div class="weekly-head">
        <span class="weekly-name">${w.icon} ${w.name}${selesai ? " ✓" : ""}</span>
        <span class="weekly-reward">+${w.poin}💎 +${w.exp}EXP</span>
      </div>
      <div class="weekly-desc">${w.desc}</div>
      <div class="weekly-track">
        <div class="weekly-fill${selesai ? " done" : ""}" style="width:${persen}%;"></div>
      </div>
      <div class="weekly-num">${Math.min(nilai, w.target)} / ${w.target}</div>
    `;
    box.appendChild(row);
  });
}


// ---------------------------------------------------------------------
//  6j) EDIT MISI (Tahap 16) — tambah / hapus / pulihkan default.
//  Misi hidup di state.missions. Tiap perubahan: simpan + render ulang.
// ---------------------------------------------------------------------

// Bikin id unik dari nama + angka, biar gak bentrok sama misi lain.
function idMisiBaru() {
  return "custom_" + Date.now().toString(36);
}

// Tambah misi baru. Param: nama (teks), cat (kategori), exp (angka).
// Stat bonus-nya kecil & merata biar adil (gak bisa diatur user, biar simpel).
function tambahMisi(nama, cat, exp) {
  nama = (nama || "").trim();
  if (!nama) { toastInfo("✏️ Nama misi gak boleh kosong."); return; }
  if (!kategoriAktif().includes(cat)) cat = kategoriAktif()[0] || "Perawatan";
  exp = parseInt(exp, 10);
  if (isNaN(exp) || exp < 1) exp = 8;
  if (exp > 50) exp = 50; // batas wajar biar gak bisa “ngecheat” EXP

  // Stat bonus default per kategori (biar misi custom tetap naikin stat).
  // Kategori custom (buatan user) dapat bonus kecil campur biar tetap adil.
  const statDefault = {
    Fisik:      { body: 2 },
    Perawatan:  { looks: 1, body: 1 },
    Mental:     { mind: 2 },
    Build:      { mind: 2, discipline: 1 },
  };

  // 'hari' (Tahap 28): array angka hari (0=Min..6=Sab). Kosong = tiap hari.
  const hari = Array.isArray(arguments[3]) ? arguments[3] : [];

  state.missions.push({
    id: idMisiBaru(),
    name: nama,
    exp: exp,
    stats: statDefault[cat] || { mind: 1, body: 1 },
    cat: cat,
    hari: hari,
    custom: true, // penanda: ini misi bikinan user (boleh dihapus)
  });
  save();
  render();
  toastInfo(hari.length ? "✅ Misi terjadwal ditambahkan!" : "✅ Misi ditambahkan!");
}

// Tahap 27: tambah kategori baru.
function tambahKategori(nama) {
  nama = (nama || "").trim();
  if (!nama) { toastInfo("✏️ Nama kategori gak boleh kosong."); return; }
  if (state.kategori.includes(nama)) { toastInfo("Kategori itu sudah ada."); return; }
  if (state.kategori.length >= 8) { toastInfo("Maksimal 8 kategori."); return; }
  state.kategori.push(nama);
  save();
  render();
  renderKategoriChips();
  isiDropdownKategori();
  toastInfo("🏷️ Kategori \"" + nama + "\" ditambahkan.");
}

// Hapus kategori (hanya kalau gak ada misi yang pakai, biar aman).
function hapusKategori(nama) {
  if (CATEGORIES.includes(nama)) { toastInfo("Kategori bawaan gak bisa dihapus."); return; }
  const dipakai = misiAktif().some(m => m.cat === nama);
  if (dipakai) { toastInfo("Masih ada misi di kategori ini. Pindahkan/hapus dulu."); return; }
  state.kategori = state.kategori.filter(k => k !== nama);
  save();
  render();
  renderKategoriChips();
  isiDropdownKategori();
  toastInfo("🗑️ Kategori dihapus.");
}

// Hapus satu misi. Kalau lagi dicentang hari ini, batalin dulu efeknya
// biar EXP/stat/poin gak nyangkut. Tahap 34: simpan buat UNDO.
let _misiTerhapus = null; // { mission, index } buat undo
function hapusMisi(id) {
  if (state.done.includes(id)) {
    toggleMission(id); // batalin centang -> EXP/stat/poin balik rapi
  }
  const idx = state.missions.findIndex(m => m.id === id);
  if (idx === -1) return;
  _misiTerhapus = { mission: state.missions[idx], index: idx };
  state.missions = state.missions.filter(m => m.id !== id);
  save();
  render();
  toastUndo("🗑️ Misi dihapus.", undoHapusMisi); // Tahap 34: kasih opsi undo
}

// Tahap 34: kembalikan misi yang barusan dihapus ke posisi semula.
function undoHapusMisi() {
  if (!_misiTerhapus) return;
  const { mission, index } = _misiTerhapus;
  state.missions.splice(Math.min(index, state.missions.length), 0, mission);
  _misiTerhapus = null;
  save();
  render();
  toastInfo("↩️ Misi dikembalikan.");
}

// Pulihkan daftar misi ke default (buang semua perubahan user).
function pulihkanMisiDefault() {
  // Batalin dulu centang hari ini biar angka gak nyangkut.
  [...state.done].forEach(id => { if (state.done.includes(id)) toggleMission(id); });
  state.missions = JSON.parse(JSON.stringify(MISI_DEFAULT));
  save();
  render();
  toastInfo("↩️ Misi dikembalikan ke default.");
}


// ---------------------------------------------------------------------
//  8n) renderMisiEditor()  — gambar daftar misi + tombol hapus, per kategori,
//  plus baca form tambah misi. Dipanggil dari render().
// ---------------------------------------------------------------------
function renderMisiEditor() {
  const box = document.getElementById("misi-editor-list");
  if (!box) return;
  box.innerHTML = "";

  kategoriAktif().forEach(cat => {
    const daftar = misiAktif().filter(m => m.cat === cat);
    if (daftar.length === 0) return;

    const heading = document.createElement("div");
    heading.className = "mission-cat";
    heading.textContent = cat;
    box.appendChild(heading);

    daftar.forEach(m => {
      const row = document.createElement("div");
      row.className = "misi-edit-row";
      const adaJadwal = m.hari && m.hari.length > 0;
      row.innerHTML = `
        <div class="misi-edit-name">${escapeHtml(m.name)}${adaJadwal ? ` <span class="misi-jadwal-tag">${m.hari.map(h => HARI_LABEL[h]).join(" ")}</span>` : ""}</div>
        <div class="misi-edit-exp">+${m.exp}</div>
        <button class="misi-note-btn" title="Catatan" aria-label="Catatan untuk ${escapeHtml(m.name)}">📝</button>
        <button class="misi-del" data-id="${m.id}" title="Hapus misi" aria-label="Hapus misi ${escapeHtml(m.name)}">✕</button>
      `;
      row.querySelector(".misi-note-btn").addEventListener("click", () => editMisiNote(m.id));
      row.querySelector(".misi-del").addEventListener("click", () => {
        if (confirm(`Hapus misi "${m.name}"?`)) hapusMisi(m.id);
      });
      box.appendChild(row);
    });
  });
}


// ---------------------------------------------------------------------
//  7) toggleMission(id)
//  Selesai -> +EXP +stat. Batal -> -EXP -stat. Lalu simpan & render.
// ---------------------------------------------------------------------
function toggleMission(id) {
  const mission = misiAktif().find(m => m.id === id);
  const sudahSelesai = state.done.includes(id);
  let naikLevel = false;

  // Hitung EXP & Poin pakai helper (biar centang & batal nilainya sama persis,
  // termasuk semua bonus dari skill + EXP Boost).
  const expMisi = expUntukMisi(mission);
  const poinMisi = poinUntukMisi();

  if (sudahSelesai) {
    state.done = state.done.filter(x => x !== id);
    addExp(-expMisi);
    applyStats(mission.stats, -1);
    state.poin -= poinMisi;                 // batalin: Poin ikut balik
    if (state.poin < 0) state.poin = 0;
    tambahProgressMingguan(mission, -1);    // batalin progress challenge
  } else {
    state.done.push(id);
    state.totalDone += 1; // hitung total misi kelar sepanjang masa
    naikLevel = addExp(expMisi); // simpan apakah naik level
    applyStats(mission.stats, +1);
    state.poin += poinMisi;                 // tiap misi kelar = +Poin
    tambahProgressMingguan(mission, +1);    // tambah progress challenge
  }

  if (state.exp < 0) state.exp = 0;
  if (state.level < 1) state.level = 1;

  save();
  render();

  // Animasi: efek "pop" di kartu yang barusan dicentang.
  if (!sudahSelesai) { animatePop(id); efekMisiKelar(); } // Tahap 20: bunyi + getar
  // Animasi: overlay "LEVEL UP!" kalau tadi naik level.
  if (naikLevel) animateLevelUp();
}


// ---------------------------------------------------------------------
//  7c) claimDailyLogin()
//  Kasih bonus Poin sekali per hari. Kalau hari ini sudah klaim, gak
//  ngapa-ngapain. Dipanggil otomatis pas app dibuka.
// ---------------------------------------------------------------------
function claimDailyLogin() {
  if (state.lastLogin === today()) return; // sudah klaim hari ini
  state.lastLogin = today();
  state.poin += POIN_LOGIN;
  save();
  toastInfo(`🎁 Daily login! +${POIN_LOGIN} 💎`);
}


// ---------------------------------------------------------------------
//  7d) buyItem(id)
//  Beli item dari Shop kalau Poin cukup. Efek tergantung tipe item:
//    consumable -> nambah stok di inventory (dipakai nanti otomatis)
//    boost      -> langsung aktif hari ini
//    cosmetic   -> nyalain selamanya (cuma bisa beli sekali)
// ---------------------------------------------------------------------
function buyItem(id) {
  const item = SHOP.find(x => x.id === id);
  if (!item) return;

  // Tema emas cuma bisa dibeli sekali.
  if (item.tipe === "cosmetic" && state.theme === "gold") {
    toastInfo("Kamu sudah punya Tema Emas.");
    return;
  }

  if (state.poin < item.harga) {
    toastInfo(`💎 Poin kurang. Butuh ${item.harga}, punya ${state.poin}.`);
    return;
  }

  // Bayar.
  state.poin -= item.harga;

  // Terapkan efek.
  if (item.tipe === "consumable") {
    state.items[id] = (state.items[id] || 0) + 1;
    toastInfo(`${item.icon} ${item.name} dibeli! Stok: ${state.items[id]}`);
  } else if (item.tipe === "boost") {
    state.expBoostDate = today();
    toastInfo(`${item.icon} ${item.name} aktif! Misi hari ini EXP dobel.`);
  } else if (item.tipe === "cosmetic") {
    state.theme = "gold";
    applyTheme();
    toastInfo(`${item.icon} ${item.name} aktif!`);
  }

  save();
  render();
}


// ---------------------------------------------------------------------
//  7e) applyTheme()  — pasang/lepas kelas tema emas di <body>.
// ---------------------------------------------------------------------
function applyTheme() {
  // Tema warna pilihan (Tahap 24): hapus semua kelas tema-*, pasang yang dipilih.
  document.body.classList.remove("tema-blue", "tema-ungu", "tema-hijau", "tema-merah");
  document.body.classList.add("tema-" + (state.tema || "blue"));
  // Tema emas (item Shop) tetap jadi lapisan terpisah di atas warna pilihan.
  document.body.classList.toggle("theme-gold", state.theme === "gold");
}


// ---------------------------------------------------------------------
//  7f) toastInfo(teks)  — notifikasi kecil umum (pakai toast yang sama).
// ---------------------------------------------------------------------
function toastInfo(teks) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerHTML = teks;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// Tahap 34: toast dengan tombol UNDO. Klik tombol -> jalankan aksiUndo.
let _undoTimer = null;
function toastUndo(teks, aksiUndo) {
  const toast = document.getElementById("toast");
  if (!toast) { if (aksiUndo) aksiUndo(); return; }
  clearTimeout(_undoTimer);
  toast.innerHTML = `${teks} <button class="toast-undo">URUNGKAN</button>`;
  toast.classList.add("show");
  const btn = toast.querySelector(".toast-undo");
  btn.addEventListener("click", () => {
    toast.classList.remove("show");
    if (aksiUndo) aksiUndo();
  });
  _undoTimer = setTimeout(() => toast.classList.remove("show"), 5000); // kasih waktu lebih buat undo
}


// ---------------------------------------------------------------------
//  7g) SUARA & GETAR (Tahap 20)
//  Nada dibikin dari kode (Web Audio API) — gak butuh file .mp3, jadi app
//  tetap ringan. AudioContext dibuat sekali, pas dipanggil pertama kali.
//  Kalau browser gak dukung atau toggle mati, fungsi diam aja (gak error).
// ---------------------------------------------------------------------
let _audioCtx = null;
function audioCtx() {
  if (_audioCtx) return _audioCtx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  _audioCtx = new AC();
  return _audioCtx;
}

// Bunyikan 1 nada singkat. freq = tinggi nada (Hz), durasi dalam detik.
function bunyiNada(freq, durasi, tipe) {
  if (!state.suaraOn) return;
  const ctx = audioCtx();
  if (!ctx) return;
  // Browser kadang "suspend" audio sampai ada interaksi; resume dulu.
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipe || "sine";
  osc.frequency.value = freq;

  // Amplop volume: naik cepat lalu meredup, biar gak "klik" kasar.
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durasi);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durasi);
}

// Getar HP (kalau didukung & toggle nyala). pola = angka/array milidetik.
function getar(pola) {
  if (!state.suaraOn) return;
  if (navigator.vibrate) navigator.vibrate(pola);
}

// Efek pas misi dicentang: "ting" pendek + getar singkat.
function efekMisiKelar() {
  bunyiNada(660, 0.12, "triangle");
  getar(30);
}

// Efek pas naik level: 3 nada naik (arpeggio) + getar pola.
function efekLevelUp() {
  bunyiNada(523, 0.14, "sine");          // C5
  setTimeout(() => bunyiNada(659, 0.14, "sine"), 110); // E5
  setTimeout(() => bunyiNada(784, 0.22, "sine"), 220); // G5
  getar([40, 50, 40]);
}


// ---------------------------------------------------------------------
//  7b) animatePop(id) & animateLevelUp()
//  Kasih kelas CSS sebentar lalu dicabut, biar animasinya jalan sekali.
// ---------------------------------------------------------------------
function animatePop(id) {
  // Cari kartu misi yang baru dicentang lewat data-id-nya.
  const card = document.querySelector(`.mission[data-id="${id}"]`);
  if (!card) return;
  card.classList.add("just-checked");
  setTimeout(() => card.classList.remove("just-checked"), 300);
}

function animateLevelUp() {
  const overlay = document.getElementById("levelup");
  const sub = document.getElementById("levelup-sub");
  const burst = document.getElementById("burst");

  efekLevelUp(); // Tahap 20: bunyi arpeggio naik + getar pas level up

  // Tampilkan level baru di bawah teks.
  sub.textContent = "Lv. " + state.level;

  // Buat 14 partikel kilau yang menyebar ke segala arah.
  burst.innerHTML = "";
  const jumlah = 14;
  for (let i = 0; i < jumlah; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    // Sudut merata melingkar, jarak acak 60–140px.
    const sudut = (i / jumlah) * Math.PI * 2;
    const jarak = 60 + Math.random() * 80;
    spark.style.setProperty("--dx", Math.cos(sudut) * jarak + "px");
    spark.style.setProperty("--dy", Math.sin(sudut) * jarak + "px");
    burst.appendChild(spark);
  }

  // Jalankan animasi: kasih kelas 'show', cabut setelah selesai.
  overlay.classList.remove("show"); // reset dulu kalau masih nyala
  void overlay.offsetWidth;          // trik: paksa browser "mulai ulang" animasi
  overlay.classList.add("show");
  setTimeout(() => overlay.classList.remove("show"), 1600);
}


// ---------------------------------------------------------------------
//  8) render()  — gambar ulang header, stat, daftar misi, pesan.
// ---------------------------------------------------------------------
function render() {
  // Day X / 66 + streak di bagian atas.
  document.getElementById("day-label").textContent = "DAY " + dayNumber();
  document.getElementById("day-total").textContent = "/ 66";
  document.getElementById("streak-label").textContent = "🔥 " + state.streak;

  // Poin (mata uang) di header.
  document.getElementById("poin-label").textContent = "💎 " + state.poin;

  // Profil (Tahap 17): avatar + nama + gelar sesuai level.
  renderProfil();

  // Ringkasan hari (Tahap 19): dashboard sekilas di tab Info.
  renderRingkas();
  renderStatistik();  // Tahap 23: statistik mendalam (tab Info)
  renderMood();       // Tahap 25: mood harian (Home)
  renderKutipan();    // Tahap 26: kutipan motivasi harian (Home)
  renderGoals();      // Tahap 29: target jangka panjang (tab Info)
  renderMoodHistory();// Tahap 42: riwayat mood 7 hari (tab Info)

  // Kalau Streak Freeze baru dipakai saat ganti hari, kasih tau sekali.
  if (state._freezeDipakai) {
    state._freezeDipakai = false;
    toastInfo("🧊 Streak Freeze dipakai — streak kamu aman!");
  }

  document.getElementById("level-label").textContent = "Lv. " + state.level;
  document.getElementById("exp-label").textContent =
    state.exp + " / " + expNeeded(state.level) + " EXP";

  const persen = (state.exp / expNeeded(state.level)) * 100;
  const expFill = document.getElementById("exp-fill");
  expFill.style.width = persen + "%";
  // Berdenyut kalau EXP sudah >= 80% (hampir naik level).
  if (persen >= 80) {
    expFill.classList.add("glow");
  } else {
    expFill.classList.remove("glow");
  }

  renderStats();
  renderGizi();

  const list = document.getElementById("mission-list");
  list.innerHTML = "";

  // Tahap 41: empty state kalau hari ini gak ada misi sama sekali
  // (mis. semua misi terjadwal & gak ada yang jadwalnya hari ini).
  if (misiHariIni().length === 0) {
    list.innerHTML = `<div class="mission-empty">🌙 Gak ada misi terjadwal hari ini. Tambah misi di "Atur Misi Sendiri".</div>`;
  }

  // Gambar misi dikelompokkan per kategori. Misi terjadwal (Tahap 28) yang
  // bukan untuk hari ini disembunyikan via misiHariIni().
  kategoriAktif().forEach(cat => {
    const misiKategori = misiHariIni().filter(m => m.cat === cat);
    if (misiKategori.length === 0) return;

    const heading = document.createElement("div");
    heading.className = "mission-cat";
    heading.textContent = cat;
    list.appendChild(heading);

    misiKategori.forEach(mission => {
      const selesai = state.done.includes(mission.id);
      const card = document.createElement("div");
      card.className = "mission" + (selesai ? " done" : "");
      card.setAttribute("data-id", mission.id);
      // Tahap 40: aksesibilitas — kartu bisa difokus & ditekan Enter/Spasi,
      // dengan label yang jelas buat pembaca layar.
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-pressed", selesai ? "true" : "false");
      card.setAttribute("aria-label", mission.name + (selesai ? " (selesai)" : ""));
      // Catatan per misi (Tahap 30): tampil di bawah nama kalau ada.
      const catatan = (state.misiNote && state.misiNote[mission.id]) || "";
      card.innerHTML = `
        <div class="check">${selesai ? "✓" : ""}</div>
        <div class="name">${mission.name}${catatan ? `<span class="misi-note-tag">📝 ${escapeHtml(catatan)}</span>` : ""}</div>
        <div class="exp">+${mission.exp}</div>
      `;
      card.addEventListener("click", () => toggleMission(mission.id));
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMission(mission.id); }
      });
      list.appendChild(card);
    });
  });

  const total = misiHariIni().length;
  const kelar = state.done.length;
  const pep = document.getElementById("pep-talk");
  if (kelar === 0) {
    pep.textContent = "💬 Hari baru. Mulai dari 1 misi yang paling gampang dulu.";
  } else if (kelar < total) {
    pep.textContent = `💬 ${kelar} dari ${total} kelar. Jalan terus, pelan gak apa.`;
  } else {
    pep.textContent = "🔥 Semua misi kelar! Hari yang sempurna. Istirahat yang layak.";
  }

  renderHistory();
  renderChart();
  renderJurnal();
  renderWeekly();
  renderMisiEditor();
  renderReminder();
  checkAchievements();
  renderAchievements();
  cekUnbreakable();   // skill Unbreakable kasih freeze gratis tiap streak x7
  renderSkills();
  renderShop();
}


// ---------------------------------------------------------------------
//  8h) renderSkills()  — gambar daftar skill + status.
//  3 kondisi tampilan:
//    - sudah di-learn  -> "Dikuasai" (nyala)
//    - kebuka & mampu   -> tombol Learn aktif
//    - terkunci/kurang  -> tombol nonaktif + teks syarat
// ---------------------------------------------------------------------
function renderSkills() {
  const box = document.getElementById("skill-list");
  if (!box) return;
  box.innerHTML = "";

  const dikuasai = state.skills.length;
  const elCount = document.getElementById("skill-count");
  if (elCount) elCount.textContent = dikuasai + " / " + SKILLS.length;

  SKILLS.forEach(skill => {
    const punya = punyaSkill(skill.id);
    const kebuka = skill.syarat(state);
    const mampu = state.poin >= skill.harga;

    const row = document.createElement("div");
    row.className = "skill-item" + (punya ? " learned" : (kebuka ? "" : " locked"));

    // Tentukan tombol / status.
    let aksi;
    if (punya) {
      aksi = `<span class="skill-status">✓ Dikuasai</span>`;
    } else if (!kebuka) {
      aksi = `<span class="skill-req">🔒 ${skill.syaratTxt}</span>`;
    } else if (!mampu) {
      aksi = `<button class="learn" disabled>💎 ${skill.harga}</button>`;
    } else {
      aksi = `<button class="learn" data-skill="${skill.id}">💎 ${skill.harga}</button>`;
    }

    row.innerHTML = `
      <div class="skill-icon">${skill.icon}</div>
      <div class="skill-info">
        <div class="skill-name">${skill.name}</div>
        <div class="skill-desc">${skill.desc}</div>
      </div>
      ${aksi}
    `;
    box.appendChild(row);
  });

  box.querySelectorAll("[data-skill]").forEach(btn => {
    btn.addEventListener("click", () => learnSkill(btn.getAttribute("data-skill")));
  });
}


// ---------------------------------------------------------------------
//  8g) renderShop()  — gambar daftar item Shop + status kepemilikan.
//  Tiap item nunjukin harga, dan tombol beli nonaktif kalau Poin kurang
//  atau item kosmetik sudah dimiliki.
// ---------------------------------------------------------------------
function renderShop() {
  const box = document.getElementById("shop-list");
  if (!box) return;
  box.innerHTML = "";

  SHOP.forEach(item => {
    const punyaKosmetik = item.tipe === "cosmetic" && state.theme === "gold";
    const mampu = state.poin >= item.harga;
    const stok = state.items[item.id] || 0;

    const row = document.createElement("div");
    row.className = "shop-item";

    // Label tombol tergantung kondisi.
    let tombol;
    if (punyaKosmetik) {
      tombol = `<button class="buy owned" disabled>Dimiliki</button>`;
    } else if (!mampu) {
      tombol = `<button class="buy" disabled>💎 ${item.harga}</button>`;
    } else {
      tombol = `<button class="buy" data-buy="${item.id}">💎 ${item.harga}</button>`;
    }

    // Tampilkan stok buat item consumable.
    const stokLabel = item.tipe === "consumable" && stok > 0
      ? `<span class="shop-stok">x${stok}</span>` : "";

    row.innerHTML = `
      <div class="shop-icon">${item.icon}</div>
      <div class="shop-info">
        <div class="shop-name">${item.name} ${stokLabel}</div>
        <div class="shop-desc">${item.desc}</div>
      </div>
      ${tombol}
    `;
    box.appendChild(row);
  });

  // Pasang klik tombol beli (hanya yang aktif).
  box.querySelectorAll("[data-buy]").forEach(btn => {
    btn.addEventListener("click", () => buyItem(btn.getAttribute("data-buy")));
  });
}


// ---------------------------------------------------------------------
//  8d) checkAchievements()
//  Cek tiap badge: kalau syaratnya tercapai dan BELUM kebuka, buka
//  (masukkan id ke state.unlocked) lalu tampilkan notifikasi kecil.
// ---------------------------------------------------------------------
function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    const sudahKebuka = state.unlocked.includes(a.id);
    if (!sudahKebuka && a.cek(state)) {
      state.unlocked.push(a.id);
      save();
      toastAchievement(a); // kasih tau user
    }
  });
}


// ---------------------------------------------------------------------
//  8e) renderAchievements()
//  Gambar grid lencana. Yang kebuka: warna + ikon. Yang belum: abu + "?".
// ---------------------------------------------------------------------
function renderAchievements() {
  const box = document.getElementById("achievement-grid");
  box.innerHTML = "";

  const jumlahKebuka = state.unlocked.length;
  document.getElementById("achievement-count").textContent =
    jumlahKebuka + " / " + ACHIEVEMENTS.length;

  ACHIEVEMENTS.forEach(a => {
    const kebuka = state.unlocked.includes(a.id);
    const cell = document.createElement("div");
    cell.className = "badge" + (kebuka ? " unlocked" : "");
    cell.title = kebuka ? a.name + " — " + a.desc : "Terkunci: " + a.desc;
    cell.innerHTML = kebuka
      ? `<div class="badge-icon">${a.icon}</div><div class="badge-name">${a.name}</div>`
      : `<div class="badge-icon">?</div>`;
    box.appendChild(cell);
  });
}


// ---------------------------------------------------------------------
//  8f) toastAchievement(a)  — notifikasi kecil pas badge kebuka.
// ---------------------------------------------------------------------
function toastAchievement(a) {
  const toast = document.getElementById("toast");
  toast.innerHTML = `${a.icon} Achievement: <b>${a.name}</b>`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}


// ---------------------------------------------------------------------
//  8c-jurnal) simpanJurnal(teks) & renderJurnal()
//  Jurnal harian: user nulis 1 catatan per hari. Nyimpen catatan pertama
//  kali hari ini kasih bonus +5 Poin (sekali/hari). Catatan ikut
//  diarsipkan ke history pas ganti hari (lihat rolloverDay).
// ---------------------------------------------------------------------
function simpanJurnal(teks) {
  const kosongSebelumnya = !state.jurnal || state.jurnal.trim() === "";
  state.jurnal = teks;

  // Bonus: pertama kali nulis jurnal hari ini (dari kosong -> ada isi).
  if (kosongSebelumnya
      && teks.trim() !== ""
      && state.jurnalBonusDate !== today()) {
    state.jurnalBonusDate = today();
    state.poin += 5;
    toastInfo("📓 Jurnal tersimpan! +5 💎");
  }
  save();
  // Update label poin di header tanpa gambar ulang semua (biar kursor
  // di textarea gak kabur saat ngetik).
  const pl = document.getElementById("poin-label");
  if (pl) pl.textContent = "💎 " + state.poin;
}

function renderJurnal() {
  const area = document.getElementById("jurnal-input");
  if (!area) return;
  // Isi textarea dengan catatan hari ini (hanya kalau beda, biar gak
  // reset kursor saat user sedang mengetik).
  if (area.value !== state.jurnal) area.value = state.jurnal;
}


// ---------------------------------------------------------------------
//  8c-chart) renderChart()
//  Gambar grafik garis progres EXP pakai SVG murni (tanpa library).
//  Datanya dari 'history' (tiap hari punya expTotal) + titik HARI INI.
//  Cara kerja singkat: cari EXP tertinggi, lalu tiap hari dipetakan
//  jadi koordinat x (kiri->kanan) & y (bawah=0, atas=tertinggi).
// ---------------------------------------------------------------------
function renderChart() {
  const box = document.getElementById("chart-box");
  if (!box) return;

  // Susun titik-titik: tiap hari di history + hari ini (titik terbaru).
  const titik = state.history.map(h => ({ label: h.date, exp: h.expTotal }));
  titik.push({ label: today(), exp: expTerkumpul() });

  // Butuh minimal 2 titik biar bisa narik garis.
  if (titik.length < 2) {
    box.innerHTML = `<div class="chart-empty">📈 Grafik muncul setelah kamu pakai app beberapa hari. Terus jalan!</div>`;
    return;
  }

  // Ambil paling banyak 14 titik terakhir biar grafik gak sesak.
  const data = titik.slice(-14);

  // Ukuran kanvas grafik (koordinat internal SVG).
  const W = 300, H = 120, pad = 8;
  const maxExp = Math.max(...data.map(d => d.exp), 1); // hindari bagi 0

  // Petakan tiap titik jadi koordinat x,y di dalam kanvas.
  const koord = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - (d.exp / maxExp) * (H - pad * 2);
    return { x, y, exp: d.exp };
  });

  // Buat string "x,y x,y ..." buat <polyline> (garis) dan area di bawahnya.
  const garis = koord.map(k => `${k.x.toFixed(1)},${k.y.toFixed(1)}`).join(" ");
  const area = `${pad},${H - pad} ${garis} ${(W - pad)},${H - pad}`;

  // Lingkaran kecil di tiap titik.
  const dots = koord.map(k =>
    `<circle cx="${k.x.toFixed(1)}" cy="${k.y.toFixed(1)}" r="2.5" fill="#7fd0ff" />`
  ).join("");

  box.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="none">
      <polygon points="${area}" fill="url(#chart-grad)" opacity="0.25" />
      <polyline points="${garis}" fill="none" stroke="#1f47e8" stroke-width="2"
                stroke-linejoin="round" stroke-linecap="round" />
      ${dots}
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f47e8" />
          <stop offset="100%" stop-color="#1f47e8" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
    <div class="chart-foot">
      <span>${data[0].label}</span>
      <span class="chart-max">Total EXP: ${expTerkumpul()}</span>
      <span>${data[data.length - 1].label}</span>
    </div>
  `;
}


// ---------------------------------------------------------------------
//  8c) renderHistory()
//  Gambar daftar hari lalu dari 'history', paling baru di atas.
//  Tiap baris: tanggal + berapa misi kelar hari itu.
// ---------------------------------------------------------------------
function renderHistory() {
  const box = document.getElementById("history-list");
  box.innerHTML = "";

  if (state.history.length === 0) {
    box.innerHTML = `<div class="history-empty">Belum ada riwayat. Mulai hari ini! 🚀</div>`;
    return;
  }

  // Tahap 43: filter riwayat pakai kata kunci (cocokkan tanggal / isi jurnal).
  const cariEl = document.getElementById("history-cari");
  const kunci = cariEl ? cariEl.value.trim().toLowerCase() : "";

  let daftar = state.history.slice().reverse();
  if (kunci) {
    daftar = daftar.filter(h =>
      (h.date || "").toLowerCase().includes(kunci) ||
      (h.jurnal || "").toLowerCase().includes(kunci)
    );
  }
  if (daftar.length === 0) {
    box.innerHTML = `<div class="history-empty">Gak ada riwayat yang cocok "${escapeHtml(kunci)}".</div>`;
    return;
  }

  daftar.forEach(hari => {
    const row = document.createElement("div");
    row.className = "history-row";
    // Kalau hari itu ada catatan jurnal, tampilkan di bawah tanggal.
    const catatan = (hari.jurnal && hari.jurnal.trim() !== "")
      ? `<div class="history-note">📓 ${escapeHtml(hari.jurnal)}</div>` : "";
    row.innerHTML = `
      <div class="history-top">
        <span class="history-date">${hari.date}</span>
        <span class="history-count">${hari.kelar} misi</span>
      </div>
      ${catatan}
    `;
    box.appendChild(row);
  });
}


// ---------------------------------------------------------------------
//  8c-esc) escapeHtml(teks)
//  Ubah karakter spesial (<, >, &, ") jadi aman buat ditaruh di HTML.
//  Penting: catatan jurnal ditulis user, jangan sampai bisa nyuntik HTML.
// ---------------------------------------------------------------------
function escapeHtml(teks) {
  return String(teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ---------------------------------------------------------------------
//  8i) tambahGizi(key, arah)  — tambah/kurang asupan gizi hari ini.
//  arah = +1 / -1, langkahnya dari GIZI_STEP. Gak boleh minus.
//  Kalau protein capai target, kasih bonus Poin sekali per hari.
// ---------------------------------------------------------------------
function tambahGizi(key, arah) {
  const step = GIZI_STEP[key];
  state.gizi[key] += step * arah;
  if (state.gizi[key] < 0) state.gizi[key] = 0;

  // Bonus: protein nyampe target -> +5 Poin, sekali per hari.
  if (key === "protein"
      && state.gizi.protein >= state.giziTarget.protein
      && state.giziBonusDate !== today()) {
    state.giziBonusDate = today();
    state.poin += 5;
    toastInfo("🍗 Target protein tercapai! +5 💎");
  }

  save();
  render();
}


// ---------------------------------------------------------------------
//  8j) renderGizi()  — gambar 3 bar gizi (kalori / protein / air) +
//  tombol +/- buat input manual. Bar penuh pas capai target.
// ---------------------------------------------------------------------
function renderGizi() {
  const box = document.getElementById("gizi-list");
  if (!box) return;
  box.innerHTML = "";

  GIZI_INFO.forEach(info => {
    const nilai = state.gizi[info.key];
    const target = state.giziTarget[info.key];
    // Lebar bar = persen menuju target, maksimal 100%.
    const persen = Math.min(100, Math.round((nilai / target) * 100));
    const tercapai = nilai >= target;

    const row = document.createElement("div");
    row.className = "gizi-row";
    row.innerHTML = `
      <div class="gizi-head">
        <span>${info.icon} ${info.label}${tercapai ? " ✓" : ""}</span>
        <span class="gizi-num">${nilai} / ${target} ${info.unit}</span>
      </div>
      <div class="gizi-track">
        <div class="gizi-fill${tercapai ? " done" : ""}" style="width:${persen}%;"></div>
      </div>
      <div class="gizi-btns">
        <button class="gizi-btn" data-gizi-minus="${info.key}">−</button>
        <button class="gizi-btn" data-gizi-plus="${info.key}">+ ${GIZI_STEP[info.key]}</button>
      </div>
    `;
    box.appendChild(row);
  });

  box.querySelectorAll("[data-gizi-plus]").forEach(btn => {
    btn.addEventListener("click", () => tambahGizi(btn.getAttribute("data-gizi-plus"), +1));
  });
  box.querySelectorAll("[data-gizi-minus]").forEach(btn => {
    btn.addEventListener("click", () => tambahGizi(btn.getAttribute("data-gizi-minus"), -1));
  });
}


// ---------------------------------------------------------------------
//  8b) renderStats()  — gambar 4 bar stat sesuai nilai sekarang (0–100).
// ---------------------------------------------------------------------
function renderStats() {
  const box = document.getElementById("stat-list");
  box.innerHTML = "";

  STAT_INFO.forEach(info => {
    const nilai = state.stats[info.key];
    const row = document.createElement("div");
    row.className = "stat";
    row.innerHTML = `
      <div class="stat-head">
        <span>${info.label}</span>
        <span>${nilai}</span>
      </div>
      <div class="stat-track">
        <div class="stat-fill" style="width:${nilai}%;background:${info.color};"></div>
      </div>
    `;
    box.appendChild(row);
  });
}


// ---------------------------------------------------------------------
//  8k) gotoPage(name)  — ganti halaman aktif (navigasi tab).
//  Sembunyikan semua .page, tampilkan yang dipilih, lalu tandai
//  tombol nav yang aktif. Semua halaman tetap 1 file — cuma
//  disembunyikan/ditampilkan pakai kelas CSS (pola SPA sederhana).
// ---------------------------------------------------------------------
function gotoPage(name) {
  // Matikan semua halaman, nyalakan yang dipilih.
  document.querySelectorAll(".page").forEach(p => {
    p.classList.toggle("active", p.id === "page-" + name);
  });
  // Tandai tombol nav yang aktif.
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-page") === name);
  });
  // Gulir ke atas tiap ganti halaman (biar gak bingung posisi).
  window.scrollTo(0, 0);
}

// Pasang klik di tiap tombol nav bawah.
function setupNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => gotoPage(btn.getAttribute("data-page")));
  });
}


// ---------------------------------------------------------------------
//  9) START
// CATATAN: blok START (load + semua setup + render) DIPINDAH ke paling bawah
// file. Dulu di sini, tapi manggil const/fungsi (mis. TEMA_PILIHAN) yang
// didefinisikan SETELAH titik ini -> error "Cannot access before init" pas
// data kosong. Taruh di akhir biar semua udah siap sebelum dijalankan.


// ---------------------------------------------------------------------
//  BLOK B — Tahap 27-31
// ---------------------------------------------------------------------

// Tahap 27: KATEGORI — isi dropdown kategori di form misi + chips kelola.
function isiDropdownKategori() {
  const sel = document.getElementById("misi-cat");
  if (!sel) return;
  const terpilih = sel.value;
  sel.innerHTML = "";
  kategoriAktif().forEach(k => {
    const o = document.createElement("option");
    o.value = k; o.textContent = k;
    sel.appendChild(o);
  });
  if (kategoriAktif().includes(terpilih)) sel.value = terpilih;
}

function renderKategoriChips() {
  const box = document.getElementById("kategori-chips");
  if (!box) return;
  box.innerHTML = "";
  kategoriAktif().forEach(k => {
    const chip = document.createElement("span");
    chip.className = "kat-chip";
    const bawaan = CATEGORIES.includes(k);
    chip.innerHTML = escapeHtml(k) + (bawaan ? "" : ` <button class="kat-del" title="Hapus kategori">✕</button>`);
    if (!bawaan) {
      chip.querySelector(".kat-del").addEventListener("click", () => hapusKategori(k));
    }
    box.appendChild(chip);
  });
}

function setupKategori() {
  isiDropdownKategori();
  renderKategoriChips();
  const btn = document.getElementById("kat-add-btn");
  const inp = document.getElementById("kat-nama");
  if (btn && inp) {
    btn.addEventListener("click", () => { tambahKategori(inp.value); inp.value = ""; });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });
  }
}

// Tahap 28: JADWAL — tombol hari (Min-Sab) di form misi. Simpan di variabel
// modul biar dibaca pas tombol "+ Tambah" ditekan.
const HARI_LABEL = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
let _jadwalPilih = []; // angka hari yang dipilih di form

function setupJadwal() {
  const box = document.getElementById("misi-hari");
  if (!box) return;
  box.innerHTML = "";
  HARI_LABEL.forEach((lbl, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hari-opt";
    b.textContent = lbl;
    b.addEventListener("click", () => {
      if (_jadwalPilih.includes(idx)) _jadwalPilih = _jadwalPilih.filter(x => x !== idx);
      else _jadwalPilih.push(idx);
      b.classList.toggle("aktif");
    });
    box.appendChild(b);
  });
}

// Tahap 30: CATATAN PER MISI — minta catatan lewat prompt sederhana.
function editMisiNote(id) {
  const lama = (state.misiNote && state.misiNote[id]) || "";
  const baru = prompt("Catatan untuk misi ini (kosongkan untuk hapus):", lama);
  if (baru === null) return; // batal
  if (!state.misiNote) state.misiNote = {};
  const teks = baru.trim();
  if (teks) state.misiNote[id] = teks.slice(0, 60);
  else delete state.misiNote[id];
  save();
  render();
}

// Tahap 29: GOALS — target jangka panjang.
function tambahGoal(nama, target) {
  nama = (nama || "").trim();
  target = parseInt(target, 10);
  if (!nama) { toastInfo("✏️ Nama target gak boleh kosong."); return; }
  if (isNaN(target) || target < 1) target = 100;
  state.goals.push({ id: "g" + Date.now().toString(36), nama, target, nilai: 0 });
  save(); render(); toastInfo("🎯 Target ditambahkan.");
}
function ubahGoal(id, delta) {
  const g = state.goals.find(x => x.id === id);
  if (!g) return;
  g.nilai = Math.max(0, Math.min(g.target, g.nilai + delta));
  save(); render();
}
function hapusGoal(id) {
  state.goals = state.goals.filter(g => g.id !== id);
  save(); render();
}
function renderGoals() {
  const box = document.getElementById("goals-list");
  if (!box) return;
  box.innerHTML = "";
  if (state.goals.length === 0) {
    box.innerHTML = `<div class="goals-empty">Belum ada target. Tambah satu di bawah 👇</div>`;
    return;
  }
  state.goals.forEach(g => {
    const persen = Math.min(100, Math.round((g.nilai / g.target) * 100));
    const el = document.createElement("div");
    el.className = "goal-item";
    el.innerHTML = `
      <div class="goal-head">
        <span class="goal-nama">${escapeHtml(g.nama)}</span>
        <button class="goal-del" title="Hapus target">✕</button>
      </div>
      <div class="goal-track"><div class="goal-fill" style="width:${persen}%;"></div></div>
      <div class="goal-foot">
        <button class="goal-min">−</button>
        <span class="goal-num">${g.nilai} / ${g.target}</span>
        <button class="goal-plus">+</button>
      </div>
    `;
    el.querySelector(".goal-del").addEventListener("click", () => { if (confirm(`Hapus target "${g.nama}"?`)) hapusGoal(g.id); });
    el.querySelector(".goal-min").addEventListener("click", () => ubahGoal(g.id, -1));
    el.querySelector(".goal-plus").addEventListener("click", () => ubahGoal(g.id, +1));
    box.appendChild(el);
  });
}
function setupGoals() {
  const btn = document.getElementById("goal-add-btn");
  const inpN = document.getElementById("goal-nama");
  const inpT = document.getElementById("goal-target");
  if (btn && inpN && inpT) {
    btn.addEventListener("click", () => { tambahGoal(inpN.value, inpT.value); inpN.value = ""; inpT.value = ""; });
  }
}

// Tahap 31: MODE gelap/terang.
function applyMode() {
  document.body.classList.toggle("mode-terang", state.mode === "terang");
}
function setupMode() {
  const t = document.getElementById("mode-toggle");
  if (!t) return;
  t.checked = state.mode === "terang";
  t.addEventListener("change", () => {
    state.mode = t.checked ? "terang" : "gelap";
    save(); applyMode();
    toastInfo(state.mode === "terang" ? "☀️ Mode terang" : "🌙 Mode gelap");
  });
}


// ---------------------------------------------------------------------
//  BLOK C — Tahap 32-36
// ---------------------------------------------------------------------

// Tahap 35: SHARE KARTU PROGRES — gambar kartu "Day X / Level Y" di canvas,
// lalu download sebagai PNG. Semua digambar dari kode (gak butuh file).
function shareKartu() {
  const W = 600, H = 800;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) { toastInfo("Browser gak dukung canvas."); return; }

  // Latar gradient gelap biru.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#17204a");
  g.addColorStop(1, "#0b0e18");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";

  // Judul ASCEND.
  ctx.fillStyle = "#4d6bff";
  ctx.font = "800 64px 'Segoe UI', sans-serif";
  ctx.fillText("ASCEND", W / 2, 110);

  // Avatar + nama.
  ctx.font = "90px sans-serif";
  ctx.fillText(state.profil.avatar, W / 2, 230);
  ctx.fillStyle = "#e8eaf4";
  ctx.font = "700 40px 'Segoe UI', sans-serif";
  ctx.fillText(state.profil.nama, W / 2, 300);
  ctx.fillStyle = "#7fd0ff";
  ctx.font = "600 26px 'Segoe UI', sans-serif";
  ctx.fillText("Lv." + state.level + " · " + gelarSekarang(), W / 2, 345);

  // Day X / 66.
  ctx.fillStyle = "#e8eaf4";
  ctx.font = "800 100px 'Segoe UI', sans-serif";
  ctx.fillText("DAY " + dayNumber(), W / 2, 470);
  ctx.fillStyle = "#8a97c2";
  ctx.font = "500 30px 'Segoe UI', sans-serif";
  ctx.fillText("dari 66 hari", W / 2, 510);

  // Baris statistik: streak, total misi, EXP.
  const stats = [
    ["🔥", state.streak, "Streak"],
    ["🏅", state.totalDone || 0, "Misi"],
    ["✨", expTerkumpul(), "EXP"],
  ];
  stats.forEach((s, i) => {
    const x = W / 2 + (i - 1) * 180;
    ctx.font = "48px sans-serif";
    ctx.fillText(s[0], x, 610);
    ctx.fillStyle = "#e8eaf4";
    ctx.font = "800 36px 'Segoe UI', sans-serif";
    ctx.fillText(String(s[1]), x, 655);
    ctx.fillStyle = "#8a97c2";
    ctx.font = "500 22px 'Segoe UI', sans-serif";
    ctx.fillText(s[2], x, 688);
  });

  // Footer.
  ctx.fillStyle = "#4d6bff";
  ctx.font = "italic 24px 'Segoe UI', sans-serif";
  ctx.fillText("Naik ke versi terbaik diri.", W / 2, 760);

  // Download.
  c.toBlob(blob => {
    if (!blob) { toastInfo("Gagal bikin gambar."); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascend-day" + dayNumber() + ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toastInfo("📸 Kartu progres kedownload!");
  }, "image/png");
}

function setupShare() {
  const btn = document.getElementById("share-btn");
  if (btn) btn.addEventListener("click", shareKartu);
}


// ---------------------------------------------------------------------
//  BLOK A — Tahap 22-26
// ---------------------------------------------------------------------

// Tahap 22: ONBOARDING — layar sambutan sekali di awal.
function setupOnboard() {
  const ov = document.getElementById("onboard");
  if (!ov) return;
  if (state.sudahOnboard) { ov.classList.remove("show"); return; }

  // Belum pernah onboard -> tampilkan.
  ov.classList.add("show");

  const inpNama = document.getElementById("onboard-nama");
  const picker  = document.getElementById("onboard-avatar");
  const btnMulai = document.getElementById("onboard-mulai");
  let pilih = state.profil.avatar;

  inpNama.value = state.profil.nama === "Hunter" ? "" : state.profil.nama;

  picker.innerHTML = "";
  AVATARS.forEach(a => {
    const b = document.createElement("button");
    b.className = "avatar-opt" + (a === pilih ? " aktif" : "");
    b.textContent = a;
    b.addEventListener("click", () => {
      pilih = a;
      picker.querySelectorAll(".avatar-opt").forEach(x =>
        x.classList.toggle("aktif", x.textContent === pilih));
    });
    picker.appendChild(b);
  });

  btnMulai.addEventListener("click", () => {
    const nama = inpNama.value.trim();
    state.profil.nama = nama || "Hunter";
    state.profil.avatar = pilih;
    state.sudahOnboard = true;
    save();
    ov.classList.remove("show");
    render();
    toastInfo("👋 Selamat datang, " + state.profil.nama + "!");
  });
}


// Tahap 24: TEMA WARNA — pilih warna aksen app.
const TEMA_PILIHAN = [
  { id: "blue",  nama: "Biru",  warna: "#1f47e8" },
  { id: "ungu",  nama: "Ungu",  warna: "#7c3aed" },
  { id: "hijau", nama: "Hijau", warna: "#0e9f6e" },
  { id: "merah", nama: "Merah", warna: "#e02424" },
];

function setupTema() {
  const box = document.getElementById("tema-picker");
  if (!box) return;
  gambarTema(box);
}

function gambarTema(box) {
  box.innerHTML = "";
  TEMA_PILIHAN.forEach(t => {
    const b = document.createElement("button");
    b.className = "tema-opt" + (state.tema === t.id ? " aktif" : "");
    b.innerHTML = `<span class="tema-dot" style="background:${t.warna};"></span>${t.nama}`;
    b.addEventListener("click", () => {
      state.tema = t.id;
      save();
      applyTheme();
      gambarTema(box); // gambar ulang tanda 'aktif'
      toastInfo("🎨 Tema: " + t.nama);
    });
    box.appendChild(b);
  });
}


// Tahap 25: MOOD HARIAN — catat 1 mood per hari.
const MOODS = ["😄", "🙂", "😐", "😔", "😫"];

function setMood(emoji) {
  state.mood[today()] = emoji;
  save();
  renderMood();
  toastInfo("Mood hari ini: " + emoji);
}

function setupMood() {
  // Render awal; tombol dibuat ulang tiap render lewat renderMood().
  renderMood();
}

function renderMood() {
  const box = document.getElementById("mood-picker");
  if (!box) return;
  const pilih = state.mood[today()] || "";
  box.innerHTML = "";
  MOODS.forEach(m => {
    const b = document.createElement("button");
    b.className = "mood-opt" + (m === pilih ? " aktif" : "");
    b.textContent = m;
    b.addEventListener("click", () => setMood(m));
    box.appendChild(b);
  });
}


// Tahap 42: RIWAYAT MOOD — baris emoji 7 hari terakhir (tab Info).
// Hari tanpa mood ditandai titik. Dibaca dari state.mood (keyed tanggal).
function tanggalMundur(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
function renderMoodHistory() {
  const box = document.getElementById("mood-history");
  if (!box) return;
  box.innerHTML = "";
  // 7 hari: dari 6 hari lalu sampai hari ini.
  for (let i = 6; i >= 0; i--) {
    const tgl = tanggalMundur(i);
    const emoji = state.mood[tgl] || "·";
    const dow = HARI_SINGKAT[new Date(tgl).getDay()];
    const kolom = document.createElement("div");
    kolom.className = "moodh-kolom" + (i === 0 ? " hari-ini" : "");
    kolom.innerHTML = `
      <div class="moodh-emoji">${emoji}</div>
      <div class="moodh-hari">${dow}</div>
    `;
    box.appendChild(kolom);
  }
}


// Tahap 26: KUTIPAN HARIAN — 1 kutipan, dipilih dari tanggal (tetap sepanjang hari).
const KUTIPAN = [
  "Sedikit tiap hari, lama-lama jadi banyak.",
  "Kamu gak harus sempurna, cukup lebih baik dari kemarin.",
  "Disiplin adalah jembatan antara tujuan dan hasil.",
  "Mulai aja dulu, semangat nyusul.",
  "Tubuh dibentuk dari kebiasaan, bukan satu hari heroik.",
  "Progres kecil tetap progres.",
  "Hari ini susah, besok kamu berterima kasih.",
  "Fokus ke proses, hasil ngikut.",
  "Konsisten kalah sama sempurna? Gak. Konsisten menang.",
  "Satu misi kelar lebih baik dari sepuluh rencana.",
];

function kutipanHariIni() {
  // Ubah tanggal jadi angka stabil, lalu pilih indeks kutipan.
  const t = today(); // "YYYY-MM-DD"
  let jml = 0;
  for (let i = 0; i < t.length; i++) jml += t.charCodeAt(i);
  return KUTIPAN[jml % KUTIPAN.length];
}

function renderKutipan() {
  const el = document.getElementById("kutipan-hari");
  if (!el) return;
  el.textContent = "\u201C" + kutipanHariIni() + "\u201D";
}


// Tahap 23: STATISTIK MENDALAM — angka ringkas dari data yang terkumpul.
function renderStatistik() {
  const box = document.getElementById("statistik-grid");
  if (!box) return;

  const hist = state.history || [];
  const totalMisi = state.totalDone || 0;

  // Rata-rata misi/hari: pakai riwayat hari yang sudah lewat + hari ini.
  const hariTercatat = hist.length + 1; // +1 buat hari ini yang belum diarsip
  const kelarHariIni = state.done.length;
  const totalKelarTercatat = hist.reduce((a, h) => a + (h.kelar || 0), 0) + kelarHariIni;
  const rataPerHari = hariTercatat > 0 ? (totalKelarTercatat / hariTercatat).toFixed(1) : "0";

  // Hari paling produktif: cari entri history dengan 'kelar' terbanyak.
  let hariTerbaik = "-";
  let maxKelar = kelarHariIni;
  let tglTerbaik = today();
  hist.forEach(h => {
    if ((h.kelar || 0) > maxKelar) { maxKelar = h.kelar; tglTerbaik = h.date; }
  });
  if (maxKelar > 0) hariTerbaik = maxKelar + " misi (" + tglTerbaik + ")";

  const kartu = [
    { icon: "🏅", label: "Total misi", nilai: totalMisi },
    { icon: "📆", label: "Hari tercatat", nilai: hariTercatat },
    { icon: "📈", label: "Rata/hari", nilai: rataPerHari },
    { icon: "⭐", label: "Level", nilai: "Lv. " + state.level },
    { icon: "✨", label: "EXP total", nilai: expTerkumpul() },
    { icon: "🔥", label: "Streak", nilai: state.streak },
  ];

  box.innerHTML = "";
  kartu.forEach(k => {
    const el = document.createElement("div");
    el.className = "ringkas-kartu";
    el.innerHTML = `
      <div class="ringkas-icon">${k.icon}</div>
      <div class="ringkas-nilai">${k.nilai}</div>
      <div class="ringkas-label">${k.label}</div>
    `;
    box.appendChild(el);
  });

  const best = document.getElementById("statistik-terbaik");
  if (best) best.textContent = "🏆 Hari paling produktif: " + hariTerbaik;
}


// ---------------------------------------------------------------------
//  setupSuara() (Tahap 20) — toggle bunyi/getar + bunyi tes pas dinyalain.
// ---------------------------------------------------------------------
function setupSuara() {
  const t = document.getElementById("suara-toggle");
  if (!t) return;
  t.checked = state.suaraOn;
  t.addEventListener("change", () => {
    state.suaraOn = t.checked;
    save();
    if (state.suaraOn) efekMisiKelar(); // kasih contoh bunyi pas dinyalain
    toastInfo(state.suaraOn ? "🔊 Suara & getar: ON" : "🔇 Suara & getar: OFF");
  });
}


// ---------------------------------------------------------------------
//  renderProfil() (Tahap 17) — gambar avatar + nama + gelar di header.
// ---------------------------------------------------------------------
function renderProfil() {
  const av = document.getElementById("profil-avatar");
  const nm = document.getElementById("profil-nama");
  const gl = document.getElementById("profil-gelar");
  if (!av || !nm || !gl) return;
  av.textContent = state.profil.avatar;
  nm.textContent = state.profil.nama;
  gl.textContent = "Lv." + state.level + " · " + gelarSekarang();
}


// ---------------------------------------------------------------------
//  renderRingkas() (Tahap 19) — tab Info: kartu ringkasan kondisi hari ini
//  + fokus (misi terdekat yang belum kelar). Semua angka dibaca dari state,
//  jadi selalu sinkron sama halaman lain (gak nyimpen angka ganda).
// ---------------------------------------------------------------------
function renderRingkas() {
  const grid = document.getElementById("ringkas-grid");
  if (!grid) return;

  const totalMisi = misiHariIni().length;
  const kelar = state.done.length;

  // Persen gizi = rata-rata 3 target (kalori, protein, air), dibatasi 100.
  let persenGizi = 0;
  GIZI_INFO.forEach(g => {
    const target = state.giziTarget[g.key] || 1;
    persenGizi += Math.min(100, (state.gizi[g.key] / target) * 100);
  });
  persenGizi = Math.round(persenGizi / GIZI_INFO.length);

  const kartu = [
    { icon: "🗺️", label: "Misi kelar", nilai: kelar + " / " + totalMisi },
    { icon: "🍎", label: "Gizi", nilai: persenGizi + "%" },
    { icon: "💎", label: "Poin", nilai: state.poin },
    { icon: "🔥", label: "Streak", nilai: state.streak + " hari" },
    { icon: "⭐", label: "Level", nilai: "Lv. " + state.level },
    { icon: "⚔️", label: "Skill", nilai: state.skills.length + " / " + SKILLS.length },
  ];

  grid.innerHTML = "";
  kartu.forEach(k => {
    const el = document.createElement("div");
    el.className = "ringkas-kartu";
    el.innerHTML = `
      <div class="ringkas-icon">${k.icon}</div>
      <div class="ringkas-nilai">${k.nilai}</div>
      <div class="ringkas-label">${k.label}</div>
    `;
    grid.appendChild(el);
  });

  // Fokus: misi pertama yang belum kelar (dorongan buat lanjut).
  const fokus = document.getElementById("ringkas-fokus");
  if (!fokus) return;
  const belum = misiHariIni().filter(m => !state.done.includes(m.id));
  if (belum.length === 0) {
    fokus.innerHTML = `<div class="ringkas-done">🎉 Semua misi hari ini kelar. Mantap!</div>`;
  } else {
    const m = belum[0];
    fokus.innerHTML = `
      <div class="ringkas-fokus-kartu">
        <div class="ringkas-fokus-cat">${m.cat}</div>
        <div class="ringkas-fokus-nama">${escapeHtml(m.name)}</div>
        <div class="ringkas-fokus-sisa">Masih ada ${belum.length} misi belum kelar</div>
      </div>
    `;
  }
}


// ---------------------------------------------------------------------
//  setupProfil() (Tahap 17) — buka modal, isi avatar picker, simpan.
// ---------------------------------------------------------------------
function setupProfil() {
  const strip   = document.getElementById("profil-strip");
  const modal   = document.getElementById("profil-modal");
  const inpNama = document.getElementById("profil-nama-input");
  const picker  = document.getElementById("avatar-picker");
  const btnBatal  = document.getElementById("profil-batal");
  const btnSimpan = document.getElementById("profil-simpan");
  if (!strip || !modal) return;

  let pilihAvatar = state.profil.avatar; // avatar yang lagi dipilih di modal

  function gambarPicker() {
    picker.innerHTML = "";
    AVATARS.forEach(a => {
      const b = document.createElement("button");
      b.className = "avatar-opt" + (a === pilihAvatar ? " aktif" : "");
      b.textContent = a;
      b.addEventListener("click", () => {
        pilihAvatar = a;
        gambarPicker(); // gambar ulang biar tanda 'aktif' pindah
      });
      picker.appendChild(b);
    });
  }

  function buka() {
    pilihAvatar = state.profil.avatar;
    inpNama.value = state.profil.nama;
    gambarPicker();
    modal.classList.add("show");
  }
  function tutup() { modal.classList.remove("show"); }

  strip.addEventListener("click", buka);
  btnBatal.addEventListener("click", tutup);
  // Klik area gelap di luar kartu = tutup (batal).
  modal.addEventListener("click", e => { if (e.target === modal) tutup(); });

  btnSimpan.addEventListener("click", () => {
    const nama = inpNama.value.trim();
    state.profil.nama = nama || "Hunter"; // kosong -> balik default
    state.profil.avatar = pilihAvatar;
    save();
    render();
    tutup();
    toastInfo("👤 Profil disimpan!");
  });
}


// ---------------------------------------------------------------------
//  setupBackup() — sambungkan tombol Export & input Import di tab Lainnya.
// ---------------------------------------------------------------------
function setupBackup() {
  const btnExport = document.getElementById("backup-export-btn");
  const inpImport = document.getElementById("backup-import-input");
  const btnImport = document.getElementById("backup-import-btn");

  if (btnExport) btnExport.addEventListener("click", exportData);

  // Tombol "Import" cuma mancing klik ke input file yang disembunyiin.
  if (btnImport && inpImport) {
    btnImport.addEventListener("click", () => inpImport.click());
    inpImport.addEventListener("change", e => {
      importData(e.target.files[0]);
      e.target.value = ""; // reset biar file sama bisa dipilih lagi nanti
    });
  }
}


// ---------------------------------------------------------------------
//  setupMisiForm() — sambungkan form "tambah misi" + tombol pulihkan default
//  di halaman Misi. Baca input nama/kategori/exp, panggil tambahMisi().
// ---------------------------------------------------------------------
function setupMisiForm() {
  const btnTambah = document.getElementById("misi-add-btn");
  const inpNama   = document.getElementById("misi-nama");
  const selCat    = document.getElementById("misi-cat");
  const inpExp    = document.getElementById("misi-exp");
  const btnReset  = document.getElementById("misi-reset-btn");

  if (btnTambah) {
    btnTambah.addEventListener("click", () => {
      tambahMisi(inpNama.value, selCat.value, inpExp.value, _jadwalPilih.slice());
      inpNama.value = "";   // kosongin lagi biar siap nambah berikutnya
      inpExp.value = "";
      _jadwalPilih = [];    // reset pilihan hari
      document.querySelectorAll("#misi-hari .hari-opt.aktif").forEach(b => b.classList.remove("aktif"));
    });
  }
  // Enter di kolom nama = langsung tambah (biar cepet).
  if (inpNama) {
    inpNama.addEventListener("keydown", e => {
      if (e.key === "Enter" && btnTambah) btnTambah.click();
    });
  }
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (confirm("Pulihkan semua misi ke default? Misi buatanmu akan hilang.")) {
        pulihkanMisiDefault();
      }
    });
  }
}


// ---------------------------------------------------------------------
//  REMINDER (Tahap 15) — pengingat harian dalam-app.
//  Catatan jujur: ini notifikasi BROWSER (butuh tab app kebuka/di
//  background). Notif push walau app ketutup butuh PWA + server —
//  itu tahap berikutnya. Di sini kita bikin pondasinya dulu.
// ---------------------------------------------------------------------

// Minta izin notifikasi ke browser (muncul popup izin sekali).
function mintaIzinNotif() {
  if (!("Notification" in window)) {
    toastInfo("Browser ini gak dukung notifikasi.");
    return Promise.resolve("unsupported");
  }
  return Notification.requestPermission();
}

// Tampilkan notifikasi (kalau diizinkan) + toast dalam-app sebagai cadangan.
function bunyikanReminder(teks) {
  if (("Notification" in window) && Notification.permission === "granted") {
    new Notification("Ascend — Pengingat", { body: teks });
  }
  toastInfo("⏰ " + teks); // selalu tampilkan toast juga, jaga-jaga
}

// Cek tiap menit: kalau jam sekarang == jam reminder, hari ini belum
// bunyi, dan masih ada misi belum kelar -> bunyikan.
function cekReminder() {
  if (!state.reminderOn) return;

  const now = new Date();
  const jamNow = String(now.getHours()).padStart(2, "0") + ":" +
                 String(now.getMinutes()).padStart(2, "0");

  if (jamNow === state.reminderJam && state.reminderTanggal !== today()) {
    state.reminderTanggal = today(); // tandai sudah bunyi hari ini
    save();
    const sisa = misiHariIni().length - state.done.length;
    if (sisa > 0) {
      bunyikanReminder(`Masih ada ${sisa} misi belum kelar hari ini. Ayo gas! 💪`);
    } else {
      bunyikanReminder("Semua misi kelar hari ini. Mantap! 🔥");
    }
  }
}

// Gambar setting reminder (toggle + input jam) di tab Lainnya.
function renderReminder() {
  const toggle = document.getElementById("reminder-toggle");
  const jam = document.getElementById("reminder-jam");
  if (!toggle || !jam) return;
  toggle.checked = state.reminderOn;
  jam.value = state.reminderJam;
}

// Sambungkan kontrol reminder + jalankan pengecek tiap menit.
function setupReminder() {
  const toggle = document.getElementById("reminder-toggle");
  const jam = document.getElementById("reminder-jam");
  if (!toggle || !jam) return;

  toggle.addEventListener("change", async () => {
    if (toggle.checked) {
      // Minta izin dulu waktu user nyalain.
      const izin = await mintaIzinNotif();
      if (izin === "denied") {
        toastInfo("Izin notif ditolak. Pengingat tetap muncul via toast dalam app.");
      }
    }
    state.reminderOn = toggle.checked;
    save();
    toastInfo(toggle.checked ? "⏰ Reminder nyala" : "Reminder dimatikan");
  });

  jam.addEventListener("change", () => {
    state.reminderJam = jam.value || "20:00";
    state.reminderTanggal = ""; // boleh bunyi lagi kalau jam diubah
    save();
    toastInfo("Jam reminder: " + state.reminderJam);
  });

  // Jalankan pengecek tiap 30 detik (cukup untuk presisi menit).
  setInterval(cekReminder, 30 * 1000);
}


// ---------------------------------------------------------------------
//  setupJurnal()  — simpan jurnal otomatis tiap user selesai mengetik.
//  Pakai event 'input' + sedikit debounce biar gak nyimpen tiap huruf.
// ---------------------------------------------------------------------
function setupJurnal() {
  const area = document.getElementById("jurnal-input");
  if (!area) return;
  let timer = null;
  area.addEventListener("input", () => {
    clearTimeout(timer);
    // Tunggu 500ms setelah ketikan terakhir baru simpan.
    timer = setTimeout(() => simpanJurnal(area.value), 500);
  });
}


// ---------------------------------------------------------------------
//  10) PWA (Tahap 21) — daftarkan service worker biar app bisa di-install
//  di HP & jalan offline. Dibungkus try/catch + cek dukungan, jadi kalau
//  browser lama gak dukung, app tetap jalan normal (cuma gak bisa install).
// ---------------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Gagal daftar (mis. dibuka langsung dari file://) — diamkan, app tetap jalan.
    });
  });
}


// =====================================================================
//  START — DIJALANKAN PALING AKHIR
//  Semua const & fungsi di atas sudah terdefinisi di titik ini, jadi aman
//  memanggil setup yang butuh TEMA_PILIHAN, MOODS, dll.
// =====================================================================
load();
applyTheme();        // pasang tema (emas kalau sudah dibeli)
applyMode();         // Tahap 31: pasang mode gelap/terang
claimDailyLogin();   // kasih bonus Poin kalau login pertama hari ini
setupNav();          // aktifkan navigasi tab bawah
setupJurnal();       // sambungkan textarea jurnal
setupReminder();     // sambungkan setting reminder + jalankan pengecek jam
setupMisiForm();     // sambungkan form tambah misi + tombol pulihkan default
setupBackup();       // sambungkan tombol export/import data
setupProfil();       // sambungkan strip profil + modal edit
setupSuara();        // sambungkan toggle suara & getar
setupTema();         // Tahap 24: pilihan tema warna
setupMood();         // Tahap 25: tombol mood harian
setupOnboard();      // Tahap 22: layar sambutan (muncul sekali)
setupKategori();     // Tahap 27: form tambah kategori
setupJadwal();       // Tahap 28: tombol hari di form misi
setupGoals();        // Tahap 29: form target jangka panjang
setupMode();         // Tahap 31: toggle mode gelap/terang
setupShare();        // Tahap 35: tombol share kartu progres
setupCariRiwayat();  // Tahap 43: kotak cari di riwayat
render();

// Tahap 43: ketik di kotak cari -> gambar ulang riwayat (terfilter).
function setupCariRiwayat() {
  const inp = document.getElementById("history-cari");
  if (inp) inp.addEventListener("input", renderHistory);
}

// Tahap 39: sembunyikan splash begitu render pertama selesai (anti-kedip).
(function sembunyikanSplash() {
  const sp = document.getElementById("splash");
  if (sp) setTimeout(() => sp.classList.add("hide"), 250);
})();
