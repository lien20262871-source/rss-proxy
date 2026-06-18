import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();

const API_KEY = process.env.SCRAPINGANT_KEY;

app.get("/", async (req, res) => {
  try {
    const targetUrl = "https://www.metro.tokyo.lg.jp/tosei/hodohappyo/index.html";

    const apiUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(targetUrl)}&x-api-key=${API_KEY}`;

    const response = await fetch(apiUrl);
    const html = await response.text();

    const $ = cheerio.load(html);
    const items = [];

    $("ul.list-link li").each((i, el) => {
      const link = "https://www.metro.tokyo.lg.jp" + $(el).find("a").attr("href");
      const date = $(el).find(".date").text().trim();
      const title = $(el).find(".title").text().trim();

      items.push({ title, link, date });
    });

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title>東京都庁 都政ニュース</title>
<link>https://www.metro.tokyo.lg.jp/tosei/hodohappyo/index.html</link>
<description>東京都庁の都政ニュースを自動生成したRSSです</description>
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
