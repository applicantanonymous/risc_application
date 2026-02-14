// Relational Credit Economy — simulator + scale calculator
// Safe to run even if some sections are missing on the page.

window.addEventListener("DOMContentLoaded", () => {

  /* =========================
     SIMULATOR
  ========================= */

  const ACTIVITIES = [
    {
      id: "prompted_call",
      title: "Guided call prompt",
      desc: "Simple discussion prompts to help families use their time on the phone more intentionally.",
      points: 10
    },
    {
      id: "shared_journal",
      title: "Shared journaling (async)",
      desc: "Short entries that can be written and read later, allowing connection without needing to coordinate schedules.",
      points: 15
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
    { at: 15, label: "Unlock: + 10 call minutes/week" },
    { at: 30, label: "Unlock: extended messaging access" },
    { at: 45, label: "Unlock: +1 video visit/month (where available)" },
    { at: 60, label: "Unlock: greater scheduling flexibility" }
  ];

  const sim = {
    activityList: document.getElementById("activityList"),
    totalCredits: document.getElementById("totalCredits"),
    progressFill: document.getElementById("progressFill"),
    progressText: document.getElementById("progressText"),
    unlocksList: document.getElementById("unlocksList"),
    loadExample: document.getElementById("loadExample"),
    resetAll: document.getElementById("resetAll")
  };

  const hasSimulator =
    sim.activityList &&
    sim.totalCredits &&
    sim.progressFill &&
    sim.progressText &&
    sim.unlocksList &&
    sim.loadExample &&
    sim.resetAll;

  function renderActivities() {
    sim.activityList.innerHTML = "";

    ACTIVITIES.forEach(a => {
      const row = document.createElement("label");
      row.className = "activityRow";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "activityRow__check";
      checkbox.dataset.points = String(a.points);
      checkbox.addEventListener("change", updateSimulator);

      const body = document.createElement("div");
      body.className = "activityRow__body";
      body.innerHTML = `
        <div class="activityRow__top">
          <div class="activityRow__title">${a.title}</div>
          <div class="activityRow__pts">${a.points} pts</div>
        </div>
        <div class="activityRow__desc">${a.desc}</div>
      `;

      row.appendChild(checkbox);
      row.appendChild(body);
      sim.activityList.appendChild(row);
    });
  }

  function getTotalCredits() {
    const inputs = sim.activityList.querySelectorAll("input:checked");
    let total = 0;
    inputs.forEach(i => (total += Number(i.dataset.points || 0)));
    return total;
  }

  function updateSimulator() {
    const total = getTotalCredits();
    sim.totalCredits.textContent = String(total);

    const unlocked = UNLOCKS.filter(u => total >= u.at);

    sim.unlocksList.innerHTML = unlocked.length
      ? unlocked.map(u => `<li>${u.label}</li>`).join("")
      : `<li class="muted">None yet.</li>`;

    const next = UNLOCKS.find(u => total < u.at);

    if (!next) {
      sim.progressFill.style.width = "100%";
      sim.progressText.textContent =
        "Max tier reached — all prototype unlocks available.";
      return;
    }

    const prev = unlocked.length ? unlocked[unlocked.length - 1].at : 0;
    const pct = ((total - prev) / (next.at - prev)) * 100;

    sim.progressFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    sim.progressText.textContent =
      `Next unlock at ${next.at} credits. (${total}/${next.at})`;
  }

  function resetSimulator() {
    sim.activityList.querySelectorAll("input").forEach(i => (i.checked = false));
    updateSimulator();
  }

  function loadSimulatorExample() {
    const boxes = sim.activityList.querySelectorAll("input");
    boxes.forEach((box, i) => { box.checked = i < 4; });
    updateSimulator();
  }

  if (hasSimulator) {
    sim.resetAll.addEventListener("click", resetSimulator);
    sim.loadExample.addEventListener("click", loadSimulatorExample);
    renderActivities();
    updateSimulator();
  }


  /* =========================
     SCALE CALCULATOR
  ========================= */

  const fmt = (n) => Math.round(n).toLocaleString();

  const scale = {
    parentsPerCohort: document.getElementById("parentsPerCohort"),
    cohortsPerYear: document.getElementById("cohortsPerYear"),
    familyPerParent: document.getElementById("familyPerParent"),
    parentsServed: document.getElementById("parentsServed"),
    familyReached: document.getElementById("familyReached"),
    totalTouched: document.getElementById("totalTouched")
  };

  const hasScale =
    scale.parentsPerCohort &&
    scale.cohortsPerYear &&
    scale.familyPerParent &&
    scale.parentsServed &&
    scale.familyReached &&
    scale.totalTouched;

  function recomputeScale() {
    const parentsPerCohort = Number(scale.parentsPerCohort.value || 0);
    const cohortsPerYear   = Number(scale.cohortsPerYear.value || 0);
    const familyPerParent  = Number(scale.familyPerParent.value || 0);

    const parentsServed = parentsPerCohort * cohortsPerYear;
    const familyReached = parentsServed * familyPerParent;
    const totalTouched  = parentsServed + familyReached;

    scale.parentsServed.textContent = fmt(parentsServed);
    scale.familyReached.textContent = fmt(familyReached);
    scale.totalTouched.textContent  = fmt(totalTouched);
  }

  if (hasScale) {
    ["parentsPerCohort", "cohortsPerYear", "familyPerParent"].forEach(key => {
      scale[key].addEventListener("input", recomputeScale);
    });
    recomputeScale();
  }

});

