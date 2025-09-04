import { useState } from 'react';

const AddProjectForm = ({ onProjectAdded, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        // UPDATED: Cleaner object creation using destructuring
        const newProject = {
            name,
            description,
            // Include dueDate only if it's been set
            ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
        };

        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProject),
            });
            if (response.ok) {
                const addedProject = await response.json();
                onProjectAdded(addedProject);
                setName('');
                setDescription('');
                setDueDate('');
            } else {
                console.error('Failed to add project');
            }
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-1">
            <div className="mb-3 text-start">
                <label htmlFor="projectName" className="form-label text-dark">Project Name</label>
                <input type="text" className="form-control" id="projectName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter project name" required />
            </div>
            <div className="mb-3 text-start">
                <label htmlFor="projectDescription" className="form-label text-dark">Description</label>
                <textarea className="form-control" id="projectDescription" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a brief description"></textarea>
            </div>
            <div className="mb-3 text-start">
                <label htmlFor="projectDueDate" className="form-label text-dark">Due Date (Optional)</label>
                <input type="date" className="form-control" id="projectDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Project</button>
            </div>
        </form>
    );
};

export default AddProjectForm;