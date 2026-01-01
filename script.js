const currentYear = new Date().getFullYear();

let currentKey = `${new Date().getMonth() + 1}-${new Date().getDate()}`;
let currentDeleteKey = "";

const dateInput = document.getElementById("date");
dateInput.setAttribute("max", `${new Date().getFullYear()}-12-31`);
dateInput.setAttribute("min", `${new Date().getFullYear()}-01-01`);

if (!getStorageValue()) {
  localStorage.setItem(currentYear, "{}");
}

let colors = localStorage.getItem("colors");

if (!colors) {
  colors = {
    good: "#307432",
    neutral: "#647235",
    bad: "#c0392b",
  };
  localStorage.setItem("colors", JSON.stringify(colors));
} else {
  colors = JSON.parse(colors);
}

const editButton = document.getElementById("edit-button");
const closeButton = document.getElementById("close-button");
const buttonsContainer = document.getElementById("buttons-container");
const modal = document.getElementById("modal");
const addVariantButton = document.getElementById("add-variant-button");
const addNameInput = document.getElementById("add-name");
const addColorInput = document.getElementById("add-color");
const errorText = document.querySelector(".error-text");

const warningModal = document.getElementById("warning-modal");
const warningCloseButton = document.getElementById("cancel-delete-button");
const confirmButton = document.getElementById("confirm-delete-button");

buttonsContainer.innerHTML = "";
buttonsContainer.append(...getButtons());

getVariants();

function getStorageValue(year = currentYear) {
  return JSON.parse(localStorage.getItem(year));
}

Object.keys(getStorageValue()).forEach((key) => {
  const value = getStorageValue()[key];
  const td = document.getElementById(key);
  td.style.backgroundColor = colors[value];
});

dateInput.addEventListener("change", (event) => {
  const selectedDate = new Date(event.target.value);
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  const dateToChange = document.getElementById("date-to-change");
  if (new Date().toDateString() === selectedDate.toDateString()) {
    dateToChange.textContent = "today";
  } else {
    dateToChange.textContent = `${selectedDate.toLocaleString("default", {
      month: "long",
    })} ${day}`;
  }
  currentKey = `${month}-${day}`;
});

editButton.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

warningCloseButton.addEventListener("click", () => {
  warningModal.style.display = "none";
});

function getButtons() {
  const buttons = [];
  Object.keys(colors).forEach((key) => {
    const button = document.createElement("button");
    button.textContent = key;
    button.dataset.value = key;
    button.style.backgroundColor = colors[key];
    button.addEventListener("click", () => {
      const value = button.dataset.value;
      const currentData = getStorageValue();
      currentData[currentKey] = value;
      const td = document.getElementById(currentKey);
      td.style.backgroundColor = colors[value];
      localStorage.setItem(currentYear, JSON.stringify(currentData));
    });
    buttons.push(button);
  });
  return buttons;
}

function getVariants() {
  const variants = [];
  Object.keys(colors).forEach((currentKey) => {
    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      if (
        Object.keys(getStorageValue()).some(
          (key) => getStorageValue()[key] === currentKey
        )
      ) {
        warningModal.style.display = "flex";
        currentDeleteKey = currentKey;
        return;
      }

      delete colors[currentKey];
      localStorage.setItem("colors", JSON.stringify(colors));
      buttonsContainer.innerHTML = "";
      buttonsContainer.append(...getButtons());
      getVariants();
    });

    const indicator = document.createElement("input");
    indicator.type = "color";
    indicator.value = colors[currentKey];
    indicator.classList.add("color-indicator");

    indicator.addEventListener("input", (e) => {
      updateButton.style.display = "block";
    });

    const updateButton = document.createElement("button");
    updateButton.textContent = "Update Color";
    updateButton.className = "update-button";
    updateButton.addEventListener("click", () => {
      colors[currentKey] = indicator.value;
      localStorage.setItem("colors", JSON.stringify(colors));
      buttonsContainer.innerHTML = "";
      buttonsContainer.append(...getButtons());
      getVariants();

      Object.keys(getStorageValue()).forEach((key) => {
        const value = getStorageValue()[key];
        const td = document.getElementById(key);
        td.style.backgroundColor = colors[value];
      });
    });

    const name = document.createElement("span");
    name.textContent = currentKey;

    const variant = document.createElement("div");
    variant.classList.add("variant");
    variant.appendChild(indicator);
    variant.appendChild(updateButton);
    variant.appendChild(name);
    variant.appendChild(removeButton);

    variants.push(variant);
  });

  const variantsContainer = document.getElementById("variants");
  variantsContainer.innerHTML = "";
  variantsContainer.append(...variants);
}

addVariantButton.addEventListener("click", () => {
  const name = addNameInput.value.trim();
  const color = addColorInput.value;
  if (!name) {
    errorText.textContent = "Please enter a name for the variant.";
    return;
  }
  if (colors[name]) {
    errorText.textContent = "A variant with this name already exists.";
    return;
  }

  errorText.textContent = "";
  colors[name] = color;
  localStorage.setItem("colors", JSON.stringify(colors));
  buttonsContainer.innerHTML = "";
  buttonsContainer.append(...getButtons());
  getVariants();
  addNameInput.value = "";
  addColorInput.value = "#000000";
});

confirmButton.addEventListener("click", () => {
  delete colors[currentDeleteKey];
  localStorage.setItem("colors", JSON.stringify(colors));
  buttonsContainer.innerHTML = "";
  buttonsContainer.append(...getButtons());
  getVariants();

  const currentData = getStorageValue();

  Object.keys(currentData).forEach((key) => {
    if (currentData[key] !== currentDeleteKey) return;

    const td = document.getElementById(key);
    td.style.backgroundColor = "";

    delete currentData[key];
  });
  localStorage.setItem(currentYear, JSON.stringify(currentData));

  currentDeleteKey = "";

  warningModal.style.display = "none";
});
