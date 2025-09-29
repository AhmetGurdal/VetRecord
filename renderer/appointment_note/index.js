let searchParam = "";
let searchValue = "";
let date = "";
let appointmentId = "";
let settings = {};
let lang = {};

const noteFolder = "./data/notes";
const settingsPath = "./data/settings.json";

const loader = document.getElementById("loader");
const noteInput = document.getElementById("note");
const detailsView = document.getElementById("details");
const messageBox = document.getElementById("messageBox");
const saveBtn = document.getElementById("saveBtn");
const backBtn = document.getElementById("backBtn");
const title = document.getElementById("title");
const header = document.getElementById("header");

function goBack() {
  if (date) {
    window.location.href = `../day/index.html?date=${date}`;
  } else if (searchParam && searchValue && animalId) {
    window.location.href = `../appointment_list/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
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

document.addEventListener("DOMContentLoaded", async () => {
  showLoader(true);
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    saveBtn.innerHTML = lang["SAVE"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
    title.innerHTML = lang["APPOINTMENT_NOTE"];
    header.innerHTML = lang["APPOINTMENT_NOTE"];
  }
  try {
    const params = new URLSearchParams(window.location.search);
    appointmentId = params.get("appointmentId");
    searchParam = params.get("search");
    searchValue = params.get("value");
    animalId = params.get("animalId");
    date = params.get("date");
    const note = await readNote(`${noteFolder}/${appointmentId}`);
    if (note) {
      noteInput.value = note;
    }
  } catch (err) {
  } finally {
    showLoader(false);
  }
});

async function readNote(path) {
  try {
    const content = await window.electronAPI.readFile(path);
    return content;
  } catch (err) {
    return null;
  }
}

async function deleteNote() {
  await window.electronAPI.deleteFile(`${noteFolder}/${appointmentId}`);
}

async function readFile(path) {
  try {
    const content = await JSON.parse(await window.electronAPI.readFile(path));
    return content;
  } catch (err) {
    alert("Failed to read file: " + err.message);
  } finally {
  }
}

async function saveNote() {
  showLoader(true);
  try {
    if (noteInput.value.length < 1) {
      deleteNote();
    }
    await window.electronAPI.writeFile(
      `${noteFolder}/${appointmentId}`,
      noteInput.value
    );
    showMessage(lang["SUCCESSFUL"], true);
  } catch (err) {
    showMessage(lang["ERROR_UNKNOWN"], false);
  } finally {
    showLoader(false);
  }
}
