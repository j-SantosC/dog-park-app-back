const { admin } = require('../infraestructure/firebase');
const {
	getFirstDogImageStream,
} = require('../services/firebase/storageService');

const db = admin.firestore();
const { storage } = require('../infraestructure/firebase');

const addDogController = async (req, res) => {
	try {
		const { name, breed, birthdate, sex, isServiceDog, userUID } =
			req.body;

		// Validate required fields
		if (!name || !breed || !birthdate || !sex || !userUID) {
			return res
				.status(400)
				.json({ error: 'All fields are required' });
		}

		// Create a new document in the "dogs" collection
		const dogData = {
			name,
			breed,
			birthdate,
			sex,
			isServiceDog,
			userUID,
		};

		await db.collection('dogs').add(dogData);

		res.status(201).json({
			message: 'Dog added successfully',
			data: dogData,
		});
	} catch (error) {
		console.error('Error adding dog:', error);
		res.status(500).json({ error: 'Failed to add dog' });
	}
};

const updateDogController = async (req, res) => {
	const dogId = req.params.dogId;
	const { name, breed, birthdate, sex, isServiceDog } = req.body;

	try {
		// Check if the document exists
		const dogRef = db.collection('dogs').doc(dogId);
		const dogDoc = await dogRef.get();

		if (!dogDoc.exists) {
			return res
				.status(404)
				.json({ message: 'Dog not found' });
		}

		// Update the document with the provided data
		const updatedData = {};

		if (name) updatedData.name = name;
		if (breed) updatedData.breed = breed;
		if (birthdate) updatedData.birthdate = birthdate;
		if (sex) updatedData.sex = sex;
		if (isServiceDog !== undefined)
			updatedData.isServiceDog = isServiceDog;

		await dogRef.update(updatedData);

		res.status(200).json({
			message: 'Dog information updated successfully',
			data: updatedData,
		});
	} catch (error) {
		console.error('Error updating dog:', error);
		res.status(500).json({
			error: 'Failed to update dog information',
		});
	}
};

const getUserDogs = async (req, res) => {
	const userUID = req.params.userUID;

	try {
		// Query the "dogs" collection for documents where userUID matches the specified user
		const snapshot = await db
			.collection('dogs')
			.where('userUID', '==', userUID)
			.get();

		if (snapshot.empty) {
			return res.status(404).json({
				message: 'No dogs found for this user.',
			});
		}

		// Map the results to an array of dog objects
		const dogs = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		res.status(200).json(dogs);
	} catch (error) {
		console.error('Error fetching dogs:', error);
		res.status(500).json({
			error: 'Failed to retrieve dogs',
		});
	}
};
const getDogPicController = async (req, res) => {
	const dogId = req.params.dogId;
	try {
		const imageStream = await getFirstDogImageStream(dogId);
		res.setHeader('Content-Type', 'image/jpeg');
		imageStream.pipe(res);
	} catch (error) {
		console.error('Error retrieving dog image:', error);
		res.status(404).send('The user doesnt have a dog image');
	}
};

const uploadDogImage = async (req, res) => {
	const dogId = req.params.dogId;
	const file = req.file;

	if (!file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	try {
		const bucket = storage.bucket();

		// Delete existing images for the dog
		const [files] = await bucket.getFiles({
			prefix: `dog-images/${dogId}/`,
		});
		const deletePromises = files.map((file) => file.delete());
		await Promise.all(deletePromises);

		// Save the new image
		const storageRef = bucket.file(
			`dog-images/${dogId}/${file.originalname}`
		);
		await storageRef.save(file.buffer, {
			metadata: { contentType: file.mimetype },
		});

		// Make the file publicly accessible
		await storageRef.makePublic();

		// Generate a public URL for the uploaded image
		const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storageRef.name}`;
		res.json({ downloadURL });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deleteDogController = async (req, res) => {
	const dogId = req.params.dogId;

	try {
		// Referencia al documento del perro en Firestore
		const dogRef = db.collection('dogs').doc(dogId);
		const dogDoc = await dogRef.get();

		// Verifica si el perro existe
		if (!dogDoc.exists) {
			return res
				.status(404)
				.json({ message: 'Dog not found' });
		}

		// Elimina el documento del perro en Firestore
		await dogRef.delete();

		// Elimina las imágenes asociadas en Firebase Storage
		const bucket = storage.bucket();
		const [files] = await bucket.getFiles({
			prefix: `dog-images/${dogId}/`,
		});
		const deletePromises = files.map((file) => file.delete());
		await Promise.all(deletePromises);

		res.status(200).json({
			message: 'Dog and associated images deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting dog:', error);
		res.status(500).json({
			error: 'Failed to delete dog',
		});
	}
};

module.exports = {
	addDogController,
	updateDogController,
	getUserDogs,
	getDogPicController,
	uploadDogImage,
	deleteDogController,
};
