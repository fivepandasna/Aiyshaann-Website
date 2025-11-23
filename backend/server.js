require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();
app.use(cors());

const PLAYER_TAG = "RVRLCJ8CP";
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

let cachedData = null;
let lastFetchTime = 0;

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all /api routes
app.use("/api/", limiter);

app.get("/api/clashroyale", async (req, res) => {
  try {
    const now = Date.now();

    // Check if we have cached data and it's still valid
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      console.log("Returning cached data");
      return res.json(cachedData);
    }

    // Fetch fresh data from clash API
    console.log("Fetching fresh data from API");
    const response = await fetch(
      `https://api.clashroyale.com/v1/players/%23${PLAYER_TAG}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CR_API_KEY}`,
        },
      },
    );
    const data = await response.json();

    // Cache data
    cachedData = {
      trophies: data.trophies,
      currentDeck: data.currentDeck.map((card) => ({
        name: card.name,
        iconUrl: card.iconUrls?.medium || null,
        evoIconUrl: card.iconUrls?.evolutionMedium || null,
        level: card.level || 0,
        rarity: card.rarity || "common",
        maxLevel: card.maxLevel,
        evolutionLevel: card.evolutionLevel || null,
        maxEvolutionLevel: card.maxEvolutionLevel || null,
      })),
    };
    lastFetchTime = now;

    res.json(cachedData);
  } catch (err) {
    console.error("Error fetching CR data:", err);

    // If API fails but we have cached data, return it
    if (cachedData) {
      console.log("API failed, returning stale cached data");
      return res.json(cachedData);
    }

    res.status(500).json({ error: "Failed to fetch CR data" });
  }
});

// Run server
app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
