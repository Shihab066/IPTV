import fetch from "node-fetch";

let cachedPlaylist = null;
let lastGenerated = 0;
const CACHE_TIME = 1000 * 60 * 60 * 4; // 4 hours

export default async function handler(req, res) {
  try {
    const IPTV_URL = process.env.IPTV_SERVER;

    // If playlist exists AND not expired → return it instantly
    if (cachedPlaylist && Date.now() - lastGenerated < CACHE_TIME) {
      res.setHeader("Content-Type", "application/x-mpegurl");
      return res.send(cachedPlaylist);
    }

    // Fetch main page (list of channels)
    const html = await fetch(IPTV_URL).then((r) => r.text());
    const match = html.match(/const allChannels = (\[.*?\]);/s);

    if (!match) return res.status(500).send("allChannels not found");

    const allChannels = JSON.parse(match[1]);

    let playlist = "#EXTM3U\n";

    // Loop through each channel
    for (const ch of allChannels) {
      const playUrl = `${IPTV_URL}/play.php?id=${ch.channelId}`;

      // Fetch channel play page
      const page = await fetch(playUrl).then((r) => r.text());
      const encodedMatch = page.match(
        /const\s+encodedUrl\s*=\s*['"]([^'"]+)['"]/
      );

      if (!encodedMatch) continue; // Skip if missing

      let decoded = Buffer.from(encodedMatch[1], "base64").toString("utf8");

      // Convert to direct stream URL
      decoded = decoded
        .replace("/embed.html", "/index.fmp4.m3u8")
        .replace(/([&?])(autoplay|mute)=[^&]+/g, "")
        .replace(/\?&/, "?")
        .replace(/&$/, "");

      playlist += `#EXTINF:-1 tvg-id="${ch.channelId}" tvg-logo="${ch.logo}" group-title="${ch.groupName}",${ch.channelName}\n`;
      playlist += `${decoded}\n`;
    }

    // Cache playlist
    cachedPlaylist = playlist;
    lastGenerated = Date.now();

    res.setHeader("Content-Type", "application/x-mpegurl");
    res.send(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
