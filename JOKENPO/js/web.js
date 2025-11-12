import { CONFIGS } from "./_configs.js";
import { start } from "./start.js";

const settingsContainer = document.getElementById("settings-container");
const settingsInputs = /** @type {{ [k: string]: HTMLInputElement }} */ ({});

Object.keys(CONFIGS).forEach((prop) => {
  const input = document.createElement("input");
  switch (typeof CONFIGS[prop]) {
    case "number":
      input.type = "number";
      input.value = `${CONFIGS[prop]}`;
      break;
    case "boolean":
      input.type = "checkbox";
      input.checked = CONFIGS[prop];
      break;
  }
  input.id = `config-${prop}`;
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
    console.log(prop, typeof CONFIGS[prop], CONFIGS[prop]);
    switch (typeof CONFIGS[prop]) {
      case "number":
        CONFIGS[prop] = +settingsInputs[prop].value;
        break;
      case "boolean":
        CONFIGS[prop] = settingsInputs[prop].checked;
        break;
    }
    console.log("depois", typeof CONFIGS[prop], CONFIGS[prop]);
  });
  start();
};
settingsContainer.appendChild(startButton);
