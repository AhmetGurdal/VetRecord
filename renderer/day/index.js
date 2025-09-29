let searchParam = "";
let searchValue = "";
let animalId = "";
let date = "";
let closedDays = [];
let appointments = {};
let deleteAppointmentId = "";
let settings = {};
let lang = {};

const deleteApprovalBox = document.getElementById("delete-approval");
const appointmentBody = document.getElementById("appointment-body");
const checkbox = document.getElementById("checkbox");
const title = document.getElementById("title");
const header = document.getElementById("header");
const createBtn = document.getElementById("createBtn");
const backBtn = document.getElementById("backBtn");
const tableState = document.getElementById("tableState");
const tableTime = document.getElementById("tableTime");
const tableAnimal = document.getElementById("tableAnimal");
const tableType = document.getElementById("tableType");
const tableBreed = document.getElementById("tableBreed");
const tableSex = document.getElementById("tableSex");
const tableOwner = document.getElementById("tableOwner");
const tableOperation = document.getElementById("tableOperation");
const tableProfiles = document.getElementById("tableProfiles");

const deleteMessage = document.getElementById("deleteMessage");
const deleteApproveBtn = document.getElementById("delete-approve");
const deleteRejectBtn = document.getElementById("delete-reject");

const appointmentsPath = "./data/appointments.json";
const closedPath = "./data/closed.json";
const animalsPath = "./data/animals.json";
const ownersPath = "./data/owners.json";
const settingsPath = "./data/settings.json";

function goBack() {
  if (searchParam && searchValue && animalId) {
    window.location.href = `../appointment_list/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  } else {
    const dateSplit = date.split("-");
    window.location.href = `../calendar/index.html?year=${dateSplit[0]}&month=${dateSplit[1]}`;
  }
}

function createAppointment() {
  window.location.href = `../appointment/index.html?date=${date}`;
}

function openOwner(ownerId) {
  window.location.href = `../owner_detail/index.html?date=${date}&ownerId=${ownerId}`;
}

function openAnimal(animalId) {
  window.location.href = `../animal_detail/index.html?date=${date}&animalId=${animalId}`;
}

function acceptDeletion() {
  delete appointments[deleteAppointmentId];
  deleteAppointmentId = "";
  deleteApprovalBox.style.display = "none";
  saveAppointments();
}

function rejectDeletion() {
  deleteApprovalBox.style.display = "none";
  deleteAppointmentId = "";
}

function approvementDeleteAppointment(appointmentId) {
  deleteAppointmentId = appointmentId;
  deleteApprovalBox.style.display = "flex";
}

function openAppointmentNote(id) {
  window.location.href = `../appointment_note/index.html?appointmentId=${id}&date=${date}`;
}

function changeCheck(id) {
  const checkBtn = document.getElementById(`check_${id}`);
  if (checkBtn.style.background == "rgb(42, 212, 42)") {
    checkBtn.style.background = "red";
    appointments[id].checked = -1;
  } else if (checkBtn.style.background == "red") {
    checkBtn.style.background = "white";
    appointments[id].checked = 0;
  } else {
    checkBtn.style.background = "rgb(42, 212, 42)";
    appointments[id].checked = 1;
  }
  saveAppointments();
}

function fillTable(appointments, animals, owners) {
  appointmentBody.innerHTML = "";
  Object.keys(appointments).forEach(async (id) => {
    const noteCheck = await window.electronAPI.checkFile(`./data/notes/${id}`);
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td style="border: 1px solid #333; padding: 8px; text-align:center;">
    <button id="check_${id}" style="background:${
      appointments[id]?.checked
        ? parseInt(appointments[id]?.checked) === -1
          ? "red"
          : "#2ad42a"
        : "white"
    }; width:3rem; height:3rem;" onclick=changeCheck(${id})></button>
    </td>    
    <td style="border: 1px solid #333; padding: 8px;">${
      appointments[id]?.time ? appointments[id]?.time : ""
    }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          animals[appointments[id].animalId].name
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          animals[appointments[id].animalId].type
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          animals[appointments[id].animalId].breed
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          animals[appointments[id].animalId].sex
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          owners[appointments[id].ownerId].firstname
        } ${owners[appointments[id].ownerId].lastname}</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          appointments[id].treatment
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">
          <div style="display:flex; gap:1rem;">
            <div id="actionButton" padding:0px;">
              <button style="width:100%; height:100%;" onclick="openAppointmentNote('${id}')">
                📋 
              </button>
              ${
                noteCheck
                  ? '<span style="position: relative;top: -3.5rem; left: 85%;">📌</span>'
                  : ""
              }
            </div>
            <button id="actionButton" onclick="openOwner('${
              appointments[id].ownerId
            }')">
              🧍
            </button>
            <button id="actionButton" onclick="openAnimal('${
              appointments[id].animalId
            }')">
              🐾
            </button>
            <button id="actionButton" style="background: #f77; color: #fff" onclick="approvementDeleteAppointment('${id}')">
              ❌
            </button>
          </div>
        </td>
      `;
    appointmentBody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  const params = new URLSearchParams(window.location.search);
  date = params.get("date");
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    backBtn.innerHTML = `← ${lang["BACK"]}`;
    createBtn.innerHTML = `➕ ${lang["NEW_APPOINTMENT"]}`;
    tableState.innerHTML = lang["STATE"];
    tableTime.innerHTML = lang["TIME"];
    tableAnimal.innerHTML = lang["ANIMAL"];
    tableType.innerHTML = lang["TYPE"];
    tableBreed.innerHTML = lang["BREED"];
    tableSex.innerHTML = lang["SEX"];
    tableOwner.innerHTML = lang["OWNER"];
    tableOperation.innerHTML = lang["OPERATION"];
    tableProfiles.innerHTML = lang["PROFILES"];
    deleteMessage.innerHTML = lang["APPOINMENT_DELETE_MSG"];
    deleteApproveBtn.innerHTML = lang["YES"];
    deleteRejectBtn.innerHTML = lang["NO"];
    title.innerHTML = lang["DAY_DETAIL"];
    header.innerHTML = `${date} - ${lang["DAY_DETAIL"]}`;
  }

  appointments = await readFile(appointmentsPath);
  const animals = await readFile(animalsPath);
  const owners = await readFile(ownersPath);
  const todayAppointments = Object.fromEntries(
    Object.entries(appointments).filter(
      ([_, value]) =>
        value.date === date &&
        !(owners[value.ownerId].deleted || animals[value.animalId].deleted)
    )
  );

  closedDays = await readFile(closedPath);
  if (!closedDays.includes(date)) {
    checkbox.checked = true;
  }
  checkbox.addEventListener("change", function (e) {
    if (this.checked) {
      closedDays = closedDays.filter((el) => el != date);
      saveClosedDays();
    } else {
      closedDays.push(date);
      saveClosedDays();
    }
  });
  fillTable(todayAppointments, animals, owners);
});

async function readFile(path) {
  // showLoader(true);
  try {
    const content = await JSON.parse(await window.electronAPI.readFile(path));
    return content;
  } catch (err) {
    alert("Failed to read file: " + err.message);
  } finally {
    // showLoader(false);
  }
}

async function saveAppointments() {
  try {
    await window.electronAPI.writeFile(
      appointmentsPath,
      JSON.stringify(appointments)
    );
    // showMessage("Başarılı Kayıt!", true);
  } catch (err) {
    // showMessage("Hata: Başarısız Kayıt !", false);
  } finally {
    // showLoader(false);
    window.location.href = `./index.html?date=${date}`;
  }
  // showLoader(true);
}

async function saveClosedDays() {
  try {
    await window.electronAPI.writeFile(closedPath, JSON.stringify(closedDays));
    // showMessage("Başarılı Kayıt!", true);
  } catch (err) {
    // showMessage("Hata: Başarısız Kayıt !", false);
  } finally {
    // showLoader(false);
  }
}
