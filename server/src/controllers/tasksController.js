import Task from '../models/TaskModel.js';
import Project from '../models/ProjectModel.js';

// GET all tasks for a specific project
export const getTasksByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findOne({ _id: projectId, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: "Project not found or you do not have authorization to view it." });
        }

        const tasks = await Task.find({ project: projectId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST a new task
export const createTask = async (req, res) => {
    const { name, dueDate } = req.body;
    const { projectId } = req.params;

    // Check if task name is provided on the server-side as well
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Task name is required.' });
    }

    try {
        const project = await Project.findOne({ _id: projectId, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to add a task to it.' });
        }
        
        if (dueDate) {
            const taskDueDate = new Date(dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Validate that the task's due date is not in the past
            if (taskDueDate < today) {
                return res.status(400).json({ message: 'Task due date cannot be in the past.' });
            }

            // **FIX 1: Add the 100-year validation for tasks**
            const currentYear = new Date().getFullYear();
            const taskDueYear = taskDueDate.getFullYear();
            if (taskDueYear > currentYear + 100) {
                return res.status(400).json({ message: 'Task due date cannot be more than 100 years in the future.' });
            }

            const projectDueDate = project.dueDate ? new Date(project.dueDate) : null;
            
            // Validate against the project's due date
            if (projectDueDate && taskDueDate > projectDueDate) {
                return res.status(400).json({ message: 'Task due date cannot be after the project deadline.' });
            }
        }
        
        const task = new Task({
            name,
            project: projectId,
            dueDate,
            user: req.user.id
        });

        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        // Mongoose validation errors will be caught here
        res.status(400).json({ message: err.message });
    }
};

// PUT/PATCH to update a task
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.taskId, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have authorization to update it.' });
        }
        
        // **NEW LOGIC: Find the parent project to validate the date**
        const project = await Project.findOne({ _id: task.project, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Associated project not found.' });
        }

        const { name, completed, dueDate } = req.body;
        
        // **NEW VALIDATION LOGIC FOR UPDATES**
        if (dueDate !== undefined && dueDate !== null) {
            const taskDueDate = new Date(dueDate);
            const projectDueDate = project.dueDate ? new Date(project.dueDate) : null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (taskDueDate < today) {
                return res.status(400).json({ message: 'Task due date cannot be in the past.' });
            }

            if (projectDueDate && taskDueDate > projectDueDate) {
                return res.status(400).json({ message: 'Task due date cannot be after the project deadline.' });
            }
        }

        if (name !== undefined) task.name = name;
        if (completed !== undefined) task.completed = completed;
        if (dueDate !== undefined) task.dueDate = dueDate;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE multiple tasks
export const bulkDeleteTasks = async (req, res) => {
    try {
        const ids = req.query.ids.split(',');
        const result = await Task.deleteMany({ _id: { $in: ids }, user: req.user.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No tasks found or you do not have authorization to delete them.' });
        }
        res.json({ message: 'Tasks deleted successfully', deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE a single task
export const deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.taskId, user: req.user.id });

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found or you do not have authorization to delete it.' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};