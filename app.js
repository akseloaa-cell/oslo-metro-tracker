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
const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const startDateTime = `${today}T${startTimeEl.value}`;
const endDateTime = `${today}T${endTimeEl.value}`;
const lineColors = {
  "1": "#029cda",
  "2": "#e95d11",
  "3": "#a964a3",
  "4": "#004896",
  "5": "#39a935"
};

let rides = JSON.parse(localStorage.getItem("rides")) || [];

lineEl.addEventListener("change", () => {
  populateStations(lineEl.value);
  updateFormColor();
});

// render ved start
render();
populateStations(lineEl.value);
updateFormColor();

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
  startTime: startDateTime,
  endTime: endDateTime,
  timestamp: Date.now()
};

  rides.unshift(ride);
  localStorage.setItem("rides", JSON.stringify(rides));

  render();

  // reset input
startStationEl.value = "";
endStationEl.value = "";
carNumberEl.value = "";
startTimeEl.value = "";
endTimeEl.value = "";
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

    const color = lineColors[r.line];
div.style.borderLeft = `6px solid ${color}`;
div.style.paddingLeft = "10px";
    
div.innerHTML = `
  <strong>Linje ${r.line}</strong><br/>
  ${r.startStation} (${r.startTime?.split("T")[1] || "?"})
  → 
  ${r.endStation} (${r.endTime?.split("T")[1] || "?"})<br/>
  Vogn ${r.carNumber}<br/>
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

function updateFormColor() {
  const color = lineColors[lineEl.value];

  const form = document.querySelector(".form");

  form.style.border = `2px solid ${color}`;
  form.style.boxShadow = `
  0 0 10px ${color}55,
  0 4px 20px rgba(0,0,0,0.08)
`;
}
