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
router.get('/:projectId', auth, getTasksByProjectId);

// POST a new task for a specific project
router.post('/:projectId', auth, createTask);

// PUT/PATCH to update a task
router.put('/:taskId', auth, updateTask);

// DELETE multiple tasks
router.delete('/bulk-delete', auth, bulkDeleteTasks);

// DELETE a single task
router.delete('/:taskId', auth, deleteTask);

export default router;