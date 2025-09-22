import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { getProfile, registerUser, loginUser, refreshToken } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Local authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    }
);

// Protected route to get user profile
router.get('/profile', auth, getProfile);

export default router;