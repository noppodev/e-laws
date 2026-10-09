const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const LAWS_DIR = path.join(__dirname, "laws");
const FONT_PATH = path.join(__dirname, "fonts", "NotoSansJP-Regular.ttf");

// ------------------------------------------------------------
// 基本設定
// ------------------------------------------------------------

if (!fs.existsSync(LAWS_DIR)) {
  throw new Error("laws/ directory not found.");
}

if (!fs.existsSync(FONT_PATH)) {
  throw new Error(
    "Japanese font not found: fonts/NotoSansJP-Regular.ttf"
  );
}

// XMLの特殊文字を戻す
function decodeXml(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// XMLタグの中身を取得
function getTag(xml, tag) {
  const regex = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  const match = xml.match(regex);

  if (!match) return "";

  return decodeXml(
    match[1]
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim()
  );
}

// XML属性を取得
function getAttribute(text, attribute) {
  const regex = new RegExp(
    `${attribute}\\s*=\\s*["']([^"']*)["']`,
    "i"
  );

  const match = text.match(regex);

  return match ? decodeXml(match[1]) : "";
}

// XMLからArticleを取得
function parseArticles(xml) {
  const articles = [];

  const articleRegex =
    /<Article\b([^>]*)>([\s\S]*?)<\/Article>/gi;

  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const attributes = match[1];
    const body = match[2];

    const num = getAttribute(attributes, "Num");
    const sentences = [];

    const sentenceRegex =
      /<Sentence\b[^>]*>([\s\S]*?)<\/Sentence>/gi;

    let sentenceMatch;

    while ((sentenceMatch = sentenceRegex.exec(body)) !== null) {
      const text = decodeXml(
        sentenceMatch[1]
          .replace(/<[^>]+>/g, "")
          .trim()
      );

      if (text) {
        sentences.push(text);
      }
    }

    // Sentenceがない場合にも対応
    if (sentences.length === 0) {
      const plain = body
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (plain) {
        sentences.push(decodeXml(plain));
      }
    }

    articles.push({
      num,
      sentences
    });
  }

  return articles;
}

// XMLからChapterを取得
function parseChapters(xml) {
  const chapters = [];

  const chapterRegex =
    /<Chapter\b([^>]*)>([\s\S]*?)<\/Chapter>/gi;

  let match;

  while ((match = chapterRegex.exec(xml)) !== null) {
    const attributes = match[1];
    const body = match[2];

    const num = getAttribute(attributes, "Num");
    const title = getTag(body, "ChapterTitle");

    chapters.push({
      num,
      title,
      articles: parseArticles(body)
    });
  }

  return chapters;
}

// ------------------------------------------------------------
// XML → 法令データ
// ------------------------------------------------------------

function parseLaw(filename) {
  const filepath = path.join(LAWS_DIR, filename);
  const xml = fs.readFileSync(filepath, "utf8");

  const title = getTag(xml, "Title");
  const preamble = getTag(xml, "Preamble");

  const chapters = parseChapters(xml);

  let articleCount = 0;

  for (const chapter of chapters) {
    articleCount += chapter.articles.length;
  }

  return {
    id: path.basename(filename, ".xml"),
    filename,
    title: title || path.basename(filename, ".xml"),
    preamble,
    chapters,
    articleCount
  };
}

// ------------------------------------------------------------
// index.json生成
// ------------------------------------------------------------

function buildIndex(laws) {
  const index = laws.map((law) => ({
    id: law.id,
    title: law.title,
    filename: law.filename,
    articleCount: law.articleCount
  }));

  const output = JSON.stringify(index, null, 2);

  fs.writeFileSync(
    path.join(LAWS_DIR, "index.json"),
    output + "\n",
    "utf8"
  );
}

// ------------------------------------------------------------
// PDF生成
// ------------------------------------------------------------

function generatePdf(law) {
  const outputPath = path.join(
    LAWS_DIR,
    `${law.id}.pdf`
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 60,
        bottom: 60,
        left: 65,
        right: 65
      },
      info: {
        Title: law.title,
        Author: "e-Laws",
        Subject: "法令"
      }
    });

    const stream = fs.createWriteStream(outputPath);

    stream.on("finish", resolve);
    stream.on("error", reject);

    doc.pipe(stream);

    // 日本語フォント
    doc.font(FONT_PATH);

    // --------------------------------------------------------
    // 表紙
    // --------------------------------------------------------

    doc
      .fontSize(24)
      .text(law.title, {
        align: "center",
        lineGap: 8
      });

    doc.moveDown(1.5);

    doc
      .fontSize(10)
      .text("e-Laws 法令データベース", {
        align: "center"
      });

    doc.moveDown(4);

    // 前文
    if (law.preamble) {
      doc
        .fontSize(15)
        .text("前文", {
          align: "center"
        });

      doc.moveDown(1);

      doc
        .fontSize(11)
        .lineGap(5)
        .text(law.preamble, {
          align: "justify"
        });

      doc.moveDown(2);
    }

    // --------------------------------------------------------
    // 本文
    // --------------------------------------------------------

    for (const chapter of law.chapters) {
      // 新しい章
      doc.addPage();

      doc
        .fontSize(17)
        .text(
          chapter.num
            ? `第${chapter.num}章　${chapter.title}`
            : chapter.title,
          {
            align: "center"
          }
        );

      doc.moveDown(1.5);

      for (const article of chapter.articles) {
        // 条文見出し
        doc
          .fontSize(13)
          .text(
            article.num
              ? `第${article.num}条`
              : "条文",
            {
              continued: false
            }
          );

        doc.moveDown(0.4);

        // 各項
        article.sentences.forEach((sentence, index) => {
          const paragraph =
            article.sentences.length > 1
              ? `　${index + 1}　${sentence}`
              : `　${sentence}`;

          doc
            .fontSize(11)
            .lineGap(4)
            .text(paragraph, {
              align: "left"
            });

          doc.moveDown(0.35);
        });

        doc.moveDown(0.8);
      }
    }

    // --------------------------------------------------------
    // ページ番号
    // --------------------------------------------------------

    // PDFKitではページ番号を後から全ページに付けるため、
    // 今回は文書生成時のフッターとして扱う。

    const range = doc.bufferedPageRange();

    for (
      let i = range.start;
      i < range.start + range.count;
      i++
    ) {
      doc.switchToPage(i);

      doc
        .font(FONT_PATH)
        .fontSize(8)
        .text(
          `${law.title}　｜　${i + 1}`,
          65,
          doc.page.height - 35,
          {
            width:
              doc.page.width -
              doc.page.margins.left -
              doc.page.margins.right,
            align: "center"
          }
        );
    }

    doc.end();
  });
}

// ------------------------------------------------------------
// 古い生成PDFを削除
// ------------------------------------------------------------

function removeOldPdfs() {
  const files = fs.readdirSync(LAWS_DIR);

  for (const file of files) {
    if (file.toLowerCase().endsWith(".pdf")) {
      fs.unlinkSync(
        path.join(LAWS_DIR, file)
      );
    }
  }
}

// ------------------------------------------------------------
// メイン処理
// ------------------------------------------------------------

async function main() {
  console.log("================================");
  console.log("e-Laws build");
  console.log("================================");

  const files = fs
    .readdirSync(LAWS_DIR)
    .filter(
      (file) =>
        file.toLowerCase().endsWith(".xml")
    )
    .sort();

  if (files.length === 0) {
    throw new Error(
      "No XML law files found in laws/."
    );
  }

  console.log(`Found ${files.length} XML file(s).`);

  // 既存PDFを削除
  removeOldPdfs();

  // XMLを読み込む
  const laws = [];

  for (const file of files) {
    console.log(`Reading: ${file}`);

    const law = parseLaw(file);

    console.log(
      `  → ${law.title} (${law.articleCount} articles)`
    );

    laws.push(law);
  }

  // index.json
  buildIndex(laws);

  console.log("Generated: laws/index.json");

  // PDF
  for (const law of laws) {
    console.log(
      `Generating PDF: ${law.id}.pdf`
    );

    await generatePdf(law);

    console.log(
      `  → laws/${law.id}.pdf`
    );
  }

  console.log("================================");
  console.log("Build completed successfully.");
  console.log("================================");
}

main().catch((error) => {
  console.error("");
  console.error("BUILD FAILED");
  console.error(error);
  process.exit(1);
});
