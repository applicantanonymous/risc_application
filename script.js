/* ===========================
   Relational Infrastructure in Jail
   script.js
   - Builds the simulator checklist
   - Calculates credits + unlocks
   - Renders academic sources
   =========================== */

const DISPLAY_CAP = 100; // purely for the progress bar UI

const ACTIVITIES = [
  {
    id: "guided_prompts",
    title: "Guided conversation prompts",
    desc: "Short prompts designed for phone/video calls.",
    credits: 15
  },
  {
    id: "coparenting",
    title: "Co-parenting exercise",
    desc: "Shared planning and decision routines (school, routines, boundaries).",
    credits: 15
  },
  {
    id: "shared_journal",
    title: "Shared journaling",
    desc: "Asynchronous entries to build continuity between contacts.",
    credits: 20
  },
  {
    id: "fun_activity",
    title: "Family Activity",
    desc: "Play a game together! .",
    credits: 10
  },
  {
    id: "check_in",
    title: "Structured check-in",
    desc: "Repair-focused: what went well, what was hard, one request for next time.",
    credits: 15
  },
  {
    id: "reflection",
    title: "Reflection module",
    desc: "Watch a short clip on  parenting/lifestyle practices and answer reflection questions.",
    credits: 15
  }
];

const UNLOCKS = [
  { threshold: 15, label: "Exponential increase in additional call minutes" },
  { threshold: 30, label: "Expanded messaging access" },
  { threshold: 45, label: "Video visitation slot" },
  { threshold: 60, label: "Visit scheduling flexibility" },
  { threshold: 85, label: "Adds to IIC 'Good-Time'" }
];

// ---------- Academic sources ----------
const SOURCES = [
  {
    title:
      "Inmate Social Ties and the Transition to Society: Does Visitation Reduce Recidivism?",
    authors: "Bales, W. D.; Mears, D. P.",
    year: 2008,
    type: "Journal article",
    link: "https://journals.sagepub.com/doi/10.1177/0022427808317574",
    notes:
      "Large administrative study linking visitation to reduced and delayed recidivism - motivates family connection as a public safety asset."
  },
  {
    title: "Prison Visitation and Recidivism",
    authors: "Mears, D. P.; Cochran, J.; Siennick, S.; Bales, W. D.",
    year: 2012,
    type: "Journal article",
    link:
      "https://ojp.gov/ncjrs/virtual-library/abstracts/prison-visitation-and-recidivism",
    notes:
      "Uses matching approaches and explores visitation dose/type, helpful for thinking about thresholds for gaining more credits based on activities completed."
  },
  {
    title:
      "Family Contact During Incarceration: A Meta-Review of the Evidence and Implications",
    authors: "Folk, J. B.; et al.",
    year: 2019,
    type: "Review / synthesis",
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6625803/",
    notes:
      "Accessible synthesis on why family contact matters and what outcomes it’s associated with; good grounding for policy rationale."
  },
  {
    title:
      "Parental Incarceration and the Family: Psychological and Social Effects of Imprisonment on Children, Parents, and Caregivers",
    authors: "Arditti, J. A.",
    year: 2012,
    type: "Book",
    link:
      "https://openlibrary.org/books/OL25140601M/Parental_incarceration_and_the_family",
    notes:
      "Family-process lens that treats strain as structural and relational; useful for framing why skill-building alone may be insufficient without contact opportunities."
  },
  {
    title: "Why Ask About Family? A Guide for Correctional Staff",
    authors: "Vera Institute of Justice",
    year: 2010,
    type: "Policy report",
    link:
      "https://vera-institute.files.svdcdn.com/production/downloads/publications/Why-ask-about-family-Final.pdf?dm=1647370696",
    notes:
      "Implementation-facing rationale for centering family supports -> useful for staff-facing framing and institutional constraints."
  }
];

// ---------- DOM helpers ----------
function $(id) {
  return document.getElementById(id);
}

// ---------- Simulator state ----------
let selected = new Set();

const activityList = $("activityList");
const creditTotalEl = $("creditTotal");
const barFill = $("barFill");
const unlockList = $("unlockList");
const resetBtn = $("resetBtn");
const demoBtn = $("demoBtn");

// ---------- Build activity checklist ----------
function renderActivities() {
  if (!activityList) return;

  activityList.innerHTML = "";

  for (const a of ACTIVITIES) {
    const row = document.createElement("label");
    row.className = "check";
    row.innerHTML = `
      <input type="checkbox" data-id="${a.id}" />
      <div>
        <strong>${a.title}</strong>
        <span>${a.desc}</span>
        <span><em>${a.credits} credits</em></span>
      </div>
    `;
    activityList.appendChild(row);
  }

  activityList.addEventListener("change", (e) => {
    const id = e.target?.dataset?.id;
    if (!id) return;

    if (e.target.checked) selected.add(id);
    else selected.delete(id);

    updateSimulator();
  });
}

function getCredits() {
  let total = 0;
  for (const id of selected) {
    const a = ACTIVITIES.find((x) => x.id === id);
    total += a ? a.credits : 0;
  }
  return total;
}

function renderUnlocks(credits) {
  if (!unlockList) return;

  unlockList.innerHTML = "";

  const unlocked = UNLOCKS.filter((u) => credits >= u.threshold);

  if (unlocked.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No unlocks yet — select activities to earn credits.";
    unlockList.appendChild(li);
    return;
  }

  for (const u of unlocked) {
    const li = document.createElement("li");
    li.textContent = u.label;
    unlockList.appendChild(li);
  }
}

function updateSimulator() {
  const credits = getCredits();

  if (creditTotalEl) creditTotalEl.textContent = String(credits);

  // progress bar
  const pct = (Math.min(credits, DISPLAY_CAP) / DISPLAY_CAP) * 100;
  if (barFill) barFill.style.width = `${pct}%`;

  renderUnlocks(credits);
}

// ---------- Buttons ----------
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    selected.clear();
    document
      .querySelectorAll("#activityList input[type='checkbox']")
      .forEach((cb) => (cb.checked = false));
    updateSimulator();
  });
}

if (demoBtn) {
  demoBtn.addEventListener("click", () => {
    // plausible “example week” — edit this set however you want
    selected = new Set(["guided_prompts", "check_in", "shared_journal", "reflection"]);
    document
      .querySelectorAll("#activityList input[type='checkbox']")
      .forEach((cb) => (cb.checked = selected.has(cb.dataset.id)));
    updateSimulator();
  });
}

// ---------- Render sources ----------
function renderSources() {
  const sourceList = $("sourceList");
  if (!sourceList) return;

  sourceList.innerHTML = "";

  for (const s of SOURCES) {
    const el = document.createElement("div");
    el.className = "source";

    const themeBadges = (s.themes || [])
      .map((t) => `<span class="badge">${t}</span>`)
      .join("");

    el.innerHTML = `
      <div class="source-top">
        <div>
          <h3 class="source-title">
            <a href="${s.link}" target="_blank" rel="noreferrer">${s.title}</a>
          </h3>
          <p class="source-meta">${s.authors} • ${s.year} • ${s.type}</p>
        </div>
        <div class="badges" aria-label="Tags">
          ${themeBadges}
        </div>
      </div>
      <p class="source-notes">${s.notes}</p>
    `;

    sourceList.appendChild(el);
  }
}

// ---------- Boot ----------
renderActivities();
updateSimulator();
renderSources();
