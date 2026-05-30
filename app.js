import { metroLines } from "./lines.js";

const lineEl = document.getElementById("line");
const startStationEl = document.getElementById("startStation");
const endStationEl = document.getElementById("endStation");
const directionEl = document.getElementById("direction");
const carNumberEl = document.getElementById("carNumber");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const totalRidesEl = document.getElementById("totalRides");
const uniqueCarsEl = document.getElementById("uniqueCars");

let rides = JSON.parse(localStorage.getItem("rides")) || [];

lineEl.addEventListener("change", () => {
  const stations = metroLines[lineEl.value];
  console.log(stations);
});
// render ved start
render();

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
  <small>${new Date(r.timestamp).toLocaleString("no-NO")}</small>
`;

    listEl.appendChild(div);
  });
}
