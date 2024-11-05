require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Photo = require('./models/photo');
const path = require('path');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB:', err));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes

// Home route - Display all photos
app.get('/', async (req, res) => {
  const photos = await Photo.find({ inRecycleBin: false });
  res.render('index', { photos });
});

// Upload form route
app.get('/upload', (req, res) => {
  res.render('upload');
});

// Handle file upload
app.post('/upload', upload.single('photo'), async (req, res) => {
  const photo = new Photo({
    filename: req.file.filename,
    originalName: req.file.originalname,
  });
  await photo.save();
  res.redirect('/');
});

// Delete photo (move to recycle bin)
app.post('/delete/:id', async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (photo) {
    photo.inRecycleBin = true;
    await photo.save();
  }
  res.redirect('/');
});

// View recycle bin
app.get('/recycle-bin', async (req, res) => {
  const photos = await Photo.find({ inRecycleBin: true });
  res.render('index', { photos });
});

// Restore photo from recycle bin
app.post('/restore/:id', async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (photo) {
    photo.inRecycleBin = false;
    await photo.save();
  }
  res.redirect('/recycle-bin');
});

// Permanent delete from recycle bin
app.post('/permanent-delete/:id', async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (photo) {
    await photo.deleteOne();
  }
  res.redirect('/recycle-bin');
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
