function goBack() {
  window.location.href = "../index.html";
}

const ownerPath = "./data/owners.json";
const animalPath = "./data/animals.json";
const settingsPath = "./data/settings.json";
const tcInput = document.getElementById("tc");
const nameInput = document.getElementById("owner-name");
const phoneInput = document.getElementById("phone");
const animalNameInput = document.getElementById("animal-name");
const chipInput = document.getElementById("chip");
const searchByButton = document.getElementById("searchBy");
const header = document.getElementById("header");
const title = document.getElementById("title");
const deleteApprovalBox = document.getElementById("delete-approval");
const backBtn = document.getElementById("back");
const deleteApproveBtn = document.getElementById("delete-approve");
const deleteRejectBtn = document.getElementById("delete-reject");
const deleteMessage = document.getElementById("delete-message");

let searchParam = "";
let searchValue = "";
let filtered_animals = {};
let filtered_owners = {};
let allOwners = {};
let allAnimals = {};
let owners = {};
let animals = {};
let searchBy = "animal";
let deleteId = "";
let settings = {};
let lang = {};

function acceptDeletion() {
  if (searchBy === "owner") {
    allOwners[deleteId].deleted = true;
  } else {
    allAnimals[deleteId].deleted = true;
  }
  deleteApprovalBox.style.display = "none";
  save();
  window.location.href = `../search/index.html?searchBy=${searchBy}`;
}

function rejectDeletion() {
  deleteApprovalBox.style.display = "none";
  deleteId = "";
}

function openDeletionApprovement(id) {
  deleteId = id;
  deleteApprovalBox.style.display = "flex";
}

function str2Token(value) {
  return value.toLowerCase().replaceAll(" ", "");
}

function goToAnimal(animalId) {
  if (searchParam && searchValue) {
    window.location.href = `../animal_detail/index.html?animalId=${animalId}&search=${searchParam}&value=${searchValue}`;
  } else {
    window.location.href = `../animal_detail/index.html?animalId=${animalId}`;
  }
}

function goToOwner(ownerId) {
  if (searchParam && searchValue) {
    window.location.href = `../owner_detail/index.html?ownerId=${ownerId}&search=${searchParam}&value=${searchValue}&searchBy=${searchBy}`;
  } else {
    window.location.href = `../owner_detail/index.html?ownerId=${ownerId}&searchBy=${searchBy}`;
  }
}

function fill_table() {
  const thead = document.getElementById("search-head");
  if (searchBy === "owner") {
    thead.innerHTML = `<tr>
            <th>${lang["DELETE"]}</th>
            <th>${lang["SSN"]}</th>
            <th>${lang["NAME"]}</th>
            <th>${lang["PHONE"]}</th>
            <th>${lang["DEBT"]}</th>
            <th>${lang["PROFILE"]}</th>
          </tr>`;
    const tbody = document.getElementById("search-results");
    tbody.innerHTML = "";
    Object.keys(filtered_owners).forEach((ownerId) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="border: 1px solid #333; padding: 8px; text-align:center;">
          <button style="height:2rem; background: #d44; color: #fff"onclick="openDeletionApprovement('${ownerId}')">
            ❌
          </button>
        </td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_owners[ownerId].tc
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_owners[ownerId].firstname
        } ${filtered_owners[ownerId].lastname}</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_owners[ownerId].phone
        }</td>
        <td style="border: 1px solid #333; padding: 8px; text-align:end;">${
          filtered_owners[ownerId]?.debt ? filtered_owners[ownerId].debt : "0"
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">
          <div style="text-align:center;">
            <button style="width: 45%; height:2rem;" onclick="goToOwner('${ownerId}')">
              🧍
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    thead.innerHTML = `<tr>
            <th>${lang["DELETE"]}</th>
            <th>${lang["ANIMAL"]}</th>
            <th>${lang["BIRTHDAY"]}</th>
            <th>${lang["TYPE"]}</th>
            <th>${lang["BREED"]}</th>
            <th>${lang["OWNER"]}</th>
            <th>${lang["PROFILES"]}</th>
          </tr>`;
    const tbody = document.getElementById("search-results");
    tbody.innerHTML = "";
    Object.keys(filtered_animals).forEach((animalId) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="border: 1px solid #333; padding: 8px; text-align:center;">
          <button style=" height:2rem; background: #d44; color: #fff"onclick="openDeletionApprovement('${animalId}')">
            ❌
          </button>
        </td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_animals[animalId].name
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_animals[animalId].birthday
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_animals[animalId].type
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          filtered_animals[animalId].breed
        }</td>
        <td style="border: 1px solid #333; padding: 8px;">${
          owners[filtered_animals[animalId].ownerId]?.firstname
        } ${owners[filtered_animals[animalId].ownerId]?.lastname}</td>
        
        <td style="border: 1px solid #333; padding: 8px;">
          <div style="text-align:center;">
            <button style="width: 45%; height:2rem;" onclick="goToOwner('${
              filtered_animals[animalId].ownerId
            }')">
              🧍
            </button>
            <button style="width: 45%; height:2rem; background:${
              filtered_animals[animalId]?.notes &&
              filtered_animals[animalId]?.notes.length > 1
                ? "rgba(116, 180, 243, 1)"
                : ""
            };" onclick="goToAnimal('${animalId}')">
              🐾
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function filterByChip(animals, filterValue) {
  if (filterValue) {
    const filtered_animalIds = Object.keys(animals).filter(
      (animalId) => animals[animalId].chip === filterValue
    );
    filtered_animals = Object.fromEntries(
      Object.entries(animals).filter(([key, value]) =>
        filtered_animalIds.includes(key)
      )
    );
    searchParam = "chip";
    searchValue = filterValue;
  } else {
    filtered_animals = animals;
  }
  fill_table();
}

function changeSearchBy() {
  if (searchBy === "owner") {
    searchBy = "animal";
  } else {
    searchBy = "owner";
  }
  window.location.href = `../search/index.html?searchBy=${searchBy}`;
  fill_table();
}

function filterByAnimalName(animals, filterValue) {
  if (filterValue) {
    const filtered_animalIds = Object.keys(animals).filter((animalId) =>
      str2Token(animals[animalId].name).startsWith(filterValue)
    );
    filtered_animals = Object.fromEntries(
      Object.entries(animals).filter(([key, value]) =>
        filtered_animalIds.includes(key)
      )
    );
    searchParam = "animalName";
    searchValue = filterValue;
  } else {
    filtered_animals = animals;
  }
  fill_table();
}

function filterByPhone(animals, owners, filterValue) {
  if (filterValue) {
    if (searchBy === "owner") {
      filtered_owners = Object.fromEntries(
        Object.entries(owners).filter(([key, value]) =>
          value.phone.startsWith(filterValue)
        )
      );
    } else {
      const filtered_ownerIds = Object.keys(owners).filter((ownerId) =>
        owners[ownerId].phone.startsWith(filterValue)
      );

      let filtered_animalIds = [];
      filtered_ownerIds.forEach((ownerId) => {
        filtered_animalIds = filtered_animalIds.concat(
          Object.keys(animals).filter(
            (animalId) => animals[animalId].ownerId == ownerId
          )
        );
      });
      filtered_animals = Object.fromEntries(
        Object.entries(animals).filter(([key, value]) =>
          filtered_animalIds.includes(key)
        )
      );
    }
    searchParam = "phone";
    searchValue = filterValue;
  } else {
    filtered_animals = animals;
    filtered_owners = owners;
  }
  fill_table();
}

function filterByOwnerName(animals, owners, filterValue) {
  if (filterValue) {
    if (searchBy === "owner") {
      filtered_owners = Object.fromEntries(
        Object.entries(owners).filter(([key, value]) =>
          str2Token(value.firstname + value.lastname).startsWith(filterValue)
        )
      );
    } else {
      const filtered_ownerIds = Object.keys(owners).filter((ownerId) =>
        str2Token(
          owners[ownerId].firstname + owners[ownerId].lastname
        ).startsWith(filterValue)
      );

      let filtered_animalIds = [];
      filtered_ownerIds.forEach((ownerId) => {
        filtered_animalIds = filtered_animalIds.concat(
          Object.keys(animals).filter(
            (animalId) => animals[animalId].ownerId == ownerId
          )
        );
      });
      filtered_animals = Object.fromEntries(
        Object.entries(animals).filter(([key, value]) =>
          filtered_animalIds.includes(key)
        )
      );
    }
    searchParam = "ownerName";
    searchValue = filterValue;
  } else {
    filtered_animals = animals;
    filtered_owners = owners;
  }

  fill_table();
}

function filterByTC(animals, filterValue) {
  if (filterValue) {
    if (searchBy === "owner") {
      filtered_owners = Object.fromEntries(
        Object.entries(owners).filter(
          ([key, value]) => value.tc === filterValue
        )
      );
    } else {
      const filtered_animalIds = Object.keys(animals).filter(
        (animalId) => owners[animals[animalId].ownerId].tc == filterValue
      );
      filtered_animals = Object.fromEntries(
        Object.entries(animals).filter(([key, value]) =>
          filtered_animalIds.includes(key)
        )
      );
    }
    searchParam = "tc";
    searchValue = filterValue;
  } else {
    filtered_animals = animals;
    filtered_owners = owners;
  }
  fill_table();
}

function filterOwners() {
  const asArray = Object.entries(allOwners);
  const filtered = asArray.filter(([key, value]) => !value.deleted);
  owners = Object.fromEntries(filtered);
  filtered_owners = owners;
}

function filterAnimals() {
  const asArray = Object.entries(allAnimals);
  const filtered = asArray.filter(([key, value]) => {
    if (value.deleted) {
      return false;
    }
    if (!Object.keys(owners).includes(value.ownerId)) {
      return false;
    }
    return true;
  });
  animals = Object.fromEntries(filtered);
  filtered_animals = animals;
}

document.addEventListener("DOMContentLoaded", async () => {
  settings = await readFile(settingsPath);
  if (settings.language) {
    lang = await readFile(`./static/languages/${settings.language}.json`);
    tcInput.placeholder = lang["SSN"];
    nameInput.placeholder = lang["OWNER_NAME"];
    phoneInput.placeholder = lang["PHONE"];
    animalNameInput.placeholder = lang["ANIMAL"];
    chipInput.placeholder = lang["CHIP_NO"];
    backBtn.innerHTML = `← ${lang["BACK"]}`;
    title.innerHTML = lang["SEARCH"];
    deleteApproveBtn.innerHTML = lang["YES"];
    deleteRejectBtn.innerHTML = lang["NO"];
    deleteMessage.innerHTML = lang["RECORD_DELETE_MSG"];
  }
  searchByButton.innerText = "🧍";
  allOwners = await readFile(ownerPath);
  filterOwners();
  allAnimals = await readFile(animalPath);
  filterAnimals();

  const params = new URLSearchParams(window.location.search);
  searchParam = params.get("search");
  searchValue = params.get("value");
  searchBy = params.get("searchBy");
  if (searchBy === "owner") {
    searchByButton.innerText = "🐾";
    chipInput.style.display = "none";
    animalNameInput.style.display = "none";
    header.innerText = lang["SEARCH_OWNER"];
  } else {
    searchByButton.innerText = "🧍";
    chipInput.style.display = "block";
    animalNameInput.style.display = "block";
    header.innerText = lang["SEARCH_ANIMAL"];
  }

  if (searchParam && searchValue) {
    switch (searchParam) {
      case "tc":
        tcInput.value = searchValue;
        filterByTC(animals, searchValue);
        break;
      case "ownerName":
        nameInput.value = searchValue;
        filterByOwnerName(animals, owners, searchValue);
        break;
      case "phone":
        phoneInput.value = searchValue;
        filterByPhone(animals, owners, searchValue);
        break;
      case "animalName":
        animalNameInput.value = searchValue;
        filterByAnimalName(animals, searchValue);
        break;
      case "chip":
        chipInput.value = searchValue;
        filterByChip(animals, searchValue);
      default:
        fill_table();
        break;
    }
  } else {
    fill_table();
  }

  tcInput.addEventListener("input", async (e) => {
    // console.log(_animals);
    filterByTC(animals, e.target.value);
  });

  nameInput.addEventListener("input", async (e) => {
    const value = str2Token(e.target.value);
    filterByOwnerName(animals, owners, value);
  });

  phoneInput.addEventListener("input", async (e) => {
    filterByPhone(animals, owners, e.target.value);
  });

  animalNameInput.addEventListener("input", async (e) => {
    const value = str2Token(e.target.value);
    filterByAnimalName(animals, value);
  });

  chipInput.addEventListener("input", async (e) => {});
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

async function save() {
  // showLoader(true);
  try {
    if (searchBy === "owner") {
      await window.electronAPI.writeFile(ownerPath, JSON.stringify(allOwners));
    } else {
      await window.electronAPI.writeFile(
        animalPath,
        JSON.stringify(allAnimals)
      );
    }
  } catch (err) {
    // showMessage("Hata: Başarısız Kayıt !", false);
  } finally {
    // showLoader(false);
  }
}
