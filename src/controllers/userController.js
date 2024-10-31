const { admin } = require('../infraestructure/firebase');
const db = admin.firestore();

const addUserController = async (req, res) => {
	const { uid, name, lastname, email, birthdate } = req.body;

	// Basic validation
	if (!uid || !name || !lastname || !email || !birthdate) {
		return res
			.status(400)
			.send(
				'UID, name, lastname, email, and birthdate are required.'
			);
	}

	try {
		// Use uid as the document ID in Firestore
		const userRef = db.collection('users').doc(uid);
		await userRef.set({
			name,
			lastname,
			email,
			birthdate,
		});

		res.status(200).json({
			message: 'User added successfully with UID!',
		});
	} catch (error) {
		console.error('Error adding user:', error);
		res.status(500).send('Error adding user.');
	}
};

const getUserController = async (req, res) => {
	const { uid } = req.params;

	try {
		const userRef = db.collection('users').doc(uid);
		const doc = await userRef.get();

		if (!doc.exists) {
			return res.status(404).send('User not found.');
		}

		res.status(200).json(doc.data());
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).send('Error fetching user.');
	}
};

const updateUserController = async (req, res) => {
	const { uid } = req.params;
	const { name, lastname, email, birthdate } = req.body;
	if (!name || !lastname || !email || !birthdate) {
		return res
			.status(400)
			.send(
				'All fields (name, lastname, email, birthdate) are required.'
			);
	}
	try {
		const userRef = db.collection('users').doc(uid);
		await userRef.update({ name, lastname, email, birthdate });
		res.status(200).json({
			message: 'User information updated successfully!',
		});
	} catch (error) {
		console.error('Error updating user:', error);
		res.status(500).send('Error updating user.');
	}
};

module.exports = {
	addUserController,
	getUserController,
	updateUserController,
};
