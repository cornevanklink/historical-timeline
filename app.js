const translations = {
  en: {
    eyebrow: "A living record · 3000 BCE to today",
    headline: 'History,<br><em>in motion.</em>',
    description: "A few of the turning points, ideas and firsts that made the world we share.",
    collection: "THE HUMAN STORY",
    scroll: 'SCROLL TO EXPLORE <span aria-hidden="true">↓</span>',
    chapter: "CHAPTER 01 — THE LONG VIEW",
    timelineTitle: "Moments that moved us",
    searchLabel: "Search events",
    searchPlaceholder: "Find a moment...",
    empty: "No moments found. Try another search.",
    footer: "The past is never past.",
    backToTop: "BACK TO TOP ↑",
    all: "All moments",
    count: (shown, total) => `${shown} OF ${total} MOMENTS`,
    categories: {
      civilization: "Civilization",
      science: "Science",
      conflict: "Conflict",
      culture: "Culture",
      "dutch-history": "Dutch history",
      "family-birthdays": "Family birthdays"
    },
    loadError: "The timeline could not be loaded. Check that events.json is available and valid.",
    themeLabel: "Choose color theme",
    lightMode: "Light",
    darkMode: "Dark",
    dateRangeSeparator: " – ",
    bce: "BCE",
    locale: "en"
  },
  nl: {
    eyebrow: "Een levend overzicht · 3000 v.Chr. tot nu",
    headline: 'Geschiedenis,<br><em>in beweging.</em>',
    description: "Een greep uit de keerpunten, ideeën en primeurs die onze gedeelde wereld vormden.",
    collection: "HET VERHAAL VAN DE MENSHEID",
    scroll: 'SCROLL OM TE ONTDEKKEN <span aria-hidden="true">↓</span>',
    chapter: "HOOFDSTUK 01 — DE GROTE LIJN",
    timelineTitle: "Momenten die ons vormden",
    searchLabel: "Gebeurtenissen zoeken",
    searchPlaceholder: "Zoek een moment...",
    empty: "Geen momenten gevonden. Probeer een andere zoekopdracht.",
    footer: "Het verleden is nooit voorbij.",
    backToTop: "TERUG NAAR BOVEN ↑",
    all: "Alle momenten",
    count: (shown, total) => `${shown} VAN ${total} MOMENTEN`,
    categories: {
      civilization: "Beschaving",
      science: "Wetenschap",
      conflict: "Conflict",
      culture: "Cultuur",
      "dutch-history": "Nederlandse geschiedenis",
      "family-birthdays": "Geboortes familie"
    },
    loadError: "De tijdlijn kon niet worden geladen. Controleer of events.json beschikbaar en geldig is.",
    themeLabel: "Kleurenthema kiezen",
    lightMode: "Licht",
    darkMode: "Donker",
    dateRangeSeparator: " tot ",
    bce: "v.Chr.",
    locale: "nl"
  }
};

const timeline = document.querySelector("#timeline");
const filters = document.querySelector("#filters");
const searchInput = document.querySelector("#search");
const eventCount = document.querySelector("#event-count");
const emptyState = document.querySelector("#empty-state");
const loadMessage = document.querySelector("#load-message");
const themeSwitch = document.querySelector("#theme-switch");
const themeColor = document.querySelector('meta[name="theme-color"]');
let events = [];
let language = "en";
let activeCategory = "all";
let searchTerm = "";
let theme = readThemePreference();

function readThemePreference() {
  try {
    return localStorage.getItem("timeline-theme") === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Could not read the saved theme preference.", error);
    return "light";
  }
}

function setTheme(nextTheme) {
  theme = nextTheme;
  document.documentElement.dataset.theme = theme;
  themeColor.content = theme === "dark" ? "#191d1b" : "#f2f1ec";
  themeSwitch.querySelectorAll("[data-theme-choice]").forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  try {
    localStorage.setItem("timeline-theme", theme);
  } catch (error) {
    console.error("Could not save the theme preference.", error);
  }
}

function localizePage() {
  const copy = translations[language];
  document.documentElement.lang = language;
  document.title = language === "nl" ? "Een korte geschiedenis — een levende tijdlijn" : "A Brief History — a living timeline";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (value) element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = copy[element.dataset.i18nPlaceholder];
  });
  document.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  themeSwitch.setAttribute("aria-label", copy.themeLabel);
  renderFilters();
  renderEvents();
}

function renderFilters() {
  const copy = translations[language];
  const categories = [...new Set(events.map((event) => event.category))];
  const options = ["all", ...categories];

  filters.setAttribute("aria-label", language === "nl" ? "Filter op categorie" : "Filter by category");
  filters.replaceChildren(...options.map((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.classList.toggle("is-active", category === activeCategory);
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.textContent = category === "all" ? copy.all : (copy.categories[category] ?? category);
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderEvents();
    });
    return button;
  }));
}

function formatYear(year) {
  const copy = translations[language];
  const formattedYear = Math.abs(year).toLocaleString(copy.locale);
  return year < 0 ? `${formattedYear} ${copy.bce}` : formattedYear;
}

function dateParts(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year === 0 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return null;
  return { year, month, day };
}

function formatDate(value) {
  const { year, month, day } = dateParts(value);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return new Intl.DateTimeFormat(translations[language].locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function validateEvents(data) {
  if (!Array.isArray(data)) throw new Error("events.json must contain an array");
  data.forEach((event, index) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      throw new Error(`Event ${index + 1} must be an object`);
    }
    if (event.date !== undefined && !dateParts(event.date)) {
      throw new Error(`Event ${index + 1} has an invalid date; use YYYY-MM-DD`);
    }
    if (event.endDate !== undefined) {
      if (!dateParts(event.endDate)) {
        throw new Error(`Event ${index + 1} has an invalid endDate; use YYYY-MM-DD`);
      }
      if (event.date === undefined || event.endDate < event.date) {
        throw new Error(`Event ${index + 1} endDate must be on or after its date`);
      }
    }
    if (event.date === undefined && !Number.isInteger(event.year)) {
      throw new Error(`Event ${index + 1} must have a year or date`);
    }
  });
  return data;
}

function eventSortKey(event) {
  if (event.date) {
    const { year, month, day } = dateParts(event.date);
    return year * 372 + month * 31 + day;
  }
  return event.year * 372;
}

function spacingForGap(first, second) {
  const yearsApart = Math.max(0, (eventSortKey(second) - eventSortKey(first)) / 372);
  return Math.min(280, Math.max(0, Math.sqrt(yearsApart) * 16 - 8));
}

function assignPeriodLanes(eventList) {
  const laneEnds = [];
  return eventList.map((event) => {
    if (!event.endDate) return null;

    const start = eventSortKey(event);
    const end = eventSortKey({ date: event.endDate });
    let lane = laneEnds.findIndex((laneEnd) => laneEnd < start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = end;
    return lane;
  });
}

let visibleEvents = [];

function positionPeriodBars() {
  const items = [...timeline.children];
  if (items.length !== visibleEvents.length) return;

  const points = items.map((item) => {
    const dot = item.querySelector(".timeline-dot");
    return item.offsetTop + dot.offsetTop + dot.offsetHeight / 2;
  });
  const startKeys = visibleEvents.map(eventSortKey);

  function positionForDate(key) {
    const nextIndex = startKeys.findIndex((startKey) => startKey >= key);
    if (nextIndex === 0) return points[0];
    if (nextIndex !== -1) {
      if (startKeys[nextIndex] === key) return points[nextIndex];
      const previousIndex = nextIndex - 1;
      const dateSpan = startKeys[nextIndex] - startKeys[previousIndex];
      if (dateSpan <= 0) return points[nextIndex];
      const fraction = (key - startKeys[previousIndex]) / dateSpan;
      return points[previousIndex] + (points[nextIndex] - points[previousIndex]) * fraction;
    }

    const lastIndex = startKeys.length - 1;
    const yearsAfter = Math.max(0, (key - startKeys[lastIndex]) / 372);
    return points[lastIndex] + Math.sqrt(yearsAfter) * 16;
  }

  items.forEach((item, index) => {
    const bar = item.querySelector(".timeline-period");
    if (!bar) return;
    const dot = item.querySelector(".timeline-dot");
    const start = points[index];
    const end = positionForDate(eventSortKey({ date: visibleEvents[index].endDate }));
    bar.style.top = `${dot.offsetTop + dot.offsetHeight / 2}px`;
    bar.style.height = `${Math.max(3, end - start)}px`;
  });
}

function renderEvents() {
  const copy = translations[language];
  const matchingEvents = events
    .filter((event) => activeCategory === "all" || event.category === activeCategory)
    .filter((event) => {
      const text = `${event.title[language]} ${event.summary[language]} ${event.date ?? ""} ${event.endDate ?? ""} ${event.year ?? ""} ${event.category}`;
      return text.toLocaleLowerCase(language).includes(searchTerm);
    })
    .sort((first, second) => eventSortKey(first) - eventSortKey(second));

  const periodLanes = assignPeriodLanes(matchingEvents);
  const items = matchingEvents.map((event, index) => {
    const item = document.createElement("li");
    item.className = "timeline-item";
    item.dataset.category = event.category;
    item.style.animationDelay = `${Math.min(index, 12) * 35}ms`;
    item.style.setProperty("--time-gap", `${index < matchingEvents.length - 1 ? spacingForGap(event, matchingEvents[index + 1]) : 0}px`);
    if (event.endDate) {
      item.style.setProperty("--period-lane-offset", `${periodLanes[index] * 6}px`);
      item.style.setProperty("--period-lane-mobile-offset", `${periodLanes[index] * 5}px`);
    }

    const dateLabel = document.createElement("div");
    dateLabel.className = "timeline-year";
    if (event.date) {
      const start = document.createElement("time");
      start.dateTime = event.date;
      start.textContent = formatDate(event.date);
      dateLabel.append(start);
      if (event.endDate && event.endDate !== event.date) {
        const separator = document.createElement("span");
        separator.textContent = copy.dateRangeSeparator;
        const end = document.createElement("time");
        end.dateTime = event.endDate;
        end.textContent = formatDate(event.endDate);
        dateLabel.append(separator, end);
      }
    } else {
      const year = document.createElement("time");
      year.dateTime = String(event.year);
      year.textContent = formatYear(event.year);
      dateLabel.append(year);
    }

    const dot = document.createElement("span");
    dot.className = "timeline-dot";
    dot.setAttribute("aria-hidden", "true");

    const period = event.endDate ? document.createElement("span") : null;
    if (period) {
      period.className = "timeline-period";
      period.setAttribute("aria-hidden", "true");
    }

    const card = document.createElement("article");
    card.className = "event-card";
    const category = document.createElement("span");
    category.className = "event-category";
    category.textContent = copy.categories[event.category] ?? event.category;
    const title = document.createElement("h3");
    title.textContent = event.title[language];
    const summary = document.createElement("p");
    summary.textContent = event.summary[language];
    card.append(category, title, summary);
    if (period) item.append(dateLabel, period, dot, card);
    else item.append(dateLabel, dot, card);
    return item;
  });
  visibleEvents = matchingEvents;
  timeline.replaceChildren(...items);
  positionPeriodBars();

  eventCount.textContent = copy.count(matchingEvents.length, events.length);
  emptyState.hidden = matchingEvents.length > 0;
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    localizePage();
  });
});

themeSwitch.querySelectorAll("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLocaleLowerCase(language);
  renderEvents();
});

window.addEventListener("resize", positionPeriodBars);

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

fetch("events.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Could not load events.json (${response.status})`);
    return response.json();
  })
  .then((data) => {
    events = validateEvents(data);
    localizePage();
  })
  .catch((error) => {
    console.error(error);
    loadMessage.hidden = false;
    loadMessage.textContent = translations[language].loadError;
  });

setTheme(theme);