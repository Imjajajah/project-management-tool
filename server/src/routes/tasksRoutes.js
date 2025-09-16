import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import {
    getTasksByProjectId,
    createTask,
    updateTask,
    bulkDeleteTasks,
    deleteTask
} from '../controllers/tasksController.js';

// GET all tasks for a specific project
router.get('/:projectId/tasks', auth, getTasksByProjectId);

// POST a new task
router.post('/:projectId/tasks', auth, createTask);

// PUT/PATCH to update a task
router.put('/tasks/:taskId', auth, updateTask);

// DELETE multiple tasks
router.delete('/tasks/bulk-delete', auth, bulkDeleteTasks);

// DELETE a single task
router.delete('/tasks/:taskId', auth, deleteTask);

export default router;