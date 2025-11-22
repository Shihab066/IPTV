export default function handler(req, res) {
  const id = req.query.id;

  if (!id) {
    return res.status(400).send("Missing channel ID");
  }

  return res.send("Channel ID received: " + id);
}
