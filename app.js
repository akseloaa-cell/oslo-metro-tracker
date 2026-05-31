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
  if (!carNumberEl.value) {
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

  totalRidesEl.textContent = rides.length;

  const uniqueCars = new Set(rides.map(r => r.carNumber));
  uniqueCarsEl.textContent = uniqueCars.size;

  rides.forEach(r => {
    const div = document.createElement("div");
    div.className = "ride";

    const color = lineColors[r.line];
    div.style.borderLeft = `6px solid ${color}`;
    div.style.paddingLeft = "10px";

div.innerHTML = `
  <strong>Linje ${r.line}</strong><br/>
  ${r.startStation} (${r.startTime?.split("T")[1] || "?"})
  → ${r.endStation} (${r.endTime?.split("T")[1] || "?"})<br/>
  Vogn ${r.carNumber}<br/>
  <small>${new Date(r.timestamp).toLocaleString("no-NO")}</small>

  <div class="ride-actions">
    <button class="edit-btn">✏️</button>
    <button class="delete-btn">🗑️</button>
  </div>
`;

    div.querySelector(".delete-btn").addEventListener("click", () => {
  deleteRide(r.id);
});

div.querySelector(".edit-btn").addEventListener("click", () => {
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

  if (viewId === "pokedexView") renderPokedex();
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

  allCars.forEach(car => {
    map.set(car, {
      carNumber: car,
      seen: false,
      count: 0,
      lastSeen: null,
      line: null
    });
  });

  rides.forEach(r => {
    const car = map.get(r.carNumber);
    if (!car) return;

    car.seen = true;
    car.count++;
    car.lastSeen = r.timestamp;
    car.line = r.line;
  });

  return Array.from(map.values());
}

function renderPokedex() {
  const cars = buildPokedex();
  pokedexEl.innerHTML = "";

  cars.forEach(car => {
    const div = document.createElement("div");
    div.className = "ride";

    if (car.seen) {
div.style.borderLeft = "6px solid #e5e7eb";
div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";

      div.innerHTML = `
        <strong>🚃 ${car.carNumber}</strong><br/>
        Sett: ${car.count}<br/>
        Sist sett: ${car.lastSeen ? new Date(car.lastSeen).toLocaleString("no-NO") : "-"}
      `;
    } else {
      div.style.opacity = "0.35";
      div.innerHTML = `
        🔒 ${car.carNumber}<br/>
        Ikke oppdaget
      `;
    }

    pokedexEl.appendChild(div);
  });
}
