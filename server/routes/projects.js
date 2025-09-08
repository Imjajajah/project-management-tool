import express from 'express'; 
const router = express.Router();
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';


// GET all projects for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new project
router.post('/', auth, async (req, res) => {
    const { name, description, dueDate } = req.body;
    const project = new Project({
        name,
        description,
        dueDate,
        user: req.user.id // Correctly uses the user ID from auth middleware
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a project and its associated tasks
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedProject = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to delete it.' });
        }

        await Task.deleteMany({ project: req.params.id });
        res.json({ message: 'Project and associated tasks deleted successfully!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a specific project by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to view it.' });
        }
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT/PATCH to update an existing project
router.put('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to update it.' });
        }

        const { name, description, dueDate } = req.body;
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (dueDate !== undefined) project.dueDate = dueDate;

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;