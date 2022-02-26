const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { User } = require('../models');

cloudinary.config({
    cloud_name: 'dwqidrcfo',
    api_key: '199999799465611',
    api_secret: 'ndO7vCE3lqPbiYZdPp9oNpH0BMc',
});

exports.updateProfileImg = (req, res, next) => {
    cloudinary.uploader.upload(req.file.path, async (err, result) => {
        if (err) return next(err);

        await User.update(
            { profileImg: result.secure_url },
            { where: { id: req.user.id } }
        );

        if (req.user.profileImg) {
            const splitted = req.user.profileImg.split('/');
            cloudinary.uploader.destroy(
                splitted[splitted.length - 1].split('.')[0]
            );
        }
        fs.unlinkSync(req.file.path);
        res.json({
            message: 'Upload profile image Completed',
            profileImg: result.secure_url,
        });
    });
};

exports.getMe = (req, res, next) => {
    const { id, firstName, lastName, profileImg, email } = req.user;
    res.status(200).json({
        user: { id, firstName, lastName, profileImg, email },
    });
};

exports.getMyData = async (req, res, next) => {
    try {
        const { firstName } = req.params;
        const user = await User.findOne({ where: { firstName } });
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};
