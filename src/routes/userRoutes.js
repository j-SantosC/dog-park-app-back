const express = require('express');
const {
	addUserController,
	getUserController,
	updateUserController,
} = require('../controllers/userController');

const router = express.Router();

router.post('/addUser', addUserController);

router.get('/getUser/:uid', getUserController);

router.put('/updateUser/:uid', updateUserController);

module.exports = router;
