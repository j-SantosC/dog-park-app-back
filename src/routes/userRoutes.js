const express = require('express');
const {
	addUserController,
	getUserController,
	updateUserController,
	uploadProfileImage,
	getProfilePicController,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

const multer = require('multer');
const upload = multer();

router.post('/addUser', addUserController);

router.get('/getUser/:uid', getUserController);

router.put('/updateUser/:uid', updateUserController);

router.post(
	'/upload-profile-image',
	authMiddleware,
	upload.single('image'),
	uploadProfileImage
);
router.get('/profile-images/:userId', getProfilePicController);

module.exports = router;
