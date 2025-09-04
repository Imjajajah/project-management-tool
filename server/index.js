require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const PORT = process.env.PORT || 8000;
const MONGO_URI = 'mongodb://mongodb:27017/project-tool-db';

// Connect to the database
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Use the routers
app.use('/api/projects', projectRoutes); // For project creation and listing
app.use('/api/projects', taskRoutes);   // For adding and getting tasks for a specific project
app.use('/api', taskRoutes);            // For updating and deleting a single task

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});