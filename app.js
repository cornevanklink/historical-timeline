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
    categories: { civilization: "Civilization", science: "Science", conflict: "Conflict", culture: "Culture" },
    loadError: "The timeline could not be loaded. Check that events.json is available and valid.",
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
    categories: { civilization: "Beschaving", science: "Wetenschap", conflict: "Conflict", culture: "Cultuur" },
    loadError: "De tijdlijn kon niet worden geladen. Controleer of events.json beschikbaar en geldig is.",
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
let events = [];
let language = "en";
let activeCategory = "all";
let searchTerm = "";

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

function renderEvents() {
  const copy = translations[language];
  const matchingEvents = events
    .filter((event) => activeCategory === "all" || event.category === activeCategory)
    .filter((event) => {
      const text = `${event.title[language]} ${event.summary[language]} ${event.year} ${event.category}`;
      return text.toLocaleLowerCase(language).includes(searchTerm);
    })
    .sort((first, second) => first.year - second.year);

  timeline.replaceChildren(...matchingEvents.map((event, index) => {
    const item = document.createElement("li");
    item.className = "timeline-item";
    item.dataset.category = event.category;
    item.style.animationDelay = `${Math.min(index, 12) * 35}ms`;

    const year = document.createElement("time");
    year.className = "timeline-year";
    year.dateTime = String(event.year);
    year.textContent = formatYear(event.year);

    const dot = document.createElement("span");
    dot.className = "timeline-dot";
    dot.setAttribute("aria-hidden", "true");

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
    item.append(year, dot, card);
    return item;
  }));

  eventCount.textContent = copy.count(matchingEvents.length, events.length);
  emptyState.hidden = matchingEvents.length > 0;
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    language = button.dataset.language;
    localizePage();
  });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLocaleLowerCase(language);
  renderEvents();
});

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
    if (!Array.isArray(data)) throw new Error("events.json must contain an array");
    events = data;
    localizePage();
  })
  .catch((error) => {
    console.error(error);
    loadMessage.hidden = false;
    loadMessage.textContent = translations[language].loadError;
  });