const express = require("express");
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST a new project
router.post('/', async (req, res) => {
    const { name, description, dueDate } = req.body;

    const project = new Project({
        name, description, dueDate,
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully!'});
    } catch (err){
        res.status(500).json({ message: err.message });
    }
});

//PUT/PATCH an existing project
router.put('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const { name, description, dueDate } = req.body;
        project.name = name || project.name;
        project.description = description || project.description;
        project.dueDate = dueDate || project.dueDate;

        if (dueDate != undefined){
            project.dueDate = dueDate;
        }

        const updatedProject = await project.save();
        res.json(updatedProject);
    
    } catch (err){
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;