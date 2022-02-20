const { User, Post, Comment } = require('../models');

exports.createComment = async (req, res, next) => {
  try {
    const { title, postId } = req.body;

    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      return res.status(400).json({ message: 'post not found' });
    }

    const newComment = await Comment.create({
      title,
      postId,
      userId: req.user.id,
    });

    const comment = await Comment.findOne({
      where: { id: newComment },
      include: {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'profileImg'],
      },
    });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

//* Delete Comment

exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findOne({ where: { id } });
    if (!comment) {
      return res.status(400).json({ message: 'comment not found' });
    }

    if (req.user.id !== comment.userId) {
      return res.status(403).json({ message: 'cannot delete this comment' });
    }

    await comment.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
