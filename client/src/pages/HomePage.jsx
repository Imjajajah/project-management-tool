import { useState } from 'react';
import Layout from '../components/layout/Layout';
import ProjectList from '../components/ProjectList';
import TaskList from '../components/TaskList';
import '../App.css';

function HomePage() {
    const [selectedProject, setSelectedProject] = useState(null);

    const handleProjectSelect = (project) => setSelectedProject(project);

    return (
        <Layout>
            <div className="row">
                <ProjectList selectedProject={selectedProject} onProjectSelect={handleProjectSelect}/>
                <TaskList selectedProject={selectedProject}/>
            </div>
        </Layout>
    );
}

export default HomePage;