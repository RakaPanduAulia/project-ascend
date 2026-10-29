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
const MISSIONS = [
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
const CATEGORIES = ["Fisik", "Perawatan", "Mental", "Build"];


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
};


// Langkah tambah/kurang tiap tombol gizi (biar input cepat).
const GIZI_STEP = { kalori: 100, protein: 10, air: 250 };
const GIZI_INFO = [
  { key: "kalori",  icon: "🔥", label: "Kalori",  unit: "kcal" },
  { key: "protein", icon: "🍗", label: "Protein", unit: "g" },
  { key: "air",     icon: "💧", label: "Air",     unit: "ml" },
];


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
  //    jumlah misi kelar, level, dan total EXP terkumpul saat itu.
  state.history.push({
    date: state.date,
    kelar: kelarKemarin,
    level: state.level,
    expTotal: expTerkumpul(),
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
//  7) toggleMission(id)
//  Selesai -> +EXP +stat. Batal -> -EXP -stat. Lalu simpan & render.
// ---------------------------------------------------------------------
function toggleMission(id) {
  const mission = MISSIONS.find(m => m.id === id);
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
  } else {
    state.done.push(id);
    state.totalDone += 1; // hitung total misi kelar sepanjang masa
    naikLevel = addExp(expMisi); // simpan apakah naik level
    applyStats(mission.stats, +1);
    state.poin += poinMisi;                 // tiap misi kelar = +Poin
  }

  if (state.exp < 0) state.exp = 0;
  if (state.level < 1) state.level = 1;

  save();
  render();

  // Animasi: efek "pop" di kartu yang barusan dicentang.
  if (!sudahSelesai) animatePop(id);
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

  // Gambar misi dikelompokkan per kategori (Fisik, Perawatan, Mental, Build).
  // Tiap kategori dikasih judul kecil dulu, baru kartu-kartu misinya.
  CATEGORIES.forEach(cat => {
    const misiKategori = MISSIONS.filter(m => m.cat === cat);
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
      card.innerHTML = `
        <div class="check">${selesai ? "✓" : ""}</div>
        <div class="name">${mission.name}</div>
        <div class="exp">+${mission.exp}</div>
      `;
      card.addEventListener("click", () => toggleMission(mission.id));
      list.appendChild(card);
    });
  });

  const total = MISSIONS.length;
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

  // slice().reverse() -> salin lalu balik urutan (terbaru dulu).
  state.history.slice().reverse().forEach(hari => {
    const row = document.createElement("div");
    row.className = "history-row";
    row.innerHTML = `
      <span class="history-date">${hari.date}</span>
      <span class="history-count">${hari.kelar} misi</span>
    `;
    box.appendChild(row);
  });
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
// ---------------------------------------------------------------------
load();
applyTheme();        // pasang tema (emas kalau sudah dibeli)
claimDailyLogin();   // kasih bonus Poin kalau login pertama hari ini
setupNav();          // aktifkan navigasi tab bawah
render();
