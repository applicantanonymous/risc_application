// Relational Credit Economy — simple, auditable prototype logic
// (Keeps it transparent and easy to explain on the page.)

const ACTIVITIES = [
  {
    id: "prompted_call",
    title: "Guided call prompt",
    desc: "Simple discussion prompts to help families use their time on the phone more intentionally.",
    points: 10
  },
  {
    id: "coparenting_exercise",
    title: "Co-parenting exercises",
    desc: "A structured way to clarify roles, expectations, and support with a partner or fellow caregiver.",
    points: 15
  },
  {
    id: "shared_journal",
    title: "Shared journaling (async)",
    desc: "Short entries that can be written and read later, allowing connection without needing to coordinate schedules.",
    points: 15
  },
  {
    id: "family_goal",
    title: "Goal-setting!",
    desc: "Choose one small goal to focus on together and decide how to check in on it",
    points: 10
  },
  {
    id: "structured_checkin",
    title: "Checking-in",
    desc: "A brief format to stay updated for all members - what’s happened, what’s ahead, and what support is needed.",
    points: 15
  },
  {
    id: "reflection_module",
    title: "Reflection module",
    desc: "Watch short guided videos/exercises focused on repair, emotional regulation, and navigating conflict.",
    points: 15
  }
  {
  id: "memory_match",
  title: "Memory Match",
  desc: "Take turns recalling a favorite shared memory and why it mattered",
  points: 5
}

{
  id: "word_game",
  title: "Game Time",
  desc: "Play any simple games your family can enjoy over call",
  points: 5
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


