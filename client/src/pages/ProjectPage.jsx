import { useState } from 'react';
import ProjectList from '../components/ProjectList';
import TaskList from '../components/TaskList';
import '../App.css';

function ProjectPage() {
    const [selectedProject, setSelectedProject] = useState(null);

    const handleProjectSelect = (project) => setSelectedProject(project);

    return (
        <div className="row h-100">
            <div className="col-md-5 d-flex flex-column h-100">
                <ProjectList selectedProject={selectedProject} onProjectSelect={handleProjectSelect}/>
            </div>
            
            <div className="col-md-7 d-flex flex-column h-100">
                <TaskList selectedProject={selectedProject}/>
            </div>
        </div>
    );
}

export default ProjectPage;