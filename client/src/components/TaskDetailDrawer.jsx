import React, { useState, useEffect } from 'react';
import { TASK_STATUSES } from './TaskItem';

// Utility function to format the due date in a long format
const formatDateLong = (dateString) => {
    if (!dateString) return 'No Due Date';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

function TaskDetailDrawer({ task, onClose, isOpen, onSaveTask }) {
    const [editedName, setEditedName] = useState('');
    const [editedDueDate, setEditedDueDate] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedStatus, setEditedStatus] = useState('');

    useEffect(() => {
        if (task) {
            setEditedName(task.name || '');
            setEditedDescription(task.description || '');
            setEditedStatus(task.status || 'todo');
            const dateValue = task.dueDate 
                ? new Date(task.dueDate).toISOString().split('T')[0]
                : '';
            setEditedDueDate(dateValue);
        }
    }, [task]);

    if (!task) return null;

    const currentStatusDisplay = TASK_STATUSES.find(s => s.value === editedStatus) || TASK_STATUSES[0];

    // 🧩 Detect if any field is changed
    const isModified =
        editedName !== (task.name || '') ||
        editedDescription !== (task.description || '') ||
        editedStatus !== (task.status || 'todo') ||
        (editedDueDate || '') !== (
            task.dueDate 
                ? new Date(task.dueDate).toISOString().split('T')[0]
                : ''
        );

    const handleSave = () => {
        if (!isModified) return; // 🧠 No changes, do nothing
        if (onSaveTask && task) {
            const updatedTaskData = {
                _id: task._id,
                name: editedName,
                dueDate: editedDueDate || null,
                description: editedDescription,
                status: editedStatus,
                completed: editedStatus === 'done',
            };
            onSaveTask(updatedTaskData);
        }
    };

    const drawerStyles = `
        .task-detail-drawer {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            width: 100%;
            max-width: 450px;
            background-color: white;
            box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
            z-index: 1050;
            transition: transform 0.3s ease-in-out;
            transform: translateX(100%);
            overflow-y: auto;
        }

        .task-detail-drawer.show {
            transform: translateX(0);
        }

        .drawer-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1045;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease-in-out, visibility 0.3s;
        }

        .drawer-backdrop.show {
            opacity: 1;
            visibility: visible;
        }

        @media (min-width: 768px) {
            .task-detail-drawer {
                width: 450px; 
            }
        }

        .task-title-input {
            border: 1px solid transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font-size: 1.5rem;
            line-height: 1.2;
            font-weight: 700 !important;
            transition: all 0.2s ease;
        }

        .task-title-input:focus {
            border-color: #ced4da !important;
            background-color: #fff;
            padding: 0.375rem 0.75rem !important;
            margin-bottom: 0.5rem;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        .input-inline-edit {
            border: 1px solid transparent !important;
            box-shadow: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            transition: all 0.2s ease;
        }

        .input-inline-edit:focus {
            border-color: #ced4da !important; 
            background-color: #fff;
            padding: 0.375rem 0.75rem !important;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        .input-inline-edit.form-control[value=""] {
            font-style: italic;
            color: #6c757d;
        }

        .input-inline-edit.form-control:focus {
            font-style: normal;
            color: #212529;
        }
    `;

    return (
        <>
            <style>{drawerStyles}</style>

            {/* Backdrop */}
            <div 
                className={`drawer-backdrop ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`task-detail-drawer ${isOpen ? 'show' : ''} p-4`}>
                <div className="d-flex justify-content-end mb-2">
                    <button 
                        onClick={onClose} 
                        className="btn-close"
                        aria-label="Close details"
                    ></button>
                </div>
                
                <div className="mb-4 border-bottom pb-3">
                    <input
                        type="text"
                        className="form-control task-title-input"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="[Untitled Task]"
                    />
                </div>

                <div className="d-grid gap-3">
                    {/* Status */}
                    <div className="d-flex align-items-center mb-3 text-start">
                        <span className="text-muted fw-semibold me-3 text-nowrap">Status:</span>
                        <select
                            className={`form-select form-select-sm border-0 ${currentStatusDisplay.bgClass} text-white fw-bold`}
                            style={{ width: 'auto' }}
                            value={editedStatus}
                            onChange={(e) => setEditedStatus(e.target.value)}
                        >
                            {TASK_STATUSES.map(s => (
                                <option key={s.value} value={s.value} className="bg-white text-dark">
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div className="text-start mb-3">
                        <p className="text-muted small mb-1 fw-semibold">Due Date</p>
                        <input
                            type="date"
                            className="form-control input-inline-edit"
                            title="Set Due Date"
                            value={editedDueDate}
                            onChange={(e) => setEditedDueDate(e.target.value)}
                        />
                    </div>
                    
                    {/* Description */}
                    <div className="text-start mb-3">
                        <p className="text-muted small mb-1 fw-semibold">Description</p>
                        <textarea
                            className="form-control input-inline-edit"
                            rows="5"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Add a detailed description..."
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    {/* Save Button */}
                    <button 
                        onClick={handleSave} 
                        className="btn btn-primary fw-bold mt-2"
                        disabled={!editedName.trim() || !isModified}
                    >
                        <i className="bi bi-save me-2"></i>
                        {isModified ? 'Save Changes' : 'No Changes'}
                    </button>

                    {/* Activity Section */}
                    <div className="pt-3 border-top">
                        <h6 className="fw-bold text-dark mb-3">Activity & Comments</h6>
                        <div className="alert alert-light text-muted small border-start border-3 border-secondary">
                            <p className="mb-0">
                                This section is for future development. You can add user comments and activity logs here!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TaskDetailDrawer;
