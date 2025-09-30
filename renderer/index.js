const appointmentsPath = "./data/appointments.json";
const animalsPath = "./data/animals.json";
const ownersPath = "./data/owners.json";
const settingsPath = "./data/settings.json";

const logoImg = document.getElementById("logo");
const todayAppointmentsBody = document.getElementById("todayAppointmentsBody");
const tomorrowAppointmentsBody = document.getElementById(
  "tomorrowAppointmentsBody"
);

const addOwnerBtn = document.getElementById("addOwnerBtn");
const addAnimalBtn = document.getElementById("addAnimalBtn");
const searchBtn = document.getElementById("searchBtn");
const calendarBtn = document.getElementById("calendarBtn");
const settingsBtn = document.getElementById("settingsBtn");
const title = document.getElementById("title");

const todaysAppointmentHeader = document.getElementById(
  "todaysAppointmentHeader"
);
const tomorrowsAppointmentHeader = document.getElementById(
  "tomorrowsAppointmentHeader"
);
const tableState1 = document.getElementById("tableState1");
const tableTime1 = document.getElementById("tableTime1");
const tableOwnerName1 = document.getElementById("tableOwnerName1");
const tableAnimalName1 = document.getElementById("tableAnimalName1");
const tableOperation1 = document.getElementById("tableOperation1");
const tableProfiles1 = document.getElementById("tableProfiles1");
const tableMessage1 = document.getElementById("tableMessage1");

const tableState2 = document.getElementById("tableState2");
const tableTime2 = document.getElementById("tableTime2");
const tableOwnerName2 = document.getElementById("tableOwnerName2");
const tableAnimalName2 = document.getElementById("tableAnimalName2");
const tableOperation2 = document.getElementById("tableOperation2");
const tableProfiles2 = document.getElementById("tableProfiles2");
const tableMessage2 = document.getElementById("tableMessage2");

let todayAppointments = {};
let tomorrowAppointments = {};
let allAppointments = {};
let animals = {};
let owners = {};
let settings = {};
let language = {};

function openOwner(ownerId) {
  window.location.href = `./owner_detail/index.html?ownerId=${ownerId}&isMain=true`;
}

function openAnimal(animalId) {
  window.location.href = `./animal_detail/index.html?animalId=${animalId}&isMain=true`;
}

function openSettings() {
  window.location.href = `./settings/index.html`;
}

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
  updateAppointments(allAppointments);
}

function openWhatsapp(id) {
  let owner = owners[allAppointments[id].ownerId];
  let animal = animals[allAppointments[id].animalId];
  let date = new Date(allAppointments[id].date);
  let wp_template = settings.wp_template_en;
  if (settings.language === "tr") {
    wp_template = settings.wp_template_tr;
  }
  if (wp_template) {
    let message = wp_template
      .replaceAll("${owner}", `${owner.firstname} ${owner.lastname}`)
      .replaceAll(
        " ${time}",
        allAppointments[id].time ? ` ${allAppointments[id].time}` : ""
      )
      .replaceAll("${date}", date.toLocaleDateString())
      .replaceAll("${animal}", animal.name)
      .replaceAll("${treatment}", allAppointments[id].treatment)
      .replaceAll("${company}", settings.company_name);
    if (window.electronAPI && window.electronAPI.openWeb) {
      window.electronAPI.openWeb(
        `https://web.whatsapp.com/send/?phone=${encodeURIComponent(
          owner.phone
        )}&text=${encodeURIComponent(message)}`
      );
    } else {
      console.error("❌ openWeb is not defined");
    }
  }
}

function fillTable(body, appointments, animals, owners) {
  body.innerHTML = "";
  Object.keys(appointments).forEach((id) => {
    const tr = document.createElement("tr");
    const ownerId = appointments[id].ownerId;
    const animalId = appointments[id].animalId;
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
        <td style="border: 1px solid #333; padding: 8px; text-align:center;">${
          appointments[id]?.time ? appointments[id]?.time : ""
        }</td>
        <td style="border: 1px solid #333; padding: 8px; text-align:center;">${
          owners[ownerId]?.firstname
        } ${owners[ownerId]?.lastname}</td>
        <td style="border: 1px solid #333; padding: 8px; text-align:center;">${
          animals[animalId]?.name
        }</td>
        <td style="border: 1px solid #333; padding: 8px; text-align:center;">${
          appointments[id]?.treatment
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">
          <div style="text-align:center; display:flex; gap:0.2rem;">
            <button id="actionButton" onclick="openOwner('${
              appointments[id].ownerId
            }')">
              🧍
            </button>
            <button id="actionButton" style="background:${
              animals[appointments[id].animalId]?.notes &&
              animals[appointments[id].animalId]?.notes.length > 1
                ? "rgba(116, 180, 243, 1)"
                : ""
            };" onclick="openAnimal('${appointments[id].animalId}')">
              🐾
            </button>
            
          </div>
        </td>
        <td style="border: 1px solid #333; padding: 8px;">
        <div style="text-align:center">
        <button style="height:2rem; width:2.5rem;" ${
          owners[appointments[id].ownerId]?.phone &&
          owners[appointments[id].ownerId]?.phone.length > 2
            ? ""
            : "disabled"
        } onclick="openWhatsapp('${id}')">💬</button>
        </div>
        </td
      `;
    body.appendChild(tr);
  });
}

function filterOwners(data) {
  const asArray = Object.entries(data);
  const filtered = asArray.filter(([key, value]) => !value.deleted);
  return Object.fromEntries(filtered);
}

function filterAnimals(data, ownerData) {
  const asArray = Object.entries(data);
  const filtered = asArray.filter(([key, value]) => {
    if (value.deleted) {
      return false;
    }
    if (!Object.keys(ownerData).includes(value.ownerId)) {
      return false;
    }
    return true;
  });
  return Object.fromEntries(filtered);
}

async function loadTodos() {
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
  } else {
    lang = await readFile(`./static/languages/tr.json`);
  }
  logoImg.src = "../static/logo.png";

  title.innerHTML = lang["TITLE"];
  addOwnerBtn.innerHTML = `🧍 ${lang["ADD_OWNER"]}`;
  addAnimalBtn.innerHTML = `🐾 ${lang["ADD_ANIMAL"]}`;
  searchBtn.innerHTML = `🔎 ${lang["SEARCH"]}`;
  calendarBtn.innerHTML = `📅 ${lang["CALENDAR"]}`;
  settingsBtn.innerHTML = `⚙️ ${lang["SETTINGS"]}`;
  todaysAppointmentHeader.innerHTML = lang["TODAYS_APPOINTMENTS"];
  tomorrowsAppointmentHeader.innerHTML = lang["TOMORROWS_APPOINTMENTS"];
  tableState1.innerHTML = lang["STATE"];
  tableTime1.innerHTML = lang["TIME"];
  tableOwnerName1.innerHTML = lang["OWNER"];
  tableAnimalName1.innerHTML = lang["ANIMAL"];
  tableOperation1.innerHTML = lang["OPERATION"];
  tableProfiles1.innerHTML = lang["PROFILES"];
  tableMessage1.innerHTML = lang["MESSAGE"];
  tableState2.innerHTML = lang["STATE"];
  tableTime2.innerHTML = lang["TIME"];
  tableOwnerName2.innerHTML = lang["OWNER"];
  tableAnimalName2.innerHTML = lang["ANIMAL"];
  tableOperation2.innerHTML = lang["OPERATION"];
  tableProfiles2.innerHTML = lang["PROFILES"];
  tableMessage2.innerHTML = lang["MESSAGE"];

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  let yyyy = today.getFullYear();
  let mm = String(today.getMonth() + 1).padStart(2, "0");
  let dd = String(today.getDate()).padStart(2, "0");
  const formattedTodayDate = `${yyyy}-${mm}-${dd}`;

  yyyy = tomorrow.getFullYear();
  mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  dd = String(tomorrow.getDate()).padStart(2, "0");
  const formattedTomorrowDate = `${yyyy}-${mm}-${dd}`;
  allAppointments = await readFile(appointmentsPath);
  owners = filterOwners(await readFile(ownersPath));
  animals = filterAnimals(await readFile(animalsPath), owners);

  todayAppointments = Object.fromEntries(
    Object.entries(allAppointments).filter(
      ([_, value]) =>
        value.date === formattedTodayDate &&
        Object.keys(owners).includes(value.ownerId) &&
        Object.keys(animals).includes(value.animalId)
    )
  );
  tomorrowAppointments = Object.fromEntries(
    Object.entries(allAppointments).filter(
      ([_, value]) =>
        value.date === formattedTomorrowDate &&
        Object.keys(owners).includes(value.ownerId) &&
        Object.keys(animals).includes(value.animalId)
    )
  );
  fillTable(todayAppointmentsBody, todayAppointments, animals, owners);
  fillTable(tomorrowAppointmentsBody, tomorrowAppointments, animals, owners);
}

function openCalendar() {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  window.location.href = `calendar/index.html?date=${month}-${year}`;
}

function openSearch() {
  window.location.href = "search/index.html";
}

function openCustomerAdd() {
  window.location.href = "owner/index.html";
}

function openAnimalAdd() {
  window.location.href = "animal/index.html";
}

window.onload = loadTodos;

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

async function updateAppointments(appointments) {
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
  }
  // showLoader(true);
}
