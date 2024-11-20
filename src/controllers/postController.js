const { getStorage } = require('firebase-admin/storage');

const storage = getStorage().bucket();

const { admin } = require('../infraestructure/firebase');
const db = admin.firestore();

const createPost = async (req, res) => {
	try {
		const { title, content, userID } = req.body;
		const file = req.file;

		if (!title || !content || !userID || !file) {
			return res
				.status(400)
				.json({ error: 'All fields are required' });
		}

		// Upload image to Firebase Storage
		const imageRef = storage.file(
			`posts/${Date.now()}_${file.originalname}`
		);
		await imageRef.save(file.buffer, {
			contentType: file.mimetype,
		});
		const imageUrl = await imageRef.getSignedUrl({
			action: 'read',
			expires: '03-09-2491', // Set expiration as needed
		});

		// Create post in Firestore
		const postRef = db.collection('posts').doc();
		await postRef.set({
			title,
			content,
			imageUrl: imageUrl[0],
			createdAt: admin.firestore.Timestamp.now(),
			userID,
		});

		res.status(201).json({
			message: 'Post created successfully',
			postId: postRef.id,
		});
	} catch (error) {
		console.error('Error creating post:', error);
		res.status(500).json({ error: 'Error creating post' });
	}
};

const getPosts = async (req, res) => {
	try {
		const postsSnapshot = await db
			.collection('posts')
			.orderBy('createdAt', 'desc')
			.get();
		const posts = postsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		res.status(200).json(posts);
	} catch (error) {
		console.error('Error fetching posts:', error);
		res.status(500).json({ error: 'Failed to fetch posts' });
	}
};

const getPost = async (req, res) => {
	try {
		const postId = req.params.id;
		const postRef = db.collection('posts').doc(postId);
		const postDoc = await postRef.get();

		if (!postDoc.exists) {
			return res
				.status(404)
				.json({ message: 'Post not found' });
		}

		const postData = postDoc.data();
		return res.status(200).json(postData);
	} catch (error) {
		console.error('Error fetching post:', error);
		res.status(500).json({
			message: 'Failed to fetch post',
			error: error.message,
		});
	}
};

const editPost = async (req, res) => {
	try {
		const { title, content, userID } = req.body;
		const file = req.file;
		const postId = req.params.id;

		if (!title || !content || !userID) {
			return res.status(400).json({
				error: 'Title, content, and userID are required',
			});
		}

		const postRef = db.collection('posts').doc(postId);
		const postDoc = await postRef.get();

		if (!postDoc.exists) {
			return res
				.status(404)
				.json({ error: 'Post not found' });
		}

		// Initialize updated data with basic fields
		const updatedData = {
			title,
			content,
			userID,
			updatedAt: admin.firestore.Timestamp.now(),
		};

		// If a new file is provided, update the image in Firebase Storage
		if (file) {
			const imageRef = storage.file(
				`posts/${Date.now()}_${file.originalname}`
			);
			await imageRef.save(file.buffer, {
				contentType: file.mimetype,
			});
			const imageUrl = await imageRef.getSignedUrl({
				action: 'read',
				expires: '03-09-2491', // Set expiration as needed
			});
			updatedData.imageUrl = imageUrl[0];
		} else if (postDoc.data().imageUrl) {
			// Keep the existing imageUrl if no new file is provided
			updatedData.imageUrl = postDoc.data().imageUrl;
		}

		await postRef.update(updatedData);

		res.status(200).json({
			message: 'Post updated successfully',
			postId: postRef.id,
		});
	} catch (error) {
		console.error('Error updating post:', error);
		res.status(500).json({ error: 'Error updating post' });
	}
};

const deletePost = async (req, res) => {
	try {
		const { postId } = req.params;
		const { userID, imageUrl } = req.body; // Assuming full URL is passed as imageUrl

		if (!postId || !userID || !imageUrl) {
			return res.status(400).json({
				error: 'Post ID, user ID, and image URL are required',
			});
		}

		// Retrieve the post from Firestore
		const postRef = db.collection('posts').doc(postId);
		const postSnapshot = await postRef.get();

		if (!postSnapshot.exists) {
			return res
				.status(404)
				.json({ error: 'Post not found' });
		}

		const post = postSnapshot.data();

		// Verify ownership
		if (post.userID !== userID) {
			return res.status(403).json({
				error: 'You are not authorized to delete this post',
			});
		}

		// Extract the file path from the full URL
		const match = imageUrl.match(/posts\/.+?(?=\?)/); // Extracts 'posts/<filename>' up to the query params
		if (match && match[0]) {
			const filePath = match[0];
			const imageRef = storage.file(filePath);
			try {
				await imageRef.delete();
				console.log(
					'Image deleted successfully:',
					filePath
				);
			} catch (error) {
				console.error(
					'Error deleting image from storage:',
					error
				);
			}
		} else {
			console.error(
				'Failed to extract file path from imageUrl:',
				imageUrl
			);
		}

		// Delete the post from Firestore
		await postRef.delete();

		res.status(200).json({ message: 'Post deleted successfully' });
	} catch (error) {
		console.error('Error deleting post:', error);
		res.status(500).json({ error: 'Error deleting post' });
	}
};

module.exports = { createPost, getPosts, getPost, editPost, deletePost };
