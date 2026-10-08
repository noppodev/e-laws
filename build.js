import fs from "node:fs";
import path from "node:path";

const lawsDir = path.resolve("laws");
const files = fs.readdirSync(lawsDir)
  .filter(name => name.toLowerCase().endsWith(".xml"))
  .sort((a, b) => a.localeCompare(b, "ja"));

function esc(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;"
  }[c]));
}

const manifest = [];
for (const file of files) {
  const xml = fs.readFileSync(path.join(lawsDir, file), "utf8");
  const title =
    xml.match(/<Title>([\s\S]*?)<\/Title>/i)?.[1]?.trim() ||
    xml.match(/<LawName>([\s\S]*?)<\/LawName>/i)?.[1]?.trim() ||
    file.replace(/\.xml$/i, "");
  const id = file.replace(/\.xml$/i, "");
  manifest.push({ id, file, title });
}

fs.writeFileSync(
  path.join(lawsDir, "index.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

console.log(`e-Laws: ${manifest.length} law(s) indexed.`);
for (const law of manifest) console.log(` - ${law.title} (${law.file})`);
