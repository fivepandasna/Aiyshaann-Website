require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();
app.use(cors());
const PLAYER_TAG = "RVRLCJ8CP";
app.get("/api/clashroyale", async (req, res) => {
  try {
    const response = await fetch(`https://api.clashroyale.com/v1/players/%23${PLAYER_TAG}`, {
      headers: {
        Authorization: `Bearer ${process.env.CR_API_KEY}`
      }
    });
    const data = await response.json();
    
    // Return card objects with names, icon URLs, levels, and evolution status
    res.json({
      trophies: data.trophies,
      currentDeck: data.currentDeck.map(card => ({
        name: card.name,
        iconUrl: card.iconUrls?.medium || null,
        evoIconUrl: card.iconUrls?.evolutionMedium || null,
        level: card.level || 0,
        rarity: card.rarity || 'common',  // Add rarity
        maxLevel: card.maxLevel,
        evolutionLevel: card.evolutionLevel || null,
        maxEvolutionLevel: card.maxEvolutionLevel || null
      }))
    });
  } catch (err) {
    console.error("Error fetching CR data:", err);
    res.status(500).json({ error: "Failed to fetch CR data" });
  }
});
// Run server
app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
