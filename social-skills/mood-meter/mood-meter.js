"use strict";

const rows = [
  "Enraged|Panicked|Stressed|Jittery|Shocked|Surprised|Upbeat|Festive|Exhilarated|Ecstatic",
  "Livid|Furious|Frustrated|Tense|Stunned|Hyper|Cheerful|Motivated|Inspired|Elated",
  "Fuming|Frightened|Angry|Nervous|Restless|Energized|Lively|Enthusiastic|Optimistic|Excited",
  "Anxious|Apprehensive|Worried|Irritated|Annoyed|Pleased|Happy|Focused|Proud|Thrilled",
  "Repulsed|Troubled|Concerned|Uneasy|Peeved|Pleasant|Joyful|Hopeful|Playful|Blissful",
  "Disgusted|Glum|Disappointed|Down|Apathetic|At ease|Easy going|Content|Loving|Fulfilled",
  "Pessimistic|Morose|Discouraged|Sad|Bored|Calm|Secure|Satisfied|Grateful|Touched",
  "Alienated|Miserable|Lonely|Disheartened|Tired|Relaxed|Chill|Restful|Blessed|Balanced",
  "Despondent|Depressed|Sullen|Exhausted|Fatigued|Mellow|Thoughtful|Peaceful|Comfy|Carefree",
  "Despair|Hopeless|Desolate|Spent|Drained|Sleepy|Complacent|Tranquil|Cozy|Serene"
];
const columnStarts = [211, 380, 549, 718, 887, 1072, 1241, 1410, 1579, 1748];
const rowStarts = [348, 451, 553, 656, 758, 875, 977, 1080, 1183, 1285];
const energyRows = { low: [5, 9], medium: [3, 6], high: [0, 4] };
const feelingColumns = { negative: [0, 4], neutral: [4, 5], positive: [5, 9] };
const situations = [
  {
    image: "A girl grins with her mouth open and both hands in the air.",
    context: "She just found out her class is going on a trip she has been looking forward to.",
    words: ["Excited", "Thrilled", "Ecstatic", "Happy", "Joyful"]
  },
  {
    image: "A boy frowns, pulls his eyebrows together and clenches both fists.",
    context: "Someone knocked over the tower he had spent a long time building.",
    words: ["Angry", "Furious", "Frustrated", "Fuming", "Irritated", "Annoyed"]
  },
  {
    image: "A girl looks down with her shoulders slumped.",
    context: "Her friend could not come to her birthday party.",
    words: ["Sad", "Down", "Disappointed", "Glum", "Lonely"]
  },
  {
    image: "A boy sits with relaxed shoulders and a small smile.",
    context: "He is sitting somewhere quiet during a break.",
    words: ["Calm", "Relaxed", "At ease", "Peaceful", "Content", "Chill", "Mellow"]
  },
  {
    image: "A boy raises his eyebrows and holds his hands together.",
    context: "He is about to speak in front of the class and keeps thinking he might forget his words.",
    words: ["Worried", "Nervous", "Anxious", "Uneasy", "Concerned", "Tense", "Apprehensive"]
  },
  {
    image: "A girl smiles and holds up a medal.",
    context: "She earned a medal after practising for weeks.",
    words: ["Proud", "Happy", "Pleased", "Joyful", "Thrilled", "Satisfied"]
  }
];

const byId = id => document.getElementById(id);
const energyQuestion = byId("energy-question");
const feelingQuestion = byId("feeling-question");
const options = [...document.querySelectorAll('input[type="radio"]')];
const status = byId("status");
const result = byId("result");
const next = byId("next");
let practice = false;
let person = 0;
let selected = "";

function speak(value) {
  const audioStatus = byId("audio-status");
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    audioStatus.textContent = "Read-aloud is unavailable in this browser.";
    return;
  }
  audioStatus.textContent = "";
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = "en-CA";
  utterance.rate = 0.88;
  utterance.onerror = event => {
    if (event.error !== "interrupted" && event.error !== "canceled") {
      audioStatus.textContent = "The browser could not play the audio. Try the speaker button again.";
    }
  };
  window.speechSynthesis.speak(utterance);
}

const tiles = rows.flatMap((line, row) => line.split("|").map((word, column) => {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.style.left = `${columnStarts[column] / 2048 * 100}%`;
  tile.style.top = `${rowStarts[row] / 1638 * 100}%`;
  tile.style.width = `${163 / 2048 * 100}%`;
  tile.style.height = `${97 / 1638 * 100}%`;

  const pick = document.createElement("button");
  pick.type = "button";
  pick.className = "pick";
  pick.setAttribute("aria-label", word);
  pick.addEventListener("click", () => choose(word));

  const speaker = document.createElement("button");
  speaker.type = "button";
  speaker.className = "speaker";
  speaker.textContent = "🔊";
  speaker.setAttribute("aria-label", `Hear ${word}`);
  speaker.addEventListener("click", () => speak(word));
  tile.append(pick, speaker);
  byId("words").append(tile);
  return { tile, pick, word, row, column };
}));

function inside(index, range) {
  return index >= range[0] && index <= range[1];
}

function updateChart() {
  const energy = document.querySelector('input[name="energy"]:checked')?.value;
  const feeling = document.querySelector('input[name="feeling"]:checked')?.value;
  const ready = Boolean(energy && feeling);
  status.textContent = ready
    ? `Look for a word in the highlighted section. ${energy} energy · ${feeling} feeling.`
    : "Answer both questions to choose a word.";
  for (const { tile, pick, word, row, column } of tiles) {
    const match = ready && inside(row, energyRows[energy]) && inside(column, feelingColumns[feeling]);
    tile.classList.toggle("match", match);
    pick.disabled = !match;
    pick.setAttribute("aria-pressed", String(word === selected));
  }
}

function clearChoice() {
  selected = "";
  result.hidden = true;
  next.hidden = true;
  updateChart();
}

function choose(word) {
  selected = word;
  updateChart();
  if (practice) {
    const { words } = situations[person];
    result.textContent = words.includes(word)
      ? `${word} is one feeling that fits the clues.`
      : `You chose ${word.toLowerCase()}. Look at the clues again. One possible feeling is ${words[0].toLowerCase()}.`;
    next.hidden = false;
  } else {
    result.textContent = `You chose ${word.toLowerCase()}.`;
  }
  result.hidden = false;
  result.focus();
}

function startRound() {
  window.speechSynthesis?.cancel();
  options.forEach(option => { option.checked = false; });
  if (practice) {
    const portrait = byId("portrait");
    portrait.src = `person-${person + 1}.jpg`;
    portrait.alt = situations[person].image;
    byId("scenario").textContent = situations[person].context;
  }
  clearChoice();
}

function setMode(showPractice) {
  if (practice === showPractice) return;
  practice = showPractice;
  byId("self").setAttribute("aria-pressed", String(!practice));
  byId("other").setAttribute("aria-pressed", String(practice));
  byId("practice").hidden = !practice;
  energyQuestion.textContent = practice ? "How is this person's energy?" : "How is your energy?";
  feelingQuestion.textContent = practice ? "How is this person feeling?" : "How are you feeling?";
  startRound();
}

byId("self").addEventListener("click", () => setMode(false));
byId("other").addEventListener("click", () => setMode(true));
byId("reset").addEventListener("click", startRound);
next.addEventListener("click", () => {
  person = (person + 1) % situations.length;
  startRound();
  byId("hear-scenario").focus();
});
byId("hear-scenario").addEventListener("click", () => {
  const { image, context } = situations[person];
  speak(`${image} ${context}`);
});
document.querySelectorAll("[data-hear]").forEach(button => {
  button.addEventListener("click", () => speak(byId(button.dataset.hear).textContent));
});
options.forEach(option => option.addEventListener("change", clearChoice));
updateChart();
