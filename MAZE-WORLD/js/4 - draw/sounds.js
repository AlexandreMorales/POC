import { MENU_CONFIG } from "../1 - polygones/index.js";
import { TRACK_TYPES } from "../3 - generation/index.js";

const AUDIO_DURATION = 13;
const AUDIO_BUFFER = AUDIO_DURATION - 0.13;
const audios = /** @type {{ [k: string]: HTMLAudioElement }} */ ({});
Object.entries(TRACK_TYPES).forEach(([track, path]) => {
  const audio = new Audio(path);
  audio.volume = 0;
  audios[track] = audio;

  audio.addEventListener(
    "timeupdate",
    () => {
      if (audio.currentTime > AUDIO_BUFFER) {
        audio.currentTime = 0;
        audio.play();
      }
    },
    false
  );
});

const TRACK_LIST = Object.keys(TRACK_TYPES);

/**
 * @param {{ [k: string]: number }} tracksCount
 */
export const updateTracks = (tracksCount) => {
  if (MENU_CONFIG.music) {
    Object.values(audios).forEach((a) => a.play());
    const max = Object.values(tracksCount).reduce(
      (acc, v) => acc + (v || 0),
      0
    );
    TRACK_LIST.forEach((track) => {
      audios[track].volume = (tracksCount[track] || 0) / max;
    });
  } else {
    if (audios) Object.values(audios).forEach((a) => a.pause());
  }
};
