const { admin } = require('../infraestructure/firebase');

const getDogParks = async (req, res) => {
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
};

const addDogPark = async (req, res) => {
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
};

const addDogToPark = async (req, res) => {
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
};

const getPark = async (req, res) => {
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
};

module.exports = { addDogPark, getDogParks, addDogToPark, getPark };
