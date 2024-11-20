const express = require('express');
const {
	createPost,
	getPosts,
	getPost,
	editPost,
	deletePost,
} = require('../controllers/postController');
const router = express.Router();

const multer = require('multer');
const upload = multer({
	storage: multer.memoryStorage(), // Store file in memory for direct upload
});

router.post('/posts', upload.single('file'), createPost);
router.get('/posts', getPosts);
router.get('/posts/:id', getPost);
router.put('/posts/:id', upload.single('file'), editPost);
router.delete('/posts/:postId', deletePost);

module.exports = router;
