// /Users/jarreyes/Documents/PROGRAMS/project-management-tool/client/src/components/ProjectList.jsx

import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getToken } from '../utils/api';
import AddProjectForm from './AddProjectForm';
import EditProjectForm from './EditProjectForm';
import ProjectModal from './modals/ProjectModal';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Updated props to include isCollapsed and onToggleCollapse
function ProjectList({ selectedProject, onProjectSelect, isCollapsed, onToggleCollapse }) { 
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    // ... (Your existing functions remain the same)
    const handleModalClose = () => {
        setEditingProject(null);
        setShowModal(false);
    };

    const fetchProjects = async () => {
        // ... (fetchProjects implementation)
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/projects`, {
                headers: {
                    'x-auth-token': token
                }
            });
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };
    // ... (Other functions like handleAddClick, handleProjectAdded, etc. remain the same)
    const handleAddClick = () => {
        setEditingProject(null);
        setShowModal(true);
    };

    const handleProjectAdded = async (newProject) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newProject),
            });

            if (response.ok) {
                const addedProject = await response.json();
                setProjects(prevProjects => [...prevProjects, addedProject]);
                Swal.fire('Success', 'Project added successfully', 'success');
                handleModalClose();
            } else {
                throw new Error('Failed to add project');
            }
            
        } catch (error) {
            console.error("Error adding project:", error);
            Swal.fire('Error!', 'Failed to add project. Please try again.', 'error');
        }
    };

    const handleProjectDeleted = async (projectId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the project and all associated tasks. You will not be able to undo this action.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const serverUrl = import.meta.env.VITE_SERVER_URL;
                    const token = getToken();
                    const response = await fetch(`${serverUrl}/api/projects/${projectId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token }
                    });

                    if (response.ok) {
                        setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));
                        Swal.fire(
                            'Deleted!',
                            'Your project has been deleted.',
                            'success'
                        );
                        if (selectedProject && selectedProject._id === projectId ) {
                            onProjectSelect(null);
                        }
                    } else {
                        throw new Error('Failed to delete project');
                    }
                } catch (error) {
                    console.error("Error deleting project:", error);
                    Swal.fire(
                        'Failed!',
                        'Failed to delete project. Please try again.',
                        'error'
                    );
                }
            }
        });
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setShowModal(true);
    };

    const handleUpdate = async (updatedProject) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/projects/${updatedProject._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(updatedProject),
            });

            if (response.ok) {
                const updatedData = await response.json();
                setProjects(prevProjects => prevProjects.map(p => p._id === updatedData._id ? updatedData : p));
                Swal.fire('Success!', 'Project updated successfully.', 'success');
                handleModalClose();
            } else {
                throw new Error('Failed to update project.');
            }
        } catch (error) {
            console.error("Error updating project:", error);
            Swal.fire('Error', 'Failed to update project. Please try again.', 'error');
        }
    };

    useEffect(() => {
        if (user) {
            fetchProjects();
        } else {
            setProjects([]);
        }
    }, [user]);

    const handleSort = (type) => {
        if (sortBy === type) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(type);
            setSortDirection('asc');
        }
    };

    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (sortBy === 'name') {
            if (sortDirection === 'asc'){
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


    if (isCollapsed) {
        // RENDER Collapsed View: Only shows a title and the toggle button
        return (
            <div className="card bg-white text-dark shadow-lg border-0 min-h-75 w-100 p-0 text-center">
                <div className="card-header border-0 bg-white text-dark py-3">
                    <button 
                        onClick={onToggleCollapse} 
                        className="btn btn-outline-secondary p-0 border-0"
                        title="Expand Projects"
                    >
                        <i className="bi bi-list-nested fs-4"></i>
                    </button>
                </div>
            </div>
        );
    }
    
    // RENDER Expanded View
    return (
        <>
            <div className="card bg-white text-dark shadow-lg border-0 min-h-75 w-100">
                <div className="card-header border-0 bg-white text-start d-flex justify-content-between align-items-center py-3 px-3 px-md-4 position-relative">
                    
                    <h2 className="mb-0 fs-5 text-truncate me-2">Projects</h2>
                    
                    {/* Primary action buttons, pushed away from the corner */}
                    <div className="d-flex justify-content-end align-items-center">
                        <button onClick={handleAddClick} className="btn btn-primary btn-sm flex-shrink-0 shadow-sm">
                            <i className="bi bi-plus-circle me-1"></i> 
                            <span className="d-none d-sm-inline">Add New Project</span>
                            <span className="d-inline d-sm-none">Add</span>
                        </button>
                    </div>

                    {/* The Collapse Button - using absolute positioning and negative margins */}
                    <button 
                        onClick={onToggleCollapse} 
                        className="btn btn-sm text-secondary p-0 position-absolute top-0 end-0"
                        style={{ 
                            marginTop: '-10px',  /* Adjust this value to offset the header's top padding (py-3) */
                            marginRight: '-10px', /* Adjust this value to offset the header's right padding (px-3/4) */
                            width: '32px', 
                            height: '32px',
                            zIndex: 10 
                        }}
                        title="Toggle Collapse">
                        <i className="bi bi-list fs-7"></i>
                    </button>

                </div>
                                
                <div className="card-body py-3 px-3 px-md-4">
                    
                    {/* Search and Sort Controls: Responsive Grid */}
                    <div className="row g-2 align-items-center mb-3">
                        <div className="col-12 col-md-7">
                            <div className="input-group input-group-sm">
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
                        <div className="col-12 col-md-5">
                            <div className="btn-group btn-group-sm w-100" role="group">
                                <button 
                                    onClick={() => handleSort('name')} 
                                    className={`btn ${sortBy === 'name' ? 'btn-secondary' : 'btn-outline-secondary'} text-truncate`} 
                                    title="Sort by Name"
                                >
                                    <i className={`bi bi-sort-alpha-${sortDirection === 'desc' ? 'up' : 'down'} me-1 d-none d-sm-inline`}></i>
                                    Name
                                </button>
                                <button 
                                    onClick={() => handleSort('date')} 
                                    className={`btn ${sortBy === 'date' ? 'btn-secondary' : 'btn-outline-secondary'} text-truncate`} 
                                    title="Sort by Date Created"
                                >
                                    <i
                                    className={`bi ${sortDirection === 'asc' ? 'bi-sort-up' : 'bi-sort-down'} me-1 d-none d-sm-inline`}
                                    ></i>
                                    Date

                                </button>   
                            </div>
                        </div>
                    </div>
                    
                    {/* Project List */}
                    <div className="list-container" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                        <ul className="list-unstyled mt-3">
                            {sortedProjects.length > 0 ? (
                                sortedProjects.map(project => (
                                    <li 
                                        key={project._id} 
                                        className={`card shadow-sm mb-2 border ${selectedProject && selectedProject._id === project._id ? 'border-primary border-2' : 'border-light'}`} 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => onProjectSelect(project)}
                                    >
                                        <div className="card-body py-1 px-1 px-sm-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                
                                                {/* Project Info: Text Truncation to prevent overflow */}
                                                <div className="flex-grow-1 me-2 text-start overflow-hidden">
                                                    <h6 className="card-title fw-bold mb-0 text-dark text-truncate" style={{ lineHeight: '1.2' }}>{project.name}</h6>
                                                    <p className="card-text text-secondary small mb-1 text-truncate d-none d-sm-block">{project.description}</p>
                                                    <div className="d-flex text-muted small mt-1">
                                                        {project.createdAt && (
                                                            <span className="me-3 d-none d-sm-inline">Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                                                        )}
                                                        {project.dueDate && (
                                                            <span className="d-none d-md-inline">Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons: Responsive Grouping */}
                                                <div className="d-flex flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <div className="btn-group btn-group-sm d-none d-sm-flex" role="group">
                                                        <button onClick={() => navigate(`/kanban/${project._id}`)} className="btn btn-outline-success" aria-label="View Kanban" title="View Kanban Board">
                                                            <i className="bi bi-columns-gap"></i>
                                                        </button>
                                                        <button onClick={() => handleEditClick(project)} className="btn btn-outline-warning" aria-label="Edit project" title="Edit Project">
                                                            <i className="bi bi-pencil-square"></i>
                                                        </button>
                                                        <button onClick={() => handleProjectDeleted(project._id)} className="btn btn-outline-danger" aria-label="Delete project" title="Delete Project">
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </div>

                                                    <div className="dropdown d-sm-none">
                                                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="More actions">
                                                            <i className="bi bi-three-dots-vertical"></i>
                                                        </button>
                                                        <ul className="dropdown-menu dropdown-menu-end">
                                                            <li>
                                                                <a className="dropdown-item text-success" href="#" onClick={() => navigate(`/kanban/${project._id}`)}>
                                                                    <i className="bi bi-columns-gap me-2"></i> View Kanban
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a className="dropdown-item text-warning" href="#" onClick={() => handleEditClick(project)}>
                                                                    <i className="bi bi-pencil-square me-2"></i> Edit Project
                                                                </a>
                                                            </li>
                                                            <li><hr className="dropdown-divider"/></li>
                                                            <li>
                                                                <a className="dropdown-item text-danger" href="#" onClick={() => handleProjectDeleted(project._id)}>
                                                                    <i className="bi bi-trash-fill me-2"></i> Delete Project
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <div className="alert alert-info text-center mt-3" role="alert">
                                    No projects found. {searchTerm && 'Try a different search term.'}
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            
            <ProjectModal show={showModal} onHide={handleModalClose} title={editingProject ? "Edit Project" : "Add Project"}>
                {editingProject ? (
                    <EditProjectForm project={editingProject} onUpdate={handleUpdate} onCancel={handleModalClose}/>
                ) : (
                    <AddProjectForm onProjectAdded={handleProjectAdded} onCancel={handleModalClose}/>
                )}
            </ProjectModal>
        </>
    );
}

export default ProjectList;