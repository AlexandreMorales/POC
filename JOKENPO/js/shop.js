import { getRandomValueFromList } from "./_utils.js";

export const SHOP_CONFIG = {
  points: 0,
  pointsPerSecond: 1,
  pointsPerKill: 20,

  initialSpawn: 250,
  entitiesPerSpawn: 50,
  secondsToSpawn: 4,
  secondsToDvdSpawn: 20,
  secondsToEvolutionSpawn: 15,
  repeatPlayerType: true,

  allSpeed: 2,
  playerSpeed: 2,
  killsToEvolve: 10,

  shopOptions: 3,
  shopRerolls: 0,
  shopRerollsPrice: 5,
};

const pointsP = document.getElementById("points");
const infosPs = document.getElementsByClassName("shop-infos");
const shopDialog = /** @type {HTMLDialogElement} */ (
  document.getElementById("shop-dialog")
);
const shopItemsContainer = document.getElementById("shop-items-container");
const shopCloseBtn = document.getElementById("shop-close");
const shopRerollBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById("shop-reroll")
);
const shopRerollPrice = document.getElementById("shop-reroll-price");

export const showPoints = () => {
  pointsP.innerText = `${SHOP_CONFIG.points}`;
};

/**
 * @param {number} price
 */
const deductPoints = (price) => {
  SHOP_CONFIG.points -= price;
  showPoints();
};

export const showInfos = () => {
  for (let i = 0; i < infosPs.length; i++) {
    const info = infosPs[i];
    info.innerHTML = SHOP_CONFIG[info.id];
  }
};

export const SHOP_ITEMS = /** @type {ShopItem[]} */ ([
  {
    title: "More {x}&nbsp; points per second",
    options: [1, 2, 3, 4, 5],
    valueFn: (option) => option * 30,
    effect: (option) => (SHOP_CONFIG.pointsPerSecond += option),
  },
  {
    title: "More {x}&nbsp; points per kill",
    options: [10, 20, 30, 40, 50],
    valueFn: (option) => option * 4,
    effect: (option) => (SHOP_CONFIG.pointsPerKill += option),
  },

  {
    title: "More {x}%&nbsp; speed",
    options: [0.1, 0.5, 1],
    valueFn: (option) => option * 100,
    effect: (option) => (SHOP_CONFIG.playerSpeed += option),
  },

  {
    title: "Less {x}&nbsp; kills to evolve",
    options: [1, 2],
    valueFn: (option) => option * 30,
    effect: (option, item) => {
      SHOP_CONFIG.killsToEvolve -= option;

      if (SHOP_CONFIG.killsToEvolve <= 2) item.deleted = true;
    },
  },

  {
    title: "Stop repeating player type",
    value: 500,
    effect: (_, item) => {
      SHOP_CONFIG.repeatPlayerType = false;
      item.deleted = true;
    },
  },
]);

/**
 * @param {ShopItem} item
 * @param {() => void} refreshItems
 * @returns {HTMLElement}
 */
const createShopItem = (item, refreshItems) => {
  const itemContainer = document.createElement("div");
  itemContainer.className = "shop-item";
  const itemTitle = document.createElement("h4");
  itemTitle.className = "shop-item-title";
  const itemPrice = document.createElement("p");
  itemPrice.className = "shop-item-value";

  let option = /** @type {number} */ (null);
  let value = /** @type {number} */ (item.value);

  if (item.options) option = getRandomValueFromList(item.options);
  if (item.valueFn) value = item.valueFn(option);

  item.chosenValue = value;
  itemTitle.innerHTML = item.title.replaceAll("{x}", `${option}`);
  itemPrice.innerHTML = `${value}&nbsp;points`;

  if (SHOP_CONFIG.points > value)
    itemContainer.onclick = () => {
      if (SHOP_CONFIG.points > value && !item.disabled) {
        deductPoints(value);
        item.effect(option, item);
        item.disabled = true;
        refreshItems();

        showInfos();
        updateRerollText();
      }
    };
  else itemContainer.classList.add("disabled");

  itemContainer.appendChild(itemTitle);
  itemContainer.appendChild(itemPrice);

  return itemContainer;
};

const loadShop = () => {
  shopItemsContainer.innerHTML = "";

  const shoptItems = [...SHOP_ITEMS.filter((item) => !item.deleted)];
  const selectedItems =
    /** @type {{ item: ShopItem, div: HTMLElement }[]} */ ([]);

  const refreshItems = () => {
    for (const item of selectedItems) {
      if (item.item.chosenValue > SHOP_CONFIG.points || item.item.disabled)
        item.div.classList.add("disabled");
    }
  };

  for (let i = 0; i < SHOP_CONFIG.shopOptions; i++) {
    const item = getRandomValueFromList(shoptItems);
    item.disabled = false;
    shoptItems.splice(shoptItems.indexOf(item), 1);
    const div = createShopItem(item, refreshItems);
    shopItemsContainer.appendChild(div);
    selectedItems.push({ item, div });
  }
};

const getRerollPrice = () =>
  SHOP_CONFIG.shopRerolls * SHOP_CONFIG.shopRerollsPrice;

const updateRerollText = () => {
  const rerollPrice = getRerollPrice();
  shopRerollPrice.innerText = `${rerollPrice}`;
  if (SHOP_CONFIG.points < rerollPrice) shopRerollBtn.disabled = true;
};

const updateRerollButton = () => {
  SHOP_CONFIG.shopRerolls = 0;
  shopRerollBtn.disabled = false;
  updateRerollText();

  shopRerollBtn.onclick = () => {
    const rerollPrice = getRerollPrice();
    if (SHOP_CONFIG.points > rerollPrice) {
      deductPoints(rerollPrice);
      SHOP_CONFIG.shopRerolls++;

      loadShop();

      updateRerollText();
    }
  };
};

/**
 * @param {() => void} callback
 */
export const openShop = (callback) => {
  loadShop();
  updateRerollButton();

  shopDialog.showModal();
  shopCloseBtn.onclick = () => {
    shopDialog.close();
    callback();
  };
};
