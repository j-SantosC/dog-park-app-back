// controllers/uploadController.js

const { storage } = require('../infraestructure/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase-admin/storage');

const uploadProfileImage = async (req, res) => {
  const file = req.file;
  const userId = req.user.id;

  try {
    // Reference the file in Firebase Storage
    const storageRef = storage.bucket().file(`profile-images/${userId}/${file.originalname}`);
    
    // Save the file with the buffer and set metadata for content type
    await storageRef.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    // Construct the public download URL
    const downloadURL = `https://storage.googleapis.com/${storage.name}/${storageRef.name}`;
    res.json({ downloadURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadProfileImage,
};
