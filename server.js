import express from "express";
import cors from "cors";

// Import API handlers
import playlistHandler from "./api/playlist.js";
import channelHandler from "./api/channel.js";

const app = express();
app.use(cors());

// Manually add endpoints
app.get("/api/playlist", playlistHandler);
app.get("/api/channel", channelHandler);
app.get("/", (req, res) => res.send("hello"));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local IPTV server running at http://localhost:${PORT}`);
});
