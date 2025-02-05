require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Fix 1: Enable Full CORS Support
app.use(
  cors({
    origin: "*", // Allow all domains (or specify allowed domains)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ✅ Fix 2: Serve Static Files Properly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware for JSON Parsing
app.use(express.json());

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📤 Upload File API
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  console.log("File uploaded:", req.file.filename); // Debugging log

  res.json({
    message: "File uploaded successfully!",
    fileUrl: fileUrl,
  });
});

// 📁 Fetch List of Files API
app.get("/files", (req, res) => {
  const directoryPath = "uploads/";

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to fetch files." });
    }

    const fileUrls = files.map((file) => ({
      name: file,
      url: `${req.protocol}://${req.get("host")}/uploads/${file}`,
    }));

    res.json({ files: fileUrls });
  });
});

// 📥 Download File API
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
