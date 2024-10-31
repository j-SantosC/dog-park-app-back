require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// Load the Firebase credentials file
const serviceAccount = require(path.resolve(process.env.FIREBASE_CREDENTIALS));

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'gs://pup-radar-8f026.appspot.com',
});

const storage = admin.storage();

module.exports = { storage, admin };
