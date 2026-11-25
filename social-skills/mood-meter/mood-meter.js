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
const tileWidth = 163;
const tileHeight = 97;
const energyRows = { low: [5, 9], medium: [3, 6], high: [0, 4] };
const feelingColumns = { negative: [0, 4], neutral: [4, 5], positive: [5, 9] };
const situations = [
  {
    image: "A girl grins with her mouth open and both hands in the air.",
    context: "She just found out her class is going on a trip she has been looking forward to.",
    words: ["Excited", "Thrilled", "Ecstatic", "Happy", "Joyful", "Exhilarated", "Elated", "Energized", "Enthusiastic", "Upbeat", "Cheerful", "Surprised", "Lively", "Festive", "Blissful"]
  },
  {
    image: "A boy frowns, pulls his eyebrows together and clenches both fists.",
    context: "Someone knocked over the tower he had spent a long time building.",
    words: ["Angry", "Furious", "Frustrated", "Fuming", "Irritated", "Annoyed", "Enraged", "Livid", "Tense", "Stressed", "Peeved"]
  },
  {
    image: "A girl looks down with her shoulders slumped.",
    context: "Her friend could not come to her birthday party.",
    words: ["Sad", "Down", "Disappointed", "Glum", "Lonely", "Discouraged", "Disheartened", "Miserable", "Sullen", "Morose", "Despondent", "Troubled"]
  },
  {
    image: "A boy sits with relaxed shoulders and a small smile.",
    context: "He is sitting somewhere quiet during a break.",
    words: ["Calm", "Relaxed", "At ease", "Peaceful", "Content", "Chill", "Mellow", "Secure", "Comfy", "Balanced", "Serene", "Tranquil", "Restful", "Carefree"]
  },
  {
    image: "A boy raises his eyebrows and holds his hands together.",
    context: "He is about to speak in front of the class and keeps thinking he might forget his words.",
    words: ["Worried", "Nervous", "Anxious", "Uneasy", "Concerned", "Tense", "Apprehensive", "Jittery", "Restless", "Frightened", "Stressed", "Panicked", "Troubled", "Irritated"]
  },
  {
    image: "A girl smiles and holds up a medal.",
    context: "She earned a medal after practising for weeks.",
    words: ["Proud", "Happy", "Pleased", "Joyful", "Thrilled", "Satisfied", "Grateful", "Fulfilled", "Elated", "Excited", "Touched", "Exhilarated", "Upbeat"]
  },
  {
    image: "A girl opens her eyes and mouth wide.",
    context: "Her friends jumped out to welcome her back to school.",
    words: ["Surprised", "Excited", "Thrilled", "Happy", "Shocked", "Stunned", "Exhilarated", "Ecstatic", "Elated", "Joyful", "Cheerful", "Upbeat"]
  },
  {
    image: "A boy frowns at a knotted cord.",
    context: "He has tried three times to untangle it and the knot keeps getting tighter.",
    words: ["Frustrated", "Irritated", "Annoyed", "Angry", "Furious", "Fuming", "Peeved", "Stressed", "Tense", "Restless", "Livid"]
  },
  {
    image: "A girl holds an envelope and drops her shoulders.",
    context: "The letter says she did not get a place in the club she wanted to join.",
    words: ["Disappointed", "Sad", "Down", "Discouraged", "Disheartened", "Glum", "Lonely", "Troubled", "Miserable", "Sullen", "Despondent"]
  },
  {
    image: "A boy leans back comfortably.",
    context: "He has finished his chores and has time to sit back and listen to music.",
    words: ["Relaxed", "At ease", "Calm", "Chill", "Content", "Restful", "Peaceful", "Comfy", "Mellow", "Serene", "Tranquil", "Carefree", "Sleepy"]
  },
  {
    image: "A girl holds a note card with her shoulders raised.",
    context: "Her name will be called next to read aloud at the assembly.",
    words: ["Nervous", "Worried", "Anxious", "Tense", "Jittery", "Restless", "Frightened", "Stressed", "Panicked", "Apprehensive", "Uneasy", "Concerned"]
  },
  {
    image: "A boy smiles with his hand on his chest.",
    context: "A classmate brought him the homework he missed while he was sick.",
    words: ["Grateful", "Touched", "Pleased", "Happy", "Content", "Satisfied", "Fulfilled", "Joyful", "Cheerful", "Loving", "Blessed"]
  },
  {
    image: "A girl leans forward with a bright smile.",
    context: "She is laughing and talking with friends at lunch.",
    words: ["Cheerful", "Happy", "Joyful", "Lively", "Upbeat", "Playful", "Enthusiastic", "Excited", "Energized", "Pleased", "Festive", "Elated"]
  },
  {
    image: "A boy crosses his arms and presses his lips together.",
    context: "The person beside him keeps tapping a pencil after he asked them to stop.",
    words: ["Irritated", "Annoyed", "Frustrated", "Angry", "Peeved", "Tense", "Fuming", "Restless", "Stressed", "Furious"]
  },
  {
    image: "A girl sits alone and looks down.",
    context: "Her usual friends are away, and she has nobody to sit with at lunch.",
    words: ["Lonely", "Sad", "Down", "Glum", "Alienated", "Miserable", "Discouraged", "Disheartened", "Sullen", "Morose", "Despondent", "Disappointed"]
  },
  {
    image: "A boy sits quietly with his eyes closed.",
    context: "He is taking a quiet break after a noisy class.",
    words: ["Peaceful", "Calm", "Relaxed", "At ease", "Content", "Restful", "Mellow", "Serene", "Tranquil", "Chill", "Comfy", "Balanced", "Sleepy"]
  },
  {
    image: "A girl pulls back with wide eyes.",
    context: "A big dog she does not know suddenly barks near her.",
    words: ["Frightened", "Panicked", "Shocked", "Nervous", "Stunned", "Surprised", "Anxious", "Worried", "Tense", "Jittery", "Apprehensive", "Uneasy"]
  },
  {
    image: "A boy laughs and makes a silly pose.",
    context: "He is trying to make his friend laugh while they take a picture.",
    words: ["Playful", "Cheerful", "Happy", "Lively", "Upbeat", "Joyful", "Excited", "Energized", "Enthusiastic", "Exhilarated", "Thrilled", "Ecstatic"]
  },
  {
    image: "A girl looks ahead with a small smile.",
    context: "Her class planted seeds yesterday, and she thinks they might start growing soon.",
    words: ["Hopeful", "Optimistic", "Pleased", "Happy", "Upbeat", "Cheerful", "Excited", "Enthusiastic", "Content", "Joyful", "Motivated"]
  },
  {
    image: "A boy fidgets with his fingers.",
    context: "He has been sitting for a long time and feels like getting up and moving around.",
    words: ["Restless", "Jittery", "Uneasy", "Annoyed", "Tense", "Nervous", "Bored", "Frustrated", "Irritated", "Peeved"]
  },
  {
    image: "A girl rests her chin on her hand.",
    context: "She has been waiting a long time with nothing to do.",
    words: ["Bored", "Apathetic", "Restless", "Tired", "Glum", "Down", "Drained", "Fatigued", "Sleepy", "Mellow", "Uneasy", "Annoyed", "Irritated"]
  },
  {
    image: "A boy sits with an easy smile.",
    context: "He has finished a snack and is enjoying a quiet moment by himself.",
    words: ["Content", "Satisfied", "At ease", "Calm", "Relaxed", "Peaceful", "Comfy", "Restful", "Mellow", "Chill", "Fulfilled", "Serene"]
  },
  {
    image: "A girl frowns and grips her backpack straps.",
    context: "She is starting at a new school and is thinking about what might go wrong.",
    words: ["Anxious", "Nervous", "Worried", "Apprehensive", "Tense", "Jittery", "Stressed", "Frightened", "Uneasy", "Concerned", "Restless", "Troubled", "Panicked"]
  },
  {
    image: "A boy beams with both hands above his head.",
    context: "His team just scored the winning goal in the final seconds.",
    words: ["Thrilled", "Excited", "Ecstatic", "Elated", "Exhilarated", "Happy", "Joyful", "Surprised", "Proud", "Energized", "Enthusiastic", "Upbeat", "Lively", "Festive", "Blissful"]
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
let pictureQueue = [];
function nextPicture() {
  if (!pictureQueue.length) {
    pictureQueue = situations.map((_, index) => index);
    for (let i = pictureQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pictureQueue[i], pictureQueue[j]] = [pictureQueue[j], pictureQueue[i]];
    }
    if (pictureQueue.length > 1 && pictureQueue[0] === person) {
      const j = 1 + Math.floor(Math.random() * (pictureQueue.length - 1));
      [pictureQueue[0], pictureQueue[j]] = [pictureQueue[j], pictureQueue[0]];
    }
  }
  person = pictureQueue.shift();
}
let selected = "";
let lastFocused = null;
function closeSuccess() {
  byId("success-overlay").hidden = true;
  if (lastFocused?.isConnected) lastFocused.focus();
}
function showSuccess() {
  lastFocused = document.activeElement;
  byId("success-overlay").hidden = false;
  byId("success-ok").focus();
}

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
  tile.style.width = `${tileWidth / 2048 * 100}%`;
  tile.style.height = `${tileHeight / 1638 * 100}%`;

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
  return { pick, word, row, column };
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
  const highlight = byId("section-highlight");
  highlight.hidden = !ready;
  if (ready) {
    const [firstRow, lastRow] = energyRows[energy];
    const [firstColumn, lastColumn] = feelingColumns[feeling];
    const left = columnStarts[firstColumn];
    const top = rowStarts[firstRow];
    highlight.style.left = `${left / 2048 * 100}%`;
    highlight.style.top = `${top / 1638 * 100}%`;
    highlight.style.width = `${(columnStarts[lastColumn] + tileWidth - left) / 2048 * 100}%`;
    highlight.style.height = `${(rowStarts[lastRow] + tileHeight - top) / 1638 * 100}%`;
  }
  for (const { pick, word, row, column } of tiles) {
    const match = ready && inside(row, energyRows[energy]) && inside(column, feelingColumns[feeling]);
    pick.disabled = !match;
    pick.setAttribute("aria-pressed", String(word === selected));
  }
}

function clearChoice() {
  closeSuccess();
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
    if (words.includes(word)) showSuccess();
  } else {
    result.textContent = `You chose ${word.toLowerCase()}.`;
    showSuccess();
  }
  result.hidden = false;
  if (byId("success-overlay").hidden) result.focus();
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
  if (practice) {
    pictureQueue = [];
    person = -1;
    nextPicture();
  }
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
  nextPicture();
  startRound();
  byId("hear-scenario").focus();
});
byId("hear-scenario").addEventListener("click", () => speak(byId("scenario").textContent));
byId("describe-picture").addEventListener("click", () => speak(situations[person].image));
byId("success-ok").addEventListener("click", closeSuccess);
byId("success-overlay").addEventListener("keydown", event => {
  if (event.key === "Tab") { event.preventDefault(); byId("success-ok").focus(); }
});
document.querySelectorAll("[data-hear]").forEach(button => {
  button.addEventListener("click", () => speak(byId(button.dataset.hear).textContent));
});
options.forEach(option => option.addEventListener("change", clearChoice));
updateChart();
