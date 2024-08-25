const express = require("express");
const multer = require('multer');
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

const router = express.Router();

const upload = multer();

router.post("/resume", upload.single("file"),async (req, res) => {
  const { file } = req;
  console.log(file);
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  if (file.mimetype !== "application/pdf") {
    res.status(400).json({
      message: "Invalid format",
    });
  } 
  const filename = `${uuidv4()}.pdf`;
  try {
    await fs.writeFile(`${__dirname}/../public/resume/${filename}`, file.buffer);
    res.send({
      message: "File uploaded successfully",
      url: `/host/resume/${filename}`,
    });
  } catch (err) {
    console.error("Error while uploading file:", err);
    res.status(500).json({
      message: "Error while uploading",
    });
  }
});
module.exports = router;
