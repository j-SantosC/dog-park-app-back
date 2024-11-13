// server.js
const express = require('express');

const dotenv = require('dotenv');
const cors = require('cors');

const { admin } = require('./infraestructure/firebase');

// const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dogRoutes = require('./routes/dogRoutes');
const parkRoutes = require('./routes/parkRoutes');

// const { removeExpiredDogs } = require('./services/dogs/dogsService');

dotenv.config();

const app = express();

app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:4200',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

app.options('*', cors());

// Define db to use Firestore

app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', dogRoutes);
app.use('/', parkRoutes);

app.use(express.json());

// Programar la tarea para que se ejecute cada minuto

// cron.schedule('*/1 * * * *', () => {
// 	console.log('Running task to remove expired dogs...');
// 	removeExpiredDogs();
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
