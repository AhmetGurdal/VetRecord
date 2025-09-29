let searchParam = "";
let searchValue = "";
let date = "";
let animalId = "";
let isMain = "";
let selectedSex = "";
let selectedType = "";
let selectedBreed = "";
let animals = {};
let settings = {};
let lang = {};

const settingsPath = "./data/settings.json";
const ownerPath = "./data/owners.json";
const animalPath = "./data/animals.json";
const catBreedPath = "./static/cat";
const dogBreedPath = "./static/dog";
const birdBreedPath = "./static/bird";
const fishBreedPath = "./static/fish";

const loader = document.getElementById("loader");
const ownerName = document.getElementById("owner-name");
const animalName = document.getElementById("name");
const birthday = document.getElementById("birthday");
const sexDropdown = document.getElementById("sex");
const typeDropdown = document.getElementById("type");
const breedDropdown = document.getElementById("breed");
const chip = document.getElementById("chip");
const notes = document.getElementById("notes");
const detailsView = document.getElementById("details");
const title = document.getElementById("title");
const header = document.getElementById("header");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");
const historyBtn = document.getElementById("create-appointment");

function goBack() {
  if (date) {
    window.location.href = `../day/index.html?date=${date}`;
  } else if (searchParam && searchValue) {
    window.location.href = `../search/index.html?search=${searchParam}&value=${searchValue}`;
  } else if (isMain) {
    window.location.href = "../index.html";
  } else {
    window.location.href = `../search/index.html`;
  }
}

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function showMessage(message, isSuccess) {
  messageBox.style.display = "block";
  messageBox.textContent = message;
  messageBox.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da"; // Green for success, red for error
  messageBox.style.color = isSuccess ? "#155724" : "#721c24";
}

function goAppointments() {
  if (searchParam && searchValue) {
    window.location.href = `../appointment_list/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  } else {
    window.location.href = `../appointment_list/index.html?animalId=${animalId}`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  showLoader(true);
  try {
    const params = new URLSearchParams(window.location.search);
    animalId = params.get("animalId");
    searchParam = params.get("search");
    searchValue = params.get("value");
    isMain = params.get("isMain");
    date = params.get("date");
    animals = await readFile(animalPath);
    const owners = await readFile(ownerPath);
    ownerName.value = `${owners[animals[animalId].ownerId].firstname} ${
      owners[animals[animalId].ownerId].lastname
    }`;
    chip.value = `${animals[animalId].chip}`;
    animalName.value = `${animals[animalId].name}`;
    birthday.value = `${animals[animalId].birthday}`;
    settings = await readFile(settingsPath);
    if (settings.language) {
      lang = await readFile(`./static/languages/${settings.language}.json`);
      title.innerHTML = lang["ANIMAL_DETAIL"];
      header.innerHTML = lang["ANIMAL_DETAIL"];
      backBtn.innerHTML = `← ${lang["BACK"]}`;
      animalName.placeholder = lang["NAME"];
      sexDropdown.input.placeholder = lang["SEX"];
      typeDropdown.input.placeholder = lang["TYPE"];
      breedDropdown.input.placeholder = lang["BREED"];
      chip.placeholder = lang["CHIP_NO"];
      notes.placeholder = lang["NOTES"];
      saveBtn.innerHTML = lang["SAVE"];
      historyBtn.innerHTML = lang["APPOINTMENT_HISTORY"];

      if (settings.language == "tr") {
        sexDropdown.options = ["Erkek", "Dişi"];
        sexDropdown.values = sexDropdown.options;
        selectedSex = `${animals[animalId].sex}`;
        sexDropdown.setSelectedOption(selectedSex);
        sexDropdown.addEventListener("select", async (e) => {
          selectedSex = e.detail;
        });

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
        selectedType = `${animals[animalId].type}`;
        typeDropdown.setSelectedOption(selectedType);
        selectedBreed = `${animals[animalId].breed}`;
        breedDropdown.options = [selectedBreed];
        breedDropdown.values = breedDropdown.options;
        breedDropdown.setSelectedOption(selectedBreed);
        typeDropdown.addEventListener("select", async (e) => {
          selectedType = e.detail;
          switch (selectedType) {
            case "Kedi":
              breedDropdown.options = await readFile(
                `${catBreedPath}_${settings.language}.json`
              );
              break;
            case "Köpek":
              breedDropdown.options = await readFile(
                `${dogBreedPath}_${settings.language}.json`
              );
              break;
            case "Kanatlı":
              breedDropdown.options = await readFile(
                `${birdBreedPath}_${settings.language}.json`
              );
              break;
            case "Balık":
              breedDropdown.options = await readFile(
                `${fishBreedPath}_${settings.language}.json`
              );
              break;
            default:
              breedDropdown.options = [];
          }
          breedDropdown.options.push("Diğer");
          breedDropdown.values = breedDropdown.options;
        });
      } else {
        sexDropdown.options = ["Male", "Female"];
        sexDropdown.values = sexDropdown.options;
        selectedSex = `${animals[animalId].sex}`;
        sexDropdown.setSelectedOption(selectedSex);
        sexDropdown.addEventListener("select", async (e) => {
          selectedSex = e.detail;
        });

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
        selectedType = `${animals[animalId].type}`;
        typeDropdown.setSelectedOption(selectedType);
        selectedBreed = `${animals[animalId].breed}`;
        breedDropdown.options = [selectedBreed];
        breedDropdown.values = breedDropdown.options;
        breedDropdown.setSelectedOption(selectedBreed);
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

    breedDropdown.addEventListener("select", (e) => {
      selectedBreed = e.detail;
    });
    if ("notes" in animals[animalId]) {
      notes.value = animals[animalId].notes;
    }
  } catch (err) {
  } finally {
    showLoader(false);
  }
});

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
  showLoader(true);
  let breedInput = breedDropdown.input.value;
  let typeInput = typeDropdown.input.value;
  if (!selectedBreed || (breedInput && breedInput != selectedBreed)) {
    selectedBreed = breedInput;
  }
  if (!selectedType || (typeInput && typeInput !== selectedType)) {
    selectedType = typeInput;
  }
  try {
    if (
      !animalName.value ||
      !birthday.value ||
      !selectedType ||
      !selectedSex ||
      !selectedBreed
    ) {
      showMessage(lang["ERROR_MISSING_INFO"], false);
    } else {
      let animal = {
        name: animalName.value || "",
        birthday: birthday.value || "",
        type: selectedType,
        breed: selectedBreed,
        sex: selectedSex,
        chip: chip.value || "",
        ownerId: animals[animalId]?.ownerId ? animals[animalId]?.ownerId : "",
        notes: notes.value || "",
      };
      await window.electronAPI.writeFile(
        animalPath,
        JSON.stringify({ ...animals, [animalId]: animal })
      );
      showMessage(lang["SUCCESSFUL"], true);
    }
  } catch (err) {
    showMessage(lang["ERROR_UNKNOWN"], false);
  } finally {
    showLoader(false);
  }
}
