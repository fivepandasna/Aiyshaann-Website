require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
app.use(cors());

const PLAYER_TAG = "RVRLCJ8CP";
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

let cachedData = null;
let lastFetchTime = 0;

app.get("/api/clashroyale", async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if we have cached data and it's still valid
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      console.log("Returning cached data");
      return res.json(cachedData);
    }
    
    // Fetch fresh data from API
    console.log("Fetching fresh data from API");
    const response = await fetch(`https://api.clashroyale.com/v1/players/%23${PLAYER_TAG}`, {
      headers: {
        Authorization: `Bearer ${process.env.CR_API_KEY}`
      }
    });
    const data = await response.json();
    
    // Cache the processed data
    cachedData = {
      trophies: data.trophies,
      currentDeck: data.currentDeck.map(card => ({
        name: card.name,
        iconUrl: card.iconUrls?.medium || null,
        evoIconUrl: card.iconUrls?.evolutionMedium || null,
        level: card.level || 0,
        rarity: card.rarity || 'common',
        maxLevel: card.maxLevel,
        evolutionLevel: card.evolutionLevel || null,
        maxEvolutionLevel: card.maxEvolutionLevel || null
      }))
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
