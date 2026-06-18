import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();

const API_KEY = process.env.SCRAPINGANT_KEY;

app.get("/", async (req, res) => {
  try {
    const targetUrl = "https://hojyokin-portal.jp/news";

    const apiUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(targetUrl)}&x-api-key=${API_KEY}`;

    const response = await fetch(apiUrl);
    const html = await response.text();

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
    console.error(error);
    res.status(500).send("RSS生成に失敗しました");
  }
});

app.listen(10000, () => console.log("RSS proxy running"));
