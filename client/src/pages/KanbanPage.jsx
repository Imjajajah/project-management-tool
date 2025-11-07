// /Users/jarreyes/Documents/PROGRAMS/project-management-tool/client/src/components/KanbanPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import { getToken } from '../utils/api';
import '../App.css';
import Swal from 'sweetalert2';

function KanbanPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    // Initialize loading based on whether a projectId exists
    const [isLoading, setIsLoading] = useState(!!projectId); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            
            if (!projectId) {
                // Check localStorage for last project to potentially redirect
                const lastProjectId = localStorage.getItem('lastKanbanProjectId');
                if (lastProjectId) {
                    navigate(`/kanban/${lastProjectId}`, { replace: true });
                    // Prevent further execution of the current effect hook
                    return; 
                }
                
                // If no projectId and no lastProjectId, show the default view
                setProject(null);
                setIsLoading(false);
                return;
            }
            
            // --- API CALL ONLY IF projectId EXISTS ---
            try {
                // Ensure loading is true before the fetch
                setIsLoading(true); 
                setProject(null); // Clear any previous project data
                
                const serverUrl = import.meta.env.VITE_SERVER_URL;
                const token = getToken();
                
                const response = await fetch(`${serverUrl}/api/projects/${projectId}`, {
                    headers: {
                        'x-auth-token': token
                    }
                });

                if (!response.ok) {
                    // Handle API error response (e.g., 404, 401)
                    throw new Error('Fetch failed with status: ' + response.status);
                }
                
                const data = await response.json();
                setProject(data);
                localStorage.setItem('lastKanbanProjectId', projectId);
                
            } catch (error) {
                console.error("Failed to fetch project:", error);
                
                // 💥 This is the logic causing the redirect/Swal:
                Swal.fire('Error', 'Project not found or you do not have permission to view it. Redirecting to projects list.', 'error').then(() => {
                    navigate('/projects');
                });
                
                // Crucial: Clear the project and local storage item if the fetch fails
                localStorage.removeItem('lastKanbanProjectId');
                setProject(null); 
                
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchProject();
        // The dependency array is correct
    }, [projectId, navigate]); 

    // --------------------------------------------------------------------------------
    // 💡 RENDER LOGIC
    // --------------------------------------------------------------------------------

    let content;

    if (isLoading) {
        // 1. Show loading spinner while fetching project data
        content = (
            <div className="card text-dark shadow-lg border-0 h-100 bg-transparent">
                <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-secondary">Loading Kanban board...</p>
                </div>
            </div>
        );
    } else if (project) {
        // 2. Show the Kanban Board if a project is loaded
        content = <KanbanBoard selectedProject={project} />;
    } else {
        // 3. Show the default "Please select a project" message
        content = (
            <div className="card bg-white text-dark shadow-lg border-0 h-100">
                <div className="card-header border-0 bg-white text-start">
                    <h2 className="mb-0 text-muted">Kanban Board View</h2>
                </div>
                <div className="card-body">
                    <div className="text-center p-5">
                        <i className="bi bi-trello text-primary display-1 mb-3"></i>
                        <p className="lead text-secondary">
                            Please select a project to view its tasks organized in the Kanban style.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-100 g-0 border-0 mt-3">
            {content}
        </div>
    );
}

export default KanbanPage;