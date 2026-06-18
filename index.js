import express from "express";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const app = express();

app.get("/", async (req, res) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium",   // ← 修正ポイント
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://hojyokin-portal.jp/news", {
      waitUntil: "networkidle2"
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const items = [];

    $("li.p-news__item").each((i, el) => {
      const link = "https://hojyokin-portal.jp" + $(el).find("a").attr("href");
      const title = $(el).find(".p-news__title").text().trim();
      const date = $(el).find(".p-news__date").text().trim();

      items.push({ title, link, date });
    });

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>補助金ポータル 新着情報</title>
<link>https://hojyokin-portal.jp/news</link>
<description>補助金ポータルの新着情報を自動生成したRSSです</description>
`;

    items.forEach(item => {
      rss += `
<item>
<title>${item.title}</title>
<link>${item.link}</link>
<pubDate>${item.date}</pubDate>
</item>
`;
    });

    rss += `
</channel>
</rss>
`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(rss);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Failed to generate RSS");
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
});

app.listen(10000, () => console.log("RSS proxy running"));
