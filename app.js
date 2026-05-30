const lineEl = document.getElementById("line");
const directionEl = document.getElementById("direction");
const trainSetEl = document.getElementById("trainSet");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");

let rides = JSON.parse(localStorage.getItem("rides")) || [];

// render ved start
render();

addBtn.addEventListener("click", () => {
  const ride = {
    id: crypto.randomUUID(),
    line: lineEl.value,
    direction: directionEl.value,
    trainSet: trainSetEl.value,
    timestamp: Date.now()
  };

  rides.unshift(ride);
  localStorage.setItem("rides", JSON.stringify(rides));

  render();

  // reset input
  directionEl.value = "";
  trainSetEl.value = "";
});

function render() {
  listEl.innerHTML = "";

  rides.forEach(r => {
    const div = document.createElement("div");
    div.className = "ride";

    div.innerHTML = `
      <strong>Linje ${r.line}</strong><br/>
      ${r.direction} <br/>
      ${r.trainSet} <br/>
      <small>${new Date(r.timestamp).toLocaleString()}</small>
    `;

    listEl.appendChild(div);
  });
}
