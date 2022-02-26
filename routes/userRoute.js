const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = passport.authenticate('jwt-auth', { session: false });

// const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/me', auth, userController.getMe); // เพิ่ม 29/1/65
router.get('/getMyData/:firstName', auth, userController.getMyData); // เพิ่ม 29/1/65
router.post('/register', authController.register);
router.post('/login', authController.login);
router.patch(
    '/profile-img',
    auth,
    upload.single('profileImg'),
    userController.updateProfileImg
);

module.exports = router;
