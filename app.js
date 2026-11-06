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
const carOverviewEl = document.getElementById("carOverview");
const carOverviewIntroEl = document.getElementById("carOverviewIntro");
const toggleCarSortBtn = document.getElementById("btnToggleCarSort");
let carOverviewSortMode = "count";

const modalEl = document.getElementById("carModal");
const modalTitleEl = document.getElementById("modalTitle");
const modalStatsEl = document.getElementById("modalStats");
const modalRidesEl = document.getElementById("modalRides");
const closeModalBtn = document.getElementById("closeModal");

// Redigeringsvindu for en eksisterende tur
const editModalEl = document.getElementById("editRideModal");
const editRideFormEl = document.getElementById("editRideForm");
const editLineEl = document.getElementById("editLine");
const editStartStationEl = document.getElementById("editStartStation");
const editEndStationEl = document.getElementById("editEndStation");
const editDateEl = document.getElementById("editDate");
const editStartTimeEl = document.getElementById("editStartTime");
const editEndTimeEl = document.getElementById("editEndTime");
const editCarNumberEl = document.getElementById("editCarNumber");
const cancelEditBtn = document.getElementById("cancelEditRide");
let editingRideId = null;

const metroMapObj = document.getElementById("metroMap");
const heatmapStatsEl = document.getElementById("heatmapStats");
const stationDetailsEl = document.getElementById("stationDetails");
let selectedHeatmapStation = null;

closeModalBtn.addEventListener("click", () => {
  modalEl.classList.remove("open");
});

cancelEditBtn.addEventListener("click", closeEditRide);
editLineEl.addEventListener("change", () => {
  populateEditStations(editLineEl.value);
});
editRideFormEl.addEventListener("submit", saveEditedRide);

editModalEl.addEventListener("click", event => {
  if (event.target === editModalEl) closeEditRide();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && editModalEl.classList.contains("open")) {
    closeEditRide();
  }
});

document.getElementById("btnCarOverview").addEventListener("click", () => {
  showView("carOverviewView");
});

toggleCarSortBtn.addEventListener("click", () => {
  carOverviewSortMode = carOverviewSortMode === "count" ? "duration" : "count";
  renderCarOverview();
});

document.getElementById("btnHomeFromCarOverview").addEventListener("click", () => {
  showView("homeView");
});

document.getElementById("btnPokedexFromCarOverview").addEventListener("click", () => {
  showView("pokedexView");
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
const carOverviewView = document.getElementById("carOverviewView");

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

  // Bruk lokal kalenderdato, ikke UTC (som kan gi feil dato sent på kvelden).
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

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
  if (!saveRides()) {
    rides.shift();
    return;
  }

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

function saveRides() {
  try {
    // Behold den eksisterende lagringsnøkkelen og datastrukturen.
    localStorage.setItem("rides", JSON.stringify(rides));
    return true;
  } catch (error) {
    console.error("Kunne ikke lagre turene:", error);
    alert("Turene kunne ikke lagres. Sjekk lagringsplassen i nettleseren. Ikke lukk eller oppdater siden før du har eksportert en sikkerhetskopi hvis turene fortsatt vises.");
    return false;
  }
}

function deleteRide(id) {
  const previousRides = rides;
  rides = rides.filter(r => r.id !== id);
  if (!saveRides()) {
    rides = previousRides;
    return;
  }
  render();
}

function editRide(id) {
  const ride = rides.find(r => r.id === id);
  if (!ride) return;

  editingRideId = id;
  editLineEl.value = String(ride.line || "1");
  populateEditStations(editLineEl.value);

  editStartStationEl.value = ride.startStation || "";
  editEndStationEl.value = ride.endStation || "";
  editDateEl.value = (ride.startTime || ride.endTime || "").split("T")[0] || "";
  editStartTimeEl.value = (ride.startTime || "").split("T")[1] || "";
  editEndTimeEl.value = (ride.endTime || "").split("T")[1] || "";
  editCarNumberEl.value = ride.carNumber ?? "";

  editModalEl.classList.add("open");
  editCarNumberEl.focus();
}

function populateEditStations(line) {
  const stations = metroLines[line] || [];
  const previousStart = editStartStationEl.value;
  const previousEnd = editEndStationEl.value;

  editStartStationEl.replaceChildren();
  editEndStationEl.replaceChildren();

  stations.forEach(station => {
    for (const select of [editStartStationEl, editEndStationEl]) {
      const option = document.createElement("option");
      option.value = station;
      option.textContent = station;
      select.appendChild(option);
    }
  });

  if (stations.includes(previousStart)) editStartStationEl.value = previousStart;
  if (stations.includes(previousEnd)) editEndStationEl.value = previousEnd;
}

function closeEditRide() {
  editModalEl.classList.remove("open");
  editRideFormEl.reset();
  editingRideId = null;
}

function saveEditedRide(event) {
  event.preventDefault();
  if (!editingRideId) return;

  const ride = rides.find(r => r.id === editingRideId);
  if (!ride) {
    closeEditRide();
    return;
  }

  const car = editCarNumberEl.value.trim();
  const start = editStartStationEl.value;
  const end = editEndStationEl.value;
  const line = editLineEl.value;
  const date = editDateEl.value;
  const startTime = editStartTimeEl.value;
  const endTime = editEndTimeEl.value;

  if (!car || !start || !end || !date || !startTime || !endTime) {
    alert("Fyll ut alle feltene før du lagrer.");
    return;
  }

  if (start === end) {
    alert("Startstopp og endestopp kan ikke være det samme.");
    return;
  }

  if (!metroLines[line]?.includes(start) || !metroLines[line]?.includes(end)) {
    alert("Velg start- og endestopp som hører til den valgte linjen.");
    return;
  }

  const previous = { ...ride };
  Object.assign(ride, {
    line,
    startStation: start,
    endStation: end,
    carNumber: car,
    startTime: `${date}T${startTime}`,
    endTime: `${date}T${endTime}`
  });

  if (!saveRides()) {
    Object.assign(ride, previous);
    return;
  }

  const shouldRefreshCarDetail = modalEl.classList.contains("open");
  closeEditRide();
  render();

  // If the edit started from a car's Pokédex details, keep that detail view
  // open and refresh it using the ride's possibly updated car number.
  if (shouldRefreshCarDetail) {
    openCarDetail(ride.carNumber);
  }
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

  // Keep the selected line color available to the form's top accent,
  // including where the refreshed stylesheet uses !important.
  form.style.setProperty("--form-line-color", color);
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

if (viewId === "carOverviewView") {
  renderCarOverview();
}

if (viewId === "heatmapView") {
  renderHeatmap();
}
}
/* ================= BUTTONS ================= */
document.getElementById("btnPokedex").addEventListener("click", () => {
  showView("pokedexView");
});

document.getElementById("btnHome").addEventListener("click", () => {
  showView("homeView");
});

document.getElementById("btnCarOverviewFromPokedex").addEventListener("click", () => {
  showView("carOverviewView");
});

/* ================= VOGNSTATISTIKK ================= */
function renderCarOverview() {
  carOverviewEl.replaceChildren();

  const counts = new Map();
  rides.forEach(ride => {
    const carNumber = String(ride.carNumber ?? "").trim();
    if (!carNumber) return;
    const current = counts.get(carNumber) || {
      carNumber,
      count: 0,
      lines: new Set(),
      lineCounts: {},
      lineMinutes: {}
    };
    current.count++;
    if (ride.line != null && String(ride.line).trim()) {
      const line = String(ride.line);
      current.lines.add(line);
      current.lineCounts[line] = (current.lineCounts[line] || 0) + 1;

      let duration = 0;
      if (ride.startTime && ride.endTime) {
        duration = (new Date(ride.endTime) - new Date(ride.startTime)) / 60000;
        if (!Number.isFinite(duration) || duration < 0) duration = 0;
      }
      current.lineMinutes[line] = (current.lineMinutes[line] || 0) + duration;
    }
    counts.set(carNumber, current);
  });

  const cars = Array.from(counts.values()).map(car => ({
    ...car,
    totalMinutes: Object.values(car.lineMinutes).reduce((sum, minutes) => sum + minutes, 0)
  }));

  const metricForCar = car => carOverviewSortMode === "duration" ? car.totalMinutes : car.count;

  const sortedCars = cars.sort((a, b) => {
    const primaryDifference = metricForCar(b) - metricForCar(a);
    return primaryDifference || a.carNumber.localeCompare(b.carNumber, "no", { numeric: true });
  });

  const maxMetric = Math.max(0, ...sortedCars.map(metricForCar));

  carOverviewIntroEl.textContent = carOverviewSortMode === "duration"
    ? "Vognene er sortert etter samlet registrert kjøretid, fra lengst til kortest."
    : "Vognene er sortert etter antall registrerte turer, fra flest til færrest.";
  toggleCarSortBtn.textContent = carOverviewSortMode === "duration"
    ? "🔁 Sorter etter antall turer"
    : "🔁 Sorter etter kjøretid";
  toggleCarSortBtn.setAttribute("aria-label", carOverviewSortMode === "duration"
    ? "Bytt sortering til antall registrerte turer"
    : "Bytt sortering til samlet kjøretid");

  const summary = document.createElement("div");
  summary.className = "car-overview-summary";
  summary.textContent = `${sortedCars.length} ulike vogner · ${rides.length} registrerte turer`;
  carOverviewEl.appendChild(summary);

  if (sortedCars.length === 0) {
    const empty = document.createElement("div");
    empty.className = "car-overview-empty";
    empty.textContent = "Du har ikke registrert noen turer ennå. Når du lagrer turer, vises vognene du har kjørt mest med her.";
    carOverviewEl.appendChild(empty);
    return;
  }

  sortedCars.forEach((car, index) => {
    const card = document.createElement("article");
    card.className = "car-rank-card";

    const rank = document.createElement("div");
    rank.className = "car-rank-number";
    rank.textContent = String(index + 1);

    const details = document.createElement("div");
    details.className = "car-rank-details";

    const title = document.createElement("strong");
    title.textContent = `🚃 Vogn ${car.carNumber}`;

    const totalMinutes = car.totalMinutes;
    const meta = document.createElement("div");
    meta.className = "car-rank-meta";
    meta.textContent = `${formatMinutes(totalMinutes)} total kjøretid · ${car.count} ${car.count === 1 ? "tur" : "turer"}`;

    const track = document.createElement("div");
    track.className = "car-rank-track";
    const isDurationSort = carOverviewSortMode === "duration";
    const lineValues = isDurationSort ? car.lineMinutes : car.lineCounts;
    const lineDescription = Array.from(car.lines)
      .sort((a, b) => a.localeCompare(b, "no", { numeric: true }))
      .map(line => isDurationSort
        ? `linje ${line}: ${formatMinutes(car.lineMinutes[line] || 0)}`
        : `linje ${line}: ${car.lineCounts[line] || 0} ${(car.lineCounts[line] || 0) === 1 ? "tur" : "turer"}`)
      .join(", ");
    track.setAttribute("aria-label", `${isDurationSort ? "Kjøretid" : "Antall turer"} fordelt på linjer: ${lineDescription}`);

    const bar = document.createElement("div");
    bar.className = "car-rank-bar";
    const metric = metricForCar(car);
    bar.style.width = maxMetric > 0 ? `${(metric / maxMetric) * 100}%` : "0%";
    bar.style.background = getLineGradient(lineValues, "to right");
    track.appendChild(bar);

    card.classList.add("car-rank-card-clickable");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Vis detaljer for vogn ${car.carNumber}`);
    card.addEventListener("click", () => openCarDetail(car.carNumber));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCarDetail(car.carNumber);
      }
    });

    details.append(title, meta, track);
    card.append(rank, details);
    carOverviewEl.appendChild(card);
  });
}

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

function getLineGradient(lineMinutes, direction = "to bottom") {
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

  return `linear-gradient(${direction}, ${parts.join(", ")})`;
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
        <div class="ride-actions">
          <button class="edit-btn" type="button" aria-label="Rediger denne turen">✏️ Rediger</button>
        </div>
      `;

      div.querySelector(".edit-btn").addEventListener("click", event => {
        event.stopPropagation();
        editRide(r.id);
      });

      modalRidesEl.appendChild(div);
    });

  modalEl.classList.add("open");
}

// Originalt, interaktivt linjekart inspirert av Ruters skjematiske nettverkskart.
// Koordinatene er skjematiske, ikke geografiske.
const svgNS = "http://www.w3.org/2000/svg";
const mapStations = new Map();
const mapBranches = [
  {line:"1", from:"Frognerseteren", to:"Frøen", start:[80,95], end:[880,570]},
  {line:"2", from:"Østerås", to:"Borgen", start:[80,420], end:[880,620]},
  {line:"3", from:"Kolsås", to:"Borgen", start:[80,790], end:[880,620]},
  {line:"4", from:"Vestli", to:"Blindern", start:[2460,90], end:[880,490]},
  {line:"5", from:"Vestli", to:"Tøyen", start:[2460,90], end:[1500,620]},
  {line:"5", from:"Blindern", to:"Sognsvann", start:[880,490], end:[530,90]},
  {line:"1", from:"Brynseng", to:"Bergkrystallen", start:[1800,680], end:[2460,1060]},
  {line:"2", from:"Hellerud", to:"Ellingsrudåsen", start:[1900,620], end:[2460,420]},
  {line:"3", from:"Hellerud", to:"Mortensrud", start:[1900,620], end:[2460,910]},
  {line:"4", from:"Brynseng", to:"Bergkrystallen", start:[1800,680], end:[2460,1060]}
];
const mapAnchors = {
  "Majorstuen":[960,620],"Nationaltheatret":[1070,620],"Stortinget":[1180,620],
  "Jernbanetorget":[1290,620],"Grønland":[1400,620],"Tøyen":[1510,620],
  "Ensjø":[1620,620],"Helsfyr":[1730,620],"Brynseng":[1840,620],
  "Hellerud":[1950,620],"Borgen":[850,620],"Smestad":[760,620],
  "Frøen":[850,530],"Blindern":[880,450],"Forskningsparken":[950,370],
  "Ullevål Stadion":[1050,310],"Nydalen":[1170,270],"Storo":[1290,240],
  "Sinsen":[1410,230],"Løren":[1530,280],"Økern":[1650,330],
  "Hasle":[1610,450],"Carl Berners Plass":[1530,510],
  "Berg":[950,210],"Tåsen":[870,170],"Østhorn":[790,130],
  "Holstein":[710,110],"Kringsjå":[630,95],"Sognsvann":[550,80],
  "Vestli":[2460,90]
};
function mapRange(line, from, to, a, b) {
  const stations = metroLines[line] || [];
  const i = stations.indexOf(from), k = stations.indexOf(to);
  if (i < 0 || k < 0) return;
  const lo = Math.min(i,k), hi = Math.max(i,k);
  for (let n=lo;n<=hi;n++) {
    const t = (n-i)/(k-i || 1);
    if (!mapStations.has(stations[n])) mapStations.set(stations[n],[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);
  }
}
function buildMapPositions() {
  mapStations.clear();
  Object.entries(mapAnchors).forEach(([name,point])=>mapStations.set(name,point));
  // Fyll ut de ulike grenene mellom kjente forgreningspunkter.
  for (const b of mapBranches) {
    const seq=metroLines[b.line] || [];
    const a=seq.indexOf(b.from), z=seq.indexOf(b.to);
    if(a<0||z<0)continue;
    const points=[];
    for(let i=Math.min(a,z);i<=Math.max(a,z);i++){
      const name=seq[i];
      if(mapAnchors[name])points.push({i,point:mapAnchors[name]});
    }
    if(!points.some(x=>x.i===a))points.push({i:a,point:b.start});
    if(!points.some(x=>x.i===z))points.push({i:z,point:b.end});
    points.sort((x,y)=>x.i-y.i);
    for(let n=0;n<points.length-1;n++){
      const u=points[n],v=points[n+1];
      for(let i=u.i;i<=v.i;i++){
        const t=(i-u.i)/(v.i-u.i||1);
        if(!mapStations.has(seq[i]))mapStations.set(seq[i],[u.point[0]+t*(v.point[0]-u.point[0]),u.point[1]+t*(v.point[1]-u.point[1])]);
      }
    }
  }
  // Alle stasjoner i fellesstrekningen deler nøyaktig samme koordinat.
  for(const line of Object.keys(metroLines)){
    const seq=metroLines[line];
    let previous=-1;
    for(let i=0;i<seq.length;i++){
      if(!mapStations.has(seq[i]))continue;
      if(previous>=0 && i-previous>1){
        const a=mapStations.get(seq[previous]),b=mapStations.get(seq[i]);
        for(let n=previous+1;n<i;n++){
          const t=(n-previous)/(i-previous);
          if(!mapStations.has(seq[n]))mapStations.set(seq[n],[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);
        }
      }
      previous=i;
    }
  }
}
function svgElement(tag,attributes={}) {
  const el=document.createElementNS(svgNS,tag);
  Object.entries(attributes).forEach(([key,value])=>el.setAttribute(key,String(value)));
  return el;
}
function stationCounts() {
  const counts=new Map();
  for(const line of Object.values(metroLines))for(const station of line)
    if(!counts.has(station))counts.set(station,{from:0,to:0});
  rides.forEach(ride=>{
    if(counts.has(ride.startStation))counts.get(ride.startStation).from++;
    if(counts.has(ride.endStation))counts.get(ride.endStation).to++;
  });
  return counts;
}
function showStationDetails(name,counts) {
  selectedHeatmapStation=name;
  const data=counts.get(name)||{from:0,to:0};
  stationDetailsEl.replaceChildren();
  const heading=document.createElement("h3");heading.textContent="🚉 "+name;
  stationDetailsEl.appendChild(heading);
  const grid=document.createElement("div");grid.className="station-stat-grid";
  for(const [label,value] of [["Påstigninger",data.from],["Avstigninger",data.to],["Totalt",data.from+data.to]]){
    const box=document.createElement("div");box.className="station-stat";
    const strong=document.createElement("strong");strong.textContent=value;
    const small=document.createElement("span");small.textContent=label;
    box.append(strong,small);grid.appendChild(box);
  }
  stationDetailsEl.appendChild(grid);
  metroMapObj.querySelectorAll(".map-station").forEach(el=>el.classList.toggle("selected",el.dataset.station===name));
}
function renderHeatmap() {
  buildMapPositions();
  const counts=stationCounts();
  const maxCount=Math.max(1,...Array.from(counts.values(),x=>x.from+x.to));
  const svg=svgElement("svg",{viewBox:"0 0 2570 1190",role:"img","aria-label":"Skjematisk kart over Oslo T-banenett med klikkbare stasjoner"});
  const lineColors={"1":"#029cda","2":"#e95d11","3":"#a964a3","4":"#004896","5":"#39a935"};
  for(const [line,seq] of Object.entries(metroLines)){
    const points=seq.map(name=>mapStations.get(name)).filter(Boolean);
    if(points.length<2)continue;
    svg.appendChild(svgElement("polyline",{points:points.map(p=>p.join(",")).join(" "),fill:"none",stroke:lineColors[line],"stroke-width":9,"stroke-linecap":"round","stroke-linejoin":"round",opacity:0.8}));
  }
  const names=Array.from(mapStations.keys());
  names.forEach((name,index)=>{
    const [x,y]=mapStations.get(name),data=counts.get(name)||{from:0,to:0},total=data.from+data.to;
    const group=svgElement("g",{class:"map-station",tabindex:"0",role:"button","aria-label":name+": "+data.from+" påstigninger, "+data.to+" avstigninger"});
    group.dataset.station=name;
    const hit=svgElement("circle",{cx:x,cy:y,r:22,fill:"transparent"});
    const circle=svgElement("circle",{cx:x,cy:y,r:total?9+Math.min(7,Math.sqrt(total/maxCount)*7):7,fill:total?"#e95d11":"white",stroke:total?"#a34108":"#334155","stroke-width":total?2.5:2.5,opacity:total?0.35+0.65*Math.sqrt(total/maxCount):1});
    const label=svgElement("text",{x:x+12,y:y+(index%2===0?-13:24),class:"map-station-label"});
    label.textContent=name;
    group.append(hit,circle,label);
    const choose=()=>showStationDetails(name,counts);
    group.addEventListener("click",choose);
    group.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}});
    svg.appendChild(group);
  });
  metroMapObj.replaceChildren(svg);
  const visited=Array.from(counts.values()).filter(v=>v.from+v.to>0).length;
  heatmapStatsEl.textContent=visited+" av "+counts.size+" stasjoner brukt som start eller slutt · "+rides.length+" registrerte turer";
  if(selectedHeatmapStation&&counts.has(selectedHeatmapStation))showStationDetails(selectedHeatmapStation,counts);
}
