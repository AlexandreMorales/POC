import { CONFIGS } from "./_configs.js";
import { start } from "./start.js";

const settingsContainer = document.getElementById("settings-container");
const settingsInputs = /** @type {{ [k: string]: HTMLInputElement }} */ ({});

Object.keys(CONFIGS).forEach((prop) => {
  const input = document.createElement("input");
  input.type = "number";
  input.id = `config-${prop}`;
  input.value = CONFIGS[prop];
  settingsInputs[prop] = input;

  const label = document.createElement("label");
  label.htmlFor = input.id;
  label.textContent = prop;

  label.appendChild(input);
  settingsContainer.appendChild(label);
});

const startButton = document.createElement("button");
startButton.innerHTML = "START";
startButton.onclick = () => {
  Object.keys(CONFIGS).forEach((prop) => {
    CONFIGS[prop] = settingsInputs[prop].value;
  });
  start();
};
settingsContainer.appendChild(startButton);
