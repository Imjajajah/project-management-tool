import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/projectsController.js'; 

// All routes now use the imported controller functions
// Corrected: The /profile route should NOT be here.
router.get('/', auth, getAllProjects);
router.post('/', auth, createProject);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

export default router;