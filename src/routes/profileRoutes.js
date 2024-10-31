// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const {
	getProfilePicController,
	uploadProfileImage,
} = require('../controllers/profileController');

const router = express.Router();
const upload = multer();

router.post(
	'/upload-profile-image',
	authMiddleware,
	upload.single('image'),
	uploadProfileImage
);
router.get('/profile-images/:userId', getProfilePicController);

module.exports = router;
