import { MENU_CONFIG } from "../../1 - polygones/index.js";
import { ENTITY_INFO } from "../../2 - entities/index.js";
import { getMod } from "../../utils.js";

const CLOCK_CONFIG = {
  passHour: 0.25,
  midNightHour: 60,
};

const analogClock = document.getElementById("analog-clock");
const digitalClock = document.getElementById("digital-clock");
const hourTensSegments = document.querySelectorAll(
  "#digital-clock-hours .digit-tens .segment"
);
const hourUnitsSegments = document.querySelectorAll(
  "#digital-clock-hours .digit-units .segment"
);
const minuteTensSegments = document.querySelectorAll(
  "#digital-clock-minutes .digit-tens .segment"
);
const minuteUnitsSegments = document.querySelectorAll(
  "#digital-clock-minutes .digit-units .segment"
);

const colons = document.getElementById("digital-clock-colons");
setInterval(() => {
  colons.classList.toggle("active");
}, 750);

export const updateClock = () => {
  const time = getTime();

  if (MENU_CONFIG.digitalClock) {
    digitalClock.classList.remove("hide");
    analogClock.classList.add("hide");
    setNumber(hourTensSegments, Math.floor(time.hour24 / 10));
    setNumber(hourUnitsSegments, Math.floor(time.hour24 % 10));
    setNumber(minuteTensSegments, Math.floor(time.minute / 10));
    setNumber(minuteUnitsSegments, Math.floor(time.minute % 10));
  } else {
    analogClock.classList.remove("hide");
    digitalClock.classList.add("hide");
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
 * @param {NodeListOf<Element>} segments
 * @param {number} value
 */
const setNumber = (segments, value) => {
  segments.forEach((el) => {
    if (el.classList.contains(`n${value}`)) el.classList.add("active");
    else el.classList.remove("active");
  });
};
