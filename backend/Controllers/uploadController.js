const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.status(200).json({ url });
};

module.exports = { uploadImage };
