import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const id = req.query.id;
    if (!id) {
      res.status(400).send("Missing id");
      return;
    }

    const PLAY_URL = `${process.env.IPTV_SERVER}/play.php?id=${id}`;

    const html = await fetch(PLAY_URL).then((r) => r.text());

    const encodedMatch = html.match(
      /const\s+encodedUrl\s*=\s*['"]([^'"]+)['"]/
    );
    if (!encodedMatch) {
      res.status(500).send("encodedUrl not found");
      return;
    }

    let decoded = Buffer.from(encodedMatch[1], "base64").toString("utf8");

    // Convert to direct .m3u8 URL
    decoded = decoded.replace("/embed.html", "/index.fmp4.m3u8");

    // Remove autoplay and mute query params
    decoded = decoded
      .replace(/([&?])(autoplay|mute)=[^&]+/g, "")
      .replace(/\?&/, "?")
      .replace(/&$/, "");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(decoded);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
