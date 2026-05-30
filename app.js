import { metroLines } from "./lines.js";

const lineEl = document.getElementById("line");
const startStationEl = document.getElementById("startStation");
const endStationEl = document.getElementById("endStation");
const startTimeEl = document.getElementById("startTime");
const endTimeEl = document.getElementById("endTime");
const directionEl = document.getElementById("direction");
const carNumberEl = document.getElementById("carNumber");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const totalRidesEl = document.getElementById("totalRides");
const uniqueCarsEl = document.getElementById("uniqueCars");

let rides = JSON.parse(localStorage.getItem("rides")) || [];

lineEl.addEventListener("change", () => {
  populateStations(lineEl.value);
});
// render ved start
render();
populateStations(lineEl.value);

addBtn.addEventListener("click", () => {
  if (!carNumberEl.value) {
  alert("Skriv inn et vognnummer.");
  return;
}
const ride = {
  id: crypto.randomUUID(),
  line: lineEl.value,
  startStation: startStationEl.value,
  endStation: endStationEl.value,
  carNumber: carNumberEl.value,
  startTime: startTimeEl.value,
  endTime: endTimeEl.value,
  timestamp: Date.now()
};

  rides.unshift(ride);
  localStorage.setItem("rides", JSON.stringify(rides));

  render();

  // reset input
startStationEl.value = "";
endStationEl.value = "";
carNumberEl.value = "";
});

function render() {
  listEl.innerHTML = "";

  totalRidesEl.textContent = rides.length;

  const uniqueCars = new Set(
    rides.map(r => r.carNumber)
  );

  uniqueCarsEl.textContent = uniqueCars.size;

  rides.forEach(r => {
    const div = document.createElement("div");
    div.className = "ride";

div.innerHTML = `
  <strong>Linje ${r.line}</strong><br/>
  ${r.startStation} → ${r.endStation}<br/>
  Vogn ${r.carNumber}<br/>
  Start: ${r.startTime || "ikke satt"}<br/>
  Slutt: ${r.endTime || "ikke satt"}<br/>
  <small>${new Date(r.timestamp).toLocaleString("no-NO")}</small>
`;

    listEl.appendChild(div);
  });
}

function populateStations(line) {
  const stations = metroLines[line];

  startStationEl.innerHTML = "";
  endStationEl.innerHTML = "";

  stations.forEach(station => {
    const option1 = document.createElement("option");
    option1.value = station;
    option1.textContent = station;
    startStationEl.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = station;
    option2.textContent = station;
    endStationEl.appendChild(option2);
  });
}
