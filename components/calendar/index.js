export class CustomCalendar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.loadTemplate();
    this.language = "tr"; // default language
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
    if (!this.currentDate) {
      this.currentDate = new Date();
    }
    this.setup();
    this.renderCalendar();
  }

  set monthWindow(date) {
    if (!this.currentDate) {
      this.currentDate = new Date();
    }
    this.currentDate.setFullYear(date.year);
    this.currentDate.setMonth(date.month);
    // this.year = year;
  }

  get monthWindow() {
    return {
      year: this.currentDate.getFullYear(),
      month: this.currentDate.getMonth(),
    };
  }

  set events(data) {
    this._events = data;
    if (this.shadowRoot) {
      this.renderCalendar();
    }
  }

  get events() {
    return this._events || [];
  }

  set closed(data) {
    this._closed = data;
    if (this.shadowRoot) {
      this.renderCalendar();
    }
  }

  get calendarLanguage() {
    return this.language;
  }

  set calendarLanguage(lang) {
    this.language = lang;
    if (this.shadowRoot) {
      this.renderCalendar();
    }
  }

  get closed() {
    return this._closed || [];
  }

  set onDayClick(callback) {
    this._onDayClick = callback;
  }

  get onDayClick() {
    return this._onDayClick;
  }

  setup() {
    this.shadowRoot.getElementById("prev-month").onclick = () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    };
    this.shadowRoot.getElementById("next-month").onclick = () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    };
  }

  renderCalendar() {
    const languageData = {
      tr: {
        weekdays: ["Pzts", "Salı", "Çarş", "Perş", "Cuma", "Cmts", "Pzr"],
        monthNames: [
          "Ocak",
          "Şubat",
          "Mart",
          "Nisan",
          "Mayıs",
          "Haziran",
          "Temmuz",
          "Ağustos",
          "Eylül",
          "Ekim",
          "Kasım",
          "Aralık",
        ],
      },
      en: {
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        monthNames: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
      },
    };
    const year = this.currentDate?.getFullYear();
    const month = this.currentDate?.getMonth();
    const currentLanguageData = languageData[this.language];
    if (this.shadowRoot) {
      const mount_year = this.shadowRoot.getElementById("month-year");
      const monday = this.shadowRoot.getElementById("monday");
      const tuesday = this.shadowRoot.getElementById("tuesday");
      const wednesday = this.shadowRoot.getElementById("wednesday");
      const thursday = this.shadowRoot.getElementById("thursday");
      const friday = this.shadowRoot.getElementById("friday");
      const saturday = this.shadowRoot.getElementById("saturday");
      const sunday = this.shadowRoot.getElementById("sunday");

      monday.innerHTML = currentLanguageData.weekdays[0];
      tuesday.innerHTML = currentLanguageData.weekdays[1];
      wednesday.innerHTML = currentLanguageData.weekdays[2];
      thursday.innerHTML = currentLanguageData.weekdays[3];
      friday.innerHTML = currentLanguageData.weekdays[4];
      saturday.innerHTML = currentLanguageData.weekdays[5];
      sunday.innerHTML = currentLanguageData.weekdays[6];
      if (mount_year) {
        mount_year.textContent = `${currentLanguageData.monthNames[month]} ${year}`;
      }
      const daysGrid = this.shadowRoot.getElementById("calendar-days");
      if (daysGrid) {
        daysGrid.innerHTML = "";
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay - 1; i++) {
          const emptyCell = document.createElement("div");
          emptyCell.classList.add("day"); // Optional, for alignment
          daysGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const dayEl = document.createElement("div");
          dayEl.textContent = day;
          dayEl.classList.add("day");
          const selectedDate = new Date(year, month, day);
          if (selectedDate.toDateString() == new Date().toDateString()) {
            dayEl.classList.add("today");
          }
          dayEl.addEventListener("click", () => {
            if (typeof this._onDayClick === "function") {
              this._onDayClick(selectedDate);
            } else {
              console.log(`Clicked day: ${day} ${month} ${year}`);
            }
          });

          const fullDateStr = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const matchingEvent = this.events.find(
            (event) => event.date === fullDateStr
          );
          const matchingClosed = this.closed.find(
            (closed) => closed === fullDateStr
          );
          if (matchingEvent) {
            dayEl.classList.add("has-event");
          }

          if (matchingClosed) {
            dayEl.classList.add("closed");
          }
          daysGrid.appendChild(dayEl);
        }
      }
    }
  }
}

customElements.define("custom-calendar", CustomCalendar);
