import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const IPTV_URL = process.env.IPTV_SERVER;

    const html = await fetch(IPTV_URL).then(r => r.text());

    const match = html.match(/const allChannels = (\[.*?\]);/s);
    if (!match) return res.status(500).send("allChannels not found");

    const allChannels = JSON.parse(match[1]);
    
    let playlist = "#EXTM3U\n";

    for (const ch of allChannels) {
      const apiUrl = `http://localhost:3000/api/channel?id=${ch.channelId}`;

      playlist += `#EXTINF:-1 tvg-logo="${ch.logo}" tvg-id="${ch.channelId}" tvg-name="${ch.channelName}" group-title="${ch.groupName}",${ch.channelName}\n`;
      playlist += `${apiUrl}\n`;
    }

    res.setHeader("Content-Type", "application/x-mpegurl");
    res.send(playlist);
  } catch (err) {
    res.status(500).send("Server error");
  }
}
