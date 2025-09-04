import { useEffect, useState } from 'react';
import AddProjectForm from '../components/AddProjectForm';
import EditProjectForm from '../components/EditProjectForm';
import TaskItem from '../components/TaskItem';
import Layout from '../components/layout/Layout';
import ProjectModal from '../components/modals/ProjectModal';

import '../App.css';

function HomePage() {
    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null); 
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Function to fetch tasks for a specific project
    const fetchTasks = async (projectId) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects/${projectId}/tasks`);
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    // Handle project selection and fetch its tasks
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        fetchTasks(project._id);
    };

    // Handle adding a new task
    const handleAddTask = async () => {
        //Check if the task name is not empty and project is selected
        if (!newTaskName.trim() || !selectedProject) return;
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects/${selectedProject._id}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newTaskName,
                    dueDate: newTaskDueDate,
                }),
            });
            const newTask = await response.json();
            setTasks(prevTasks => [...prevTasks, newTask]);
            setNewTaskName('');
            setNewTaskDueDate('');
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // Handle toggling a task's completion status
    const handleToggleComplete = async (task) => {
        const updatedTask = { ...task, completed: !task.completed };
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask),
            });
            const result = await response.json();
            setTasks(prevTasks => prevTasks.map(t => (t._id === result._id ? result : t)));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Handle task deletion
    const handleDeleteTask = async (taskId) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            await fetch(`${serverUrl}/api/tasks/${taskId}`, {
                method: 'DELETE',
            });
            setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // Function to fetch projects
    const fetchProjects = async () => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects`);
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const handleAddClick = () => {
        setEditingProject(null);
        setShowModal(true);
    }

    const handleModalClose = () => {
        setEditingProject(null);
        setShowModal(false);
    }

    // Function to add projects
    const handleProjectAdded = async (newProject) => {
        setProjects(prevProjects => [...prevProjects, newProject]);
        setShowModal(false);
        await fetchProjects();
    };

    // Function to delete projects
    const handleProjectDeleted = async (projectId) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects/${projectId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete project');
            }
            setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));
            
            // If the deleted project was the selected one, clear the selection
            if (selectedProject && selectedProject._id === projectId) {
                setSelectedProject(null);
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    // Function to update projects
    const handleEditClick = (project) => {
        setEditingProject(project);
        setShowModal(true);
    };

    const handleUpdate = (updatedProject) => {
        setProjects(prevProjects => prevProjects.map(proj => proj._id === updatedProject._id ? updatedProject : proj));
        setEditingProject(null);
        setShowModal(false);
    };

    const handleCancelEdit = () => {
        setEditingProject(null);
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSort = (type) => {
        if (sortBy === type) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(type);
            setSortDirection('asc');
        }
    };

    const filteredProjects = projects.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === 'name') {
            if (sortDirection === 'asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        }
        if (sortBy === 'date') {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            if (sortDirection === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        }
        
        return 0;
    });

    return (
       <Layout>
            <div className="row">
                <div className="col-md-5">
                    <div className="card bg-white text-dark shadow-lg border-0">
                        <div className="card-header border-0 bg-white text-start d-flex justify-content-between align-items-center">
                            <h2>Projects</h2>
                            <button onClick={handleAddClick} className="btn btn-primary btn-lg">
                                <i className="bi bi-plus-circle me-2"></i> Add New Project
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="row d-flex align-items-center mb-3">
                                <div className="col-12 col-md-7">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-secondary text-dark"><i className="bi bi-search"></i></span>
                                        <input 
                                            type="text" 
                                            placeholder="Search projects..." 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                            className="form-control bg-white text-dark border-secondary"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-md-5 mt-2 mt-md-0">
                                    <div className="btn-group w-100" role="group">
                                        <button onClick={() => handleSort('name')} className="btn btn-outline-secondary hover-text-white">
                                            <i className={`bi bi-sort-alpha-${sortDirection === 'desc' ? 'up' : 'down'} me-0`}></i>
                                            <span className="text-secondary">Name</span>
                                        </button>
                                        <button onClick={() => handleSort('date')} className="btn btn-outline-secondary hover-text-white">
                                            <i className={`bi bi-sort-down${sortDirection === 'desc' ? '-alt' : ''} me-0`}></i>
                                            <span className="text-secondary">Date</span>
                                        </button>   
                                    </div>
                                </div>
                            </div>
                            <ul className="list-unstyled mt-2">
                                {sortedProjects.map(project => (
                                    <li key={project._id} className={`card shadow-sm mb-1 border ${selectedProject && selectedProject._id === project._id ? 'border-primary' : 'border-light'}`} style={{ cursor: 'pointer' }} onClick={() => handleProjectSelect(project)}>
                                        <div className="card-body py-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="card-title fw-bold mb-0 text-dark" style={{ lineHeight: '1' }}>{project.name}</h6>
                                                <div className="btn-group" role="group">
                                                    <button onClick={(e) => { e.stopPropagation(); handleProjectSelect(project); }} className="btn btn-sm btn-outline-secondary" aria-label="View tasks">
                                                        <i className="bi bi-eye-fill text-info"></i>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(project); }} className="btn btn-sm btn-outline-secondary" aria-label="Edit project">
                                                        <i className="bi bi-pencil-square text-warning"></i>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleProjectDeleted(project._id); }} className="btn btn-sm btn-outline-secondary" aria-label="Delete project">
                                                        <i className="bi bi-trash-fill text-danger"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="card-text text-secondary small mb-0">{project.description}</p>
                                            <div className="d-flex justify-content-between text-muted small mt-1">
                                                {project.createdAt && (
                                                    <span className="me-2">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                                                )}
                                                {project.dueDate && (
                                                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-7">
                    {selectedProject ? (
                        <div className="card bg-white text-dark shadow-lg border-0">
                            <div className="card-header border-0 bg-white text-start">
                                <h2 className="mb-0">Tasks for {selectedProject.name}</h2>
                            </div>
                            <div className="card-body">
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control bg-white text-dark border-secondary w-60"
                                        placeholder="New Task Name"
                                        value={newTaskName}
                                        onChange={(e) => setNewTaskName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddTask();
                                            }
                                        }}
                                    />
                                    <input 
                                        type="date" 
                                        className="form-control bg-white text-dark border-secondary w-20" 
                                        value={newTaskDueDate} 
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    />
                                    <button onClick={handleAddTask} className="btn btn-success w-20">
                                        <i className="bi bi-plus-circle me-2"></i> Add Task
                                    </button>
                                </div>
                                <div className="mt-4">
                                    {tasks.length > 0 ? (
                                        tasks.map(task => (
                                            <TaskItem 
                                                key={task._id} 
                                                task={task} 
                                                onToggleComplete={handleToggleComplete} 
                                                onDelete={handleDeleteTask} 
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center p-3">
                                            <i className="bi bi-check2-circle text-success display-4 mb-3"></i>
                                            <p className="lead text-secondary">No tasks yet. Add one to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-white text-dark shadow-lg border-0">
                            <div className="card-header border-0 bg-white text-start">
                                <h2 className="mb-0 text-muted">Select a project to view its tasks.</h2>
                            </div>
                            <div className="card-body">
                                <div className="text-center p-5">
                                    <i className="bi bi-arrow-left-circle-fill text-primary display-1 mb-3"></i>
                                    <p className="lead text-secondary">Click on a project to see its details and tasks appear here.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ProjectModal show={showModal} onHide={handleModalClose} title={editingProject ? "Edit Project" : "Add Project"}>
                {editingProject ? (
                    <EditProjectForm project={editingProject} onUpdate={handleUpdate} onCancel={handleModalClose}/>
                ) : (
                    <AddProjectForm onProjectAdded={handleProjectAdded} onCancel={handleModalClose}/>
                )}
            </ProjectModal>
       </Layout>
    );
}

export default HomePage;