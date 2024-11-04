const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
	const authorization = req.headers.authorization;

	if (!authorization || !authorization.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const token = authorization.split(' ')[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(token);
		req.user = { id: decodedToken.uid }; // Attach the user ID to the request
		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({ error: 'Invalid token' });
	}
};

module.exports = authMiddleware;
