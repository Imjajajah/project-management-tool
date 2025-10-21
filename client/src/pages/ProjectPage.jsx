import { useState } from 'react';
import ProjectList from '../components/ProjectList';
import TaskList from '../components/TaskList';
import '../App.css';

function ProjectPage() {
    const [selectedProject, setSelectedProject] = useState(null);
    // NEW STATE: To control the sidebar's collapse state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

    const handleProjectSelect = (project) => setSelectedProject(project);
    
    // NEW: Function to toggle the sidebar state
    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    const sidebarClass = isSidebarCollapsed ? 'col-md-1' : 'col-md-4';
    const tasklistClass = isSidebarCollapsed ? 'col-md-11' : 'col-md-8';

    return (
        <div className="row h-100 g-0"> {/* g-0 removes gutter for a cleaner look when resizing */}
            
            {/* Project Sidebar Column */}
            <div className={`d-flex flex-column h-100 p-2 p-md-3 ${sidebarClass}`} 
                 // Added custom minimum width to keep the icon visible when collapsed
                 style={{ minWidth: isSidebarCollapsed ? '60px' : 'auto', transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out' }} 
            >
                <ProjectList 
                    selectedProject={selectedProject} 
                    onProjectSelect={handleProjectSelect}
                    isCollapsed={isSidebarCollapsed} // Pass state down to ProjectList
                    onToggleCollapse={toggleSidebar} // Pass toggle function down
                />
            </div>
            
            {/* Task List Column */}
            <div className={`d-flex flex-column h-100 p-2 p-md-3 ${tasklistClass}`}>
                <TaskList 
                    selectedProject={selectedProject}
                />
            </div>
        </div>
    );
}

export default ProjectPage;