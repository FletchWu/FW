const STORAGE_KEY = "kuromi-mandarin-quest-v3";
const LEGACY_STORAGE_KEY = "kuromi-mandarin-quest-v2";
const HEARTS_PER_RUN = 3;
const ROUNDS_PER_UNIT = 4;
const CUSTOM_UNIT_ID = "custom";
const LINE_SOURCE = "line";
const LINE_API_URL = "https://kuromi-line-sync.fletcher1019.workers.dev";
const LINE_SYNC_INTERVAL_MS = 60000;

const BASE_UNITS = [
  { id: "morning", title: "Morning Magic", description: "Warm greetings and quick check-ins.", icon: "1", phraseIndexes: [0, 1, 11] },
  { id: "feelings", title: "Mood Charms", description: "Say how you feel naturally.", icon: "2", phraseIndexes: [2, 3, 11] },
  { id: "snacks", title: "Snack Spell", description: "Food, drinks, and tiny cravings.", icon: "3", phraseIndexes: [4, 5, 6] },
  { id: "plans", title: "Plan Portal", description: "Make casual plans and coordinate timing.", icon: "4", phraseIndexes: [7, 8, 9] },
  { id: "sweet", title: "Sweet Boss", description: "Caring phrases and a final review.", icon: "5", phraseIndexes: [1, 8, 10, 11] },
];

const BASE_PHRASES = [
  { hanzi: "早安", pinyin: "zǎo ān", meaning: "Good morning.", note: "A warm everyday greeting.", category: "greetings", source: "built-in" },
  { hanzi: "你今天過得怎麼樣？", pinyin: "nǐ jīn tiān guò de zěn me yàng?", meaning: "How was your day today?", note: "Useful for checking in after work or class.", category: "greetings", source: "built-in" },
  { hanzi: "我有點累", pinyin: "wǒ yǒu diǎn lèi", meaning: "I am a little tired.", note: "A natural way to soften how you feel.", category: "feelings", source: "built-in" },
  { hanzi: "可以幫我一下嗎？", pinyin: "kě yǐ bāng wǒ yí xià ma?", meaning: "Could you help me for a moment?", note: "Polite and common for small favors.", category: "daily", source: "built-in" },
  { hanzi: "我想喝水", pinyin: "wǒ xiǎng hē shuǐ", meaning: "I want to drink water.", note: "Swap water for tea, coffee, or juice.", category: "food", source: "built-in" },
  { hanzi: "這個很好吃", pinyin: "zhè ge hěn hǎo chī", meaning: "This is delicious.", note: "A happy phrase for meals and snacks.", category: "food", source: "built-in" },
  { hanzi: "你想吃什麼？", pinyin: "nǐ xiǎng chī shén me?", meaning: "What do you want to eat?", note: "A useful daily planning question.", category: "food", source: "built-in" },
  { hanzi: "我等一下回來", pinyin: "wǒ děng yí xià huí lái", meaning: "I will come back in a bit.", note: "Casual and useful when stepping away.", category: "plans", source: "built-in" },
  { hanzi: "我們晚一點見", pinyin: "wǒ men wǎn yì diǎn jiàn", meaning: "We will meet a little later.", note: "Good for flexible plans.", category: "plans", source: "built-in" },
  { hanzi: "明天有空嗎？", pinyin: "míng tiān yǒu kòng ma?", meaning: "Are you free tomorrow?", note: "A simple way to make plans.", category: "plans", source: "built-in" },
  { hanzi: "我很想你", pinyin: "wǒ hěn xiǎng nǐ", meaning: "I miss you a lot.", note: "Sweet, direct, and easy to remember.", category: "feelings", source: "built-in" },
  { hanzi: "辛苦了", pinyin: "xīn kǔ le", meaning: "You worked hard.", note: "A caring phrase after someone puts in effort.", category: "feelings", source: "built-in" },
];

const CHALLENGE_TYPES = [
  { kind: "picture", label: "Choose the phrase", prompt: (phrase) => `Which phrase means “${stripPunctuation(phrase.meaning)}”?` },
  { kind: "builder", label: "Build the meaning", prompt: () => "Write this in English" },
  { kind: "choice", label: "Meaning match", prompt: (phrase) => phrase.meaning, optionTitle: (phrase) => phrase.hanzi, optionMeta: (phrase) => phrase.pinyin },
  { kind: "listening", label: "Listening", prompt: () => "Listen and choose the phrase", optionTitle: (phrase) => phrase.hanzi, optionMeta: (phrase) => phrase.meaning },
];

const state = {
  activeUnitId: "morning",
  answered: false,
  builderSelection: [],
  challenge: null,
  currentView: "home",
  phraseFilter: "all",
  phraseSearch: "",
  progress: loadProgress(),
  round: 0,
  selectedAnswer: null,
};

const elements = {
  answerGrid: document.querySelector("#answer-grid"),
  challengePrompt: document.querySelector("#challenge-prompt"),
  challengeType: document.querySelector("#challenge-type"),
  closeCustomForm: document.querySelector("#close-custom-form"),
  closeLesson: document.querySelector("#close-lesson"),
  closeLineSync: document.querySelector("#close-line-sync"),
  continueButton: document.querySelector("#continue-button"),
  continueLearning: document.querySelector("#continue-learning"),
  customCategory: document.querySelector("#custom-category"),
  customForm: document.querySelector("#custom-form"),
  customHanzi: document.querySelector("#custom-hanzi"),
  customId: document.querySelector("#custom-id"),
  customMeaning: document.querySelector("#custom-meaning"),
  customNote: document.querySelector("#custom-note"),
  customPinyin: document.querySelector("#custom-pinyin"),
  customSheet: document.querySelector("#custom-sheet"),
  dailyGoalCount: document.querySelector("#daily-goal-count"),
  dailyGoalProgress: document.querySelector("#daily-goal-progress"),
  exportCustom: document.querySelector("#export-custom"),
  feedbackPanel: document.querySelector("#feedback-panel"),
  feedbackText: document.querySelector("#feedback-text"),
  feedbackTitle: document.querySelector("#feedback-title"),
  heartValue: document.querySelector("#heart-value"),
  homePath: document.querySelector("#home-path"),
  importCustomFile: document.querySelector("#import-custom-file"),
  learnPath: document.querySelector("#learn-path"),
  lessonActionBar: document.querySelector("#lesson-action-bar"),
  lessonHeartValue: document.querySelector("#lesson-heart-value"),
  lessonProgressFill: document.querySelector("#lesson-progress-fill"),
  lessonScreen: document.querySelector("#lesson-screen"),
  lineSettingsCopy: document.querySelector("#line-settings-copy"),
  lineSyncNow: document.querySelector("#line-sync-now"),
  lineSyncSheet: document.querySelector("#line-sync-sheet"),
  lineSyncStatus: document.querySelector("#line-sync-status"),
  openLineSync: document.querySelector("#open-line-sync"),
  phrasebookAdd: document.querySelector("#phrasebook-add"),
  phraseFilters: document.querySelector("#phrase-filters"),
  phraseGrid: document.querySelector("#phrase-grid"),
  phraseSearch: document.querySelector("#phrase-search"),
  playAudio: document.querySelector("#play-audio"),
  practiceCount: document.querySelector("#practice-count"),
  practiceList: document.querySelector("#practice-list"),
  profileSummary: document.querySelector("#profile-summary"),
  questProgress: document.querySelector("#quest-progress"),
  resetProgress: document.querySelector("#reset-progress"),
  saveAnother: document.querySelector("#save-another"),
  startCustomPractice: document.querySelector("#start-custom-practice"),
  streakValue: document.querySelector("#streak-value"),
  toast: document.querySelector("#toast"),
  xpValue: document.querySelector("#xp-value"),
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    return normalizeProgress(saved);
  } catch {
    return createFreshProgress();
  }
}

function normalizeProgress(saved) {
  if (!saved) return createFreshProgress();
  return {
    completedUnits: Array.isArray(saved.completedUnits) ? saved.completedUnits.filter((id) => typeof id === "string") : [],
    customPhrases: Array.isArray(saved.customPhrases) ? saved.customPhrases.map(normalizeCustomPhrase).filter(Boolean) : [],
    dailyCompletedDate: String(saved.dailyCompletedDate || ""),
    hearts: Number.isFinite(Number(saved.hearts)) ? Math.min(HEARTS_PER_RUN, Math.max(0, Number(saved.hearts))) : HEARTS_PER_RUN,
    lastLessonAt: String(saved.lastLessonAt || ""),
    lineSync: { lastSyncedAt: String(saved.lineSync?.lastSyncedAt || "") },
    mastered: Array.isArray(saved.mastered) ? saved.mastered.filter((item) => typeof item === "string") : [],
    streak: Math.max(0, Number(saved.streak) || 0),
    xp: Math.max(0, Number(saved.xp) || 0),
  };
}

function createFreshProgress() {
  return { completedUnits: [], customPhrases: [], dailyCompletedDate: "", hearts: HEARTS_PER_RUN, lastLessonAt: "", lineSync: { lastSyncedAt: "" }, mastered: [], streak: 0, xp: 0 };
}

function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }

function getUnits() {
  return [...BASE_UNITS, { id: CUSTOM_UNIT_ID, title: "My Practice", description: "Your custom and LINE phrases.", icon: "+", isCustom: true }];
}

function getAllPhrases() { return [...BASE_PHRASES, ...state.progress.customPhrases].filter(isDisplayablePhrase); }
function getActiveUnit() { return getUnits().find((unit) => unit.id === state.activeUnitId) || BASE_UNITS[0]; }
function getUnitPhrases(unit) { return unit.isCustom ? state.progress.customPhrases.filter(isDisplayablePhrase) : unit.phraseIndexes.map((index) => BASE_PHRASES[index]); }

function getNextUnit() {
  return BASE_UNITS.find((unit) => !state.progress.completedUnits.includes(unit.id)) || BASE_UNITS[BASE_UNITS.length - 1];
}

function setView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll(".app-view").forEach((view) => {
    const active = view.dataset.view === viewName;
    view.hidden = !active;
    view.classList.toggle("is-active", active);
  });
  document.querySelectorAll("[data-nav]").forEach((button) => button.classList.toggle("is-active", button.dataset.nav === viewName));
  elements.phrasebookAdd.hidden = viewName !== "phrasebook";
  window.scrollTo({ top: 0, behavior: "smooth" });
  render();
}

function render() {
  renderStatus();
  renderHome();
  renderPaths();
  renderPractice();
  renderPhrasebook();
  renderProfile();
}

function renderStatus() {
  elements.xpValue.textContent = state.progress.xp;
  elements.streakValue.textContent = state.progress.streak;
  elements.heartValue.textContent = `♥ ${state.progress.hearts}`;
  elements.lessonHeartValue.textContent = `♥ ${state.progress.hearts}`;
}

function renderHome() {
  const doneToday = state.progress.dailyCompletedDate === todayKey();
  elements.dailyGoalCount.textContent = doneToday ? "1 / 1" : "0 / 1";
  elements.dailyGoalProgress.style.width = doneToday ? "100%" : "0%";
  elements.questProgress.textContent = `${Math.min(30, state.progress.xp % 40)} / 30`;
}

function renderPaths() {
  elements.homePath.innerHTML = BASE_UNITS.map((unit, index) => renderPathNode(unit, index)).join("");
  elements.learnPath.innerHTML = getUnits().map((unit, index) => renderPathNode(unit, index, true)).join("");
}

function renderPathNode(unit, index, expanded = false) {
  const completed = state.progress.completedUnits.includes(unit.id);
  const nextUnit = getNextUnit();
  const current = unit.id === nextUnit.id || (unit.isCustom && state.progress.completedUnits.length >= BASE_UNITS.length);
  const priorComplete = index === 0 || state.progress.completedUnits.includes(getUnits()[index - 1]?.id);
  const locked = !unit.isCustom && !completed && !current && !priorComplete;
  const review = completed;
  const className = completed ? "is-complete is-review" : current ? "is-current" : locked ? "is-locked" : "";
  const tag = completed ? "Review" : current ? "Next" : locked ? "Locked" : unit.isCustom ? "Custom" : "Open";
  const symbol = completed ? "✓" : locked ? "·" : unit.icon;
  const hiddenOnHome = !expanded && index > 4 ? "hidden" : "";
  return `<button class="path-node ${className}" type="button" data-unit="${unit.id}" ${locked ? "disabled" : ""} ${hiddenOnHome}>
    <span class="node-orb">${symbol}</span><span><strong>${escapeHtml(unit.title)}</strong><small>${escapeHtml(unit.description)}</small></span><span class="node-tag">${tag}</span>
  </button>`;
}

function renderPractice() {
  const custom = state.progress.customPhrases.filter(isDisplayablePhrase);
  elements.practiceCount.textContent = `${custom.length} saved phrase${custom.length === 1 ? "" : "s"}`;
  elements.practiceList.innerHTML = custom.slice(-4).reverse().map((phrase) => `<article class="mini-phrase"><span><strong>${escapeHtml(phrase.hanzi)}</strong><small>${escapeHtml(phrase.meaning)}</small></span><button class="audio-button" type="button" data-speak="${escapeAttribute(getPhraseKey(phrase))}" aria-label="Play ${escapeAttribute(phrase.hanzi)}">♪</button></article>`).join("") || `<div class="empty-state">Add a phrase or send one through LINE to begin.</div>`;
}

function renderPhrasebook() {
  const query = state.phraseSearch.trim().toLocaleLowerCase();
  const phrases = getAllPhrases().filter((phrase) => {
    const matchesFilter = state.phraseFilter === "all" || (state.phraseFilter === "custom" ? phrase.source !== "built-in" : getPhraseCategory(phrase) === state.phraseFilter);
    const haystack = `${phrase.hanzi} ${phrase.pinyin} ${phrase.meaning}`.toLocaleLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });
  elements.phraseGrid.innerHTML = phrases.map(renderPhraseCard).join("") || `<div class="empty-state">No phrases match this search.</div>`;
}

function renderPhraseCard(phrase) {
  const key = getPhraseKey(phrase);
  const mastered = state.progress.mastered.includes(key) || state.progress.mastered.includes(phrase.hanzi);
  const custom = phrase.source !== "built-in";
  const menu = custom ? `<details class="phrase-menu"><summary aria-label="Phrase actions">•••</summary><div class="phrase-menu-items"><button type="button" data-edit-custom="${escapeAttribute(phrase.id)}">Edit</button><button class="delete" type="button" data-delete-custom="${escapeAttribute(phrase.id)}">Delete</button></div></details>` : "";
  return `<article class="phrase-card ${custom ? "is-custom" : ""}">
    <div class="phrase-card-head"><div><h3>${escapeHtml(phrase.hanzi)}</h3><p class="pinyin">${escapeHtml(cleanPinyin(phrase.pinyin) || "Pinyin not available")}</p></div>${menu}</div>
    <p class="translation">${escapeHtml(phrase.meaning)}</p>
    <div class="phrase-meta"><span><span class="mastery-badge ${mastered ? "" : "is-learning"}">${mastered ? "Mastered" : "Learning"}</span>${custom ? `<span class="source-badge">${phrase.source === LINE_SOURCE ? "LINE" : "Custom"}</span>` : ""}</span><button class="audio-button" type="button" data-speak="${escapeAttribute(key)}" aria-label="Play ${escapeAttribute(phrase.hanzi)}">♪</button></div>
  </article>`;
}

function renderProfile() {
  elements.profileSummary.textContent = `${state.progress.xp} XP · ${state.progress.mastered.length} phrases mastered`;
  const lastSync = state.progress.lineSync.lastSyncedAt ? new Date(state.progress.lineSync.lastSyncedAt).toLocaleString() : "Waiting for first sync";
  elements.lineSettingsCopy.textContent = `Automatic · ${lastSync}`;
}

function startLesson(unitId) {
  const unit = getUnits().find((item) => item.id === unitId) || getNextUnit();
  const phrases = getUnitPhrases(unit);
  if (!phrases.length) {
    showToast("Add a custom phrase first.");
    openCustomForm();
    return;
  }
  state.activeUnitId = unit.id;
  state.round = 0;
  state.progress.hearts = state.progress.hearts || HEARTS_PER_RUN;
  elements.lessonScreen.hidden = false;
  document.body.style.overflow = "hidden";
  createChallenge();
}

function closeLesson() {
  elements.lessonScreen.hidden = true;
  document.body.style.overflow = "";
  state.challenge = null;
  state.round = 0;
  render();
}

function createChallenge() {
  const unit = getActiveUnit();
  const unitPhrases = getUnitPhrases(unit);
  const phrase = unitPhrases[state.round % unitPhrases.length];
  const type = CHALLENGE_TYPES[state.round % CHALLENGE_TYPES.length];
  state.answered = false;
  state.builderSelection = [];
  state.selectedAnswer = null;
  state.challenge = { phrase, type, options: createOptions(phrase), builderTokens: type.kind === "builder" ? getBuilderTokens(phrase) : [] };
  renderChallenge();
  if (type.kind === "listening") speakPhrase(phrase);
}

function createOptions(phrase) {
  const distractors = shuffle(getAllPhrases().filter((item) => getPhraseKey(item) !== getPhraseKey(phrase) && item.hanzi !== phrase.hanzi));
  return shuffle([phrase, ...distractors.slice(0, 3)]);
}

function renderChallenge() {
  const { phrase, type, options } = state.challenge;
  const roundCount = getRoundCountForUnit(getActiveUnit());
  elements.challengeType.textContent = type.label;
  elements.challengePrompt.textContent = type.kind === "builder" ? phrase.hanzi : type.prompt(phrase);
  elements.playAudio.hidden = type.kind !== "listening" && type.kind !== "builder";
  elements.lessonProgressFill.style.width = `${Math.round((state.round / roundCount) * 100)}%`;
  elements.feedbackPanel.hidden = !state.answered;
  elements.lessonActionBar.className = `lesson-action-bar${state.answered ? state.selectedAnswer === getPhraseKey(phrase) ? " is-correct" : " is-wrong" : ""}`;
  elements.continueButton.textContent = state.answered ? "Continue" : "Check";
  elements.continueButton.disabled = !state.answered && !hasLessonSelection();

  if (type.kind === "picture") renderPictureChallenge(options, phrase);
  else if (type.kind === "builder") renderBuilderChallenge(phrase);
  else elements.answerGrid.className = "answer-grid", elements.answerGrid.innerHTML = options.map((option, index) => renderAnswerButton(option, phrase, type, index)).join("");
}

function renderAnswerButton(option, phrase, type, index) {
  const key = getPhraseKey(option);
  const selected = state.selectedAnswer === key;
  const correct = key === getPhraseKey(phrase);
  const resultClass = state.answered ? correct ? "is-correct" : selected ? "is-wrong" : "" : selected ? "is-selected" : "";
  return `<button class="answer-button ${resultClass}" type="button" data-answer="${escapeAttribute(key)}"><strong>${escapeHtml(type.optionTitle(option))}</strong><span>${escapeHtml(type.optionMeta(option) || option.meaning)}</span><span class="sr-only">Option ${index + 1}</span></button>`;
}

function renderPictureChallenge(options, phrase) {
  elements.answerGrid.className = "answer-grid is-picture-grid";
  elements.answerGrid.innerHTML = options.slice(0, 4).map((option, index) => {
    const key = getPhraseKey(option);
    const selected = state.selectedAnswer === key;
    const correct = key === getPhraseKey(phrase);
    const resultClass = state.answered ? correct ? "is-correct" : selected ? "is-wrong" : "" : selected ? "is-selected" : "";
    return `<button class="answer-button picture-card ${resultClass}" type="button" data-answer="${escapeAttribute(key)}"><span class="picture-art">${getPhraseArt(option)}</span><span class="choice-footer"><strong>${escapeHtml(option.hanzi)}</strong><span class="choice-key">${index + 1}</span></span><span>${escapeHtml(cleanPinyin(option.pinyin) || option.meaning)}</span></button>`;
  }).join("");
}

function renderBuilderChallenge(phrase) {
  const selected = state.builderSelection.map((token, index) => `<button class="selected-token" type="button" data-remove-token="${index}">${escapeHtml(token)}</button>`).join("");
  const tokens = state.challenge.builderTokens.map((token, index) => `<button class="word-token" type="button" data-token-index="${index}" ${state.builderSelection.includes(token) ? "disabled" : ""}>${escapeHtml(token)}</button>`).join("");
  elements.answerGrid.className = "answer-grid is-builder-grid";
  elements.answerGrid.innerHTML = `<div class="builder-scene"><div class="speaker-mascot">${getSpeakerMascot()}</div><button class="speech-bubble" type="button" data-play-builder><span>Tap to listen</span><strong>${escapeHtml(phrase.hanzi)}</strong></button></div><div class="builder-line">${selected}</div><div class="token-bank">${tokens}</div>`;
}

function hasLessonSelection() { return state.challenge?.type.kind === "builder" ? state.builderSelection.length > 0 : Boolean(state.selectedAnswer); }

function selectAnswer(key) {
  if (state.answered) return;
  state.selectedAnswer = key;
  renderChallenge();
}

function checkAnswer() {
  if (state.answered || !hasLessonSelection()) return;
  const { phrase, type } = state.challenge;
  const correctKey = getPhraseKey(phrase);
  if (type.kind === "builder") {
    const expected = getCorrectBuilderTokens(phrase).join(" ").toLowerCase();
    const actual = state.builderSelection.join(" ").toLowerCase();
    state.selectedAnswer = actual === expected ? correctKey : "builder-wrong";
  }
  state.answered = true;
  const correct = state.selectedAnswer === correctKey;
  if (correct) handleCorrectAnswer(phrase); else handleWrongAnswer(phrase);
  saveProgress();
  renderChallenge();
}

function handleCorrectAnswer(phrase) {
  const gain = phrase.source === "built-in" ? 10 : 12;
  state.progress.xp += gain;
  state.progress.streak += 1;
  const key = getPhraseKey(phrase);
  if (!state.progress.mastered.includes(key)) state.progress.mastered.push(key);
  elements.feedbackTitle.textContent = "Correct!";
  elements.feedbackText.textContent = `${phrase.hanzi} · ${cleanPinyin(phrase.pinyin) || "Pronunciation saved"} · ${phrase.meaning}`;
  showXpPop(gain);
}

function handleWrongAnswer(phrase) {
  state.progress.hearts = Math.max(0, state.progress.hearts - 1);
  state.progress.streak = 0;
  elements.feedbackTitle.textContent = "Almost — here is the answer";
  elements.feedbackText.textContent = `${phrase.hanzi} · ${cleanPinyin(phrase.pinyin) || "Pinyin not available"} · ${phrase.meaning}. ${phrase.note || "Try reading it aloud once."}`;
}

function continueLesson() {
  if (!state.answered) return checkAnswer();
  if (state.progress.hearts === 0) {
    state.progress.hearts = HEARTS_PER_RUN;
    state.round = 0;
    showToast("Hearts refilled. Try once more.");
    return createChallenge();
  }
  state.round += 1;
  if (state.round >= getRoundCountForUnit(getActiveUnit())) return completeUnit();
  createChallenge();
}

function completeUnit() {
  const unit = getActiveUnit();
  if (!state.progress.completedUnits.includes(unit.id)) {
    state.progress.completedUnits.push(unit.id);
    state.progress.xp += unit.isCustom ? 15 : 25;
  }
  state.progress.dailyCompletedDate = todayKey();
  state.progress.lastLessonAt = new Date().toISOString();
  state.progress.hearts = HEARTS_PER_RUN;
  saveProgress();
  closeLesson();
  showToast(`${unit.title} complete. Nice work!`);
}

function getRoundCountForUnit(unit) { return unit.isCustom ? Math.max(1, Math.min(ROUNDS_PER_UNIT, getUnitPhrases(unit).length)) : ROUNDS_PER_UNIT; }

function getBuilderTokens(phrase) {
  const correct = getCorrectBuilderTokens(phrase);
  const distractors = ["please", "now", "tea", "with", "soon", "very"].filter((token) => !correct.includes(token));
  return shuffle([...correct, ...shuffle(distractors).slice(0, 2)]);
}
function getCorrectBuilderTokens(phrase) { return stripPunctuation(phrase.meaning).split(/\s+/).filter(Boolean); }
function addBuilderToken(index) { if (!state.answered) { const token = state.challenge.builderTokens[Number(index)]; if (token && !state.builderSelection.includes(token)) state.builderSelection.push(token); renderChallenge(); } }
function removeBuilderToken(index) { if (!state.answered) { state.builderSelection.splice(Number(index), 1); renderChallenge(); } }

function openCustomForm(phrase = null) {
  elements.customSheet.hidden = false;
  elements.customId.value = phrase?.id || "";
  elements.customHanzi.value = phrase?.hanzi || "";
  elements.customMeaning.value = phrase?.meaning || "";
  elements.customPinyin.value = phrase?.pinyin || "";
  elements.customCategory.value = getPhraseCategory(phrase || {}) || "daily";
  elements.customNote.value = phrase?.note || "";
  setTimeout(() => elements.customHanzi.focus(), 80);
}
function closeCustomForm() { elements.customSheet.hidden = true; elements.customForm.reset(); elements.customId.value = ""; }

function saveCustomPhrase({ practiceNow }) {
  if (!elements.customForm.reportValidity()) return;
  const phrase = normalizeCustomPhrase({ id: elements.customId.value || createId(), hanzi: elements.customHanzi.value, meaning: elements.customMeaning.value, pinyin: elements.customPinyin.value, category: elements.customCategory.value, note: elements.customNote.value, source: "custom" });
  if (!phrase) return showToast("Please enter valid Traditional Chinese text and a meaning.");
  upsertCustomPhrase(phrase);
  state.progress.completedUnits = state.progress.completedUnits.filter((id) => id !== CUSTOM_UNIT_ID);
  saveProgress();
  closeCustomForm();
  render();
  showToast(`${phrase.hanzi} saved.`);
  if (practiceNow) startLesson(CUSTOM_UNIT_ID);
}

function upsertCustomPhrase(phrase) {
  const index = state.progress.customPhrases.findIndex((item) => item.id === phrase.id);
  if (index >= 0) state.progress.customPhrases[index] = phrase; else state.progress.customPhrases.push(phrase);
}
function editCustomPhrase(id) { const phrase = state.progress.customPhrases.find((item) => item.id === id); if (phrase) openCustomForm(phrase); }
function deleteCustomPhrase(id) {
  const phrase = state.progress.customPhrases.find((item) => item.id === id);
  if (!phrase || !window.confirm(`Delete “${phrase.hanzi}” from your phrasebook?`)) return;
  state.progress.customPhrases = state.progress.customPhrases.filter((item) => item.id !== id);
  state.progress.mastered = state.progress.mastered.filter((item) => item !== id);
  saveProgress(); render(); showToast("Phrase deleted.");
}

function normalizeCustomPhrase(phrase) {
  const hanzi = cleanChineseText(phrase?.hanzi);
  const meaning = cleanPlainText(phrase?.meaning, 180);
  if (!hanzi || !meaning || !containsChinese(hanzi)) return null;
  return { id: String(phrase.id || createId()), hanzi, pinyin: cleanPinyin(phrase.pinyin), meaning, category: normalizeCategory(phrase.category), note: cleanPlainText(phrase.note, 220), source: phrase.source === LINE_SOURCE ? LINE_SOURCE : "custom" };
}
function isDisplayablePhrase(phrase) { return Boolean(phrase && containsChinese(phrase.hanzi) && cleanPlainText(phrase.meaning, 180)); }
function cleanChineseText(value) { return String(value || "").normalize("NFC").replace(/[\u0000-\u001f\u007f�]/g, "").trim().slice(0, 80); }
function containsChinese(value) { return /[\u3400-\u9fff\uf900-\ufaff]/.test(String(value || "")); }
function cleanPlainText(value, maxLength) { return String(value || "").normalize("NFC").replace(/[\u0000-\u001f\u007f�]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength); }
function cleanPinyin(value) {
  const pinyin = cleanPlainText(value, 120);
  return /^[A-Za-zÀ-žüÜāáǎàēéěèīíǐìōóǒòūúǔùńňǹḿ\s'’\-.,?!:]+$/.test(pinyin) ? pinyin : "";
}
function normalizeCategory(value) { return ["greetings", "food", "feelings", "plans", "daily", "home", "travel", "relationship", "line"].includes(value) ? value : "daily"; }
function getPhraseCategory(phrase) { if (phrase.source !== "built-in" && !phrase.category) return "custom"; return normalizeCategory(phrase.category); }

async function syncLineTerms({ quiet = false } = {}) {
  if (!quiet) elements.lineSyncStatus.textContent = "Checking for new phrases…";
  elements.lineSyncNow.disabled = true;
  try {
    const response = await fetch(`${LINE_API_URL}/api/public/terms`, { cache: "no-store" });
    if (!response.ok) throw new Error("Sync failed");
    const payload = await response.json();
    const terms = Array.isArray(payload.terms) ? payload.terms : [];
    const before = state.progress.customPhrases.length;
    terms.map(normalizeLineTerm).filter(Boolean).forEach(upsertImportedPhrase);
    state.progress.lineSync.lastSyncedAt = new Date().toISOString();
    saveProgress(); render();
    const added = state.progress.customPhrases.length - before;
    elements.lineSyncStatus.textContent = `${terms.length} phrases synced · just now`;
    if (added > 0) showToast(`${added} new LINE phrase${added === 1 ? "" : "s"} added.`);
  } catch {
    elements.lineSyncStatus.textContent = "Could not sync. Try again shortly.";
  } finally { elements.lineSyncNow.disabled = false; }
}

function normalizeLineTerm(term) {
  return normalizeCustomPhrase({ id: `line-${term?.id || term?.hanzi || createId()}`, hanzi: term?.hanzi, pinyin: term?.pinyin, meaning: term?.meaning, category: term?.category || "line", note: term?.note || "Saved from LINE.", source: LINE_SOURCE });
}
function upsertImportedPhrase(phrase) {
  const duplicate = state.progress.customPhrases.find((item) => item.id === phrase.id || (item.hanzi === phrase.hanzi && item.meaning === phrase.meaning));
  upsertCustomPhrase(duplicate ? { ...phrase, id: duplicate.id } : phrase);
}

function exportCustomPhrases() {
  const payload = { app: "kuromi-mandarin-quest", exportedAt: new Date().toISOString(), version: 2, customPhrases: state.progress.customPhrases };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a"); link.href = url; link.download = `kuromi-mandarin-custom-${todayKey()}.json`; link.click(); URL.revokeObjectURL(url);
  showToast("Phrase backup downloaded.");
}

async function importCustomPhrases(file) {
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const source = Array.isArray(payload) ? payload : payload.customPhrases;
    if (!Array.isArray(source)) throw new Error("Invalid file");
    const before = state.progress.customPhrases.length;
    source.map(normalizeCustomPhrase).filter(Boolean).forEach(upsertImportedPhrase);
    saveProgress(); render(); showToast(`${state.progress.customPhrases.length - before} new phrases imported.`);
  } catch { showToast("Import failed. Choose a valid JSON backup."); }
  finally { elements.importCustomFile.value = ""; }
}

function resetProgress() {
  if (!window.confirm("Reset XP, streak, hearts, and lesson progress? Your custom phrases will be kept.")) return;
  const customPhrases = state.progress.customPhrases;
  const lineSync = state.progress.lineSync;
  state.progress = createFreshProgress(); state.progress.customPhrases = customPhrases; state.progress.lineSync = lineSync;
  saveProgress(); render(); showToast("Learning progress reset.");
}

function speakPhrase(phrase) {
  if (!("speechSynthesis" in window)) return showToast("Audio is not available in this browser.");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase.hanzi); utterance.lang = "zh-TW"; utterance.rate = 0.82; speechSynthesis.speak(utterance);
}
function speakByKey(key) { const phrase = getAllPhrases().find((item) => getPhraseKey(item) === key); if (phrase) speakPhrase(phrase); }

function showXpPop(amount) { const pop = document.createElement("span"); pop.className = "xp-pop"; pop.textContent = `+${amount} XP`; document.body.append(pop); setTimeout(() => pop.remove(), 1000); }
let toastTimer;
function showToast(message) { clearTimeout(toastTimer); elements.toast.textContent = message; elements.toast.hidden = false; toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2600); }

function getPhraseKey(phrase) { return phrase.id || phrase.hanzi; }
function createId() { return crypto?.randomUUID ? crypto.randomUUID() : `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function todayKey() { return new Date().toISOString().slice(0, 10); }
function stripPunctuation(value) { return String(value || "").replace(/[.?]/g, "").trim(); }
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function escapeAttribute(value) { return escapeHtml(value); }

function getPhraseArt(phrase) {
  const text = `${phrase.meaning} ${phrase.category || ""}`.toLowerCase();
  if (text.includes("water") || text.includes("drink")) return artCup();
  if (text.includes("eat") || text.includes("delicious") || text.includes("food")) return artBowl();
  if (text.includes("morning") || text.includes("tomorrow")) return artSun();
  if (text.includes("miss") || text.includes("help") || text.includes("worked")) return artHeart();
  return artStar();
}
function artCup() { return `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M35 25h48l-6 58H41z" fill="#bdeffc" stroke="#fff" stroke-width="5"/><path d="M40 60h39l-3 23H43z" fill="#69cce9"/><path d="M47 36c8-7 18-7 26 0" fill="none" stroke="#7f3fb5" stroke-width="5" stroke-linecap="round"/></svg>`; }
function artBowl() { return `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M20 43c10 48 70 48 80 0z" fill="#f7b94c"/><path d="M28 40c12-18 53-22 66 0" fill="none" stroke="#61bb67" stroke-width="9"/><circle cx="49" cy="31" r="9" fill="#ed6fad"/><path d="M37 80h46" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`; }
function artSun() { return `<svg viewBox="0 0 120 100" aria-hidden="true"><circle cx="60" cy="42" r="24" fill="#ffd068"/><path d="M24 78c17-17 55-17 72 0" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><circle cx="52" cy="40" r="3" fill="#3b204d"/><circle cx="68" cy="40" r="3" fill="#3b204d"/></svg>`; }
function artHeart() { return `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M60 84C28 62 20 40 34 27c12-11 23-2 26 9 3-11 14-20 26-9 14 13 6 35-26 57z" fill="#ed6fad"/><path d="M48 54c8 7 16 7 24 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`; }
function artStar() { return `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M60 12l11 25 27 3-20 18 6 27-24-14-24 14 6-27-20-18 27-3z" fill="#c996e8" stroke="#fff" stroke-width="4"/><circle cx="52" cy="48" r="3" fill="#3b204d"/><circle cx="68" cy="48" r="3" fill="#3b204d"/></svg>`; }
function getSpeakerMascot() { return `<svg viewBox="0 0 140 150" aria-hidden="true"><path d="M37 56C22 24 22 9 35 5c12 11 19 30 21 48zM83 53c4-21 12-39 24-48 12 6 7 23-9 52z" fill="#2a1735"/><path d="M35 52c10-16 50-16 60 1 22 35 7 75-25 75S14 88 35 52z" fill="#382046"/><ellipse cx="65" cy="75" rx="26" ry="22" fill="#fff"/><circle cx="55" cy="73" r="4" fill="#24172d"/><circle cx="76" cy="73" r="4" fill="#24172d"/><path d="M55 47l10 7 10-7 9 7 8-7-4 18H42z" fill="#ed6fad"/></svg>`; }

document.querySelector(".bottom-nav").addEventListener("click", (event) => { const button = event.target.closest("[data-nav]"); if (button) setView(button.dataset.nav); });
document.querySelectorAll("[data-go-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.goView)));
document.addEventListener("click", (event) => {
  const unit = event.target.closest("[data-unit]");
  const speak = event.target.closest("[data-speak]");
  const edit = event.target.closest("[data-edit-custom]");
  const remove = event.target.closest("[data-delete-custom]");
  if (unit && !unit.disabled) startLesson(unit.dataset.unit);
  else if (speak) speakByKey(speak.dataset.speak);
  else if (edit) editCustomPhrase(edit.dataset.editCustom);
  else if (remove) deleteCustomPhrase(remove.dataset.deleteCustom);
});
elements.continueLearning.addEventListener("click", () => startLesson(getNextUnit().id));
elements.startCustomPractice.addEventListener("click", () => startLesson(CUSTOM_UNIT_ID));
elements.phrasebookAdd.addEventListener("click", () => openCustomForm());
document.querySelectorAll("[data-review]").forEach((button) => button.addEventListener("click", () => startLesson(button.dataset.review === "listening" ? "morning" : getNextUnit().id)));

elements.answerGrid.addEventListener("click", (event) => {
  const answer = event.target.closest("[data-answer]");
  const token = event.target.closest("[data-token-index]");
  const remove = event.target.closest("[data-remove-token]");
  if (answer) selectAnswer(answer.dataset.answer);
  else if (token) addBuilderToken(token.dataset.tokenIndex);
  else if (remove) removeBuilderToken(remove.dataset.removeToken);
  else if (event.target.closest("[data-play-builder]") && state.challenge) speakPhrase(state.challenge.phrase);
});
elements.continueButton.addEventListener("click", continueLesson);
elements.closeLesson.addEventListener("click", closeLesson);
elements.playAudio.addEventListener("click", () => state.challenge && speakPhrase(state.challenge.phrase));

elements.phraseSearch.addEventListener("input", (event) => { state.phraseSearch = event.target.value; renderPhrasebook(); });
elements.phraseFilters.addEventListener("click", (event) => { const chip = event.target.closest("[data-filter]"); if (!chip) return; state.phraseFilter = chip.dataset.filter; document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === chip)); renderPhrasebook(); });

elements.closeCustomForm.addEventListener("click", closeCustomForm);
elements.customSheet.addEventListener("click", (event) => { if (event.target === elements.customSheet) closeCustomForm(); });
elements.customForm.addEventListener("submit", (event) => { event.preventDefault(); saveCustomPhrase({ practiceNow: true }); });
elements.saveAnother.addEventListener("click", () => saveCustomPhrase({ practiceNow: false }));
elements.openLineSync.addEventListener("click", () => { elements.lineSyncSheet.hidden = false; syncLineTerms({ quiet: true }); });
elements.closeLineSync.addEventListener("click", () => { elements.lineSyncSheet.hidden = true; });
elements.lineSyncSheet.addEventListener("click", (event) => { if (event.target === elements.lineSyncSheet) elements.lineSyncSheet.hidden = true; });
elements.lineSyncNow.addEventListener("click", () => syncLineTerms());
elements.exportCustom.addEventListener("click", exportCustomPhrases);
elements.importCustomFile.addEventListener("change", (event) => importCustomPhrases(event.target.files[0]));
elements.resetProgress.addEventListener("click", resetProgress);

document.addEventListener("keydown", (event) => {
  if (elements.lessonScreen.hidden || event.target.matches("input, textarea, select")) return;
  if (/^[1-4]$/.test(event.key)) {
    const options = elements.answerGrid.querySelectorAll("[data-answer]");
    options[Number(event.key) - 1]?.click();
  } else if (event.key === "Enter" && !elements.continueButton.disabled) elements.continueButton.click();
  else if (event.key === "Escape") closeLesson();
});

setView("home");
syncLineTerms({ quiet: true });
setInterval(() => syncLineTerms({ quiet: true }), LINE_SYNC_INTERVAL_MS);
document.addEventListener("visibilitychange", () => { if (!document.hidden) syncLineTerms({ quiet: true }); });

