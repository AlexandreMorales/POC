const audioContext = new AudioContext();
const oscList = [];
let mainGainNode = null;

const notesOrder = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const pythMultOrder = [
  1,
  256 / 243,
  9 / 8,
  32 / 27,
  81 / 64,
  4 / 3,
  1024 / 729,
  // (729/512),
  3 / 2,
  128 / 81,
  27 / 16,
  16 / 9,
  243 / 128,
];

const keyboard = document.querySelector(".keyboard");
const wavePicker = document.querySelector("select[name='waveform']");
const volumeControl = document.querySelector("input[name='volume']");

let noteFreq = null;
let customWaveform = null;
let sineTerms = null;
let cosineTerms = null;

const usePyth = false;

function createNoteTable() {
  const firstFreq = 27.5;
  const stepValue = 2 ** (1 / 12);
  const octaves = 7;

  let currFreq = usePyth
    ? firstFreq * pythMultOrder[3]
    : firstFreq * stepValue * stepValue;

  const noteFreq = [];
  for (let i = 1; i <= octaves; i++) {
    noteFreq[i] = {};
    const firOctFreq = firstFreq * pythMultOrder[3] * 2 ** (i - 1);
    for (let j = 0; j < notesOrder.length; j++) {
      currFreq = usePyth ? firOctFreq * pythMultOrder[j] : currFreq * stepValue;
      noteFreq[i][notesOrder[j]] = correctRoundError(currFreq);
    }
  }

  return noteFreq;
}

if (!Object.entries) {
  Object.entries = function entries(O) {
    return reduce(
      keys(O),
      (e, k) =>
        concat(
          e,
          typeof k === "string" && isEnumerable(O, k) ? [[k, O[k]]] : []
        ),
      []
    );
  };
}

function setup() {
  noteFreq = createNoteTable();

  volumeControl.addEventListener("change", changeVolume, false);

  mainGainNode = audioContext.createGain();
  mainGainNode.connect(audioContext.destination);
  mainGainNode.gain.value = volumeControl.value;

  // Create the keys; skip any that are sharp or flat; for
  // our purposes we don't need them. Each octave is inserted
  // into a <div> of class "octave".

  noteFreq.forEach((keys, idx) => {
    const keyList = Object.entries(keys);
    const octaveElem = document.createElement("div");
    octaveElem.className = "octave";

    keyList.forEach((key) => {
      octaveElem.appendChild(createKey(key[0], idx, key[1]));
    });

    keyboard.appendChild(octaveElem);
  });

  document
    .querySelector("div[data-note='B'][data-octave='5']")
    .scrollIntoView(false);

  sineTerms = new Float32Array([0, 0, 1, 0, 1]);
  cosineTerms = new Float32Array(sineTerms.length);
  customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);

  for (let i = 0; i < 9; i++) {
    oscList[i] = {};
  }
}

function notePressed(event) {
  if (event.buttons & 1) {
    const dataset = event.target.dataset;

    if (!dataset["pressed"] && dataset["octave"]) {
      const octave = Number(dataset["octave"]);
      oscList[octave][dataset["note"]] = playTone(dataset["frequency"]);
      dataset["pressed"] = "yes";
    }
  }
}

function noteReleased(event) {
  const dataset = event.target.dataset;

  if (dataset && dataset["pressed"]) {
    const octave = Number(dataset["octave"]);

    if (oscList[octave] && oscList[octave][dataset["note"]]) {
      oscList[octave][dataset["note"]].stop();
      delete oscList[octave][dataset["note"]];
      delete dataset["pressed"];
    }
  }
}

function createKey(note, octave, freq) {
  const keyElement = document.createElement("div");
  const labelElement = document.createElement("div");

  keyElement.classList.add("key");
  if (note[1] === "#") {
    keyElement.classList.add("black-key");
  }
  keyElement.dataset["octave"] = octave;
  keyElement.dataset["note"] = note;
  keyElement.dataset["frequency"] = freq;
  labelElement.appendChild(document.createTextNode(note));
  labelElement.appendChild(document.createElement("sub")).textContent = octave;
  keyElement.appendChild(labelElement);

  keyElement.addEventListener("mousedown", notePressed, false);
  keyElement.addEventListener("mouseup", noteReleased, false);
  keyElement.addEventListener("mouseover", notePressed, false);
  keyElement.addEventListener("mouseleave", noteReleased, false);

  return keyElement;
}

function playTone(freq) {
  const osc = audioContext.createOscillator();
  osc.connect(mainGainNode);

  const type = wavePicker.options[wavePicker.selectedIndex].value;

  if (type === "custom") {
    osc.setPeriodicWave(customWaveform);
  } else {
    osc.type = type;
  }

  osc.frequency.value = freq;
  osc.start();

  return osc;
}

function changeVolume(event) {
  mainGainNode.gain.value = volumeControl.value;
}

setup();
const synthKeys = document.querySelectorAll(".key");
const keyCodes = [
  "Space",
  "ShiftLeft",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "Comma",
  "Period",
  "Slash",
  "ShiftRight",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
  "Quote",
  "Enter",
  "Tab",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "BracketLeft",
  "BracketRight",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal",
  "Backspace",
  "Escape",
];
function keyNote(event) {
  const elKey = synthKeys[keyCodes.indexOf(event.code)];
  if (elKey) {
    if (event.type === "keydown") {
      elKey.tabIndex = -1;
      elKey.focus();
      elKey.classList.add("active");
      notePressed({ buttons: 1, target: elKey });
    } else {
      elKey.classList.remove("active");
      noteReleased({ buttons: 1, target: elKey });
    }
    event.preventDefault();
  }
}
// addEventListener("keydown", keyNote);
// addEventListener("keyup", keyNote);

function correctRoundError(num, estimation = 12) {
  return Math.round(num * 10 ** estimation) / 10 ** estimation;
}

function createKick(frequency = 220, duration = 0.5) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(1, audioContext.currentTime);

  osc.frequency.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );
  gain.gain.value = volumeControl.value;

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + duration);
}

function createSnare(duration = 0.3) {
  const noise = audioContext.createBufferSource();
  const buffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * duration,
    audioContext.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;

  const noiseGain = audioContext.createGain();
  noise.connect(noiseGain);
  noiseGain.connect(audioContext.destination);

  noiseGain.gain.setValueAtTime(1, audioContext.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();
  osc.connect(oscGain);
  oscGain.connect(audioContext.destination);
  osc.frequency.setValueAtTime(200, audioContext.currentTime);
  oscGain.gain.setValueAtTime(0.5, audioContext.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  noiseGain.gain.value = volumeControl.value;
  oscGain.gain.value = volumeControl.value;
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + duration);
  noise.start(audioContext.currentTime);
  noise.stop(audioContext.currentTime + duration);
}

function createHiHat(duration = 0.2) {
  const noise = audioContext.createBufferSource();
  const buffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * duration,
    audioContext.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(10000, audioContext.currentTime);
  noise.connect(filter);
  filter.connect(audioContext.destination);

  noise.start(audioContext.currentTime);
  noise.stop(audioContext.currentTime + duration);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "a") {
    createKick();
  } else if (e.key === "s") {
    createSnare();
  } else if (e.key === "d") {
    createHiHat();
  }
});

const importForTone = async () => {
  // load a midi file in the browser
  const midi = await Midi.fromUrl("midi/Nightclub.mid");
  //the file name decoded from the first track
  const name = midi.name;
  console.log("importForTone", midi);
  //get the tracks
  // midi.tracks.forEach((track) => {
  //   //tracks have notes and controlChanges

  //   //notes are an array
  //   const notes = track.notes;
  //   notes.forEach((note) => {
  //     //note.midi, note.time, note.duration, note.name
  //   });

  //   //the control changes are an object
  //   //the keys are the CC number
  //   track.controlChanges[64];
  //   //they are also aliased to the CC number's common name (if it has one)
  //   track.controlChanges.sustain.forEach((cc) => {
  //     // cc.ticks, cc.value, cc.time
  //   });

  //   //the track also has a channel and instrument
  //   //track.instrument.name
  // });
};

const importFromParser = () => {
  let source = document.getElementById("filereader");
  // provide the File source and a callback function
  MidiParser.parse(source, function (obj) {
    console.log(obj);
  });
};

importForTone();
importFromParser();
