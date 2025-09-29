function goBack() {
  window.location.href = "../index.html";
}

function createAnimalID() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const loader = document.getElementById("loader");
const animalName = document.getElementById("name");
const birthday = document.getElementById("birthday");
const typeDropdown = document.getElementById("type");
const breedDropdown = document.getElementById("breed");
const sexDropdown = document.getElementById("sex");
const chip = document.getElementById("chip");
const ownersDropdown = document.getElementById("owners");
const messageBox = document.getElementById("messageBox");
const header = document.getElementById("header");
const title = document.getElementById("title");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");

const ownerPath = "./data/owners.json";
const animalPath = "./data/animals.json";
const catBreedPath = "./static/cat";
const dogBreedPath = "./static/dog";
const birdBreedPath = "./static/bird";
const fishBreedPath = "./static/fish";
const settingsPath = "./data/settings.json";

let selectedOwnerId = "";
let selectedType = "";
let selectedBreed = "";
let selectedSex = "";
let settings = {};
let lang = {};

function filterOwners(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => !value.deleted)
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    animalName.placeholder = lang["ANIMAL"];
    ownersDropdown.input.placeholder = lang["OWNER_NAME"];
    sexDropdown.input.placeholder = lang["SEX"];
    typeDropdown.input.placeholder = lang["TYPE"];
    breedDropdown.input.placeholder = lang["BREED"];
    chip.placeholder = lang["CHIP_NO"];
    header.innerHTML = lang["ADD_ANIMAL"];
    title.innerHTML = lang["ADD_ANIMAL"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
    saveBtn.innerHTML = lang["SAVE"];

    if (settings.language == "tr") {
      typeDropdown.options = [
        "Kedi",
        "Köpek",
        "Kanatlı",
        "Balık",
        "Koyun",
        "İnek",
        "Diğer",
      ];
      typeDropdown.values = typeDropdown.options;

      sexDropdown.options = ["Erkek", "Dişi"];
      sexDropdown.values = sexDropdown.options;

      typeDropdown.addEventListener("select", async (e) => {
        selectedType = e.detail;
        switch (selectedType) {
          case "Kedi":
            breedDropdown.options = await readFile(catBreedPath);
            break;
          case "Köpek":
            breedDropdown.options = await readFile(dogBreedPath);
            break;
          case "Kanatlı":
            breedDropdown.options = await readFile(birdBreedPath);
            break;
          case "Balık":
            breedDropdown.options = await readFile(fishBreedPath);
            break;
          default:
            breedDropdown.options = [];
        }
        breedDropdown.options.push("Diğer");
        breedDropdown.values = breedDropdown.options;
      });
    } else {
      typeDropdown.options = [
        "Cat",
        "Dog",
        "Bird",
        "Fish",
        "Sheep",
        "Cow",
        "Other",
      ];
      typeDropdown.values = typeDropdown.options;

      sexDropdown.options = ["Male", "Female"];
      sexDropdown.values = sexDropdown.options;

      typeDropdown.addEventListener("select", async (e) => {
        selectedType = e.detail;
        switch (selectedType) {
          case "Cat":
            breedDropdown.options = await readFile(
              `${catBreedPath}_${settings.language}.json`
            );
            break;
          case "Dog":
            breedDropdown.options = await readFile(
              `${dogBreedPath}_${settings.language}.json`
            );
            break;
          case "Bird":
            breedDropdown.options = await readFile(
              `${birdBreedPath}_${settings.language}.json`
            );
            break;
          case "Fish":
            breedDropdown.options = await readFile(
              `${fishBreedPath}_${settings.language}.json`
            );
            break;
          default:
            breedDropdown.options = [];
        }
        breedDropdown.options.push("Other");
        breedDropdown.values = breedDropdown.options;
      });
    }
  }
  const owners = filterOwners(await readFile(ownerPath));
  // dropdown.options = ["Apple", "Banana", "Cherry", "Mango"];

  ownersDropdown.addEventListener("select", (e) => {
    selectedOwnerId = e.detail;
  });

  breedDropdown.addEventListener("select", (e) => {
    selectedBreed = e.detail;
  });

  sexDropdown.addEventListener("select", (e) => {
    selectedSex = e.detail;
  });

  ownersDropdown.values = Object.keys(owners);
  ownersDropdown.options = ownersDropdown.values.map((ownerId) => {
    return `${owners[ownerId].firstname} ${owners[ownerId].lastname}`;
  });

  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  birthday.value = formattedDate;
});

// Handle selection change
// dropdown.addEventListener("change", () => {
//   output.textContent = `You selected: ${dropdown.value}`;
// });

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function showMessage(message, isSuccess) {
  messageBox.style.display = "block";
  messageBox.textContent = message;
  messageBox.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da"; // Green for success, red for error
  messageBox.style.color = isSuccess ? "#155724" : "#721c24";
}

async function readFile(path) {
  showLoader(true);
  try {
    const content = await JSON.parse(await window.electronAPI.readFile(path));
    return content;
  } catch (err) {
    alert("Failed to read file: " + err.message);
  } finally {
    showLoader(false);
  }
}

async function save() {
  const content = await JSON.parse(
    await window.electronAPI.readFile(animalPath)
  );
  showLoader(true);
  if (!selectedBreed) {
    selectedBreed = breedDropdown.input.value;
  }
  if (!selectedType) {
    selectedType = typeDropdown.input.value;
  }
  try {
    if (selectedOwnerId.length > 0) {
      if (
        !animalName.value ||
        !birthday.value ||
        !selectedType ||
        !selectedSex ||
        !selectedBreed
      ) {
        showMessage(lang["ERROR_MISSING_INFO"], false);
      } else {
        let id = createAnimalID();
        while (id in content) {
          id = createAnimalID();
        }

        let animal = {
          name: animalName.value,
          birthday: birthday.value,
          type: selectedType,
          breed: selectedBreed,
          sex: selectedSex,
          chip: chip.value,
          ownerId: selectedOwnerId,
        };
        await window.electronAPI.writeFile(
          animalPath,
          JSON.stringify({ ...content, [id]: animal })
        );
        showMessage(lang["SUCCESSFUL"], true);
      }
    } else {
      showMessage(lang["ERROR_INCORRECT_OWNER"], false);
    }
  } catch (err) {
    showMessage(lang["ERROR_UNKNOWN"], false);
  } finally {
    showLoader(false);
  }
}
