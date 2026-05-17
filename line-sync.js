const LINE_STORAGE_KEY = "kuromi-mandarin-quest-v3";
const LINE_LEGACY_STORAGE_KEY = "kuromi-mandarin-quest-v2";
const LINE_API_URL = "https://kuromi-line-sync.fletcher1019.workers.dev";
const LINE_SYNC_INTERVAL_MS = 60000;

const lineElements = {
  close: document.querySelector("#close-line-sync"),
  form: document.querySelector("#line-sync-form"),
  open: document.querySelector("#open-line-sync"),
  sheet: document.querySelector("#line-sync-sheet"),
  status: document.querySelector("#line-sync-status"),
  syncNow: document.querySelector("#line-sync-now"),
};

function getLineProgress() {
  try {
    return JSON.parse(localStorage.getItem(LINE_STORAGE_KEY))
      || JSON.parse(localStorage.getItem(LINE_LEGACY_STORAGE_KEY))
      || createLineProgress();
  } catch {
    return createLineProgress();
  }
}

function createLineProgress() {
  return {
    completedUnits: [],
    customPhrases: [],
    hearts: 3,
    lineSync: {},
    mastered: [],
    streak: 0,
    xp: 0,
  };
}

function saveLineProgress(progress) {
  localStorage.setItem(LINE_STORAGE_KEY, JSON.stringify(progress));
}

function openLineSheet() {
  lineElements.sheet.hidden = false;
  renderLineStatus();
}

function closeLineSheet() {
  lineElements.sheet.hidden = true;
}

async function syncLineTerms({ shouldReload = true } = {}) {
  lineElements.syncNow.disabled = true;
  renderLineStatus("Syncing LINE terms...");

  try {
    const response = await fetch(`${LINE_API_URL}/api/public/terms`);

    if (!response.ok) {
      throw new Error("Sync failed");
    }

    const payload = await response.json();
    const terms = Array.isArray(payload.terms) ? payload.terms : [];
    const progress = getLineProgress();
    const beforeCount = Array.isArray(progress.customPhrases) ? progress.customPhrases.length : 0;

    progress.customPhrases = Array.isArray(progress.customPhrases) ? progress.customPhrases : [];
    terms.map(normalizeLineTerm).filter(Boolean).forEach((term) => upsertLinePhrase(progress, term));
    progress.completedUnits = (progress.completedUnits || []).filter((unitId) => unitId !== "custom");
    progress.lineSync = {
      lastSyncedAt: new Date().toISOString(),
    };
    saveLineProgress(progress);

    const newCount = progress.customPhrases.length - beforeCount;
    renderLineStatus(`Synced ${terms.length} LINE terms. ${newCount} new.`);

    if (shouldReload && newCount > 0) {
      setTimeout(() => window.location.reload(), 700);
    }
  } catch {
    renderLineStatus("Sync failed. Try again in a moment.");
  } finally {
    lineElements.syncNow.disabled = false;
  }
}

function normalizeLineTerm(term) {
  if (!term?.hanzi || !term?.meaning) {
    return null;
  }

  return {
    category: term.category || "line",
    hanzi: String(term.hanzi).trim(),
    id: `line-${term.id || term.hanzi}`,
    meaning: String(term.meaning).trim(),
    note: term.note || "Saved from LINE.",
    pinyin: term.pinyin || "",
    source: "line",
  };
}

function upsertLinePhrase(progress, phrase) {
  const existingIndex = progress.customPhrases.findIndex((item) => (
    item.id === phrase.id
    || (item.hanzi === phrase.hanzi && item.meaning === phrase.meaning)
  ));

  if (existingIndex >= 0) {
    progress.customPhrases[existingIndex] = { ...progress.customPhrases[existingIndex], ...phrase };
    return;
  }

  progress.customPhrases.push(phrase);
}

function renderLineStatus(message = "") {
  const progress = getLineProgress();
  const lastSyncedAt = progress.lineSync?.lastSyncedAt || "";
  const syncedAt = lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never";

  lineElements.status.textContent = message || `Connected automatically. Last sync: ${syncedAt}.`;
}

if (lineElements.open && lineElements.sheet) {
  lineElements.open.addEventListener("click", openLineSheet);
  lineElements.close.addEventListener("click", closeLineSheet);
  lineElements.form.addEventListener("submit", (event) => event.preventDefault());
  lineElements.syncNow.addEventListener("click", () => syncLineTerms());
  lineElements.sheet.addEventListener("click", (event) => {
    if (event.target === lineElements.sheet) {
      closeLineSheet();
    }
  });

  syncLineTerms({ shouldReload: false });
  setInterval(() => syncLineTerms(), LINE_SYNC_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      syncLineTerms();
    }
  });
}
