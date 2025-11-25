import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import API handlers
import playlistHandler from "./api/playlist.js";

const app = express();
app.use(cors());
dotenv.config();

// Manually add endpoints
app.get("/api/playlist", playlistHandler);
app.get("/", (req, res) => res.send("hello"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local IPTV server running at http://localhost:${PORT}`);
});
