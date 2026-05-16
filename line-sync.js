const LINE_STORAGE_KEY = "kuromi-mandarin-quest-v3";
const LINE_LEGACY_STORAGE_KEY = "kuromi-mandarin-quest-v2";

const lineElements = {
  apiUrl: document.querySelector("#line-api-url"),
  close: document.querySelector("#close-line-sync"),
  form: document.querySelector("#line-sync-form"),
  open: document.querySelector("#open-line-sync"),
  sheet: document.querySelector("#line-sync-sheet"),
  status: document.querySelector("#line-sync-status"),
  syncNow: document.querySelector("#line-sync-now"),
  token: document.querySelector("#line-sync-token"),
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

function getLineSettings() {
  const progress = getLineProgress();

  return {
    apiUrl: String(progress.lineSync?.apiUrl || "").trim(),
    lastSyncedAt: String(progress.lineSync?.lastSyncedAt || ""),
    syncToken: String(progress.lineSync?.syncToken || "").trim(),
  };
}

function saveLineSettings() {
  const progress = getLineProgress();

  progress.lineSync = {
    apiUrl: lineElements.apiUrl.value.trim().replace(/\/+$/, ""),
    lastSyncedAt: progress.lineSync?.lastSyncedAt || "",
    syncToken: lineElements.token.value.trim(),
  };
  saveLineProgress(progress);
  renderLineStatus("Settings saved.");
}

function openLineSheet() {
  const settings = getLineSettings();

  lineElements.apiUrl.value = settings.apiUrl;
  lineElements.token.value = settings.syncToken;
  lineElements.sheet.hidden = false;
  renderLineStatus();
  lineElements.apiUrl.focus();
}

function closeLineSheet() {
  lineElements.sheet.hidden = true;
}

async function syncLineTerms() {
  saveLineSettings();

  const settings = getLineSettings();

  if (!settings.apiUrl || !settings.syncToken) {
    renderLineStatus("Add the API URL and sync token first.");
    return;
  }

  lineElements.syncNow.disabled = true;
  renderLineStatus("Syncing LINE terms...");

  try {
    const response = await fetch(`${settings.apiUrl}/api/terms`, {
      headers: {
        Authorization: `Bearer ${settings.syncToken}`,
      },
    });

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
      ...settings,
      lastSyncedAt: new Date().toISOString(),
    };
    saveLineProgress(progress);

    const newCount = progress.customPhrases.length - beforeCount;
    renderLineStatus(`Synced ${terms.length} terms. ${newCount} new. Refreshing...`);
    setTimeout(() => window.location.reload(), 700);
  } catch {
    renderLineStatus("Sync failed. Check the API URL, token, and Worker deploy.");
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
  const settings = getLineSettings();
  const syncedAt = settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString() : "Never";

  lineElements.status.textContent = message || (settings.apiUrl ? `Connected. Last sync: ${syncedAt}.` : "Not connected yet.");
}

if (lineElements.open && lineElements.sheet) {
  lineElements.open.addEventListener("click", openLineSheet);
  lineElements.close.addEventListener("click", closeLineSheet);
  lineElements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveLineSettings();
  });
  lineElements.syncNow.addEventListener("click", syncLineTerms);
  lineElements.sheet.addEventListener("click", (event) => {
    if (event.target === lineElements.sheet) {
      closeLineSheet();
    }
  });
}
