let animalId = "";
let searchParam = "";
let searchValue = "";
let date = "";
let id = 1;

let animals = {};
let owners = {};
let treatments = [];
let appointments = {};
let settings = {};
let lang = {};

let selectedOwnerId = "";
let selectedAnimalId = "";
let selectedTreatment = "";

function createAppointmentID() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const ownersDropdown = document.getElementById("ownerInput");
const animalDropdown = document.getElementById("animalInput");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const reason = document.getElementById("reason");
const messageBox = document.getElementById("messageBox");
const title = document.getElementById("title");
const header = document.getElementById("header");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");

const treatmentsPath = "./static/treatments";
const animalsPath = "./data/animals.json";
const ownersPath = "./data/owners.json";
const appointmentsPath = "./data/appointments.json";
const settingsPath = "./data/settings.json";

function goBack() {
  if (date) {
    window.location.href = `../day/index.html?date=${date}`;
  }
  if (animalId) {
    window.location.href = `../appointment_list/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  }
  if (id) {
    window.location.href = `../appointment_list/index.html?animalId=${appointments[id].animalId}&search=${searchParam}&value=${searchValue}`;
  }
}

function showMessage(message, isSuccess) {
  messageBox.style.display = "block";
  messageBox.textContent = message;
  messageBox.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da"; // Green for success, red for error
  messageBox.style.color = isSuccess ? "#155724" : "#721c24";
}

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function filterData(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => !value.deleted)
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    treatments = await this.readFile(
      `${treatmentsPath}_${settings.language}.json`
    );
    ownersDropdown.input.placeholder = lang["OWNER"];
    animalDropdown.input.placeholder = lang["ANIMAL"];
    dateInput.placeholder = lang["DATE"];
    timeInput.placeholder = lang["TIME"];
    reason.input.placeholder = lang["OPERATION"];
    title.innerHTML = lang["CREATE_APPOINTMENT"];
    header.innerHTML = lang["CREATE_APPOINTMENT"];
    saveBtn.innerHTML = lang["SAVE"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
  }
  const params = new URLSearchParams(window.location.search);
  animalId = params.get("animalId");
  searchParam = params.get("search");
  searchValue = params.get("value");
  id = params.get("id");
  date = params.get("date");
  if (date) {
    dateInput.value = date;
    dateInput.disabled = true;
  }
  animals = await this.readFile(animalsPath);
  owners = filterData(await this.readFile(ownersPath));
  appointments = filterData(await this.readFile(appointmentsPath));

  reason.values = treatments;
  reason.options = reason.values;

  ownersDropdown.values = Object.keys(owners);
  ownersDropdown.options = ownersDropdown.values.map((ownerId) => {
    return `${owners[ownerId].firstname} ${owners[ownerId].lastname}`;
  });

  ownersDropdown.addEventListener("select", async (e) => {
    selectedOwnerId = e.detail;
    let filtered_animals = Object.fromEntries(
      Object.entries(animals).filter(
        ([key, value]) => value.ownerId == e.detail && !value.deleted
      )
    );
    animalDropdown.values = Object.keys(filtered_animals);
    animalDropdown.options = animalDropdown.values.map(
      (id) => `${animals[id].name}`
    );
  });

  animalDropdown.addEventListener("select", async (e) => {
    selectedAnimalId = e.detail;
  });

  if (animalId) {
    selectedAnimalId = animalId;
    selectedOwnerId = animals[animalId].ownerId;
    animalDropdown.setSelectedOption(animals[animalId].name);
    animalDropdown.input.disabled = true;
    let owner = owners[selectedOwnerId];
    ownersDropdown.setSelectedOption(`${owner.firstname} ${owner.lastname}`);
    ownersDropdown.input.disabled = true;
  }

  if (id) {
    selectedAnimalId = appointments[id].animalId;
    selectedOwnerId = appointments[id].ownerId;
    animalDropdown.setSelectedOption(animals[selectedAnimalId].name);
    animalDropdown.input.disabled = true;
    let owner = owners[selectedOwnerId];
    ownersDropdown.setSelectedOption(`${owner.firstname} ${owner.lastname}`);
    ownersDropdown.input.disabled = true;
    dateInput.value = appointments[id].date;
    timeInput.value = appointments[id]?.time;
    reason.setSelectedOption(appointments[id].treatment);
    selectedTreatment = appointments[id].treatment;
  } else {
    let appointmentKeys = Object.keys(appointments);
    while (!id || appointmentKeys.includes(id)) {
      id = createAppointmentID();
    }
  }

  reason.addEventListener("select", async (e) => {
    selectedTreatment = e.detail;
  });
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

async function saveAppointment() {
  showLoader(true);
  try {
    if (selectedTreatment && selectedAnimalId && selectedOwnerId && id) {
      let appointment = {
        animalId: selectedAnimalId,
        ownerId: selectedOwnerId,
        date: dateInput.value,
        treatment: selectedTreatment,
      };
      // if (noteInput.value) {
      //   appointments[newId] = {
      //     ...appointments[newId],
      //     notes: noteInput.value,
      //   };
      // }
      if (timeInput.value) {
        appointment = {
          ...appointment,
          time: timeInput.value,
        };
      }
      await window.electronAPI.writeFile(
        appointmentsPath,
        JSON.stringify({ ...appointments, [`${id}`]: appointment })
      );
    }
    showMessage(lang["SUCCESSFUL"], true);
  } catch (err) {
    showMessage(lang["ERROR_UNKNOWN"], false);
  } finally {
    showLoader(false);
  }
}
