let animalId = "";
let searchParam = "";
let searchValue = "";
let settings = {};
let lang = {};

const appointmentPath = "./data/appointments.json";
const closedDaysPath = "./data/closed.json";
const animalsPath = "./data/animals.json";
const ownersPath = "./data/owners.json";
const settingsPath = "./data/settings.json";
const calendar = document.querySelector("custom-calendar");
const customDate = document.getElementById("custom-date");
const title = document.getElementById("title");
const header = document.getElementById("header");
const backBtn = document.getElementById("backBtn");

function goBack() {
  if (searchParam && searchValue && animalId) {
    window.location.href = `../appointment_list/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  } else {
    window.location.href = "../index.html";
  }
}

function selectDay(date) {
  if (animalId) {
    window.location.href = `../appointment/index.html?date=${date}&animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  } else {
    window.location.href = `../day/index.html?date=${date}`;
  }
}

function filterOwners() {
  const asArray = Object.entries(owners);
  const filtered = asArray.filter(([key, value]) => !value.deleted);
  owners = Object.fromEntries(filtered);
}

function filterAnimals() {
  const asArray = Object.entries(animals);
  const filtered = asArray.filter(([key, value]) => {
    if (value.deleted) {
      return false;
    }
    console.log(value.ownerId);
    if (!Object.keys(owners).includes(value.ownerId)) {
      return false;
    }
    return true;
  });
  animals = Object.fromEntries(filtered);
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    calendar.calendarLanguage = settings.language;
    title.innerHTML = lang["CALENDAR"];
    header.innerHTML = lang["CALENDAR"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
  }
  customDate.addEventListener("change", (e) => {
    selectDay(e.target.value);
  });
  calendar.onDayClick = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    selectDay(formattedDate);
  };

  const params = new URLSearchParams(window.location.search);
  animalId = params.get("animalId");
  searchParam = params.get("search");
  searchValue = params.get("value");
  year = params.get("year");
  month = params.get("month");

  if (year && month) {
    calendar.monthWindow = { year: parseInt(year), month: parseInt(month) - 1 };
  }
  const appointments = await readFile(appointmentPath);
  const animals = await readFile(animalsPath);
  const owners = await readFile(ownersPath);
  const filteredAppointments = Object.fromEntries(
    Object.entries(appointments).filter(
      ([key, value]) =>
        !(animals[value.animalId].deleted || owners[value.ownerId].deleted)
    )
  );
  const closedDays = await readFile(closedDaysPath);

  calendar.events = Object.values(filteredAppointments);
  calendar.closed = closedDays;
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
