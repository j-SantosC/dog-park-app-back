const {
	addDogController,
	updateDogController,
	getUserDogs,
	getDogPicController,
	uploadDogImage,
} = require('../controllers/dogController');

const authMiddleware = require('../middlewares/authMiddleware');

const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer();

router.post('/add-dog', addDogController);
router.put('/update-dog/:dogId', updateDogController);
router.get('/user-dogs/:userUID', getUserDogs);
router.get('/dog-images/:dogId', getDogPicController);
router.post(
	'/upload-dog-image/:dogId',
	authMiddleware,
	upload.single('image'),
	uploadDogImage
);

module.exports = router;
