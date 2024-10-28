const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dog-park-app-c06d4.appspot.com', // Your Firebase bucket name
});

const storage = admin.storage();

module.exports = { storage, admin };
