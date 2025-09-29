function goBack() {
  window.location.href = "../index.html";
}
const settingsPath = "./data/settings.json";

let lang = {};
let settings = {};

function createOwnerID() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
  }
  tc.placeholder = `*${lang["SSN"]}`;
  firstname.placeholder = `*${lang["NAME"]}`;
  lastname.placeholder = `*${lang["SURNAME"]}`;
  phone.placeholder = lang["PHONE"];
  title.innerHTML = lang["ADD_OWNER"];
  header.innerHTML = lang["ADD_OWNER"];
  backBtn.innerHTML = `← ${lang["BACK"]}`;
  saveBtn.innerHTML = lang["SAVE"];
});

const loader = document.getElementById("loader");
const tc = document.getElementById("tc");
const firstname = document.getElementById("firstname");
const lastname = document.getElementById("lastname");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const messageBox = document.getElementById("messageBox");

const title = document.getElementById("title");
const header = document.getElementById("header");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");

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
  const path = "./data/owners.json";
  const owners = await JSON.parse(await window.electronAPI.readFile(path));
  const filteredOwners = Object.fromEntries(
    Object.entries(owners).filter(([_, value]) => !value.deleted)
  );
  showLoader(true);
  if (tc.value && firstname.value && lastname.value) {
    let isExistingTC = false;
    for (let ownerId of Object.keys(filteredOwners)) {
      if (filteredOwners[ownerId].tc === tc.value) {
        isExistingTC = true;
        break;
      }
    }
    if (isExistingTC) {
      showMessage(lang["ERROR_DUPLICATE_SSN"], false);
    } else {
      let id = createOwnerID();
      while (id in owners) {
        id = createOwnerID();
      }
      let owner = {
        tc: tc.value,
        firstname: firstname.value,
        lastname: lastname.value,
        phone: phone.value,
        email: email.value,
      };
      await window.electronAPI.writeFile(
        path,
        JSON.stringify({ ...owners, [id]: owner })
      );
      showMessage(lang["SUCCESSFUL"], true);
    }
  } else {
    showMessage(lang["ERROR_OWNER_MISSING"], false);
  }
  try {
  } catch (err) {
    showMessage(lang["ERROR_UNKNOWN"], false);
  } finally {
    showLoader(false);
  }
}
