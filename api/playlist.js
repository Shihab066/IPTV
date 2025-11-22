export default async function handler(req, res) {
  try {
    const server = process.env.IPTV_SERVER;

    if (!server) {
      return res.status(500).send("IPTV server not configured");
    }

    // Fetch the HTML
    const response = await fetch(`${server}/`);
    const html = await response.text();

    // Extract allChannels
    const channelsMatch = html.match(/const allChannels = (\[.*?\]);/s);
    if (!channelsMatch) {
      return res.status(500).send("Could not find allChannels in HTML");
    }

    const allChannels = JSON.parse(channelsMatch[1]);

    // Build playlist
    let playlist = "#EXTM3U\n\n";
    const base = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/channel`;

    allChannels.forEach((ch) => {
      playlist += `#EXTINF:-1 tvg-id="${ch.id}" group-title="${ch.category}", ${ch.name}\n`;
      playlist += `${base}?id=${ch.id}\n\n`;
    });

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.send(playlist.trim());
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}
