//
const util = require('util');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { Post, User, Comment, Like } = require('../models/index');

const uploadPromise = util.promisify(cloudinary.uploader.upload);

//*GET ALL POST
exports.getAllPost = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'],
          },
        },

        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: {
                exclude: ['password', 'createdAt', 'updatedAt'],
              },
            },
          ],
        },

        {
          model: Like,
          include: [
            {
              model: User,
              attributes: {
                exclude: ['password', 'createdAt', 'updatedAt'],
              },
            },
          ],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [Comment, 'createdAt', 'ASC'],
      ],
    });

    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

//* CREATE POST
exports.createPost = async (req, res, next) => {
  try {
    const { title, headTitle } = req.body;

    // let result = {};
    // if (req.file) {
    //   result = await uploadPromise(req.file.path);
    //   fs.unlinkSync(req.file.path);
    // }

    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      return res.status(401).json({ message: 'you are unauthenticated' });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'you are unauthenticated' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const post = await Post.create({
      headTitle,
      title,
      userId: payload.id,
      img: result.secure_url,
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

//************************ พิมพ์ */

//* UPDATE POST

exports.updatePost = async (req, res, next) => {
  try {
    //* รับ title img จาก body
    const { title, img } = req.body;
    const { postId } = req.params;
    const post = await Post.findOne({
      where: { id: postId },
    });
    //* โพสนี้มีอยู่ในดาต้าเบสไหม
    if (!post) {
      return res.status(400).json({
        message: 'this post request not found',
      });
    }
    //* เช็คว่าโพสเป็นของผู้ใช้ไหม
    if (post.userId !== req.user.id) {
      return res.status(403).json({
        message: 'cannot accept this post request',
      });
    }

    await Post.update({ title, img }, { where: { id: postId } });
    res.status(200).json({ message: 'post request accepted' });
  } catch (err) {
    next(err);
  }
};

//* DELETE POST
exports.deletePost = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return res.status(400).json({ message: 'post not found' });
    }

    await Like.destroy({ where: { postId: id } }, { transaction });
    await Comment.destroy({ where: { postId: id } }, { transaction });
    await Post.destroy({ where: { id } }, { transaction });
    await transaction.commit();
    res.status(204).json();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};
