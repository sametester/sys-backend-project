const util = require('util');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { Post, User, Comment, Like, sequelize } = require('../models/index');

cloudinary.config({
    cloud_name: 'dwqidrcfo',
    api_key: '199999799465611',
    api_secret: 'ndO7vCE3lqPbiYZdPp9oNpH0BMc',
});

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

        let result = {};
        if (req.file) {
            result = await uploadPromise(req.file.path);
            fs.unlinkSync(req.file.path);
        }

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

//* UPDATE POST

exports.updatePost = async (req, res, next) => {
    try {
        //* รับ title img จาก body
        const { title, headTitle } = req.body;
        let result = {};

        if (req.file) {
            result = await uploadPromise(req.file.path);
            fs.unlinkSync(req.file.path);
        }

        const { postId } = req.params;

        const [affectedRow] = await Post.update(
            { title, headTitle, img: result.secure_url },
            {
                where: {
                    id: postId,
                    userId: req.user.id,
                },
            }
        );
        if (affectedRow === 0) {
            res.status(400).json({ message: 'cannot update todo' });
        }

        console.log(555555555555555);

        const post = await Post.findOne({
            where: { id: postId },
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
        });
        res.status(200).json({ post });
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

exports.likePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const result = await Like.create({
            userId: req.user.id,
            postId: postId,
        });
        res.status(201).send({ message: 'like success' });
    } catch (err) {
        next(err);
    }
};
exports.unLikePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const result = await Like.destroy({
            where: { postId: postId, userId: req.user.id },
        });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
