const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createUser, login } = require('./controllers/authController'); // Import your controller functions


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.post('/login', login);
app.post('/create-user', createUser);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
