const { storage } = require('../../infraestructure/firebase');

const getFirstProfileImageStream = async (userId) => {
	const bucket = storage.bucket();
	const [files] = await bucket.getFiles({
		prefix: `profile-images/${userId}`,
	});

	if (files.length === 0) {
		throw new Error(`No image found for user ${userId}`);
	}

	const fileToKeep = files[0];

	return fileToKeep.createReadStream();
};

const getFirstDogImageStream = async (dogId) => {
	const bucket = storage.bucket();
	const [files] = await bucket.getFiles({
		prefix: `dog-images/${dogId}`,
	});

	if (files.length === 0) {
		throw new Error(`No image found for dog ${dogId}`);
	}

	const fileToKeep = files[0];

	return fileToKeep.createReadStream();
};

module.exports = { getFirstProfileImageStream, getFirstDogImageStream };
