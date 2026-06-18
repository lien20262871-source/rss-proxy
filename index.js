import express from "express";
import chromium from "chrome-aws-lambda";
import * as cheerio from "cheerio";

const app = express();

app.get("/", async (req, res) => {
  let browser = null;

  try {
    // Puppeteer 起動（Render 対応）
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();

    // 新着情報ページを開く
    await page.goto("https://hojyokin-portal.jp/news", {
      waitUntil: "networkidle2"
    });

    // JS 実行後の HTML を取得
    const html = await page.content();

    const $ = cheerio.load(html);

    const items = [];

    // 補助金ポータルの正しい記事構造
    $("li.p-news__item").each((i, el) => {
      const link = "https://hojyokin-portal.jp" + $(el).find("a").attr("href");
      const title = $(el).find(".p-news__title").text().trim();
      const date = $(el).find(".p-news__date").text().trim();

      items.push({ title, link, date });
    });

    // RSS XML を生成
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

    res.set("Content-Type
