const { storage } = require('../infraestructure/firebase');

const getFirstProfileImageStream = async (userId) => {
    const bucket = storage.bucket(); // Access the bucket
    const [files] = await bucket.getFiles({ prefix: `profile-images/${userId}` }); // Use userId in prefix
    
    if (files.length === 0) {
        throw new Error(`No image found for user ${userId}`);
    }

    const file = files[0];
    return file.createReadStream(); // Return the stream of the user-specific image
};

module.exports = {getFirstProfileImageStream}