let searchParam = "";
let searchValue = "";
let searchByValue = "";
let date = "";
let ownerId = "";
let isMain = "";
let firstname = "";
let lastname = "";
let phone = "";
let email = "";
let owners = {};
let settings = {};
let lang = {};

const ownerPath = "./data/owners.json";
const settingsPath = "./data/settings.json";
const loader = document.getElementById("loader");
const tcInput = document.getElementById("tc");
const firstnameInput = document.getElementById("firstname");
const lastnameInput = document.getElementById("lastname");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const detailsView = document.getElementById("details");
const debtValue = document.getElementById("debtValue");
const debtInput = document.getElementById("debtInput");
const contactsInput = document.getElementById("contacts");
const messageBox = document.getElementById("messageBox");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");
const title = document.getElementById("title");
const header = document.getElementById("header");

function goBack() {
  if (date) {
    window.location.href = `../day/index.html?date=${date}`;
  } else if (searchParam && searchValue) {
    window.location.href = `../search/index.html?search=${searchParam}&value=${searchValue}&searchBy=${searchByValue}`;
  } else if (isMain) {
    window.location.href = "../index.html";
  } else {
    window.location.href = `../search/index.html?searchBy=${searchByValue}`;
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

function increaseDebt() {
  let debt = "debt" in owners[ownerId] ? owners[ownerId].debt : 0;
  try {
    debt -= debtInput.value * -1;
    owners[ownerId]["debt"] = debt;
    debtValue.innerHTML = `${lang["DEBT"]} : ${owners[ownerId].debt}`;
  } catch (err) {}
}

function decreaseDebt() {
  let debt = "debt" in owners[ownerId] ? owners[ownerId].debt : 0;
  try {
    debt -= debtInput.value;
    owners[ownerId]["debt"] = debt;
    debtValue.innerHTML = `${lang["DEBT"]} : ${owners[ownerId].debt}`;
  } catch (err) {}
}

document.addEventListener("DOMContentLoaded", async () => {
  showLoader(true);
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    tcInput.placeholder = lang["SSN"];
    firstnameInput.placeholder = lang["NAME"];
    lastnameInput.placeholder = lang["SURNAME"];
    phoneInput.placeholder = lang["PHONE"];
    contactsInput.placeholder = lang["NOTES"];
    debtInput.placeholder = lang["VALUE"];
    saveBtn.innerHTML = lang["SAVE"];
    title.innerHTML = lang["OWNER_DETAIL"];
    header.innerHTML = lang["OWNER_DETAIL"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    ownerId = params.get("ownerId");
    searchParam = params.get("search");
    searchValue = params.get("value");
    searchByValue = params.get("searchBy");
    console.log(searchByValue);
    date = params.get("date");
    isMain = params.get("isMain");

    owners = await readFile(ownerPath);
    tcInput.value = `${owners[ownerId].tc}`;
    firstnameInput.value = `${owners[ownerId].firstname}`;
    lastnameInput.value = `${owners[ownerId].lastname}`;
    phoneInput.value = `${owners[ownerId].phone}`;
    emailInput.value = `${owners[ownerId].email}`;
    contactsInput.value = `${owners[ownerId].contacts || ""}`;

    if ("debt" in owners[ownerId]) {
      debtValue.innerHTML = `${lang["DEBT"]} : ${owners[ownerId].debt}`;
    } else {
      debtValue.innerHTML = `${lang["DEBT"]} : 0`;
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
  try {
    let owner = {
      ...owners[ownerId],
      tc: tcInput.value || "",
      firstname: firstnameInput.value || "",
      lastname: lastnameInput.value || "",
      phone: phoneInput.value,
      email: emailInput.value,
      contacts: contactsInput.value || "",
    };

    await window.electronAPI.writeFile(
      ownerPath,
      JSON.stringify({ ...owners, [ownerId]: owner })
    );
    showMessage(lang["SUCCESSFUL"], true);
  } catch (err) {
    // alert("Failed to read file: " + err.message);
    showMessage(lang["ERROR_UNKNOWN"], false);
  } finally {
    showLoader(false);
  }
}
