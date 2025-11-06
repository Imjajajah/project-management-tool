import express from 'express';
import auth from '../../auth/middleware/auth.js';
import Project from '../../projects/models/ProjectModel.js';
import Task from '../../tasks/models/TaskModel.js';

const router = express.Router();

/**
 * @route   GET /api/homepage/summary
 * @desc    Get summary data for dashboard (projects, tasks, stats, upcoming deadlines)
 * @access  Private
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({ user: userId });
    const tasks = await Task.find({ user: userId });

    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const done = tasks.filter(t => t.status === 'done').length;

    const upcomingTasks = tasks
      .filter(t => t.dueDate && new Date(t.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map(t => ({
        _id: t._id,
        name: t.name,
        dueDate: t.dueDate,
      }));

    res.json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      todo,
      inProgress,
      done,
      upcomingTasks,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error loading dashboard summary' });
  }
});

export default router;
