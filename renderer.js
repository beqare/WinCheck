const checkBtn = document.getElementById("checkBtn");
const updatesTable = document.getElementById("updatesTable");
const tbody = updatesTable.querySelector("tbody");

function parseWingetOutput(output) {
  /*
    winget upgrade Ausgabe sieht so aus:

    Name                        Id                           Version        Available      Source
    -------------------------------------------------------------------------------------------
    7-Zip 21.07 (x64)           7zip.7zip                    21.07          22.01         winget

    Wir parsen Zeilen nach Spalten (Name, Id, Version, Available)
  */

  const lines = output.trim().split("\n");
  // Erste zwei Zeilen sind header, dann Daten
  if (lines.length < 3) return [];

  // Ab Zeile 3 starten die Daten
  const dataLines = lines.slice(2);

  const updates = dataLines.map((line) => {
    // Trennungen sind mit vielen Leerzeichen, splitte mit Regex
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

  // Update-Button Events
  document.querySelectorAll(".update-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      btn.disabled = true;
      btn.textContent = "Installing";

      // Spinner erstellen und an Button anhängen
      const spinner = document.createElement("span");
      spinner.classList.add("spinner");
      btn.appendChild(spinner);

      const success = await window.api.installUpdate(id);

      // Spinner entfernen
      btn.removeChild(spinner);

      if (success) {
        btn.textContent = "Done";
        btn.style.backgroundColor = "#28a745"; // grün
      } else {
        btn.textContent = "Error";
        btn.disabled = false;
        btn.style.backgroundColor = "#dc3545"; // rot
      }
    });
  });
}

checkBtn.addEventListener("click", checkUpdates);
