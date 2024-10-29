const { storage } = require('../infraestructure/firebase');

const uploadProfileImage = async (req, res) => {
  const file = req.file;
  const userId = req.user.id;

  try {
    const bucket = storage.bucket();

    const [files] = await bucket.getFiles({ prefix: `profile-images/${userId}/` });
    const deletePromises = files.map((file) => file.delete());
    await Promise.all(deletePromises);

    const storageRef = bucket.file(`profile-images/${userId}/${file.originalname}`);

    await storageRef.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${storageRef.name}`;
    res.json({ downloadURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadProfileImage,
};
