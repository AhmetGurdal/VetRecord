let animalId = "";
let searchParam = "";
let searchValue = "";
let allAppointments = {};
let filteredAppointments = {};
let deleteAppointmentId = "";
let settings = {};
let lang = {};

const settingsPath = "./data/settings.json";
const appointmentsPath = "./data/appointments.json";
const deleteApprovalBox = document.getElementById("delete-approval");
const deleteApproveBtn = document.getElementById("delete-approve");
const deleteRejectBtn = document.getElementById("delete-reject");
const deleteAppointmentMsg = document.getElementById("deleteAppointmentMsg");
const backBtn = document.getElementById("back");
const header = document.getElementById("header");
const title = document.getElementById("title");
const newButton = document.getElementById("newButton");
const tableState = document.getElementById("tableState");
const tableDate = document.getElementById("tableDate");
const tableTime = document.getElementById("tableTime");
const tableOperation = document.getElementById("tableOperation");
const tableSettings = document.getElementById("tableSettings");

function goBack() {
  if (searchParam && searchValue) {
    window.location.href = `../animal_detail/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  } else {
    window.location.href = `../animal_detail/index.html?animalId=${animalId}`;
  }
}

function acceptDeletion() {
  if (deleteAppointmentId) {
    delete allAppointments[deleteAppointmentId];
  }
  deleteAppointmentId = "";
  deleteApprovalBox.style.display = "none";
  save(allAppointments);
}

function rejectDeletion() {
  deleteApprovalBox.style.display = "none";
  deleteAppointmentId = "";
}

function approvementDeleteAppointment(appointmentId) {
  console.log("appointmentId", appointmentId);
  deleteAppointmentId = appointmentId;
  deleteApprovalBox.style.display = "flex";
}

function createAppointment() {
  window.location.href = `../calendar/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
}

function openAppointmentNote(id) {
  window.location.href = `../appointment_note/index.html?appointmentId=${id}&animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  if (settings.language) {
    console.log();
    lang = await readFile(`./static/languages/${settings.language}.json`);
    deleteApproveBtn.innerHTML = lang["YES"];
    deleteRejectBtn.innerHTML = lang["YES"];
    deleteAppointmentMsg.innerHTML = lang["APPOINMENT_DELETE_MSG"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
    header.innerHTML = lang["APPOINTMENTS"];
    title.innerHTML = lang["APPOINTMENTS"];
    newButton.innerHTML = `➕ ${lang["NEW_APPOINTMENT"]}`;
    tableState.innerHTML = lang["STATE"];
    tableDate.innerHTML = lang["DATE"];
    tableTime.innerHTML = lang["TIME"];
    tableOperation.innerHTML = lang["OPERATION"];
    tableSettings.innerHTML = lang["SETTINGS"];
  }
  const params = new URLSearchParams(window.location.search);
  animalId = params.get("animalId");
  searchParam = params.get("search");
  searchValue = params.get("value");
  allAppointments = await readFile(appointmentsPath);
  filteredAppointments = Object.fromEntries(
    Object.entries(allAppointments).filter(
      ([_, value]) => value.animalId === animalId
    )
  );
  fill_table(filteredAppointments);
});

function changeCheck(id) {
  const checkBtn = document.getElementById(`check_${id}`);
  if (checkBtn.style.background == "rgb(42, 212, 42)") {
    checkBtn.style.background = "red";
    allAppointments[id].checked = -1;
  } else if (checkBtn.style.background == "red") {
    checkBtn.style.background = "white";
    allAppointments[id].checked = 0;
  } else {
    checkBtn.style.background = "rgb(42, 212, 42)";
    allAppointments[id].checked = 1;
  }
  save(allAppointments);
}

function editAppointment(id) {
  window.location.href = `../appointment/index.html?id=${id}&search=${searchParam}&value=${searchValue}`;
}

async function fill_table(appointments) {
  const tbody = document.getElementById("appointment_list");
  tbody.innerHTML = "";
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
    }; width:2rem; height:2rem;" onclick=changeCheck('${id}')></button>
        </td>
        <td style="border: 1px solid #333; padding: 8px;">${
          appointments[id].date
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          appointments[id]?.time ? appointments[id]?.time : ""
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          appointments[id].treatment
        }</td>
        <td style="border: 1px solid #333; padding: 8px; max-width: 5rem;">
          <div style="display:flex; gap:1rem;">
            <div style="width:30%; height:2rem; padding:0px;">
              <button style="width:100%; height:100%;" onclick="openAppointmentNote('${id}')">
                📋 
              </button>
              ${
                noteCheck
                  ? '<span style="position: relative;top: -3rem; left: 90%;">📌</span>'
                  : ""
              }
            </div>
            <button style="width:30%; height:2rem; background: rgba(68, 203, 221, 1);" onclick="editAppointment('${id}')">
            🖊️
            </button>
            <button style="width:30%; height:2rem; background: #d44; color: #fff"onclick="approvementDeleteAppointment('${id}')">
              ❌
            </button>
          </div>
        </td>
      `;
    tbody.appendChild(tr);
  });
}

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

async function save(appointments) {
  // showLoader(true);
  try {
    await window.electronAPI.writeFile(
      appointmentsPath,
      JSON.stringify(appointments)
    );
  } catch (err) {
    // showMessage("Hata: Başarısız Kayıt !", false);
  } finally {
    // showLoader(false);
  }
}
