///Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { getProfile } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email']}));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        
        // This is the key change: redirect to the client with the token as a URL parameter.
        res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    }
);

router.get('/profile', auth, getProfile);

export default router;