// routes/authRoutes.js
const express = require('express');
const { createUser, login } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/create-user', createUser);

module.exports = router;
