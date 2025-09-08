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
                <div className="col-md-5">
                    <ProjectList selectedProject={selectedProject} onProjectSelect={handleProjectSelect}/>
                </div>
                
                <div className="col-md-7">
                    <TaskList selectedProject={selectedProject}/>
                </div>
                
            </div>
        </Layout>
    );
}

export default HomePage;