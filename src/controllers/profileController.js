const { getFirstProfileImageStream } = require("../services/firebaseService");

const getProfilePicController = async (req, res) => {
    const userId = req.params.userId; 
    try {
        const imageStream = await getFirstProfileImageStream(userId);
        res.setHeader('Content-Type', 'image/jpeg'); 
        imageStream.pipe(res); 
    } catch (error) {
        console.error('Error retrieving profile image:', error);
        res.status(500).send('Error retrieving profile image');
    }
  }

  module.exports = {getProfilePicController}