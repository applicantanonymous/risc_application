
(() => {
  "use strict";

  // ---- Config ----
  const ACTIVITIES = [
    {
      id: "guided_prompts",
      name: "Guided conversation prompts",
      credits: 10,
      desc: "Short prompts for 10–15 minute calls to sustain conversation."
    },
    {
      id: "coparenting",
      name: "Co-parenting exercise",
      credits: 15,
      desc: "Shared planning routines with a fellow partner/ caregiver."
    },
    {
      id: "journaling",
      name: "Shared journaling",
      credits: 12,
      desc: "Asynchronous entries that build continuity between contacts."
    },
    {
      id: "goal_setting",
      name: "Family Games",
      credits: 10,
      desc: "Play games together during visits or calls to foster connection and create shared memories."
    },
    {
      id: "structured_checkin",
      name: "Structured check-in",
      credits: 8,
      desc: "Repair-focused: what went well, what was hard, one request for next time."
    },
    {
      id: "reflection",
      name: "Reflection module",
      credits: 10,
      desc: "Watch a short clip and answer reflection questions."
    }
  ];

  // Thresholds → Privileges (prototype tiers)
  const UNLOCKS = [
    { threshold: 20, label: "Additional call minutes (+10 min/week)" },
    { threshold: 40, label: "Extended messaging access (+1 day/week)" },
    { threshold: 60, label: "Video visitation privilege (+1/month)" },
    { threshold: 80, label: "Scheduling flexibility (priority slot request)" }
  ];

  // ---- DOM ----
  const $ = (sel) => document.querySelector(sel);

  const elActivities = $("#activities");
  const elTotal = $("#totalCredits");
  const elUnlocks = $("#unlocksList");
  const elMeter = $("#meterFill");
  const elNextNote = $("#nextUnlockNote");

  const btnLoad = $("#loadExample");
  const btnReset = $("#reset");

  // Defensive checks (so file can fail gracefully)
  const required = [elActivities, elTotal, elUnlocks, elMeter, elNextNote, btnLoad, btnReset];
  if (required.some((x) => !x)) {
    // eslint-disable-next-line no-console
    console.warn("script.js: Missing expected DOM nodes. Check index.html IDs.");
    return;
  }

  // ---- State ----
  const state = {
    selected: new Set()
  };

  // ---- Helpers ----
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

  function setText(node, text) {
    node.textContent = text;
  }

  function clear(node) {
    node.innerHTML = "";
  }

  // Small UX: highlight nav as you scroll (optional)
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav a"))
      .filter((a) => a.getAttribute("href")?.startsWith("#"));

    if (!links.length) return;

    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((a) => {
            const active = a.getAttribute("href") === id;
            a.classList.toggle("active", active);
          });
        });
      },
      { root: null, threshold: 0.25 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // ---- Rendering ----
  function renderActivities() {
    clear(elActivities);

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
    const total = computeTotal();
    setText(elTotal, String(total));

    // Unlocked list
    const unlocked = getUnlocked(total);
    clear(elUnlocks);

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

    // Progress toward next unlock
    const next = getNextUnlock(total);

    if (!next) {
      elMeter.style.width = "100%";
      setText(
        elNextNote,
        "All prototype privileges unlocked. (In practice, add additional tiers or rotate benefits.)"
      );
      return;
    }

    const prev = unlocked.length ? unlocked[unlocked.length - 1].threshold : 0;
    const span = next.threshold - prev;
    const progress = span === 0 ? 1 : (total - prev) / span;
    const pct = Math.max(0, Math.min(1, progress)) * 100;

    elMeter.style.width = `${pct}%`;
    setText(
      elNextNote,
      `Next unlock at ${next.threshold} credits: ${next.label} (need ${next.threshold - total} more).`
    );
  }

  // ---- Actions ----
  function reset() {
    state.selected.clear();
    renderActivities();
    updateOutputs();
  }

  function loadExample() {
    state.selected.clear();
    // Example bundle = 40 credits (unlocks first two tiers)
    ["guided_prompts", "journaling", "structured_checkin", "goal_setting"].forEach((id) =>
      state.selected.add(id)
    );
    renderActivities();
    updateOutputs();
  }

  // ---- Wire up buttons ----
  btnReset.addEventListener("click", reset);
  btnLoad.addEventListener("click", loadExample);

  // ---- Init ----
  renderActivities();
  updateOutputs();
  initScrollSpy();
})();
