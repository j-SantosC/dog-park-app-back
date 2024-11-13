const express = require('express');
const router = express.Router();
const {
	getDogParks,
	addDogPark,
	addDogToPark,
	getPark,
} = require('../controllers/parkController');

router.get('/dog-parks', getDogParks);

router.post('/dog-parks', addDogPark);

router.post('/dog-parks/:parkId/dogs', addDogToPark);

router.get('/dog-parks/:parkId', getPark);

module.exports = router;
