const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

exports.register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } =
            req.body;

        //* CHECK EMAIL
        // const isEmail = emailFormat.test(email);

        const existUser = await User.findOne({
            where: { email: email },
        });
        if (existUser) {
            return res
                .status(400)
                .json({ message: 'this email is already in use' });
        }

        //* CHECK PASSWORD AND CONFIRMPASSWORD
        if (password !== confirmPassword) {
            return res
                .status(400)
                .json({ message: 'The password confirmation does not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'user created' });
    } catch (err) {
        next(err);
    }
};

//* status 201 Created	The request has been fulfilled, and a new resource is created
//* status 400 Bad Request	The request cannot be fulfilled due to bad syntax

//* LOGIN
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // const isEmail = emailFormat.test(email);

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res
                .status(400)
                .json({ message: 'invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ message: 'invalid email or password' });
        }

        //* Sent Token
        const payload = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '30d',
        });

        const { id, firstName, lastName, profileImg, email: em } = user;
        res.status(200).json({
            token,
            user: { id, firstName, lastName, profileImg, em },
        });
        res.json('You Logged IN');
    } catch (err) {
        next(err);
    }
};

//* status 201 Created	The request has been fulfilled, and a new resource is created
//* status 400 Bad Request	The request cannot be fulfilled due to bad syntax
