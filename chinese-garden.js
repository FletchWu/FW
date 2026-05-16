const STORAGE_KEY = "kuromi-mandarin-quest-v3";
const LEGACY_STORAGE_KEY = "kuromi-mandarin-quest-v2";
const HEARTS_PER_RUN = 3;
const ROUNDS_PER_UNIT = 4;
const CUSTOM_UNIT_ID = "custom";

const BASE_UNITS = [
  {
    id: "morning",
    title: "Morning Magic",
    description: "Practice warm everyday greetings and quick check-ins.",
    icon: "1",
    phraseIndexes: [0, 1, 11],
  },
  {
    id: "feelings",
    title: "Mood Charms",
    description: "Say how you feel without sounding too blunt.",
    icon: "2",
    phraseIndexes: [2, 3, 11],
  },
  {
    id: "snacks",
    title: "Snack Spell",
    description: "Handle food, drinks, and tiny cravings.",
    icon: "3",
    phraseIndexes: [4, 5, 6],
  },
  {
    id: "plans",
    title: "Plan Portal",
    description: "Make casual plans and coordinate timing.",
    icon: "4",
    phraseIndexes: [7, 8, 9],
  },
  {
    id: "sweet",
    title: "Sweet Boss Fight",
    description: "Review caring phrases and finish the quest.",
    icon: "5",
    phraseIndexes: [1, 8, 10, 11],
  },
];

const BASE_PHRASES = [
  {
    hanzi: "\u65e9\u5b89",
    pinyin: "z\u01ceo \u0101n",
    meaning: "Good morning.",
    note: "A warm everyday greeting.",
    source: "built-in",
  },
  {
    hanzi: "\u4f60\u4eca\u5929\u904e\u5f97\u600e\u9ebc\u6a23\uff1f",
    pinyin: "n\u01d0 j\u012bn ti\u0101n gu\u00f2 de z\u011bn me y\u00e0ng?",
    meaning: "How was your day today?",
    note: "Useful for checking in after work or class.",
    source: "built-in",
  },
  {
    hanzi: "\u6211\u6709\u9ede\u7d2f",
    pinyin: "w\u01d2 y\u01d2u di\u01cen l\u00e8i",
    meaning: "I am a little tired.",
    note: "A natural way to soften how you feel.",
    source: "built-in",
  },
  {
    hanzi: "\u53ef\u4ee5\u5e6b\u6211\u4e00\u4e0b\u55ce\uff1f",
    pinyin: "k\u011b y\u01d0 b\u0101ng w\u01d2 y\u012b xi\u00e0 ma?",
    meaning: "Could you help me for a moment?",
    note: "Polite and common for small favors.",
    source: "built-in",
  },
  {
    hanzi: "\u6211\u60f3\u559d\u6c34",
    pinyin: "w\u01d2 xi\u01ceng h\u0113 shu\u01d0",
    meaning: "I want to drink water.",
    note: "Swap water for tea, coffee, or juice.",
    source: "built-in",
  },
  {
    hanzi: "\u9019\u500b\u5f88\u597d\u5403",
    pinyin: "zh\u00e8 ge h\u011bn h\u01ceo ch\u012b",
    meaning: "This is delicious.",
    note: "A happy phrase for meals and snacks.",
    source: "built-in",
  },
  {
    hanzi: "\u4f60\u60f3\u5403\u4ec0\u9ebc\uff1f",
    pinyin: "n\u01d0 xi\u01ceng ch\u012b sh\u00e9n me?",
    meaning: "What do you want to eat?",
    note: "The most important daily planning question.",
    source: "built-in",
  },
  {
    hanzi: "\u6211\u7b49\u4e00\u4e0b\u56de\u4f86",
    pinyin: "w\u01d2 d\u011bng y\u012b xi\u00e0 hu\u00ed l\u00e1i",
    meaning: "I will come back in a bit.",
    note: "Casual and useful when stepping away.",
    source: "built-in",
  },
  {
    hanzi: "\u6211\u5011\u665a\u4e00\u9ede\u898b",
    pinyin: "w\u01d2 men w\u01cen y\u012b di\u01cen ji\u00e0n",
    meaning: "We will meet a little later.",
    note: "Good for flexible plans.",
    source: "built-in",
  },
  {
    hanzi: "\u660e\u5929\u6709\u7a7a\u55ce\uff1f",
    pinyin: "m\u00edng ti\u0101n y\u01d2u k\u00f2ng ma?",
    meaning: "Are you free tomorrow?",
    note: "A simple way to make plans.",
    source: "built-in",
  },
  {
    hanzi: "\u6211\u5f88\u60f3\u4f60",
    pinyin: "w\u01d2 h\u011bn xi\u01ceng n\u01d0",
    meaning: "I miss you a lot.",
    note: "Sweet, direct, and easy to remember.",
    source: "built-in",
  },
  {
    hanzi: "\u8f9b\u82e6\u4e86",
    pinyin: "x\u012bn k\u01d4 le",
    meaning: "You worked hard.",
    note: "A caring phrase after someone puts in effort.",
    source: "built-in",
  },
];

const CHALLENGE_TYPES = [
  {
    kind: "picture",
    label: "New Word",
    prompt: (phrase) => `Which one of these is "${phrase.meaning.replace(/[.?]/g, "")}"?`,
  },
  {
    kind: "builder",
    label: "Build Sentence",
    prompt: () => "Write this in English",
  },
  {
    kind: "choice",
    label: "Meaning Match",
    prompt: (phrase) => phrase.meaning,
    optionTitle: (phrase) => phrase.hanzi,
    optionMeta: (phrase) => phrase.pinyin || phrase.note || "Custom practice",
  },
  {
    kind: "choice",
    label: "Phrase Match",
    prompt: (phrase) => phrase.hanzi,
    optionTitle: (phrase) => phrase.meaning,
    optionMeta: (phrase) => phrase.pinyin || phrase.note || "Custom practice",
  },
  {
    kind: "choice",
    label: "Listening Round",
    prompt: () => "Listen, then choose the phrase.",
    optionTitle: (phrase) => phrase.hanzi,
    optionMeta: (phrase) => phrase.meaning,
    shouldSpeak: true,
  },
];

const state = {
  activeUnitId: "morning",
  answered: false,
  builderSelection: [],
  challenge: null,
  progress: loadProgress(),
  round: 0,
  selectedAnswer: null,
};

const elements = {
  answerGrid: document.querySelector("#answer-grid"),
  challengePrompt: document.querySelector("#challenge-prompt"),
  challengeType: document.querySelector("#challenge-type"),
  closeLesson: document.querySelector("#close-lesson"),
  closeCustomForm: document.querySelector("#close-custom-form"),
  continueButton: document.querySelector("#continue-button"),
  customCategory: document.querySelector("#custom-category"),
  customForm: document.querySelector("#custom-form"),
  customHanzi: document.querySelector("#custom-hanzi"),
  customId: document.querySelector("#custom-id"),
  customMeaning: document.querySelector("#custom-meaning"),
  customNote: document.querySelector("#custom-note"),
  customPinyin: document.querySelector("#custom-pinyin"),
  customSheet: document.querySelector("#custom-sheet"),
  exportCustom: document.querySelector("#export-custom"),
  feedbackText: document.querySelector("#feedback-text"),
  heartValue: document.querySelector("#heart-value"),
  importCustomFile: document.querySelector("#import-custom-file"),
  lessonHeartValue: document.querySelector("#lesson-heart-value"),
  lessonProgressFill: document.querySelector("#lesson-progress-fill"),
  masteryLabel: document.querySelector("#mastery-label"),
  openCustomForm: document.querySelector("#open-custom-form"),
  phraseGrid: document.querySelector("#phrase-grid"),
  playAudio: document.querySelector("#play-audio"),
  progressFill: document.querySelector("#progress-fill"),
  resetProgress: document.querySelector("#reset-progress"),
  rewardCharms: document.querySelector("#reward-charms"),
  saveAnother: document.querySelector("#save-another"),
  savePracticeNow: document.querySelector("#save-practice-now"),
  streakValue: document.querySelector("#streak-value"),
  unitDescription: document.querySelector("#unit-description"),
  unitList: document.querySelector("#unit-list"),
  unitTitle: document.querySelector("#unit-title"),
  xpValue: document.querySelector("#xp-value"),
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      || JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));

    return normalizeProgress(saved);
  } catch {
    return createFreshProgress();
  }
}

function normalizeProgress(saved) {
  if (!saved) {
    return createFreshProgress();
  }

  return {
    completedUnits: Array.isArray(saved.completedUnits) ? saved.completedUnits : [],
    customPhrases: Array.isArray(saved.customPhrases) ? saved.customPhrases.map(normalizeCustomPhrase).filter(Boolean) : [],
    hearts: Number(saved.hearts) || HEARTS_PER_RUN,
    mastered: Array.isArray(saved.mastered) ? saved.mastered : [],
    streak: Number(saved.streak) || 0,
    xp: Number(saved.xp) || 0,
  };
}

function createFreshProgress() {
  return {
    completedUnits: [],
    customPhrases: [],
    hearts: HEARTS_PER_RUN,
    mastered: [],
    streak: 0,
    xp: 0,
  };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function getUnits() {
  return [
    ...BASE_UNITS,
    {
      id: CUSTOM_UNIT_ID,
      title: "My Practice",
      description: "Daily-life terms you add from real conversations.",
      icon: "+",
      isCustom: true,
    },
  ];
}

function getAllPhrases() {
  return [
    ...BASE_PHRASES,
    ...state.progress.customPhrases,
  ];
}

function getActiveUnit() {
  return getUnits().find((unit) => unit.id === state.activeUnitId) || BASE_UNITS[0];
}

function getUnitPhrases(unit) {
  if (unit.isCustom) {
    return state.progress.customPhrases;
  }

  return unit.phraseIndexes.map((index) => BASE_PHRASES[index]);
}

function createChallenge() {
  const unit = getActiveUnit();
  const unitPhrases = getUnitPhrases(unit);

  if (unitPhrases.length === 0) {
    state.answered = false;
    state.challenge = null;
    state.selectedAnswer = null;
    render();
    return;
  }

  const phrase = unitPhrases[state.round % unitPhrases.length];
  const type = CHALLENGE_TYPES[state.round % CHALLENGE_TYPES.length];
  const options = createOptions(phrase);
  const builderTokens = type.kind === "builder" ? getBuilderTokens(phrase) : [];

  state.answered = false;
  state.builderSelection = [];
  state.challenge = { builderTokens, options, phrase, type };
  state.selectedAnswer = null;
  render();

  if (type.shouldSpeak) {
    speakPhrase(phrase);
  }
}

function createOptions(phrase) {
  const distractors = shuffle(getAllPhrases().filter((item) => item.id !== phrase.id && item.hanzi !== phrase.hanzi));
  return shuffle([phrase, ...distractors.slice(0, 3)]);
}

function render() {
  renderStatus();
  renderHero();
  renderUnits();
  renderChallenge();
  renderPhraseBank();
  renderRewards();
}

function renderStatus() {
  elements.xpValue.textContent = state.progress.xp;
  elements.streakValue.textContent = state.progress.streak;
  elements.heartValue.textContent = "\u2665".repeat(state.progress.hearts).padEnd(HEARTS_PER_RUN, "\u2661");
  elements.lessonHeartValue.textContent = `\u2665 ${state.progress.hearts}`;
}

function renderHero() {
  const unit = getActiveUnit();
  const unitRoundCount = getRoundCountForUnit(unit);
  const progress = Math.min(100, Math.round((state.round / unitRoundCount) * 100));

  elements.unitTitle.textContent = unit.title;
  elements.unitDescription.textContent = unit.description;
  elements.progressFill.style.width = `${progress}%`;
  elements.lessonProgressFill.style.width = `${progress}%`;
}

function getRoundCountForUnit(unit) {
  if (unit.isCustom) {
    return Math.max(1, Math.min(ROUNDS_PER_UNIT, state.progress.customPhrases.length));
  }

  return ROUNDS_PER_UNIT;
}

function renderUnits() {
  elements.unitList.innerHTML = getUnits().map((unit) => {
    const isActive = unit.id === state.activeUnitId;
    const isComplete = state.progress.completedUnits.includes(unit.id);
    const score = getUnitScore(unit, isComplete);

    return `
      <button class="unit-button ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}" type="button" data-unit="${unit.id}">
        <span class="unit-icon">${unit.icon}</span>
        <span>
          <strong>${unit.title}</strong>
          <span>${unit.description}</span>
        </span>
        <span class="unit-score">${score}</span>
      </button>
    `;
  }).join("");
}

function getUnitScore(unit, isComplete) {
  if (unit.isCustom) {
    return state.progress.customPhrases.length ? `${state.progress.customPhrases.length} saved` : "Add";
  }

  return isComplete ? "Done" : `${unit.phraseIndexes.length} cards`;
}

function renderChallenge() {
  if (!state.challenge) {
    renderEmptyChallenge();
    return;
  }

  const { options, phrase, type } = state.challenge;

  elements.challengeType.textContent = type.label;
  elements.challengePrompt.textContent = type.prompt(phrase);
  elements.continueButton.hidden = !state.answered;
  elements.playAudio.hidden = !type.shouldSpeak;

  if (type.kind === "picture") {
    renderPictureChallenge(options, phrase);
    return;
  }

  if (type.kind === "builder") {
    renderBuilderChallenge(phrase);
    return;
  }

  elements.answerGrid.className = "answer-grid";
  elements.answerGrid.innerHTML = options.map((option) => renderAnswerButton(option, phrase, type)).join("");
}

function renderPictureChallenge(options, phrase) {
  elements.answerGrid.className = "answer-grid is-picture-grid";
  elements.answerGrid.innerHTML = options.slice(0, 3).map((option, index) => {
    const isCorrect = getPhraseKey(option) === getPhraseKey(phrase);
    const isSelected = state.selectedAnswer === getPhraseKey(option);
    const resultClass = getAnswerClass(isCorrect, isSelected);

    return `
      <button class="answer-button picture-card ${resultClass}" type="button" data-answer="${getPhraseKey(option)}">
        <span class="picture-art">${getPhraseArt(option)}</span>
        <span class="choice-footer">
          <strong>${option.hanzi}</strong>
          <span class="choice-key">${index + 1}</span>
        </span>
        <span>${option.pinyin || option.meaning}</span>
      </button>
    `;
  }).join("");
}

function renderBuilderChallenge(phrase) {
  const tokens = state.challenge.builderTokens;
  const selected = state.builderSelection.map((token, index) => `
    <button class="selected-token" type="button" data-remove-token="${index}">${token}</button>
  `).join("");
  const tokenButtons = tokens.map((token, index) => {
    const used = state.builderSelection.includes(token);

    return `<button class="word-token" type="button" data-token-index="${index}" ${used ? "disabled" : ""}>${token}</button>`;
  }).join("");

  elements.answerGrid.className = "answer-grid is-builder-grid";
  elements.answerGrid.innerHTML = `
    <div class="builder-scene">
      <div class="speaker-mascot">${getSpeakerMascot()}</div>
      <button class="speech-bubble" type="button" data-play-builder>
        <span>Audio</span>
        <strong>${phrase.hanzi}</strong>
      </button>
    </div>
    <div class="builder-line">${selected}</div>
    <div class="token-bank">${tokenButtons}</div>
    <button class="builder-check" type="button" data-check-builder>Check</button>
  `;
}

function renderEmptyChallenge() {
  elements.challengeType.textContent = "Custom Quest";
  elements.challengePrompt.textContent = "Add a term to start practicing.";
  elements.continueButton.hidden = true;
  elements.playAudio.hidden = true;
  elements.answerGrid.innerHTML = `
    <div class="empty-state">
      <h2>No custom terms yet</h2>
      <p>Add a word or phrase you noticed in daily life, then practice it here.</p>
      <button class="primary-button" type="button" data-open-custom-empty>+ Add Practice</button>
    </div>
  `;
}

function renderAnswerButton(option, phrase, type) {
  const isCorrect = option.id ? option.id === phrase.id : option.hanzi === phrase.hanzi;
  const isSelected = state.selectedAnswer === getPhraseKey(option);
  const resultClass = getAnswerClass(isCorrect, isSelected);

  return `
    <button class="answer-button ${resultClass}" type="button" data-answer="${getPhraseKey(option)}">
      <strong>${type.optionTitle(option)}</strong>
      <span>${type.optionMeta(option)}</span>
    </button>
  `;
}

function getAnswerClass(isCorrect, isSelected) {
  if (!state.answered) {
    return "";
  }

  if (isCorrect) {
    return "is-correct";
  }

  return isSelected ? "is-wrong" : "";
}

function renderPhraseBank() {
  const allPhrases = getAllPhrases();
  const customCount = state.progress.customPhrases.length;
  const masteredCount = state.progress.mastered.length;

  elements.masteryLabel.textContent = `${masteredCount} mastered | ${customCount} custom`;
  elements.phraseGrid.innerHTML = allPhrases.map(renderPhraseCard).join("");
}

function renderPhraseCard(phrase) {
  const isMastered = state.progress.mastered.includes(getPhraseKey(phrase)) || state.progress.mastered.includes(phrase.hanzi);
  const customActions = phrase.source === "custom" ? `
    <div class="phrase-actions">
      <button class="phrase-action" type="button" data-edit-custom="${phrase.id}">Edit</button>
      <button class="phrase-action" type="button" data-delete-custom="${phrase.id}">Delete</button>
    </div>
  ` : "";

  return `
    <article class="phrase-card">
      <strong>${phrase.hanzi}</strong>
      <span>${phrase.pinyin || phrase.category || "Custom"}</span>
      <small>${phrase.meaning}${isMastered ? " Mastered." : ""}</small>
      ${customActions}
    </article>
  `;
}

function renderRewards() {
  const charmCount = Math.min(18, Math.max(4, state.progress.xp / 10 + state.progress.customPhrases.length + 3));
  const charms = Array.from({ length: charmCount }, (_, index) => {
    const x = 40 + ((index * 64) % 440);
    const y = 276 + Math.floor(index / 8) * 18 + (index % 2) * 6;
    const color = index % 2 ? "#f38ccf" : "#ffd45f";

    return `
      <g class="reward-charm" transform="translate(${x} ${y})">
        <path d="M0 0 C-2 -14 -2 -26 0 -36" stroke="#d8b9ec" stroke-width="5" stroke-linecap="round" fill="none" />
        <path d="M0 -56 l7 14 16 2 -12 10 3 16 -14 -8 -14 8 3 -16 -12 -10 16 -2 Z" fill="${color}" stroke="#fff7ff" stroke-width="3" />
      </g>
    `;
  });

  elements.rewardCharms.innerHTML = charms.join("");
}

function getBuilderTokens(phrase) {
  const correctTokens = getCorrectBuilderTokens(phrase);
  const distractors = ["please", "now", "tea", "with", "soon", "very"].filter((token) => !correctTokens.includes(token));

  return shuffle([...correctTokens, ...shuffle(distractors).slice(0, 2)]);
}

function getCorrectBuilderTokens(phrase) {
  return phrase.meaning
    .replace(/[.?]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function addBuilderToken(tokenIndex) {
  if (state.answered || !state.challenge) {
    return;
  }

  const token = state.challenge.builderTokens[Number(tokenIndex)];

  if (token && !state.builderSelection.includes(token)) {
    state.builderSelection.push(token);
    renderChallenge();
  }
}

function removeBuilderToken(tokenIndex) {
  if (state.answered) {
    return;
  }

  state.builderSelection.splice(Number(tokenIndex), 1);
  renderChallenge();
}

function checkBuilderAnswer() {
  if (state.answered || !state.challenge) {
    return;
  }

  const { phrase } = state.challenge;
  const correct = getCorrectBuilderTokens(phrase).join(" ").toLowerCase();
  const answer = state.builderSelection.join(" ").toLowerCase();

  state.answered = true;
  state.selectedAnswer = answer === correct ? getPhraseKey(phrase) : "builder-wrong";

  if (answer === correct) {
    handleCorrectAnswer(phrase);
  } else {
    handleWrongAnswer(phrase);
  }

  saveProgress();
  render();
}

function getPhraseArt(phrase) {
  const text = `${phrase.meaning} ${phrase.category || ""}`.toLowerCase();

  if (text.includes("water") || text.includes("drink")) {
    return getWaterArt();
  }

  if (text.includes("eat") || text.includes("delicious") || text.includes("food")) {
    return getFoodArt();
  }

  if (text.includes("morning") || text.includes("tomorrow") || text.includes("free")) {
    return getSunArt();
  }

  if (text.includes("miss") || text.includes("worked") || text.includes("help")) {
    return getHeartArt();
  }

  if (text.includes("tired")) {
    return getPillowArt();
  }

  if (text.includes("back") || text.includes("later") || text.includes("meet")) {
    return getClockArt();
  }

  return getSparkleArt();
}

function getFoodArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <path d="M35 100 C39 59 71 43 116 55 C143 62 157 79 156 103 C121 118 71 120 35 100 Z" fill="#f6b54f" />
      <path d="M53 88 C70 58 112 48 141 72" fill="none" stroke="#6ed04c" stroke-width="15" stroke-linecap="round" />
      <circle cx="92" cy="58" r="16" fill="#ff5b69" />
      <circle cx="124" cy="70" r="16" fill="#8fe044" />
      <path d="M36 100 C40 70 64 60 89 73 C64 76 52 87 48 108 Z" fill="#7a4a2b" />
      <rect x="69" y="92" width="40" height="18" rx="9" fill="#dc8f32" />
      <rect x="114" y="102" width="44" height="18" rx="9" fill="#dc8f32" />
    </svg>
  `;
}

function getWaterArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <path d="M58 42 H126 L115 124 H69 Z" fill="#c8f4ff" stroke="#f6ffff" stroke-width="7" />
      <path d="M67 84 H117 L112 124 H73 Z" fill="#5fd1ff" />
      <path d="M79 61 C91 50 105 50 117 61" fill="none" stroke="#7b42b4" stroke-width="8" stroke-linecap="round" />
      <circle cx="110" cy="78" r="7" fill="#f38ccf" />
    </svg>
  `;
}

function getSunArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <circle cx="90" cy="70" r="34" fill="#ffd45f" />
      <path d="M43 112 C64 91 116 91 137 112" fill="none" stroke="#fff7ff" stroke-width="14" stroke-linecap="round" />
      <path d="M54 118 H126" stroke="#f38ccf" stroke-width="10" stroke-linecap="round" />
      <circle cx="78" cy="65" r="5" fill="#42215f" />
      <circle cx="102" cy="65" r="5" fill="#42215f" />
    </svg>
  `;
}

function getHeartArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <path d="M90 124 C47 93 33 65 50 45 C65 27 85 39 90 55 C95 39 115 27 130 45 C147 65 133 93 90 124 Z" fill="#ff5b9d" />
      <path d="M68 83 C82 94 99 94 113 83" fill="none" stroke="#fff7ff" stroke-width="8" stroke-linecap="round" />
      <circle cx="76" cy="67" r="5" fill="#42215f" />
      <circle cx="105" cy="67" r="5" fill="#42215f" />
    </svg>
  `;
}

function getPillowArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <rect x="42" y="50" width="96" height="58" rx="22" fill="#d8b9ec" stroke="#fff7ff" stroke-width="7" />
      <path d="M62 75 H118" stroke="#7b42b4" stroke-width="8" stroke-linecap="round" />
      <text x="120" y="45" fill="#ffd45f" font-size="28" font-weight="900">Z</text>
      <text x="140" y="32" fill="#ffd45f" font-size="20" font-weight="900">Z</text>
    </svg>
  `;
}

function getClockArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <circle cx="90" cy="78" r="44" fill="#fff7ff" stroke="#7b42b4" stroke-width="10" />
      <path d="M90 78 V50 M90 78 H116" stroke="#42215f" stroke-width="8" stroke-linecap="round" />
      <path d="M60 33 L45 20 M120 33 L135 20" stroke="#f38ccf" stroke-width="9" stroke-linecap="round" />
      <circle cx="90" cy="78" r="6" fill="#f38ccf" />
    </svg>
  `;
}

function getSparkleArt() {
  return `
    <svg viewBox="0 0 180 150" aria-hidden="true">
      <path d="M90 23 l14 37 39 5 -29 25 8 38 -32 -20 -32 20 8 -38 -29 -25 39 -5 Z" fill="#ffd45f" stroke="#fff7ff" stroke-width="6" />
      <circle cx="78" cy="74" r="5" fill="#42215f" />
      <circle cx="102" cy="74" r="5" fill="#42215f" />
      <path d="M80 91 C87 97 95 97 102 91" fill="none" stroke="#42215f" stroke-width="5" stroke-linecap="round" />
    </svg>
  `;
}

function getSpeakerMascot() {
  return `
    <svg viewBox="0 0 180 210" aria-hidden="true">
      <path d="M61 82 C42 39 41 18 58 11 C73 25 83 52 86 79 Z" fill="#20142d" />
      <path d="M103 79 C109 51 120 25 136 11 C151 19 145 42 122 82 Z" fill="#20142d" />
      <path d="M55 77 C67 55 116 55 128 78 C151 116 135 169 92 169 C49 169 32 116 55 77 Z" fill="#241834" />
      <ellipse cx="92" cy="107" rx="36" ry="31" fill="#fff2fb" />
      <circle cx="77" cy="104" r="5" fill="#21152e" />
      <circle cx="107" cy="104" r="5" fill="#21152e" />
      <path d="M85 121 C89 125 95 125 99 121" fill="none" stroke="#21152e" stroke-width="4" stroke-linecap="round" />
      <path d="M76 72 l10 8 12 -8 12 8 10 -8 -5 23 H81 Z" fill="#f38ccf" />
      <circle cx="98" cy="82" r="7" fill="#fff2fb" />
      <path d="M58 151 C72 192 116 192 130 151" fill="#7de0ff" />
    </svg>
  `;
}

function handleAnswer(answer) {
  if (state.answered || !state.challenge) {
    return;
  }

  const { phrase } = state.challenge;
  const isCorrect = answer === getPhraseKey(phrase);

  state.answered = true;
  state.selectedAnswer = answer;

  if (isCorrect) {
    handleCorrectAnswer(phrase);
  } else {
    handleWrongAnswer(phrase);
  }

  saveProgress();
  render();
}

function handleCorrectAnswer(phrase) {
  state.progress.xp += phrase.source === "custom" ? 12 : 10;
  state.progress.streak += 1;

  if (!state.progress.mastered.includes(getPhraseKey(phrase))) {
    state.progress.mastered.push(getPhraseKey(phrase));
  }

  elements.feedbackText.textContent = `Correct. ${phrase.hanzi} means "${phrase.meaning}"`;
}

function handleWrongAnswer(phrase) {
  state.progress.hearts = Math.max(0, state.progress.hearts - 1);
  state.progress.streak = 0;
  elements.feedbackText.textContent = `Almost. The answer is ${phrase.hanzi}: ${phrase.meaning}`;
}

function continueLesson() {
  if (state.progress.hearts === 0) {
    state.progress.hearts = HEARTS_PER_RUN;
    state.round = 0;
    elements.feedbackText.textContent = "Hearts refilled. Try this quest again.";
    saveProgress();
    createChallenge();
    return;
  }

  state.round += 1;

  if (state.round >= getRoundCountForUnit(getActiveUnit())) {
    completeUnit();
    return;
  }

  elements.feedbackText.textContent = "Choose the best answer to charge the next charm.";
  createChallenge();
}

function completeUnit() {
  const unit = getActiveUnit();

  if (!state.progress.completedUnits.includes(unit.id)) {
    state.progress.completedUnits.push(unit.id);
    state.progress.xp += unit.isCustom ? 15 : 25;
  }

  state.round = 0;
  state.progress.hearts = HEARTS_PER_RUN;
  elements.feedbackText.textContent = `${unit.title} cleared. Pick the next quest.`;
  saveProgress();
  render();
}

function selectUnit(unitId) {
  state.activeUnitId = unitId;
  state.round = 0;

  if (unitId === CUSTOM_UNIT_ID && state.progress.customPhrases.length === 0) {
    elements.feedbackText.textContent = "Add your first custom term to start My Practice.";
    openCustomForm();
  } else {
    elements.feedbackText.textContent = "New quest loaded. Choose the best answer.";
  }

  createChallenge();
}

function resetProgress() {
  const customPhrases = state.progress.customPhrases;

  state.progress = createFreshProgress();
  state.progress.customPhrases = customPhrases;
  state.round = 0;
  state.activeUnitId = "morning";
  elements.feedbackText.textContent = "Progress reset. Custom list kept safe.";
  saveProgress();
  createChallenge();
}

function openCustomForm(phrase = null) {
  elements.customSheet.hidden = false;
  elements.customId.value = phrase?.id || "";
  elements.customHanzi.value = phrase?.hanzi || "";
  elements.customMeaning.value = phrase?.meaning || "";
  elements.customPinyin.value = phrase?.pinyin || "";
  elements.customCategory.value = phrase?.category || "daily";
  elements.customNote.value = phrase?.note || "";
  elements.customHanzi.focus();
}

function closeCustomForm() {
  elements.customSheet.hidden = true;
  elements.customForm.reset();
  elements.customId.value = "";
}

function saveCustomPhrase({ practiceNow }) {
  if (!elements.customForm.reportValidity()) {
    return;
  }

  const phrase = buildCustomPhraseFromForm();

  if (!phrase) {
    return;
  }

  upsertCustomPhrase(phrase);
  state.progress.completedUnits = state.progress.completedUnits.filter((unitId) => unitId !== CUSTOM_UNIT_ID);
  saveProgress();

  if (practiceNow) {
    closeCustomForm();
    selectUnit(CUSTOM_UNIT_ID);
    return;
  }

  elements.feedbackText.textContent = `${phrase.hanzi} saved. Add another term when you spot one.`;
  elements.customForm.reset();
  elements.customId.value = "";
  render();
  elements.customHanzi.focus();
}

function buildCustomPhraseFromForm() {
  const hanzi = elements.customHanzi.value.trim();
  const meaning = elements.customMeaning.value.trim();

  if (!hanzi || !meaning) {
    return null;
  }

  return normalizeCustomPhrase({
    category: elements.customCategory.value,
    hanzi,
    id: elements.customId.value || createId(),
    meaning,
    note: elements.customNote.value.trim(),
    pinyin: elements.customPinyin.value.trim(),
    source: "custom",
  });
}

function upsertCustomPhrase(phrase) {
  const existingIndex = state.progress.customPhrases.findIndex((item) => item.id === phrase.id);

  if (existingIndex >= 0) {
    state.progress.customPhrases[existingIndex] = phrase;
    return;
  }

  state.progress.customPhrases.push(phrase);
}

function editCustomPhrase(id) {
  const phrase = state.progress.customPhrases.find((item) => item.id === id);

  if (phrase) {
    openCustomForm(phrase);
  }
}

function deleteCustomPhrase(id) {
  const phrase = state.progress.customPhrases.find((item) => item.id === id);

  if (!phrase || !window.confirm(`Delete "${phrase.hanzi}" from custom practice?`)) {
    return;
  }

  state.progress.customPhrases = state.progress.customPhrases.filter((item) => item.id !== id);
  state.progress.mastered = state.progress.mastered.filter((item) => item !== id);
  state.progress.completedUnits = state.progress.completedUnits.filter((unitId) => unitId !== CUSTOM_UNIT_ID);

  if (state.activeUnitId === CUSTOM_UNIT_ID) {
    state.round = 0;
  }

  elements.feedbackText.textContent = `${phrase.hanzi} deleted from custom practice.`;
  saveProgress();
  createChallenge();
}

function exportCustomPhrases() {
  const payload = {
    app: "kuromi-mandarin-quest",
    exportedAt: new Date().toISOString(),
    version: 1,
    customPhrases: state.progress.customPhrases,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `kuromi-mandarin-custom-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importCustomPhrases(file) {
  if (!file) {
    return;
  }

  try {
    const payload = JSON.parse(await file.text());
    const imported = parseImportedPhrases(payload);
    const beforeCount = state.progress.customPhrases.length;

    imported.forEach(upsertImportedPhrase);
    state.progress.completedUnits = state.progress.completedUnits.filter((unitId) => unitId !== CUSTOM_UNIT_ID);
    saveProgress();
    createChallenge();

    elements.feedbackText.textContent = `Imported ${state.progress.customPhrases.length - beforeCount} new custom terms.`;
  } catch {
    elements.feedbackText.textContent = "Import failed. Please choose a valid custom practice JSON file.";
  } finally {
    elements.importCustomFile.value = "";
  }
}

function parseImportedPhrases(payload) {
  const source = Array.isArray(payload) ? payload : payload.customPhrases;

  if (!Array.isArray(source)) {
    throw new Error("Invalid import file");
  }

  return source.map(normalizeCustomPhrase).filter(Boolean);
}

function upsertImportedPhrase(phrase) {
  const duplicate = state.progress.customPhrases.find((item) => (
    item.id === phrase.id
    || (item.hanzi === phrase.hanzi && item.meaning === phrase.meaning)
  ));

  if (duplicate) {
    upsertCustomPhrase({ ...phrase, id: duplicate.id });
    return;
  }

  upsertCustomPhrase(phrase);
}

function normalizeCustomPhrase(phrase) {
  if (!phrase?.hanzi || !phrase?.meaning) {
    return null;
  }

  return {
    category: String(phrase.category || "daily"),
    hanzi: String(phrase.hanzi).trim(),
    id: String(phrase.id || createId()),
    meaning: String(phrase.meaning).trim(),
    note: String(phrase.note || "").trim(),
    pinyin: String(phrase.pinyin || "").trim(),
    source: "custom",
  };
}

function getPhraseKey(phrase) {
  return phrase.id || phrase.hanzi;
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function speakPhrase(phrase) {
  if (!("speechSynthesis" in window)) {
    elements.feedbackText.textContent = "Pronunciation is not available in this browser.";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(phrase.hanzi);
  utterance.lang = "zh-TW";
  utterance.rate = 0.82;

  window.speechSynthesis.speak(utterance);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

elements.answerGrid.addEventListener("click", (event) => {
  const emptyButton = event.target.closest("[data-open-custom-empty]");
  const answerButton = event.target.closest("[data-answer]");
  const builderPlayButton = event.target.closest("[data-play-builder]");
  const builderCheckButton = event.target.closest("[data-check-builder]");
  const removeTokenButton = event.target.closest("[data-remove-token]");
  const tokenButton = event.target.closest("[data-token-index]");

  if (emptyButton) {
    openCustomForm();
    return;
  }

  if (builderPlayButton && state.challenge) {
    speakPhrase(state.challenge.phrase);
    return;
  }

  if (builderCheckButton) {
    checkBuilderAnswer();
    return;
  }

  if (removeTokenButton) {
    removeBuilderToken(removeTokenButton.dataset.removeToken);
    return;
  }

  if (tokenButton) {
    addBuilderToken(tokenButton.dataset.tokenIndex);
    return;
  }

  if (answerButton) {
    handleAnswer(answerButton.dataset.answer);
  }
});

elements.closeCustomForm.addEventListener("click", closeCustomForm);
elements.closeLesson.addEventListener("click", () => {
  state.round = 0;
  elements.feedbackText.textContent = "Lesson paused. Pick any quest to continue.";
  saveProgress();
  render();
});
elements.continueButton.addEventListener("click", continueLesson);
elements.customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveCustomPhrase({ practiceNow: true });
});
elements.customSheet.addEventListener("click", (event) => {
  if (event.target === elements.customSheet) {
    closeCustomForm();
  }
});
elements.exportCustom.addEventListener("click", exportCustomPhrases);
elements.importCustomFile.addEventListener("change", (event) => importCustomPhrases(event.target.files[0]));
elements.openCustomForm.addEventListener("click", () => openCustomForm());
elements.phraseGrid.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-custom]");
  const deleteButton = event.target.closest("[data-delete-custom]");

  if (editButton) {
    editCustomPhrase(editButton.dataset.editCustom);
  }

  if (deleteButton) {
    deleteCustomPhrase(deleteButton.dataset.deleteCustom);
  }
});
elements.playAudio.addEventListener("click", () => {
  if (state.challenge) {
    speakPhrase(state.challenge.phrase);
  }
});
elements.resetProgress.addEventListener("click", resetProgress);
elements.saveAnother.addEventListener("click", () => saveCustomPhrase({ practiceNow: false }));
elements.unitList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-unit]");

  if (button) {
    selectUnit(button.dataset.unit);
  }
});

createChallenge();
