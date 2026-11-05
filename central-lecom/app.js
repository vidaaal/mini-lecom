const root = document.documentElement;
const searchInput = document.querySelector("#search");
const articles = [...document.querySelectorAll("[data-article]")];
const groups = [...document.querySelectorAll("[data-group]")];
const chips = [...document.querySelectorAll("[data-filter]")];
const navItems = [...document.querySelectorAll(".nav-item[data-cat]")];
const favToggle = document.querySelector("#fav-toggle");
const favCount = document.querySelector("#fav-count");
const resultsCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const scrim = document.querySelector("#scrim");
const menuBtn = document.querySelector("#menu-btn");
const closeSidebar = document.querySelector("#close-sidebar");
const themeToggle = document.querySelector("#theme-toggle");

const favoritesKey = "central-lecom-favorites-v1";
let activeCategory = "all";
let favoritesOnly = false;
let toastTimer;

function readFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(favoritesKey) || "[]"));
  } catch {
    return new Set();
  }
}
let favorites = readFavorites();

function normalizeText(value) {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function syncFavoriteButtons() {
  for (const article of articles) {
    const button = article.querySelector("[data-favorite]");
    if (!button) continue;
    const saved = favorites.has(article.id);
    button.classList.toggle("saved", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.textContent = saved ? "★ Salvo" : "☆ Salvar";
  }
  favCount.textContent = String(favorites.size);
}

function applyFilters() {
  const query = normalizeText(searchInput.value.trim());
  let visible = 0;

  for (const article of articles) {
    const matchText =
      !query || normalizeText(article.textContent).includes(query);
    const matchCategory =
      activeCategory === "all" || article.dataset.category === activeCategory;
    const matchFavorite = !favoritesOnly || favorites.has(article.id);
    article.hidden = !(matchText && matchCategory && matchFavorite);
    if (!article.hidden) visible += 1;
  }

  for (const group of groups) {
    group.hidden = !group.querySelector("[data-article]:not([hidden])");
  }

  for (const item of navItems) {
    item.classList.toggle("active", item.dataset.cat === activeCategory);
  }

  for (const chip of chips) {
    chip.classList.toggle("active", chip.dataset.filter === activeCategory);
  }

  favToggle.classList.toggle("active", favoritesOnly);
  resultsCount.textContent = `${visible} ${visible === 1 ? "página" : "páginas"}`;
  emptyState.hidden = visible !== 0;
}

function selectCategory(category) {
  activeCategory = category;
  favoritesOnly = false;
  applyFilters();
}

for (const chip of chips) {
  chip.addEventListener("click", () => selectCategory(chip.dataset.filter));
}

for (const item of navItems) {
  item.addEventListener("click", () => {
    selectCategory(item.dataset.cat);
    closeMenu();
  });
}

searchInput.addEventListener("input", applyFilters);

favToggle.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  applyFilters();
});

document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  activeCategory = "all";
  favoritesOnly = false;
  applyFilters();
  searchInput.focus();
});

document.addEventListener("click", async (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const article = favoriteButton.closest("[data-article]");
    if (favorites.has(article.id)) favorites.delete(article.id);
    else favorites.add(article.id);
    try {
      localStorage.setItem(favoritesKey, JSON.stringify([...favorites]));
    } catch {}
    syncFavoriteButtons();
    applyFilters();
    notify(
      favorites.has(article.id)
        ? "Adicionado aos favoritos"
        : "Removido dos favoritos"
    );
    return;
  }

  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    const article = copyButton.closest("[data-article]");
    const link = `${location.href.split("#")[0]}#${article.id}`;
    try {
      if (navigator.clipboard && location.protocol !== "file:") {
        await navigator.clipboard.writeText(link);
      } else {
        const helper = document.createElement("textarea");
        helper.value = link;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.append(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      notify("Link copiado");
    } catch {
      notify("Não foi possível copiar");
    }
  }
});

// Theme
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("central-lecom-theme", theme);
  } catch {}
}

const savedTheme = (() => {
  try {
    return localStorage.getItem("central-lecom-theme");
  } catch {
    return null;
  }
})();
if (savedTheme === "dark" || savedTheme === "light") {
  applyTheme(savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  applyTheme("dark");
}

themeToggle.addEventListener("click", () => {
  const next =
    root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

// Mobile menu
function openMenu() {
  sidebar.classList.add("open");
  scrim.classList.add("show");
}
function closeMenu() {
  sidebar.classList.remove("open");
  scrim.classList.remove("show");
}
menuBtn.addEventListener("click", openMenu);
closeSidebar.addEventListener("click", closeMenu);
scrim.addEventListener("click", closeMenu);

// Keyboard shortcut for search
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === "Escape") {
    closeMenu();
    if (document.activeElement === searchInput) searchInput.blur();
  }
});

// Open article from hash
function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  if (el && el.matches("[data-article]")) {
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

window.addEventListener("hashchange", openFromHash);

// Init
syncFavoriteButtons();
applyFilters();
openFromHash();
