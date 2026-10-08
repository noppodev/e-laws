const results = document.querySelector("#results");
const queryInput = document.querySelector("#query");
const count = document.querySelector("#count");
let laws = [];
let loaded = [];

async function loadManifest() {
  const response = await fetch("laws/index.json", { cache: "no-store" });
  if (!response.ok) throw new Error("laws/index.json を読み込めませんでした。");
  laws = await response.json();
  render(laws);
}

async function loadLawText(law) {
  if (loaded[law.id]) return loaded[law.id];
  const response = await fetch(`laws/${encodeURIComponent(law.file)}`);
  if (!response.ok) return "";
  const text = await response.text();
  loaded[law.id] = text;
  return text;
}

function render(list) {
  count.textContent = `${list.length}件`;
  results.innerHTML = "";
  if (!list.length) {
    results.innerHTML = `<p class="empty">該当する法令がありません。</p>`;
    return;
  }
  for (const law of list) {
    const a = document.createElement("a");
    a.className = "result";
    a.href = `law/?id=${encodeURIComponent(law.id)}`;
    a.innerHTML = `<strong>${escapeHtml(law.title)}</strong><span>${escapeHtml(law.file)}</span>`;
    results.appendChild(a);
  }
}

document.querySelector("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  search(queryInput.value);
});

let timer;
queryInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => search(queryInput.value), 180);
});

async function search(value) {
  const q = value.trim().toLowerCase();
  if (!q) return render(laws);

  const matched = [];
  for (const law of laws) {
    const haystack = `${law.title} ${law.file}`.toLowerCase();
    if (haystack.includes(q)) {
      matched.push(law);
      continue;
    }
    const text = (await loadLawText(law)).toLowerCase();
    if (text.includes(q)) matched.push(law);
  }
  render(matched);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

loadManifest().catch(err => {
  results.innerHTML = `<p class="error">${escapeHtml(err.message)}</p>`;
});
