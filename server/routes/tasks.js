const express = require('express');
const router = express.Router({ mergeParams: true });
const Task = require('../models/Task');

// Get all tasks for specific project
router.get('/:projectId/tasks', async (req, res) => {
    try {
        // FIXED: Corrected the typo from 'projectsId' to 'projectId'
        const tasks = await Task.find({ project: req.params.projectId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// POST a new task
router.post('/:projectId/tasks', async (req, res) => {
    const { name, dueDate } = req.body;
    const { projectId } = req.params;

    const task = new Task({
        name, 
        project: projectId,
        dueDate,
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err){
        res.status(400).json({ message: err.message });
    }
});

// PUT/PATCH to update a task
router.put('/tasks/:taskId', async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { name, completed, dueDate } = req.body;

        task.name = name || task.name;

        if (completed !== undefined){
            task.completed = completed;
        }

        if (dueDate !== undefined){
            task.dueDate = dueDate;
        }
        
        const updatedTask = await task.save();
        // FIXED: Returned the correct variable 'updatedTask' instead of 'newTask'
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a task
// FIXED: 'route' to 'router' and corrected the URL path
router.delete('/tasks/:taskId', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.taskId);
        
        // FIXED: Used the correct variable name 'deletedTask'
        if (!deletedTask){
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        // FIXED: Corrected the syntax for sending a status and JSON response
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;