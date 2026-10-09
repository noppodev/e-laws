const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pdfkit = require('pdfkit');
const xml2js = require('xml2js');

const lawsDir = path.join(__dirname, 'laws');
const files = fs.readdirSync(lawsDir).filter(f => f.toLowerCase().endsWith('.xml'));
const entries = [];

function textOf(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (typeof node === 'object') return node._ ? String(node._) : '';
  return String(node);
}

function articleText(a) {
  const paras = a.Paragraph || [];
  if (paras.length) return paras.map(p => textOf(p.Sentence)).join(' ');
  return textOf(a.Sentence);
}

function addPdf(entry, parsed) {
  const pdfPath = path.join(lawsDir, entry.file.replace(/\.xml$/i, '.pdf'));
  const doc = new pdfkit({size: 'A4', margin: 56, info: {Title: entry.title, Subject: 'e-Laws 法令PDF'}});
  const out = fs.createWriteStream(pdfPath);
  doc.pipe(out);
  // Japanese-capable font bundled from system when available; fallback to Helvetica.
  const fonts = ['/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'];
  const font = fonts.find(fs.existsSync);
  if (font) doc.font(font);
  doc.fontSize(20).text(entry.title, {align:'center'}).moveDown(1.5);
  if (parsed.Constitution && parsed.Constitution.Preamble) {
    doc.fontSize(11).text('前文', {align:'center'}).moveDown(.5);
    doc.text(textOf(parsed.Constitution.Preamble), {align:'justify'}).moveDown(1);
  }
  const chapters = parsed.Constitution?.Chapter || [];
  for (const ch of chapters) {
    const ct = textOf(ch.ChapterTitle);
    if (ct) doc.fontSize(14).text(`第${ch.$?.Num || ''}章　${ct}`).moveDown(.4);
    for (const a of (ch.Article || [])) {
      doc.fontSize(11).text(`第${a.$?.Num || ''}条`, {continued:false});
      const body = articleText(a);
      if (body) doc.text(body, {indent: 14, lineGap: 2}).moveDown(.4);
    }
  }
  if (!chapters.length) {
    const articles = parsed.Law?.Article || parsed.Constitution?.Article || [];
    for (const a of articles) {
      doc.fontSize(11).text(`第${a.$?.Num || ''}条`);
      doc.text(articleText(a), {indent:14, lineGap:2}).moveDown(.4);
    }
  }
  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

(async () => {
  for (const file of files) {
    const xml = fs.readFileSync(path.join(lawsDir, file), 'utf8');
    const parsed = await xml2js.parseStringPromise(xml, {explicitArray:true, trim:true});
    const root = parsed.Constitution || parsed.Law || {};
    const title = textOf(root.Title) || path.basename(file, '.xml');
    const entry = {id:path.basename(file,'.xml'), file, title, pdf:file.replace(/\.xml$/i,'.pdf')};
    entries.push(entry);
    await addPdf(entry, parsed);
  }
  entries.sort((a,b) => a.title.localeCompare(b.title, 'ja'));
  fs.writeFileSync(path.join(lawsDir,'index.json'), JSON.stringify(entries,null,2)+'\n');
  console.log(`Generated ${entries.length} law entries.`);
})();
