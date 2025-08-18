import { getPolyInfo, MENU_CONFIG } from "../1 - polygones/index.js";
import { TRACK_TYPES } from "../3 - generation/index.js";

const AUDIO_DURATION = 36;
const audios = /** @type {{ [k: string]: HTMLAudioElement }} */ ({});

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
  const audio = new Audio(path);
  audio.volume = 0;
  audios[track] = audio;
});

const audiosList = Object.values(audios);

const TRACK_LIST = Object.keys(TRACK_FILES);

let audiosInterval = null;
let audiosTime = 0;

/**
 * @param {{ [k: string]: number }} tracksCount
 */
export const updateTracks = (tracksCount) => {
  if (MENU_CONFIG.music) {
    const polyInfo = getPolyInfo();
    if (!audiosInterval) {
      audiosList.forEach((a) => a.play());
      audiosTime = 0;
      audiosInterval = setInterval(() => {
        audiosTime++;
        if (audiosTime >= AUDIO_DURATION) audiosTime = 0;
        // Prevent desync
        audiosList.forEach((a) => (a.currentTime = audiosTime));
      }, 1000);
    }
    const max = polyInfo.rows * polyInfo.columns;
    TRACK_LIST.forEach((track) => {
      audios[track].volume = (tracksCount[track] || 0) / max;
    });
  } else {
    if (audios) audiosList.forEach((a) => a.pause());
    clearInterval(audiosInterval);
    audiosInterval = null;
  }
};
