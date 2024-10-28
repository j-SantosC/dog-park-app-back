const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createUser, login } = require('./controllers/authController');
const multer = require('multer');
const upload = multer();

const authMiddleware = require('./middlewares/authMiddleware');
const { uploadProfileImage } = require('./controllers/uploadController');
const { getFirstProfileImageStream } = require('./services/firebaseService');

dotenv.config();

const app = express();

// Only apply JSON middleware to specific routes that require JSON parsing
app.use('/login', express.json());
app.use('/create-user', express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.post(
  '/upload-profile-image',
  authMiddleware,
  upload.single('image'),
  uploadProfileImage
);

app.post('/login', login);
app.post('/create-user', createUser);

app.get('/profile-images/:userId', async (req, res) => {
  const userId = req.params.userId; // Retrieve the userId from the route
  try {
      const imageStream = await getFirstProfileImageStream(userId); // Pass userId to the function
      res.setHeader('Content-Type', 'image/jpeg'); // Adjust based on image type
      imageStream.pipe(res); // Stream the image directly
  } catch (error) {
      console.error('Error retrieving profile image:', error);
      res.status(500).send('Error retrieving profile image');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
