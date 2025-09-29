export class CustomDropdown extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._options = [];
    this._filteredOptions = [];
    this._selectedIndex = -1;
    this._values = [];
    this.loadTemplate();
  }

  connectedCallback() {
    this._placeholder = this.getAttribute("placeholder") || "";
  }

  async loadTemplate() {
    const [html, css] = await Promise.all([
      fetch(new URL("./index.html", import.meta.url)).then((res) => res.text()),
      fetch(new URL("./index.css", import.meta.url)).then((res) => res.text()),
    ]);

    const style = document.createElement("style");
    style.textContent = css;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    this.shadowRoot.append(style, wrapper);

    this.input = this.shadowRoot.querySelector(".dropdown-input");
    this.list = this.shadowRoot.querySelector(".dropdown-list");

    this.input.placeholder = this._placeholder;

    this.setupListeners();
  }

  set options(value) {
    this._options = value || [];
    this._filteredOptions = [...this._options];
    // Don't call renderList here — dropdown should only open on user interaction
  }

  get options() {
    return this._options;
  }

  set values(value) {
    this._values = value || [];
  }

  get values() {
    return this._values;
  }

  setupListeners() {
    this.input?.addEventListener("input", () => {
      const search = this.input.value.toLowerCase();
      this._filteredOptions = this._options.filter((opt) =>
        opt.toLowerCase().includes(search)
      );
      this._selectedIndex = -1;
      this.renderList(true);
    });

    this.input?.addEventListener("keydown", (e) => {
      const items = this.list.querySelectorAll(".dropdown-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this._selectedIndex = (this._selectedIndex + 1) % items.length;
        this.updateHighlight(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this._selectedIndex =
          (this._selectedIndex - 1 + items.length) % items.length;
        this.updateHighlight(items);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (
          this._selectedIndex >= 0 &&
          this._selectedIndex < this._filteredOptions.length
        ) {
          this.selectOption(this._filteredOptions[this._selectedIndex]);
        }
      }
    });

    this.input?.addEventListener("click", () => {
      this._filteredOptions = [...this._options];
      this._selectedIndex = -1;
      this.renderList(true);
    });

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        this.hideList();
      }
    });
  }

  renderList(show = true) {
    if (!this.list) return;

    this.list.innerHTML = "";

    if (this._filteredOptions.length === 0 || !show) {
      this.hideList();
      return;
    }

    this._filteredOptions.forEach((option) => {
      const div = document.createElement("div");
      div.className = "dropdown-item";
      div.textContent = option;
      div.addEventListener("mousedown", () => {
        this.selectOption(option);
      });
      this.list.appendChild(div);
    });

    this.list.style.display = "block";
  }

  updateHighlight(items) {
    items.forEach((item) => item.classList.remove("active"));
    if (this._selectedIndex >= 0) {
      items[this._selectedIndex].classList.add("active");
    }
  }

  selectOption(value) {
    this.input.value = value;
    this.hideList();

    const index = this._options.indexOf(value);
    this.dispatchEvent(
      new CustomEvent("select", { detail: this._values[index] })
    );
  }

  setSelectedOption(value) {
    this.input.value = value;
    this._selectedIndex = this._options.indexOf(value);
    this.hideList();
  }

  hideList() {
    if (this.list) {
      this.list.style.display = "none";
    }
  }
}

customElements.define("custom-dropdown", CustomDropdown);
