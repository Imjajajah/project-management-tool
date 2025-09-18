import { useState } from 'react';
import Swal from 'sweetalert2';

const AddProjectForm = ({ onProjectAdded, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;

        if (!name.trim()) {
            Swal.fire('Error!', 'Project name is required.', 'error');
            return;
        }

        const newProject = {
            name,
            description,
            ...(dueDate && { dueDate: new Date(dueDate).toISOString() }),
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDate && new Date(dueDate) < today) {
            Swal.fire('Error!', 'Due date cannot be in the past.', 'error');
            return;
        }
        
        setIsSubmitting(true); 

        try {
            await onProjectAdded(newProject);
            setName('');
            setDescription('');
            setDueDate('');
        } catch (error) {
            Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-1">
            <div className="mb-3 text-start">
                <label htmlFor="projectName" className="form-label text-dark d-flex align-items-center">
                    Project Name
                    <span className="text-danger ms-1">*</span>
                </label>
                <input type="text" className="form-control" id="projectName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter project name" required />
            </div>
            <div className="mb-3 text-start">
                <label htmlFor="projectDescription" className="form-label text-dark">
                    Description
                    <span className="text-danger ms-1">*</span>
                </label>
                <textarea className="form-control" id="projectDescription" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a brief description"></textarea>
            </div>
            <div className="mb-3 text-start">
                <label htmlFor="projectDueDate" className="form-label text-dark">Due Date (Optional)</label>
                <input type="date" className="form-control" id="projectDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Project'}
                </button>
            </div>
        </form>
    );
};

export default AddProjectForm;