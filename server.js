require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend from public/
app.use(express.static(path.join(__dirname, "public")));

const PLAYER_TAG = "RVRLCJ8CP"; // Without the '#'
const API_KEY = process.env.CR_API_KEY;

if (!API_KEY) {
  console.warn("Warning: CR_API_KEY not set. Create a .env file from .env.example and add your key.");
}

app.get("/api/clashroyale", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Server missing CR_API_KEY. See .env.example" });
  }

  try {
    const url = `https://api.clashroyale.com/v1/players/%23${PLAYER_TAG}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/json"
      }
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("CR API responded with status", resp.status, text);
      return res.status(resp.status).json({ error: "Failed to fetch from Clash Royale API", details: text });
    }

    const data = await resp.json();

    // extract minimal info to send to the client
    const trophies = data.trophies ?? null;
    const currentDeck = Array.isArray(data.currentDeck) ? data.currentDeck.map(c => `${c.name} (Level ${c.level ?? "?"})`) : [];

    res.json({ trophies, currentDeck });
  } catch (err) {
    console.error("Error fetching Clash Royale API:", err);
    res.status(500).json({ error: "Internal server error fetching CR data" });
  }
});

// optional: a simple health check
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
