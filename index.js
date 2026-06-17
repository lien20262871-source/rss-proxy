import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  const rss = await fetch("https://hojyokin-portal.jp/feed", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8",
      "Referer": "https://hojyokin-portal.jp/"
    }
  });

  const text = await rss.text();
  res.set("Content-Type", "application/xml");
  res.send(text);
});

app.listen(10000, () => console.log("RSS proxy running"));
