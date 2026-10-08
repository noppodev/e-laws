const params = new URLSearchParams(location.search);
const id = params.get("id");

const meta = document.querySelector("#lawMeta");
const content = document.querySelector("#lawContent");
const xmlLink = document.querySelector("#xmlLink");

if (!id) {
  content.innerHTML = `<p class="error">法令が指定されていません。</p>`;
} else {
  load();
}

async function load() {
  const manifestRes = await fetch("../laws/index.json", { cache: "no-store" });
  const laws = await manifestRes.json();
  const law = laws.find(x => x.id === id);
  if (!law) throw new Error("指定された法令が見つかりません。");

  const res = await fetch(`../laws/${encodeURIComponent(law.file)}`);
  if (!res.ok) throw new Error("法令XMLを読み込めませんでした。");
  const xmlText = await res.text();

  xmlLink.href = `../laws/${encodeURIComponent(law.file)}`;
  xmlLink.download = law.file;
  meta.innerHTML = `<p class="eyebrow">法令</p><h1>${escapeHtml(law.title)}</h1><p class="filename">${escapeHtml(law.file)}</p>`;

  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("XMLの形式が正しくありません。");

  renderLaw(xml);
}

function renderLaw(xml) {
  content.innerHTML = "";

  const preamble = xml.querySelector(":scope > Preamble");
  if (preamble) {
    const section = document.createElement("section");
    section.className = "preamble";
    section.textContent = preamble.textContent.trim();
    content.appendChild(section);
  }

  xml.querySelectorAll(":scope > Chapter").forEach(chapter => {
    const chapterSection = document.createElement("section");
    chapterSection.className = "chapter";

    const title = document.createElement("h2");
    title.textContent = `第${chapter.getAttribute("Num")}章 ${chapter.querySelector(":scope > ChapterTitle")?.textContent ?? ""}`.trim();
    chapterSection.appendChild(title);

    chapter.querySelectorAll(":scope > Article").forEach(article => {
      const articleEl = document.createElement("section");
      articleEl.className = "article";
      const num = article.getAttribute("Num");
      const heading = document.createElement("h3");
      heading.textContent = `第${num}条`;
      articleEl.appendChild(heading);

      const paragraphs = article.querySelectorAll(":scope > Paragraph");
      if (paragraphs.length) {
        paragraphs.forEach((p, i) => {
          const row = document.createElement("p");
          const pnum = p.getAttribute("Num");
          row.innerHTML = `<span class="para-num">${pnum ? ` ${pnum} ` : ""}</span>${escapeHtml(p.querySelector(":scope > Sentence")?.textContent ?? p.textContent)}`;
          articleEl.appendChild(row);
        });
      } else {
        const sentence = article.querySelector(":scope > Sentence");
        const row = document.createElement("p");
        row.textContent = sentence?.textContent ?? "";
        articleEl.appendChild(row);
      }
      chapterSection.appendChild(articleEl);
    });
    content.appendChild(chapterSection);
  });
}

document.querySelector("#pdfButton").addEventListener("click", () => window.print());

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}
