function goBack() {
  window.location.href = "../index.html";
}

const settingsPath = "./data/settings.json";
let settings = {};
let lang = {};

// document.addEventListener("DOMContentLoaded", async () => {});

const wpMessageBox = document.getElementById("wpMessageBox");
const companyBox = document.getElementById("companyNameBox");
const messageBox = document.getElementById("messageBox");
const languageSelect = document.getElementById("languageSelect");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");
const header = document.getElementById("header");

const owner = document.getElementById("owner");
const date = document.getElementById("date");
const time = document.getElementById("time");
const treatment = document.getElementById("treatment");
const animal = document.getElementById("animal");
const company = document.getElementById("company");
// const logoPathBox = document.getElementById("file-upload");
// const previewLogo = document.getElementById("previewLogo");

async function loadSettings() {
  settings = await readFile(settingsPath);
  if (settings.company_name) {
    companyBox.value = settings.company_name;
  }
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    languageSelect.innerHTML = `
      <option value="tr" ${settings.language === "tr" && "selected"}>${
      lang["TURKISH"]
    }</option>
        <option value="en" ${settings.language === "en" && "selected"}>${
      lang["ENGLISH"]
    }</option>
      `;
    header.innerHTML = lang["SETTINGS"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
    if (settings.language === "tr" && settings.wp_template_tr) {
      wpMessageBox.value = settings.wp_template_tr;
    } else if (settings.language === "en" && settings.wp_template_en) {
      wpMessageBox.value = settings.wp_template_en;
    }
    owner.innerHTML = `→ ${lang["OWNER"]}`;
    date.innerHTML = `→ ${lang["DATE"]}`;
    time.innerHTML = `→ ${lang["TIME"]}`;
    treatment.innerHTML = `→ ${lang["OPERATION"]}`;
    animal.innerHTML = `→ ${lang["ANIMAL"]}`;
    company.innerHTML = `→ ${lang["COMPANY"]}`;
    companyBox.placeholder = lang["COMPANY"];

    saveBtn.innerHTML = lang["SAVE"];
  }
  // if (settings.logo_path) {
  //   if (settings.logo_path.startsWith(".")) {
  //     previewLogo.src = `../${settings.logo_path}`;
  //   }
  // }
  // logoPathBox.addEventListener("change", function () {
  //   if (this.files.length > 0) {
  //     // Example: log file name
  //     console.log("Selected file:", this.files[0]);
  //     previewLogo.src = this.files[0].path;
  //   }
  // });
}

window.onload = loadSettings;

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

function showMessage(message, isSuccess) {
  messageBox.style.display = "block";
  messageBox.textContent = message;
  messageBox.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da"; // Green for success, red for error
  messageBox.style.color = isSuccess ? "#155724" : "#721c24";
}

async function updateSettings() {
  try {
    const companyName = companyBox.value;
    const wpTemplate = wpMessageBox.value;
    // let logoPath = previewLogo.src;
    // if (logoPath.startsWith("../")) {
    //   logoPath = logoPath.substring(3);
    // }
    if (settings.language === "en") {
      settings.wp_template_en = wpTemplate;
    } else if (settings.language === "tr") {
      settings.wp_template_tr = wpTemplate;
    }
    await window.electronAPI.writeFile(
      settingsPath,
      JSON.stringify({
        ...settings,
        company_name: companyName,
        language: languageSelect.value,
        // logo_path: logoPath,
      })
    );
    showMessage("Başarılı Kayıt!", true);
  } catch (err) {
    showMessage("Hata: Başarısız Kayıt !", false);
  } finally {
    // showLoader(false);
    window.location.href = "./index.html";
    await window.electronAPI.relauch();
  }
  // showLoader(true);
}
