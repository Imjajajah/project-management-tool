import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import { getToken } from '../utils/api';
import '../App.css';
import Swal from 'sweetalert2';

function KanbanPage() {
    const { projectId } = useParams(); // Get project ID from URL
    const [project, setProject] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) {

                const lastProjectId = localStorage.getItem('lastKanbanProjectId');
                if (lastProjectId) {
                    navigate(`/kanban/${lastProjectId}`, { replace: true });
                    return;
                }

                Swal.fire({
                    title: 'No Project Selected',
                    text: 'Please go back and select a project to view its Kanban board.',
                    icon: 'info',
                    confirmButtonText: 'Go to Projects',
                }).then(() => {
                    navigate('/projects');
                });
                return;
            }

            try {
                const serverUrl = import.meta.env.VITE_SERVER_URL;
                const token = getToken();
                const response = await fetch(`${serverUrl}/api/projects/${projectId}`, {
                    headers: {
                        'x-auth-token': token
                    }
                });

                if (!response.ok) {
                    throw new Error('Project not found or unauthorized');
                }
                const data = await response.json();
                setProject(data);
                localStorage.setItem('lastKanbanProjectId', projectId);
            } catch (error) {
                console.error("Failed to fetch project:", error);
                Swal.fire('Error', 'Project not found or you do not have permission to view it.', 'error').then(() => {
                    navigate('/projects');
                });
            }
        };
        fetchProject();
    }, [projectId, navigate]);

    return (
        <div className="h-100 p-0">
            {project ? (
                <KanbanBoard selectedProject={project} />
            ) : (
                <div className="card bg-white text-dark shadow-lg border-0 h-100">
                    <div className="card-body d-flex flex-column justify-content-center align-items-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-secondary">Loading Kanban board...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KanbanPage;