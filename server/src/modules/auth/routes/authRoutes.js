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
    async (req, res) => {
        try {
            // Google profile object
            const googleEmail = req.user.emails?.[0]?.value;
            const googleName = req.user.displayName;
            const googleId = req.user.id;

            if (!googleEmail) {
                console.error('Google profile missing email:', req.user);
                return res.redirect('/login');
            }

            // Check if user already exists
            let user = await User.findOne({ email: googleEmail });

            if (!user) {
                // Create new user
                user = new User({
                    username: googleName,
                    email: googleEmail,
                    googleId: googleId
                });
                await user.save();
            } else if (!user.googleId) {
                // Attach googleId to existing user
                user.googleId = googleId;
                await user.save();
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user._id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            res.redirect(`${clientUrl}/auth/callback?token=${token}`);
        } catch (err) {
            console.error('Google OAuth error:', err);
            res.redirect('/login');
        }
    }
);

// Protected route to get user profile
router.get('/profile', auth, getProfile);

export default router;