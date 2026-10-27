// =====================================================================
//  ASCEND — Tahap 1
//  Papan misi harian: centang misi -> EXP naik -> disimpan di browser.
//  Tiap fungsi dikasih penjelasan di atasnya biar gampang dipahami.
// =====================================================================


// ---------------------------------------------------------------------
//  1) DAFTAR MISI
//  Ini "data" misi hari ini. Tiap misi punya:
//    id   = penanda unik (biar bisa dibedain)
//    name = teks yang tampil
//    exp  = berapa EXP kalau dicentang
// ---------------------------------------------------------------------
const MISSIONS = [
  { id: "gym",       name: "🏋️ Gym 45 menit",            exp: 15 },
  { id: "berangkat", name: "🌅 Berangkat ≤ 07:15",        exp: 10 },
  { id: "skincare",  name: "🧴 Skincare pagi/malam",       exp: 8  },
  { id: "air",       name: "💧 Minum air ≥ 2 liter",       exp: 8  },
  { id: "makan",     name: "🥗 Makan 1 menu sehat",        exp: 8  },
  { id: "jurnal",    name: "📓 Jurnaling 5 menit",         exp: 10 },
  { id: "inggris",   name: "🇬🇧 Belajar Inggris ~15 menit", exp: 12 },
  { id: "build",     name: "💻 Ngoding app 30 menit",      exp: 15 },
  { id: "tidur",     name: "😴 Tidur ≥ 7 jam",             exp: 10 },
];


// ---------------------------------------------------------------------
//  2) STATE (keadaan sekarang)
//  "state" = kondisi terkini: berapa EXP, level berapa, misi mana yang
//  sudah dicentang. Semua yang bisa berubah kita simpan di sini.
// ---------------------------------------------------------------------
let state = {
  exp: 0,
  level: 1,
  done: [],      // contoh: ["air", "skincare"]
  date: today(), // tanggal hari ini, buat reset otomatis tiap hari
};


// ---------------------------------------------------------------------
//  3) today()
//  Ngasih tanggal hari ini sebagai teks, misal "2026-10-27".
// ---------------------------------------------------------------------
function today() {
  return new Date().toISOString().slice(0, 10);
}


// ---------------------------------------------------------------------
//  4) expNeeded(level)
//  Hitung EXP yang dibutuhkan buat naik dari level ini ke berikutnya.
//  Aturannya: level x 100.
// ---------------------------------------------------------------------
function expNeeded(level) {
  return level * 100;
}


// ---------------------------------------------------------------------
//  5) save()  dan  load()
//  save  = tulis state ke localStorage (memori browser) jadi teks.
//  load  = baca balik pas halaman dibuka lagi, biar progres gak hilang.
// ---------------------------------------------------------------------
function save() {
  localStorage.setItem("ascend", JSON.stringify(state));
}

function load() {
  const saved = localStorage.getItem("ascend");
  if (saved) {
    state = JSON.parse(saved);
  }
  // Kalau ternyata sudah ganti hari, reset centang misi (EXP & level tetap).
  if (state.date !== today()) {
    state.done = [];
    state.date = today();
    save();
  }
}


// ---------------------------------------------------------------------
//  6) addExp(amount)
//  Tambah EXP. Kalau EXP cukup, naik level dan sisa EXP dibawa.
// ---------------------------------------------------------------------
function addExp(amount) {
  state.exp += amount;
  while (state.exp >= expNeeded(state.level)) {
    state.exp -= expNeeded(state.level);
    state.level += 1;
  }
}


// ---------------------------------------------------------------------
//  7) toggleMission(id)
//  Dipanggil pas misi diklik. Selesai -> tambah EXP. Batal -> kurangi EXP.
// ---------------------------------------------------------------------
function toggleMission(id) {
  const mission = MISSIONS.find(m => m.id === id);
  const sudahSelesai = state.done.includes(id);

  if (sudahSelesai) {
    state.done = state.done.filter(x => x !== id);
    addExp(-mission.exp);
  } else {
    state.done.push(id);
    addExp(mission.exp);
  }

  if (state.exp < 0) state.exp = 0;
  if (state.level < 1) state.level = 1;

  save();
  render();
}


// ---------------------------------------------------------------------
//  8) render()
//  Gambar ulang seluruh tampilan sesuai 'state' terbaru.
// ---------------------------------------------------------------------
function render() {
  document.getElementById("level-label").textContent = "Lv. " + state.level;
  document.getElementById("exp-label").textContent =
    state.exp + " / " + expNeeded(state.level) + " EXP";

  const persen = (state.exp / expNeeded(state.level)) * 100;
  document.getElementById("exp-fill").style.width = persen + "%";

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
}


// ---------------------------------------------------------------------
//  9) START
// ---------------------------------------------------------------------
load();
render();
