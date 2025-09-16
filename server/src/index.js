import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import usersRoutes from './routes/usersRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js'; // Corrected variable name
import tasksRoutes from './routes/tasksRoutes.js';
import User from './models/UserModel.js';
import jwt from 'jsonwebtoken'; 

const app = express();

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:8000'}/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => { // <-- CORRECTED TYPO
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                // Do not set password as required for Google users
                // You may want to hash a dummy password to conform to your model later
            });
            await user.save();
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Connect to the database
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Use the routers
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);

// Google Auth Routes
app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
    passport.authenticate('google', {failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth-success?token=${token}`);
    }
)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});