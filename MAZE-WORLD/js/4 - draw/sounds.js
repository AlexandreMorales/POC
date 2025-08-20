import { getPolyInfo, MENU_CONFIG } from "../1 - polygones/index.js";
import { TRACK_TYPES } from "../3 - generation/index.js";

const audios =
  /** @type {{ [k: string]: { srcNode: AudioBufferSourceNode, gainNode: GainNode } }} */ ({});

const TRACK_FILES = {
  [TRACK_TYPES.TRACK1]: "sounds/blocks/track1.wav",
  [TRACK_TYPES.TRACK2]: "sounds/blocks/track2.wav",
  [TRACK_TYPES.TRACK3]: "sounds/blocks/track3.wav",
  [TRACK_TYPES.TRACK4]: "sounds/blocks/track4.wav",
  [TRACK_TYPES.TRACK5]: "sounds/blocks/track5.wav",
  [TRACK_TYPES.TRACK6]: "sounds/blocks/track6.wav",
  [TRACK_TYPES.TRACK7]: "sounds/blocks/track7.wav",
  [TRACK_TYPES.TRACK8]: "sounds/blocks/track8.wav",
  // [TRACK_TYPES.TRACK9]: "sounds/blocks/track9.wav",
  // [TRACK_TYPES.TRACK10]: "sounds/blocks/track10.wav",
  [TRACK_TYPES.TRACK11]: "sounds/blocks/track11.wav",
  // [TRACK_TYPES.TRACK12]: "sounds/blocks/track12.wav",
  // [TRACK_TYPES.TRACK13]: "sounds/blocks/track13.wav",
  [TRACK_TYPES.TRACK14]: "sounds/blocks/track14.wav",
  [TRACK_TYPES.TRACK15]: "sounds/blocks/track15.wav",
  [TRACK_TYPES.TRACK16]: "sounds/blocks/track16.wav",
};

Object.entries(TRACK_FILES).forEach(([track, path]) => {
  const pan = +track.replace("TRACK", "") % 2 ? -1 : 1;
  const ctx = new AudioContext();
  const srcNode = ctx.createBufferSource();

  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;
  gainNode.connect(ctx.destination);

  const ambientPan = ctx.createStereoPanner();
  ambientPan.pan.value = pan;
  ambientPan.connect(gainNode);

  audios[track] = { srcNode, gainNode };

  fetch(path, { mode: "cors" })
    .then((resp) => resp.arrayBuffer())
    .then((buffer) =>
      ctx.decodeAudioData(buffer, (abuffer) => {
        srcNode.buffer = abuffer;
        srcNode.connect(ambientPan);
        srcNode.loop = true;
      })
    );
});

const audiosList = Object.values(audios);

const TRACK_LIST = Object.keys(TRACK_FILES);

let audioStarted = false;

/**
 * @param {{ [k: string]: number }} tracksCount
 */
export const updateTracks = (tracksCount) => {
  if (MENU_CONFIG.music) {
    const polyInfo = getPolyInfo();
    if (!audioStarted) {
      audioStarted = true;
      audiosList.forEach((a) => a.srcNode.start());
    }
    const max = polyInfo.rows * polyInfo.columns * 1.2;
    TRACK_LIST.forEach((track) => {
      const { gainNode } = audios[track];
      gainNode.gain.value = (tracksCount[track] || 0) / max;
    });
  } else {
    if (audioStarted) {
      audioStarted = false;
      audiosList.forEach((a) => a.srcNode.stop());
    }
  }
};
