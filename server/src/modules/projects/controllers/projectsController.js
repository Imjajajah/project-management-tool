///Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/controllers/projectsController.js

import Project from '../models/ProjectModel.js';
import Task from '../../tasks/models/TaskModel.js';


//GET all projects
export const getAllProjects = async (req, res) => {
    try {
     
        console.log("Fetching projects for user ID:", req.user ? req.user._id : "User is not authenticated");
        
        const projects = await Project.find({ user: req.user._id });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
//GET a specific project by ID
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to view it' });
        }
        res.json(project);
    } catch (err){
        res.status(500).json({ message: err.message });
    }
};

//POST a new project
export const createProject = async (req, res) => {
    const { name, description, dueDate } = req.body;
    const project = new Project({
        name, description, dueDate, user: req.user.id
    });

    // ADD THIS LINE
    console.log("Attempting to save new project:", project);

    try {
        const newProject = await project.save();

        // ADD THIS LINE
        console.log("Successfully saved project:", newProject);

        res.status(201).json(newProject);
    } catch (err) {
        console.error("Error saving project:", err);
        res.status(400).json({ message: err.message });
    }
};

//PUT/PATCH to update an existing project
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
        if (!project) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to update it' });
        }

        const { name, description, dueDate } = req.body;
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (dueDate !== undefined) project.dueDate = dueDate;

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (err){
        res.status(400).json({message: err.message });
    }
};

// DELETE a project and its associated tasks
export const deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found or you do not have authorization to update it' });
        }

        await Task.deleteMany({ project: req.params.id });
        res.json({ message: 'Project and associated tasks deleted successfully!'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};