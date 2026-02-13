// Relational Credit Economy — simple, auditable prototype logic
// (Keeps it transparent and easy to explain on the page.)

const ACTIVITIES = [
  {
    id: "prompted_call",
    title: "Guided call prompt",
    desc: "Short-call friendly prompt to reduce misunderstandings and push toward repair.",
    points: 8
  },
  {
    id: "coparenting_exercise",
    title: "Co-parenting exercise",
    desc: "Clarify roles + expectations with a caregiver (structured, not freeform).",
    points: 12
  },
  {
    id: "shared_journal",
    title: "Shared journaling (async)",
    desc: "Asynchronous entries that can be read later (low bandwidth).",
    points: 10
  },
  {
    id: "family_goal",
    title: "Family goal-setting",
    desc: "Define one small weekly goal + check-in plan.",
    points: 9
  },
  {
    id: "structured_checkin",
    title: "Structured check-in",
    desc: "A brief check-in format for continuity (what happened, what’s next, what I need).",
    points: 7
  },
  {
    id: "reflection_module",
    title: "Reflection module",
    desc: "Short module focused on repair, regulation, or conflict de-escalation.",
    points: 6
  }
];

// Thresholds are intentionally simple for a demo:
const UNLOCKS = [
  { at: 15, label: "Unlock: +5 call minutes/week" },
  { at: 30, label: "Unlock: extended messaging access" },
  { at: 45, label: "Unlock: +1 video visit/month (where available)" },
  { at: 60, label: "Unlock: greater scheduling flexibility" }
];

const els = {
  activityList: document.getElementById("activityList"),
  totalCredits: document.getElementById("totalCredits"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  unlocksList: document.getElementById("unlocksList"),
  loadExample: document.getElementById("loadExample"),
  resetAll: document.getElementById("resetAll")
};

function renderActivities() {
  els.activityList.innerHTML = "";

  ACTIVITIES.forEach(a => {
    const row = document.createElement("label");
    row.className = "item";
    row.setAttribute("for", a.id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = a.id;
    checkbox.dataset.points = String(a.points);
    checkbox.addEventListener("change", updateSimulator);

    const meta = document.createElement("div");
    meta.className = "item__meta";

    const title = document.createElement("div");
    title.className = "item__title";
    title.textContent = a.title;

    const desc = document.createElement("div");
    desc.className = "item__desc";
    desc.textContent = a.desc;

    const pts = document.createElement("div");
    pts.className = "item__pts";
    pts.textContent = `${a.points} credits`;

    meta.appendChild(title);
    meta.appendChild(desc);
    meta.appendChild(pts);

    row.appendChild(checkbox);
    row.appendChild(meta);

    els.activityList.appendChild(row);
  });
}

function getTotalCredits() {
  const inputs = els.activityList.querySelectorAll("input[type='checkbox']");
  let total = 0;
  inputs.forEach(i => {
    if (i.checked) total += Number(i.dataset.points || 0);
  });
  return total;
}

function getUnlocked(total) {
  return UNLOCKS.filter(u => total >= u.at);
}

function nextThreshold(total) {
  for (const u of UNLOCKS) {
    if (total < u.at) return u.at;
  }
  return null; // maxed out
}

function updateSimulator() {
  const total = getTotalCredits();
  els.totalCredits.textContent = String(total);

  const unlocked = getUnlocked(total);

  // Unlock list
  els.unlocksList.innerHTML = "";
  if (unlocked.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "None yet.";
    els.unlocksList.appendChild(li);
  } else {
    unlocked.forEach(u => {
      const li = document.createElement("li");
      li.textContent = u.label;
      els.unlocksList.appendChild(li);
    });
  }

  // Progress bar
  const next = nextThreshold(total);
  if (next === null) {
    els.progressFill.style.width = "100%";
    els.progressText.textContent = "Max tier reached — all prototype unlocks available.";
    return;
  }

  const prev = unlocked.length === 0 ? 0 : unlocked[unlocked.length - 1].at;
  const span = next - prev;
  const into = total - prev;
  const pct = Math.max(0, Math.min(100, (into / span) * 100));

  els.progressFill.style.width = `${pct}%`;
  els.progressText.textContent = `Next unlock at ${next} credits. (${into}/${span} in this tier)`;
}

function setChecks(ids) {
  const inputs = els.activityList.querySelectorAll("input[type='checkbox']");
  inputs.forEach(i => {
    i.checked = ids.includes(i.id);
  });
  updateSimulator();
}

function reset() {
  setChecks([]);
}

function loadExample() {
  // Example is intentionally plausible + not “maxed out”
  setChecks(["prompted_call", "structured_checkin", "shared_journal", "family_goal"]);
}

renderActivities();
updateSimulator();

els.resetAll?.addEventListener("click", reset);
els.loadExample?.addEventListener("click", loadExample);

