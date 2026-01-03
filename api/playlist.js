import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const IPTV_URL = process.env.IPTV_SERVER;
    const host = req.get("host");

    const html = await fetch(IPTV_URL).then((r) => r.text());

    // 1. Extract encryptedData
    const match = html.match(/const encryptedData\s*=\s*"([^"]+)"/);
    if (!match) {
      return res.status(500).send("encryptedData not found");
    }

    // 2. Decode Base64 → JSON
    const decoded = Buffer.from(match[1], "base64").toString("utf-8");

    // 3. Parse channels
    const allChannels = JSON.parse(decoded);

    let playlist = "#EXTM3U\n";

    for (const ch of allChannels) {
      const apiUrl = `http://${host}/api/channel?id=${ch.channelId}`;

      playlist += `#EXTINF:-1 tvg-logo="${ch.logo}" tvg-id="${ch.channelId}" tvg-name="${ch.channelName}" group-title="${ch.groupName}",${ch.channelName}\n`;
      playlist += `${apiUrl}\n`;
    }

    res.setHeader("Content-Type", "application/x-mpegurl");
    res.send(playlist);
  } catch (err) {
    res.status(500).send("Server error");
  }
}
