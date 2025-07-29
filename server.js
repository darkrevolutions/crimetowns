const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json()); // parse JSON bodies

// Ensure uploads folder exists
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer setup for saving uploaded videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Serve static frontend files from 'public' folder (put your html/css/js files here)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded videos statically
app.use('/uploads', express.static(uploadFolder));

// In-memory array to store videos metadata
const videos = [];

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
  const { title, category, user } = req.body;

  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
  if (!title || !category || !user) return res.status(400).json({ error: 'Missing fields' });

  const video = {
    id: Date.now(),
    title,
    category,
    user,
    date: new Date().toLocaleDateString(),
    src: '/uploads/' + req.file.filename
  };

  videos.push(video);

  res.json({ message: 'Upload successful', video });
});

// List videos endpoint
app.get('/videos', (req, res) => {
  res.json(videos);
});

// Delete video endpoint
app.delete('/delete', (req, res) => {
  const idNum = Number(req.body.id);
  if (!idNum) return res.status(400).json({ error: 'Video ID is required' });

  const index = videos.findIndex(v => v.id === idNum);
  if (index === -1) return res.status(404).json({ error: 'Video not found' });

  const video = videos[index];
  const filePath = path.join(__dirname, video.src);

  fs.unlink(filePath, err => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ error: 'Failed to delete video file' });
    }

    videos.splice(index, 1);
    res.json({ message: 'Video deleted successfully' });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
