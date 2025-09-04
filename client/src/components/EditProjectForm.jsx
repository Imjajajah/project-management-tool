import { useState } from 'react';

function EditProjectForm({ project, onUpdate, onCancel }) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [dueDate, setDueDate] = useState(project.dueDate ? project.dueDate.split('T')[0] : '');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedProject = { name, description, dueDate };

        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects/${project._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProject),
            });

            if (!response.ok) {
                throw new Error('Failed to update project');
            }

            const updatedData = await response.json();
            onUpdate(updatedData);
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
           <div className="row">
                <div className="col-md-12 mb-3 text-start">
                    <div className="mb-3 text-start">
                        <label htmlFor="name" className="form-label">Project Name: </label>
                        <input id="name" type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required/> 
                    </div>

                    <div className="mb-3 text-start">
                        <label htmlFor="description" className="form-label">Description: </label>
                        <textarea id="description" value={description} className="form-control" onChange={(e) => setDescription(e.target.value)} required/>
                    </div>
                   
                    <div className="mb-3 text-start">
                        <label htmlFor="projectDueDate" className="form-label text-dark">Due Date (Optional)</label>
                        <input type="date" className="form-control" id="projectDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Update Project</button>
                    </div>
                   
                </div>
            </div>
        </form>



    );
}

export default EditProjectForm;