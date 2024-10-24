const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const serviceAccount = require('./config/firebase-service-account.json'); // Import your service account JSON
const { createUser, login } = require('./controllers/authController'); // Import your controller functions


dotenv.config();

const app = express();
app.use(express.json());

app.post('/login', login);
app.post('/create-user', createUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
