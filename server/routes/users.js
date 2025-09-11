import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        res.status(500).json({ message: 'Server error during registration.', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Logged in successfully!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (err) {
        res.status(400).json({ message: 'Server error during login.', error: err.message });
    }
});

// Since the client side is still calling this, we will add it back, but
// with a simple error message as it's not being used for this token flow.
router.post('/refresh-token', (req, res) => {
    return res.status(400).json({ message: 'Refresh token not needed for this authentication flow.' });
});

export default router;