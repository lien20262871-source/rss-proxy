import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", async (req, res) => {
  try {
    const response = await fetch("https://hojyokin-portal.jp/feed", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://hojyokin-portal.jp/"
      }
    });

    const text = await response.text();

    // RSSが壊れていても安全に表示できるようにする
    if (!text.trim().startsWith("<")) {
      res.status(404).send("Feed not found or invalid XML source");
      return;
    }

    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(text);
  } catch (error) {
    console.error("Error fetching RSS:", error);
    res.status(500).send("Failed to fetch RSS feed");
  }
});

app.listen(10000, () => console.log("RSS proxy running"));
