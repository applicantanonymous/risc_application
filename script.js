
(() => {
  "use strict";

  // ---------- Simulator config ----------
  const ACTIVITIES = [
    { id: "guided_prompts", name: "Guided conversation prompts", credits: 10, desc: "Short prompts for 10–15 minute calls to sustain continuity." },
    { id: "coparenting", name: "Co-parenting exercise", credits: 15, desc: "Shared planning routines (school, schedules, boundaries) with a caregiver." },
    { id: "journaling", name: "Shared journaling", credits: 12, desc: "Asynchronous entries that build continuity between contacts." },
    { id: "goal_setting", name: "Family goal-setting", credits: 10, desc: "Agree on one small weekly goal and a realistic plan." },
    { id: "structured_checkin", name: "Structured check-in", credits: 8, desc: "Repair-focused: what went well, what was hard, one request for next time." },
    { id: "reflection", name: "Reflection module", credits: 10, desc: "Short content + reflection questions (practice + repetition)." }
  ];

  const UNLOCKS = [
    { threshold: 20, label: "Additional call minutes (+10 min/week)" },
    { threshold: 40, label: "Extended messaging access (+1 day/week)" },
    { threshold: 60, label: "Video visitation privilege (+1/month)" },
    { threshold: 80, label: "Scheduling flexibility (priority slot request)" }
  ];

  // ---------- DOM helpers ----------
  const $ = (sel) => document.querySelector(sel);

  const elActivities = $("#activities");
  const elTotal = $("#totalCredits");
  const elUnlocks = $("#unlocksList");
  const elMeter = $("#meterFill");
  const elNextNote = $("#nextUnlockNote");
  const btnLoad = $("#loadExample");
  const btnReset = $("#reset");

  // If the simulator isn't on the page for some reason, fail quietly
  const simulatorReady = [elActivities, elTotal, elUnlocks, elMeter, elNextNote, btnLoad, btnReset].every(Boolean);

  const state = { selected: new Set() };

  function computeTotal() {
    let total = 0;
    for (const id of state.selected) {
      const a = ACTIVITIES.find((x) => x.id === id);
      if (a) total += a.credits;
    }
    return total;
  }

  function getUnlocked(total) {
    return UNLOCKS.filter((u) => total >= u.threshold);
  }

  function getNextUnlock(total) {
    return UNLOCKS.find((u) => total < u.threshold) || null;
  }

  function renderActivities() {
    if (!simulatorReady) return;
    elActivities.innerHTML = "";

    ACTIVITIES.forEach((a) => {
      const row = document.createElement("div");
      row.className = "activity";

      const left = document.createElement("div");
      left.className = "activity-left";

      const title = document.createElement("div");
      title.className = "activity-name";
      title.textContent = a.name;

      const desc = document.createElement("div");
      desc.className = "activity-desc";
      desc.textContent = a.desc;

      left.appendChild(title);
      left.appendChild(desc);

      const right = document.createElement("div");
      right.className = "activity-right";

      const credit = document.createElement("div");
      credit.className = "activity-credits";
      credit.textContent = `${a.credits} credits`;

      const selected = state.selected.has(a.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn ${selected ? "danger" : ""}`;
      btn.textContent = selected ? "Remove" : "Add";
      btn.setAttribute("aria-pressed", String(selected));

      btn.addEventListener("click", () => {
        if (state.selected.has(a.id)) state.selected.delete(a.id);
        else state.selected.add(a.id);
        renderActivities();
        updateOutputs();
      });

      right.appendChild(credit);
      right.appendChild(btn);

      row.appendChild(left);
      row.appendChild(right);

      elActivities.appendChild(row);
    });
  }

  function updateOutputs() {
    if (!simulatorReady) return;

    const total = computeTotal();
    elTotal.textContent = String(total);

    const unlocked = getUnlocked(total);
    elUnlocks.innerHTML = "";

    if (unlocked.length === 0) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = "None yet.";
      elUnlocks.appendChild(li);
    } else {
      unlocked.forEach((u) => {
        const li = document.createElement("li");
        li.textContent = `${u.threshold}+: ${u.label}`;
        elUnlocks.appendChild(li);
      });
    }

    const next = getNextUnlock(total);
    if (!next) {
      elMeter.style.width = "100%";
      elNextNote.textContent = "All prototype privileges unlocked. (In practice, add more tiers or rotate benefits.)";
      return;
    }

    const prev = unlocked.length ? unlocked[unlocked.length - 1].threshold : 0;
    const span = next.threshold - prev;
    const progress = span === 0 ? 1 : (total - prev) / span;
    const pct = Math.max(0, Math.min(1, progress)) * 100;

    elMeter.style.width = `${pct}%`;
    elNextNote.textContent = `Next unlock at ${next.threshold} credits: ${next.label} (need ${next.threshold - total} more).`;
  }

  function reset() {
    state.selected.clear();
    renderActivities();
    updateOutputs();
  }

  function loadExample() {
    state.selected.clear();
    // Example bundle = 40 credits (unlocks first 2 tiers)
    ["guided_prompts", "journaling", "structured_checkin", "goal_setting"].forEach((id) => state.selected.add(id));
    renderActivities();
    updateOutputs();
  }

  if (simulatorReady) {
    btnReset.addEventListener("click", reset);
    btnLoad.addEventListener("click", loadExample);
    renderActivities();
    updateOutputs();
  }

  // ---------- Scrollspy (nav highlight) ----------
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav a"))
      .filter((a) => (a.getAttribute("href") || "").startsWith("#"));

    if (!links.length) return;

    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRati
