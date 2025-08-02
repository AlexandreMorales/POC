import { MENU_CONFIG } from "../../1 - polygones/index.js";
import { ENTITY_INFO } from "../../2 - entities/index.js";
import { getMod } from "../../utils.js";

const CLOCK_CONFIG = {
  passHour: 0.25,
  midNightHour: 60,
};

const analogClock = document.getElementById("clock");
const digitalClock = document.getElementById("digital-clock");
const [hour1, hour2] = document.querySelectorAll(".hours .digit");
const [minute1, minute2] = document.querySelectorAll(".minutes .digit");
const [colons] = document.querySelectorAll(".colons");

setInterval(() => {
  colons.classList.toggle("active");
}, 750);

export const updateClock = () => {
  const time = getTime();

  if (MENU_CONFIG.digitalClock) {
    digitalClock.style.display = "flex";
    analogClock.style.display = "none";
    setNumber(hour1, Math.floor(time.hour24 / 10));
    setNumber(hour2, Math.floor(time.hour24 % 10));
    setNumber(minute1, Math.floor(time.minute / 10));
    setNumber(minute2, Math.floor(time.minute % 10));
  } else {
    digitalClock.style.display = "none";
    analogClock.style.display = "block";
    analogClock.style.setProperty(
      "--clock-hour-rotate",
      `${time.hour * 30 + time.minute * 0.5}deg`
    );
    analogClock.style.setProperty(
      "--clock-minute-rotate",
      `${time.minute * 6}deg`
    );
  }
};

export const passTime = () => {
  ENTITY_INFO.timeOfDay += CLOCK_CONFIG.passHour;

  if (
    ENTITY_INFO.timeOfDay >= CLOCK_CONFIG.midNightHour ||
    ENTITY_INFO.timeOfDay <= 0
  ) {
    CLOCK_CONFIG.passHour = -CLOCK_CONFIG.passHour;
  }

  updateClock();
};

/**
 * @return {{ hour: number, hour24: number, minute: number }}
 */
const getTime = () => {
  const hourRaw = (12 * ENTITY_INFO.timeOfDay) / CLOCK_CONFIG.midNightHour;
  let hour = Math.floor(hourRaw);
  let minute = Math.round((hourRaw - hour) * 100);
  minute = Math.floor(minute * 0.6);
  minute = CLOCK_CONFIG.passHour > 0 ? minute : 60 - minute;
  minute = getMod(minute, 60);
  if (CLOCK_CONFIG.passHour < 0) hour = Math.max((minute ? 11 : 12) - hour, 0);
  const hour24 = CLOCK_CONFIG.passHour > 0 ? hour + 12 : hour;
  return { hour, hour24, minute };
};

/**
 * @param {Element} element
 * @param {number} value
 */
const setNumber = (element, value) => {
  element
    .querySelectorAll(`:not(.n${value})`)
    .forEach((el) => el.classList.remove("active"));
  element
    .querySelectorAll(`.n${value}`)
    .forEach((el) => el.classList.add("active"));
};
