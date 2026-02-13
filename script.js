// Relational Credit Economy — simple, auditable prototype logic
// (Keeps it transparent and easy to explain on the page.)

// Relational Credit Economy — simulator logic

window.addEventListener("DOMContentLoaded", () => {

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
      title: "Goal-setting",
      desc: "Choose one small goal to focus on together and decide how to check in on it.",
      points: 10
    },
    {
      id: "structured_checkin",
      title: "Checking-in",
      desc: "A brief format to stay updated — what’s happened, what’s ahead, and what support is needed.",
      points: 15
    },
    {
      id: "reflection_module",
      title: "Reflection module",
      desc: "Short guided videos/exercises focused on repair, emotional regulation, and navigating conflict.",
      points: 15
    },
    {
      id: "memory_match",
      title: "Memory Match",
      desc: "Take turns recalling a favorite shared memory and why it mattered.",
      points: 5
    },
    {
      id: "word_game",
      title: "Game Time",
      desc: "Play simple games your family can enjoy over a call.",
      points: 5
    }
  ];

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

  // HARD FAIL if HTML is wrong
  const missing = Object.entries(els)
    .filter(([_, el]) => !el)
    .map(([key]) => key);

  if (missing.length) {
    console.error("Simulator missing required HTML IDs:", missing);
    return;
  }

  function renderActivities() {
    els.activityList.innerHTML = "";

    ACTIVITIES.forEach(a => {
      const row = document.createElement("label");
      row.className = "item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.points = a.points;

      checkbox.addEventListener("change", updateSimulator);

      const meta = document.createElement("div");
      meta.className = "item__meta";

      meta.innerHTML = `
        <div class="item__title">${a.title}</div>
        <div class="item__desc">${a.desc}</div>
        <div class="item__pts">${a.points} credits</div>
      `;

      row.appendChild(checkbox);
      row.appendChild(meta);

      els.activityList.appendChild(row);
    });
  }

  function getTotalCredits() {
    const inputs = els.activityList.querySelectorAll("input:checked");

    let total = 0;

    inputs.forEach(i => {
      total += Number(i.dataset.points);
    });

    return total;
  }

  function updateSimulator() {
    const total = getTotalCredits();

    els.totalCredits.textContent = total;

    const unlocked = UNLOCKS.filter(u => total >= u.at);

    els.unlocksList.innerHTML = unlocked.length
      ? unlocked.map(u => `<li>${u.label}</li>`).join("")
      : `<li class="muted">None yet.</li>`;

    const next = UNLOCKS.find(u => total < u.at);

    if (!next) {
      els.progressFill.style.width = "100%";
      els.progressText.textContent =
        "Max tier reached — all prototype unlocks available.";
      return;
    }

    const prev = unlocked.length ? unlocked[unlocked.length - 1].at : 0;

    const pct = ((total - prev) / (next.at - prev)) * 100;

    els.progressFill.style.width = `${Math.max(0, pct)}%`;

    els.progressText.textContent =
      `Next unlock at ${next.at} credits. (${total}/${next.at})`;
  }

  function reset() {
    els.activityList
      .querySelectorAll("input")
      .forEach(i => (i.checked = false));

    updateSimulator();
  }

  function loadExample() {
    const boxes = els.activityList.querySelectorAll("input");

    boxes.forEach((box, i) => {
      if (i < 4) box.checked = true;
    });

    updateSimulator();
  }

  els.resetAll.addEventListener("click", reset);
  els.loadExample.addEventListener("click", loadExample);

  renderActivities();
  updateSimulator();
});

