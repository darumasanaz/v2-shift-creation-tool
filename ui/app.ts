import staff from "../data/staff.json";
import rules from "../data/rules.json";
import demand from "../data/demand.json";
import { assignCore, type Day } from "../logic/assignCore";
import { validate, type Violation } from "../logic/validate";

const monthInput = document.getElementById("monthInput") as HTMLInputElement | null;
const generateButton = document.getElementById("genBtn");
const scheduleContainer = document.getElementById("schedule");
const violationsContainer = document.getElementById("violations");

function renderSchedule(days: Day[]) {
  if (!scheduleContainer) {
    return;
  }

  scheduleContainer.innerHTML = "";

  if (days.length === 0) {
    scheduleContainer.textContent = "結果がありません";
    return;
  }

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  ["date", "slot", "staffIds"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  days.forEach((day) => {
    day.slots.forEach((slot) => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = day.date;
      row.appendChild(dateCell);

      const slotCell = document.createElement("td");
      slotCell.textContent = `${slot.start}\u2013${slot.end}`;
      row.appendChild(slotCell);

      const staffCell = document.createElement("td");
      staffCell.textContent = (slot.staffIds ?? []).join(",");
      row.appendChild(staffCell);

      table.appendChild(row);
    });
  });

  scheduleContainer.appendChild(table);
}

function renderViolations(violations: Violation[]) {
  if (!violationsContainer) {
    return;
  }

  violationsContainer.innerHTML = "";

  if (violations.length === 0) {
    violationsContainer.textContent = "違反はありません";
    return;
  }

  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  ["priority", "id", "date", "slot", "detail"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  violations.forEach((violation) => {
    const row = document.createElement("tr");

    const priorityCell = document.createElement("td");
    priorityCell.textContent = violation.priority;
    row.appendChild(priorityCell);

    const idCell = document.createElement("td");
    idCell.textContent = violation.id;
    row.appendChild(idCell);

    const dateCell = document.createElement("td");
    dateCell.textContent = violation.date;
    row.appendChild(dateCell);

    const slotCell = document.createElement("td");
    if (violation.start || violation.end) {
      const start = violation.start ?? "";
      const end = violation.end ?? "";
      slotCell.textContent = `${start}\u2013${end}`;
    } else {
      slotCell.textContent = "-";
    }
    row.appendChild(slotCell);

    const detailCell = document.createElement("td");
    detailCell.textContent = violation.detail ?? "";
    row.appendChild(detailCell);

    table.appendChild(row);
  });

  violationsContainer.appendChild(table);
}

function handleGenerate() {
  if (!monthInput) {
    return;
  }

  const month = monthInput.value;
  if (!month) {
    renderSchedule([]);
    if (violationsContainer) {
      violationsContainer.textContent = "月を選択してください";
    }
    return;
  }

  try {
    const schedule = assignCore({ staff, rules, demand, month });
    renderSchedule(schedule);
    const { violations } = validate(schedule, rules, staff);
    renderViolations(violations);
  } catch (error) {
    console.error(error);
  }
}

if (generateButton) {
  generateButton.addEventListener("click", handleGenerate);
}
