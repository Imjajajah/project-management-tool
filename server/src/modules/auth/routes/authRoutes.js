import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getProfile);

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // 1️⃣ Check if user already exists by email
      let user = await User.findOne({ email: req.user.email });

      if (!user) {
        // 2️⃣ Generate a unique username
        let baseUsername = req.user.displayName.replace(/\s+/g, '');
        let uniqueUsername = baseUsername;
        let counter = 1;

        while (await User.findOne({ username: uniqueUsername })) {
          uniqueUsername = `${baseUsername}${counter++}`;
        }

        // 3️⃣ Create new Google user
        user = new User({
          username: uniqueUsername,
          email: req.user.email,
          googleId: req.user.id
        });
        await user.save();
      } else if (!user.googleId) {
        // 4️⃣ If email exists but no googleId, link the account
        user.googleId = req.user.id;
        await user.save();
      }

      // 5️⃣ Generate JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 6️⃣ Redirect to frontend with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.redirect('/login');
    }
  }
);

export default router;
