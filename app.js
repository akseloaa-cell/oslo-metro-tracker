const lineEl = document.getElementById("line");
const directionEl = document.getElementById("direction");
const carNumberEl = document.getElementById("carNumber");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");

let rides = JSON.parse(localStorage.getItem("rides")) || [];

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
  direction: directionEl.value,
  carNumber: carNumberEl.value,
  timestamp: Date.now()
};

  rides.unshift(ride);
  localStorage.setItem("rides", JSON.stringify(rides));

  render();

  // reset input
  directionEl.value = "";
carNumberEl.value = "";
});

function render() {
  listEl.innerHTML = "";

  rides.forEach(r => {
    const div = document.createElement("div");
    div.className = "ride";

    div.innerHTML = `
  <strong>Linje ${r.line}</strong><br/>
  ${r.direction}<br/>
  Vogn ${r.carNumber}<br/>
  <small>${new Date(r.timestamp).toLocaleString("no-NO")}</small>
`;

    listEl.appendChild(div);
  });
}
