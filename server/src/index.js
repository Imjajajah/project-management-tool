///Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/index.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import projectsRoutes from './modules/projects/routes/projectsRoutes.js';
import tasksRoutes from './modules/tasks/routes/tasksRoutes.js';
import authRoutes from './modules/auth/routes/authRoutes.js'; // New routes for authentication
import connectDB from './config/db.js';
import passportConfig from './config/passport.js'; // Import Passport.js configuration

const app = express();

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const PORT = process.env.PORT || 8000;

// Connect to the database
connectDB();

// Initialize Passport.js configuration
passportConfig();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Use the routers
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/auth', authRoutes); 
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});