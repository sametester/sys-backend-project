const express = require('express');
const authenticate = require('../middlewares/authenticate');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/', authenticate, commentController.createLike);
router.delete('/:id', authenticate, commentController.deleteLike);

module.exports = router;
