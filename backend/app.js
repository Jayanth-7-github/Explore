const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const fs = require("fs");
const path = require("path");
const citiesPath = path.join(__dirname, "cities.json");
let cities = [];
try {
  const data = fs.readFileSync(citiesPath, "utf-8");
  // Add a new city
  app.post("/api/cities", (req, res) => {
    const newCity = req.body;
    // Assign a new unique id
    const maxId = cities.reduce((max, c) => Math.max(max, c.id), 0);
    newCity.id = maxId + 1;
    // Assign ids to places if missing
    if (Array.isArray(newCity.places)) {
      let placeId = 1;
      newCity.places = newCity.places.map((p) => ({
        id: placeId++,
        name: p.name,
        description: p.description,
      }));
    } else {
      newCity.places = [];
    }
    cities.push(newCity);
    // Save to file
    try {
      fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), "utf-8");
    } catch (err) {
      return res.status(500).json({ error: "Failed to save city data" });
    }
    res.status(201).json(newCity);
  });
  cities = JSON.parse(data);
} catch (err) {
  console.error("Failed to load cities.json", err);
  cities = [];
}

// API route for all cities and their places
app.get("/api/cities", (req, res) => {
  res.json(cities);
});

// Update city details (including places)
app.put("/api/cities/:id", (req, res) => {
  const cityId = parseInt(req.params.id);
  const updatedCity = req.body;
  const index = cities.findIndex((c) => c.id === cityId);
  if (index === -1) {
    return res.status(404).json({ error: "City not found" });
  }
  // Keep the id consistent
  updatedCity.id = cityId;
  cities[index] = updatedCity;
  // Save to file
  const fs = require("fs");
  const path = require("path");
  const citiesPath = path.join(__dirname, "cities.json");
  try {
    fs.writeFileSync(citiesPath, JSON.stringify(cities, null, 2), "utf-8");
  } catch (err) {
    return res.status(500).json({ error: "Failed to save city data" });
  }
  res.json(updatedCity);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
