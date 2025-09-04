import { useEffect, useState } from 'react';
import AddProjectForm from './AddProjectForm';
import EditProjectForm from './EditProjectForm';
import ProjectModal from './modals/ProjectModal';
import Swal from 'sweetalert2';

function ProjectList({ selectedProject, onProjectSelect }) {
    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const showSweetAlert = (title, text, confirmButtonText, action) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: confirmButtonText,
        }).then((result) => {
            if (result.isConfirmed) {
                action();
            }
        });
    }

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

    const handleProjectAdded = async (newProject) => {
        setProjects(prevProjects => [...prevProjects, newProject]);
        setShowModal(false);
        await fetchProjects();
    };

    const handleProjectDeleted = (projectId) => {
        showSweetAlert(
            "Are you sure",
            "This will permanently delete the project and all its tasks!",
            "Yes, Delete it",
            () => {
                try {
                    const serverUrl = import.meta.env.VITE_SERVER_URL;
                    fetch(`${serverUrl}/api/projects/${projectId}`, {
                        method: 'DELETE',
                    }).then(() => {
                        setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId ));
                        if (selectedProject && selectedProject._id === projectId ) {
                            onProjectSelect(null);
                        }
                    });
                } catch (error) {
                    console.error("Error deleting project:", error);
                }
            }
        );
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setShowModal(true);
    }

    const handleUpdate = (updatedProject) => {
        setProjects(prevProjects => prevProjects.map(proj => proj._id === updatedProject._id ? updatedProject : proj));
        setEditingProject(null);
        setShowModal(false);
    }

    const handleCancelEdit = () => setEditingProject(null);
    
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

    return (
        <>
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
                                <li key={project._id} className={`card shadow-sm mb-1 border ${selectedProject && selectedProject._id === project._id ? 'border-primary' : 'border-light'}`} style={{ cursor: 'pointer' }} onClick={() => onProjectSelect(project)}>
                                    <div className="card-body py-0">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="card-title fw-bold mb-0 text-dark" style={{ lineHeight: '1' }}>{project.name}</h6>
                                            <div className="btn-group" role="group">
                                                <button onClick={(e) => { e.stopPropagation(); onProjectSelect(project); }} className="btn btn-sm btn-outline-secondary" aria-label="View tasks" title="View Project">
                                                    <i className="bi bi-eye-fill text-info"></i> 
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEditClick(project); }} className="btn btn-sm btn-outline-secondary" aria-label="Edit project" title="Edit Project">
                                                    <i className="bi bi-pencil-square text-warning"></i>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleProjectDeleted(project._id); }} className="btn btn-sm btn-outline-secondary" aria-label="Delete project" title="Delete Project">
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