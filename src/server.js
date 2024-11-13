// server.js
const express = require('express');

const dotenv = require('dotenv');
const cors = require('cors');
const { admin } = require('./infraestructure/firebase');
const cron = require('node-cron');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dogRoutes = require('./routes/dogRoutes');

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

app.use(express.json());

app.get('/dog-parks', async (req, res) => {
	try {
		// Obtener referencia de los parques en Realtime Database
		const parksSnapshot = await admin
			.database()
			.ref('dogParks')
			.once('value');
		const parks = [];

		// Recorrer los datos de cada parque
		parksSnapshot.forEach((childSnapshot) => {
			parks.push({
				id: childSnapshot.key,
				...childSnapshot.val(),
			});
		});

		// Enviar respuesta con los datos de los parques
		res.json(parks);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/dog-parks', async (req, res) => {
	try {
		const { name, latitude, longitude, dogs } = req.body;

		// Validación de datos
		if (!name || !latitude || !longitude || !Array.isArray(dogs)) {
			return res.status(400).send('All fields are required.');
		}

		const newPark = {
			name,
			latitude,
			longitude,
			dogs,
			createdAt: Date.now(),
		};

		// Añadir parque a Realtime Database
		const parkRef = await admin
			.database()
			.ref('dogParks')
			.push(newPark);
		res.status(201).json({ id: parkRef.key, ...newPark });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/dog-parks/:parkId/dogs', async (req, res) => {
	try {
		const { parkId } = req.params;
		const { dogId } = req.body;

		if (!dogId) {
			return res
				.status(400)
				.json({ error: 'All fields are required.' });
		}

		// Estructura del perro con timestamp `addedAt`
		const dogData = {
			id: dogId,
			addedAt: Date.now(), // Tiempo actual en milisegundos
		};

		// Guardar el perro en el parque en Realtime Database
		await admin
			.database()
			.ref(`dogParks/${parkId}/dogs/${dogId}`)
			.set(dogData);

		res.status(201).json({
			message: 'Dog added to park successfully',
			...dogData,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/dog-parks/:parkId', async (req, res) => {
	try {
		const { parkId } = req.params; // Get the park ID from the request parameters

		// Get the specific park data from Realtime Database
		const parkSnapshot = await admin
			.database()
			.ref(`dogParks/${parkId}`)
			.once('value');

		// Check if the park exists
		if (!parkSnapshot.exists()) {
			return res
				.status(404)
				.json({ error: 'Park not found' });
		}

		// Get park data and include the park ID
		const parkData = {
			id: parkId,
			...parkSnapshot.val(),
		};

		// Send the response with the specific park data
		res.json(parkData);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const removeExpiredDogs = async () => {
	const now = Date.now();
	const expirationTime = 2 * 60 * 1000; // 5 minutos en milisegundos

	try {
		const parksRef = admin.database().ref('dogParks');
		const parksSnapshot = await parksRef.once('value');

		// Recorrer cada parque
		parksSnapshot.forEach((parkSnapshot) => {
			const parkId = parkSnapshot.key;
			const dogsRef = parksRef.child(`${parkId}/dogs`);

			// Recorrer cada perro en el parque
			dogsRef.once('value', (dogsSnapshot) => {
				dogsSnapshot.forEach((dogSnapshot) => {
					const dogId = dogSnapshot.key;
					const dogData = dogSnapshot.val();

					// Verificar si el perro ha estado más de 5 minutos en el parque
					if (
						dogData.addedAt &&
						now - dogData.addedAt >
							expirationTime
					) {
						dogsRef.child(dogId).remove(); // Eliminar el perro si ha expirado su tiempo
					}
				});
			});
		});

		console.log('Expired dogs removed successfully.');
	} catch (error) {
		console.error('Error removing expired dogs:', error);
	}
};

// Programar la tarea para que se ejecute cada 5 minutos
cron.schedule('*/1 * * * *', () => {
	console.log('Running task to remove expired dogs...');
	removeExpiredDogs();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
