const checkBtn = document.getElementById("checkBtn");
const updatesTable = document.getElementById("updatesTable");
const tbody = updatesTable.querySelector("tbody");

function parseWingetOutput(output) {
  const lines = output.trim().split("\n");
  if (lines.length < 3) return [];

  const dataLines = lines.slice(2);

  const updates = dataLines.map((line) => {
    const cols = line.trim().split(/\s{2,}/);
    return {
      name: cols[0],
      id: cols[1],
      currentVersion: cols[2],
      availableVersion: cols[3],
    };
  });

  return updates;
}

async function checkUpdates() {
  checkBtn.disabled = true;
  checkBtn.textContent = "Checking...";

  const output = await window.api.checkUpdates();
  const updates = parseWingetOutput(output);

  tbody.innerHTML = "";
  if (updates.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Keine Updates verfügbar</td></tr>';
  } else {
    for (const upd of updates) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${upd.name}</td>
        <td>${upd.currentVersion} → ${upd.availableVersion}</td>
        <td><button class="update-btn" data-id="${upd.id}">Update</button></td>
      `;
      tbody.appendChild(tr);
    }
  }

  updatesTable.hidden = false;
  checkBtn.disabled = false;
  checkBtn.textContent = "Check for Updates";

  document.querySelectorAll(".update-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      btn.disabled = true;
      btn.textContent = "Installing";

      const spinner = document.createElement("span");
      spinner.classList.add("spinner");
      btn.appendChild(spinner);

      const success = await window.api.installUpdate(id);

      btn.removeChild(spinner);

      if (success) {
        btn.textContent = "Done";
        btn.style.backgroundColor = "#55bd6dff";
      } else {
        btn.textContent = "Error";
        btn.disabled = false;
        btn.style.backgroundColor = "#df6672ff";
      }
    });
  });
}

checkBtn.addEventListener("click", checkUpdates);
