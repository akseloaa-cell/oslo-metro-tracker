import { metroLines } from "./lines.js";
import { allCars } from "./cars.js";

/* ================= DOM ================= */
const lineEl = document.getElementById("line");
const startStationEl = document.getElementById("startStation");
const endStationEl = document.getElementById("endStation");
const startTimeEl = document.getElementById("startTime");
const endTimeEl = document.getElementById("endTime");

const carNumberEl = document.getElementById("carNumber");

const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");

const totalRidesEl = document.getElementById("totalRides");
const uniqueCarsEl = document.getElementById("uniqueCars");

const pokedexEl = document.getElementById("pokedex");

const modalEl = document.getElementById("carModal");
const modalTitleEl = document.getElementById("modalTitle");
const modalStatsEl = document.getElementById("modalStats");
const modalRidesEl = document.getElementById("modalRides");
const closeModalBtn = document.getElementById("closeModal");

const heatmapStatsEl =
  document.getElementById("heatmapStats");

closeModalBtn.addEventListener("click", () => {
  modalEl.classList.remove("open");
});

document.getElementById("btnHeatmap")
  .addEventListener("click", () => {
    showView("heatmapView");
  });

document.getElementById("btnHomeFromHeatmap")
  .addEventListener("click", () => {
    showView("homeView");
  });

document.getElementById("btnPokedexFromHeatmap")
  .addEventListener("click", () => {
    showView("pokedexView");
  });
/* ================= COLORS ================= */
const lineColors = {
  "1": "#029cda",
  "2": "#e95d11",
  "3": "#a964a3",
  "4": "#004896",
  "5": "#39a935"
};

/* ================= VIEWS ================= */
const homeView = document.getElementById("homeView");
const pokedexView = document.getElementById("pokedexView");

/* ================= STATE ================= */
let rides = JSON.parse(localStorage.getItem("rides")) || [];

/* ================= INIT ================= */
populateStations(lineEl.value);
updateFormColor();
render();
showView("homeView");

/* ================= EVENTS ================= */
lineEl.addEventListener("change", () => {
  populateStations(lineEl.value);
  updateFormColor();
});

addBtn.addEventListener("click", () => {
  if (!carNumberEl.value.trim()) {
    alert("Skriv inn et vognnummer.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const ride = {
    id: crypto.randomUUID(),
    line: lineEl.value,
    startStation: startStationEl.value,
    endStation: endStationEl.value,
    carNumber: carNumberEl.value,
    startTime: `${today}T${startTimeEl.value}`,
    endTime: `${today}T${endTimeEl.value}`,
    timestamp: Date.now()
  };

  rides.unshift(ride);
  localStorage.setItem("rides", JSON.stringify(rides));

  render();

  startStationEl.value = "";
  endStationEl.value = "";
  carNumberEl.value = "";
  startTimeEl.value = "";
  endTimeEl.value = "";
});

/* ================= RENDER HOME ================= */
function render() {
  listEl.innerHTML = "";

  // Stats
  totalRidesEl.textContent = rides.length;

  const uniqueCars = new Set(
    rides.map(r => r.carNumber)
  );

  uniqueCarsEl.textContent = uniqueCars.size;

  // Turer
  rides.forEach(r => {
    const div = document.createElement("div");
    div.className = "ride";

    const color = lineColors[r.line] || "#cccccc";

    div.style.borderLeft = `6px solid ${color}`;

    const startTime = r.startTime
      ? r.startTime.split("T")[1]
      : "?";

    const endTime = r.endTime
      ? r.endTime.split("T")[1]
      : "?";

    div.innerHTML = `
      <strong>Linje ${r.line}</strong><br/>

      🚉 ${r.startStation}
      (${startTime})

      →

      ${r.endStation}
      (${endTime})

      <br/>

      🚃 Vogn ${r.carNumber}

      <br/>

      <small>
        Registrert
        ${new Date(r.timestamp)
          .toLocaleString("no-NO")}
      </small>

      <div class="ride-actions">
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    div.querySelector(".delete-btn")
      .addEventListener("click", () => {
        deleteRide(r.id);
      });

    div.querySelector(".edit-btn")
      .addEventListener("click", () => {
        editRide(r.id);
      });

    listEl.appendChild(div);
  });
}

function deleteRide(id) {
  rides = rides.filter(r => r.id !== id);
  localStorage.setItem("rides", JSON.stringify(rides));
  render();
}

function editRide(id) {
  const ride = rides.find(r => r.id === id);
  if (!ride) return;

  const newCar = prompt("Vognnummer:", ride.carNumber);
  if (!newCar) return;

  const newStart = prompt("Startstopp:", ride.startStation);
  const newEnd = prompt("Endestopp:", ride.endStation);

  ride.carNumber = newCar;
  ride.startStation = newStart;
  ride.endStation = newEnd;

  localStorage.setItem("rides", JSON.stringify(rides));
  render();
}
/* ================= STATIONS ================= */
function populateStations(line) {
  const stations = metroLines[line];

  startStationEl.innerHTML = "";
  endStationEl.innerHTML = "";

  stations.forEach(station => {
    const opt1 = document.createElement("option");
    opt1.value = station;
    opt1.textContent = station;
    startStationEl.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = station;
    opt2.textContent = station;
    endStationEl.appendChild(opt2);
  });
}

/* ================= UI COLORS ================= */
function updateFormColor() {
  const color = lineColors[lineEl.value];
  const form = document.querySelector(".form");

  form.style.border = `2px solid ${color}`;
  form.style.boxShadow = `
    0 0 10px ${color}55,
    0 4px 20px rgba(0,0,0,0.08)
  `;
}

/* ================= VIEW SYSTEM ================= */
function showView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");

if (viewId === "pokedexView") {
  renderPokedex();
}

if (viewId === "heatmapView") {
  renderHeatmap();
}

/* ================= BUTTONS ================= */
document.getElementById("btnPokedex").addEventListener("click", () => {
  showView("pokedexView");
});

document.getElementById("btnHome").addEventListener("click", () => {
  showView("homeView");
});

/* ================= POKÉDEX ================= */
function buildPokedex() {
  const map = new Map();

  // Opprett alle vogner
  allCars.forEach(car => {
    map.set(String(car), {
      carNumber: String(car),
      seen: false,
      count: 0,
      lastSeen: null,
      lineMinutes: {}
    });
  });

  // Gå gjennom alle registrerte turer
  rides.forEach(r => {
    const car = map.get(String(r.carNumber));

    if (!car) return;

    car.seen = true;
    car.count++;
    car.lastSeen = r.timestamp;

    // Regn ut kjøretid i minutter
    let duration = 0;

    if (r.startTime && r.endTime) {
      duration =
        (new Date(r.endTime) - new Date(r.startTime))
        / 60000;

      // Hindrer negative eller ugyldige verdier
      if (isNaN(duration) || duration < 0) {
        duration = 0;
      }
    }

    // Legg til minutter på riktig linje
    car.lineMinutes[r.line] =
      (car.lineMinutes[r.line] || 0) + duration;
  });

  return Array.from(map.values());
}

function getLineGradient(lineMinutes) {
  const total =
    Object.values(lineMinutes)
      .reduce((sum, mins) => sum + mins, 0);

  if (total === 0) return "#e5e7eb";

  let start = 0;
  const parts = [];

  for (const [line, mins] of Object.entries(lineMinutes)) {
    const percent = (mins / total) * 100;
    const end = start + percent;

    parts.push(
      `${lineColors[line]} ${start}% ${end}%`
    );

    start = end;
  }

  return `linear-gradient(to bottom, ${parts.join(", ")})`;
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) {
    return `${mins} min`;
  }

  return `${hours}t ${mins}m`;
}

function renderPokedex() {
  const cars = buildPokedex();
  pokedexEl.innerHTML = "";

  cars.forEach(car => {
    const div = document.createElement("div");
    div.className = "ride";

if (car.seen) {

  const totalMinutes =
    Object.values(car.lineMinutes)
      .reduce((sum, mins) => sum + mins, 0);

  const gradient =
    getLineGradient(car.lineMinutes);

  div.innerHTML = `
    <div class="line-history-bar"
         style="background:${gradient}">
    </div>

    <strong>🚃 ${car.carNumber}</strong><br/>
    ${formatMinutes(totalMinutes)}
  `;
} else {
  div.className = "ride locked";

  div.innerHTML = `
    🔒 ${car.carNumber}
  `;
}

    div.addEventListener("click", () => {
  openCarDetail(car.carNumber);
});
    
    pokedexEl.appendChild(div);
  });
}

function openCarDetail(carNumber) {

  const carRides =
    rides.filter(r => String(r.carNumber) === String(carNumber));

  modalTitleEl.textContent =
    `🚃 Vogn ${carNumber}`;

  /* ================= LINE STATS ================= */
  const lineMinutes = {};

  carRides.forEach(r => {

    let duration = 0;

    if (r.startTime && r.endTime) {
      duration =
        (new Date(r.endTime) - new Date(r.startTime)) / 60000;

      if (isNaN(duration) || duration < 0) {
        duration = 0;
      }
    }

    lineMinutes[r.line] =
      (lineMinutes[r.line] || 0) + duration;
  });

  let statsHtml =
    `<p><strong>Turer:</strong> ${carRides.length}</p>`;

  statsHtml += `<h3>Kjøretid per linje</h3>`;

Object.entries(lineMinutes).forEach(([line, mins]) => {

  const color = lineColors[line] || "#ccc";

  statsHtml += `
    <div style="
      border-left: 5px solid ${color};
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 10px;
      margin-bottom: 8px;
    ">
      <strong>Linje ${line}</strong><br/>
      ${formatMinutes(mins)}
    </div>
  `;
});

  modalStatsEl.innerHTML = statsHtml;

  /* ================= RIDES LIST ================= */
  modalRidesEl.innerHTML = "";

  carRides
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach(r => {

      const div = document.createElement("div");
      div.className = "ride";

      const color = lineColors[r.line] || "#ccc";

      const startTime = r.startTime?.split("T")[1] || "?";
      const endTime = r.endTime?.split("T")[1] || "?";

      const date = r.timestamp
        ? new Date(r.timestamp).toLocaleDateString("no-NO")
        : "?";

      div.style.borderLeft = `5px solid ${color}`;
      div.style.paddingLeft = "10px";

      div.innerHTML = `
        <strong>Linje ${r.line}</strong><br/>

        🚉 ${r.startStation} → ${r.endStation}<br/>

        ⏰ ${startTime} - ${endTime}<br/>

        📅 ${date}
      `;

      modalRidesEl.appendChild(div);
    });

  modalEl.classList.add("open");
}

function renderHeatmap() {

  const visited = {};

  rides.forEach(r => {

    visited[r.startStation] =
      (visited[r.startStation] || 0) + 1;

    visited[r.endStation] =
      (visited[r.endStation] || 0) + 1;

  });

  const sorted =
    Object.entries(visited)
      .sort((a, b) => b[1] - a[1]);

  heatmapStatsEl.innerHTML = "";

  sorted.forEach(([station, count]) => {

    const div = document.createElement("div");

    div.className = "heatmap-card";

    div.innerHTML = `
      <strong>${station}</strong>
      <span>${count}</span>
    `;

    heatmapStatsEl.appendChild(div);

  });

}
