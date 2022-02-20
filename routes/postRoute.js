const express = require('express');
const passport = require('passport');

const router = express.Router();
const postController = require('../controllers/postController');
// const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');
const auth = passport.authenticate('jwt-auth', { session: false });

router.get('/', postController.getAllPost);
router.post('/', auth, upload.single('img'), postController.createPost);
router.patch('/:postId', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);

module.exports = router;
