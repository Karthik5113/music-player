const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express(); // ✅ app is defined here
const PORT = 3000;

/* Serve static files */
app.use(express.static(__dirname));

/* API: Get songs + covers */
app.get("/api/songs", (req, res) => {
  try {
    const songsDir = path.join(__dirname, "songs");
    const result = {};

    const folders = fs.readdirSync(songsDir);

    folders.forEach((folder) => {
      const folderPath = path.join(songsDir, folder);

      if (!fs.statSync(folderPath).isDirectory()) return;

      const files = fs.readdirSync(folderPath);

      const songs = files
        .filter((file) => file.endsWith(".mp3"))
        .map((file) => `songs/${folder}/${file}`);

      const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

      const coverFile = files.find(file =>
        imageExtensions.includes(path.extname(file).toLowerCase())
      );

      const cover = coverFile
        ? `songs/${folder}/${coverFile}`
        : "elements/default-cover.jpg";

      result[folder] = {
        cover,
        songs,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Failed to read songs folder" });
  }
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
