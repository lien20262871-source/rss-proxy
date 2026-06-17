import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  try {
    const rss = await fetch("https://hojyokin-portal.jp/feed", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://hojyokin-portal.jp/"
      }
    });

    const text = await rss.text();

    // XML の構文エラーを避けるため、text/plain として返す
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(text);
  } catch (error) {
    console.error("Error fetching RSS:", error);
    res.status(500).send("Failed to fetch RSS feed");
  }
});

app.listen(10000, () => console.log("RSS proxy running"));
