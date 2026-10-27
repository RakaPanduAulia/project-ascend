// =====================================================================
//  ASCEND — Tahap 3
//  Papan misi + EXP + LEVEL + STAT + RIWAYAT + STREAK + Day X/66.
//  Centang misi -> EXP & stat naik. Tiap ganti hari, hari kemarin
//  disimpan ke riwayat dan streak dihitung. Semua awet di browser.
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
  { id: "gym",       name: "🏋️ Gym 45 menit",            exp: 15, stats: { body: 4, discipline: 2 } },
  { id: "berangkat", name: "🌅 Berangkat ≤ 07:15",        exp: 10, stats: { body: 2, discipline: 2 } },
  { id: "skincare",  name: "🧴 Skincare pagi/malam",       exp: 8,  stats: { looks: 3 } },
  { id: "air",       name: "💧 Minum air ≥ 2 liter",       exp: 8,  stats: { body: 2 } },
  { id: "makan",     name: "🥗 Makan 1 menu sehat",        exp: 8,  stats: { body: 2 } },
  { id: "jurnal",    name: "📓 Jurnaling 5 menit",         exp: 10, stats: { mind: 3 } },
  { id: "inggris",   name: "🇬🇧 Belajar Inggris ~15 menit", exp: 12, stats: { mind: 3 } },
  { id: "build",     name: "💻 Ngoding app 30 menit",      exp: 15, stats: { mind: 3, discipline: 2 } },
  { id: "tidur",     name: "😴 Tidur ≥ 7 jam",             exp: 10, stats: { body: 2, mind: 1 } },
];


// Nama & warna tiap stat, buat ditampilkan. Urutannya ngikut ini.
const STAT_INFO = [
  { key: "body",       label: "💪 Body",       color: "#4d6bff" },
  { key: "mind",       label: "🧠 Mind",       color: "#1f47e8" },
  { key: "looks",      label: "✨ Looks",      color: "#6f8cff" },
  { key: "discipline", label: "🔥 Discipline", color: "#0a2bc2" },
];


// ---------------------------------------------------------------------
//  2) STATE (keadaan sekarang)
//  Tambahan Tahap 3:
//    startDate = tanggal pertama pakai app (buat hitung "Day X/66")
//    streak    = berapa hari beruntun nyelesaiin minimal 1 misi
//    history   = daftar hari lalu, mis. [{ date:"2026-10-26", kelar:5 }]
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
};


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

  // 1) Arsipkan hari kemarin.
  state.history.push({ date: state.date, kelar: kelarKemarin });
  // Simpan paling banyak 60 hari terakhir biar gak kebanyakan.
  if (state.history.length > 60) {
    state.history = state.history.slice(-60);
  }

  // 2) Update streak.
  if (kelarKemarin >= 1) {
    state.streak += 1;
  } else {
    state.streak = 0;
  }

  // 3) Hari baru.
  state.done = [];
  state.date = today();
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
// ---------------------------------------------------------------------
function addExp(amount) {
  state.exp += amount;
  while (state.exp >= expNeeded(state.level)) {
    state.exp -= expNeeded(state.level);
    state.level += 1;
  }
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
//  7) toggleMission(id)
//  Selesai -> +EXP +stat. Batal -> -EXP -stat. Lalu simpan & render.
// ---------------------------------------------------------------------
function toggleMission(id) {
  const mission = MISSIONS.find(m => m.id === id);
  const sudahSelesai = state.done.includes(id);

  if (sudahSelesai) {
    state.done = state.done.filter(x => x !== id);
    addExp(-mission.exp);
    applyStats(mission.stats, -1);
  } else {
    state.done.push(id);
    addExp(mission.exp);
    applyStats(mission.stats, +1);
  }

  if (state.exp < 0) state.exp = 0;
  if (state.level < 1) state.level = 1;

  save();
  render();
}


// ---------------------------------------------------------------------
//  8) render()  — gambar ulang header, stat, daftar misi, pesan.
// ---------------------------------------------------------------------
function render() {
  // Day X / 66 + streak di bagian atas.
  document.getElementById("day-label").textContent = "DAY " + dayNumber();
  document.getElementById("day-total").textContent = "/ 66";
  document.getElementById("streak-label").textContent = "🔥 " + state.streak;

  document.getElementById("level-label").textContent = "Lv. " + state.level;
  document.getElementById("exp-label").textContent =
    state.exp + " / " + expNeeded(state.level) + " EXP";

  const persen = (state.exp / expNeeded(state.level)) * 100;
  document.getElementById("exp-fill").style.width = persen + "%";

  renderStats();

  const list = document.getElementById("mission-list");
  list.innerHTML = "";

  MISSIONS.forEach(mission => {
    const selesai = state.done.includes(mission.id);
    const card = document.createElement("div");
    card.className = "mission" + (selesai ? " done" : "");
    card.innerHTML = `
      <div class="check">${selesai ? "✓" : ""}</div>
      <div class="name">${mission.name}</div>
      <div class="exp">+${mission.exp}</div>
    `;
    card.addEventListener("click", () => toggleMission(mission.id));
    list.appendChild(card);
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
//  9) START
// ---------------------------------------------------------------------
load();
render();
