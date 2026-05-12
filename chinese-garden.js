const STORAGE_KEY = "kuromi-mandarin-quest-v2";
const HEARTS_PER_RUN = 3;
const ROUNDS_PER_UNIT = 4;

const UNITS = [
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

const PHRASES = [
  { hanzi: "\u65e9\u5b89", pinyin: "z\u01ceo \u0101n", meaning: "Good morning.", note: "A warm everyday greeting." },
  { hanzi: "\u4f60\u4eca\u5929\u904e\u5f97\u600e\u9ebc\u6a23\uff1f", pinyin: "n\u01d0 j\u012bn ti\u0101n gu\u00f2 de z\u011bn me y\u00e0ng?", meaning: "How was your day today?", note: "Useful for checking in after work or class." },
  { hanzi: "\u6211\u6709\u9ede\u7d2f", pinyin: "w\u01d2 y\u01d2u di\u01cen l\u00e8i", meaning: "I am a little tired.", note: "A natural way to soften how you feel." },
  { hanzi: "\u53ef\u4ee5\u5e6b\u6211\u4e00\u4e0b\u55ce\uff1f", pinyin: "k\u011b y\u01d0 b\u0101ng w\u01d2 y\u012b xi\u00e0 ma?", meaning: "Could you help me for a moment?", note: "Polite and common for small favors." },
  { hanzi: "\u6211\u60f3\u559d\u6c34", pinyin: "w\u01d2 xi\u01ceng h\u0113 shu\u01d0", meaning: "I want to drink water.", note: "Swap water for tea, coffee, or juice." },
  { hanzi: "\u9019\u500b\u5f88\u597d\u5403", pinyin: "zh\u00e8 ge h\u011bn h\u01ceo ch\u012b", meaning: "This is delicious.", note: "A happy phrase for meals and snacks." },
  { hanzi: "\u4f60\u60f3\u5403\u4ec0\u9ebc\uff1f", pinyin: "n\u01d0 xi\u01ceng ch\u012b sh\u00e9n me?", meaning: "What do you want to eat?", note: "The most important daily planning question." },
  { hanzi: "\u6211\u7b49\u4e00\u4e0b\u56de\u4f86", pinyin: "w\u01d2 d\u011bng y\u012b xi\u00e0 hu\u00ed l\u00e1i", meaning: "I will come back in a bit.", note: "Casual and useful when stepping away." },
  { hanzi: "\u6211\u5011\u665a\u4e00\u9ede\u898b", pinyin: "w\u01d2 men w\u01cen y\u012b di\u01cen ji\u00e0n", meaning: "We will meet a little later.", note: "Good for flexible plans." },
  { hanzi: "\u660e\u5929\u6709\u7a7a\u55ce\uff1f", pinyin: "m\u00edng ti\u0101n y\u01d2u k\u00f2ng ma?", meaning: "Are you free tomorrow?", note: "A simple way to make plans." },
  { hanzi: "\u6211\u5f88\u60f3\u4f60", pinyin: "w\u01d2 h\u011bn xi\u01ceng n\u01d0", meaning: "I miss you a lot.", note: "Sweet, direct, and easy to remember." },
  { hanzi: "\u8f9b\u82e6\u4e86", pinyin: "x\u012bn k\u01d4 le", meaning: "You worked hard.", note: "A caring phrase after someone puts in effort." },
];

const CHALLENGE_TYPES = [
  {
    label: "Meaning Match",
    prompt: (phrase) => phrase.meaning,
    optionTitle: (phrase) => phrase.hanzi,
    optionMeta: (phrase) => phrase.pinyin,
  },
  {
    label: "Phrase Match",
    prompt: (phrase) => phrase.hanzi,
    optionTitle: (phrase) => phrase.meaning,
    optionMeta: (phrase) => phrase.pinyin,
  },
  {
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
  challenge: null,
  progress: loadProgress(),
  round: 0,
  selectedAnswer: null,
};

const elements = {
  answerGrid: document.querySelector("#answer-grid"),
  challengePrompt: document.querySelector("#challenge-prompt"),
  challengeType: document.querySelector("#challenge-type"),
  continueButton: document.querySelector("#continue-button"),
  feedbackText: document.querySelector("#feedback-text"),
  heartValue: document.querySelector("#heart-value"),
  masteryLabel: document.querySelector("#mastery-label"),
  phraseGrid: document.querySelector("#phrase-grid"),
  playAudio: document.querySelector("#play-audio"),
  progressFill: document.querySelector("#progress-fill"),
  resetProgress: document.querySelector("#reset-progress"),
  rewardCharms: document.querySelector("#reward-charms"),
  streakValue: document.querySelector("#streak-value"),
  unitDescription: document.querySelector("#unit-description"),
  unitList: document.querySelector("#unit-list"),
  unitTitle: document.querySelector("#unit-title"),
  xpValue: document.querySelector("#xp-value"),
};

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    return {
      completedUnits: Array.isArray(saved?.completedUnits) ? saved.completedUnits : [],
      hearts: Number(saved?.hearts) || HEARTS_PER_RUN,
      mastered: Array.isArray(saved?.mastered) ? saved.mastered : [],
      streak: Number(saved?.streak) || 0,
      xp: Number(saved?.xp) || 0,
    };
  } catch {
    return createFreshProgress();
  }
}

function createFreshProgress() {
  return {
    completedUnits: [],
    hearts: HEARTS_PER_RUN,
    mastered: [],
    streak: 0,
    xp: 0,
  };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function getActiveUnit() {
  return UNITS.find((unit) => unit.id === state.activeUnitId) || UNITS[0];
}

function getUnitPhrases(unit) {
  return unit.phraseIndexes.map((index) => PHRASES[index]);
}

function createChallenge() {
  const unit = getActiveUnit();
  const unitPhrases = getUnitPhrases(unit);
  const phrase = unitPhrases[state.round % unitPhrases.length];
  const type = CHALLENGE_TYPES[state.round % CHALLENGE_TYPES.length];
  const options = shuffle([
    phrase,
    ...shuffle(PHRASES.filter((item) => item.hanzi !== phrase.hanzi)).slice(0, 3),
  ]);

  state.answered = false;
  state.challenge = { options, phrase, type };
  state.selectedAnswer = null;
  render();

  if (type.shouldSpeak) {
    speakPhrase(phrase);
  }
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
}

function renderHero() {
  const unit = getActiveUnit();
  const progress = Math.min(100, Math.round((state.round / ROUNDS_PER_UNIT) * 100));

  elements.unitTitle.textContent = unit.title;
  elements.unitDescription.textContent = unit.description;
  elements.progressFill.style.width = `${progress}%`;
}

function renderUnits() {
  elements.unitList.innerHTML = UNITS.map((unit) => {
    const isActive = unit.id === state.activeUnitId;
    const isComplete = state.progress.completedUnits.includes(unit.id);
    const score = isComplete ? "Done" : `${unit.phraseIndexes.length} cards`;

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

function renderChallenge() {
  const { options, phrase, type } = state.challenge;

  elements.challengeType.textContent = type.label;
  elements.challengePrompt.textContent = type.prompt(phrase);
  elements.continueButton.hidden = !state.answered;
  elements.playAudio.hidden = !type.shouldSpeak;
  elements.answerGrid.innerHTML = options.map((option) => {
    const isCorrect = option.hanzi === phrase.hanzi;
    const isSelected = state.selectedAnswer === option.hanzi;
    const resultClass = getAnswerClass(isCorrect, isSelected);

    return `
      <button class="answer-button ${resultClass}" type="button" data-answer="${option.hanzi}">
        <strong>${type.optionTitle(option)}</strong>
        <span>${type.optionMeta(option)}</span>
      </button>
    `;
  }).join("");
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
  const masteredCount = state.progress.mastered.length;

  elements.masteryLabel.textContent = `${masteredCount} mastered`;
  elements.phraseGrid.innerHTML = PHRASES.map((phrase) => {
    const isMastered = state.progress.mastered.includes(phrase.hanzi);

    return `
      <article class="phrase-card">
        <strong>${phrase.hanzi}</strong>
        <span>${phrase.pinyin}</span>
        <small>${phrase.meaning}${isMastered ? " Mastered." : ""}</small>
      </article>
    `;
  }).join("");
}

function renderRewards() {
  const charmCount = Math.min(18, Math.max(4, state.progress.xp / 10 + 3));
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

function handleAnswer(answer) {
  if (state.answered) {
    return;
  }

  const { phrase } = state.challenge;
  const isCorrect = answer === phrase.hanzi;

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
  state.progress.xp += 10;
  state.progress.streak += 1;

  if (!state.progress.mastered.includes(phrase.hanzi)) {
    state.progress.mastered.push(phrase.hanzi);
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

  if (state.round >= ROUNDS_PER_UNIT) {
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
    state.progress.xp += 25;
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
  elements.feedbackText.textContent = "New quest loaded. Choose the best answer.";
  createChallenge();
}

function resetProgress() {
  state.progress = createFreshProgress();
  state.round = 0;
  state.activeUnitId = "morning";
  elements.feedbackText.textContent = "Progress reset. Fresh quest, fresh charms.";
  saveProgress();
  createChallenge();
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
  const button = event.target.closest("[data-answer]");

  if (button) {
    handleAnswer(button.dataset.answer);
  }
});

elements.continueButton.addEventListener("click", continueLesson);
elements.playAudio.addEventListener("click", () => speakPhrase(state.challenge.phrase));
elements.resetProgress.addEventListener("click", resetProgress);
elements.unitList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-unit]");

  if (button) {
    selectUnit(button.dataset.unit);
  }
});

createChallenge();
