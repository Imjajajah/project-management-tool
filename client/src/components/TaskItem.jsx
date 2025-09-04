import React from 'react';

const TaskItem = ({ task, onToggleComplete, onDelete, isSelected, onToggleSelect }) => {

    const formatDate = (dateString) => {
        if (!dateString) {return ''};

        const date = new Date(dateString);

        if (isNaN(date)){
            return 'Invalid Date';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formattedDueDate = formatDate(task.dueDate);

    return (
        <div
            className={`card mb-2 p-2 text-dark border-secondary ${task.completed ? 'bg-light' : ''}`}
            // Note: The main onClick now handles both completion and selection
            onClick={() => onToggleComplete(task)}
            style={{ cursor: 'pointer' }}>
            <div className="d-flex align-items-center justify-content-between text-start">
                <div className="d-flex align-items-center">
                    <input
                        className="form-check-input me-3 mt-0"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(task._id)}
                        onClick={(e) => e.stopPropagation()} // Prevents the parent div's onClick from firing
                        id={`task-select-${task._id}`}
                    />
                    <input
                        className="form-check-input me-3 mt-0 d-none"
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        id={`task-complete-${task._id}`}
                    />
                    <label
                        htmlFor={`task-complete-${task._id}`}
                        className={`form-check-label w-100 ${task.completed ? 'text-decoration-line-through text-secondary' : 'text-dark'}`}
                        style={{ cursor: 'pointer' }}
                    >
                        {task.name}
                    </label>
                </div>
                <div className="d-flex align-items-center text-start">
                    <p className="text-start text-muted mb-0 me-3">
                        {formattedDueDate ? `Due: ${formattedDueDate}` : ''}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task._id);
                        }}
                        className="btn btn-sm btn-outline-danger border-0"
                        aria-label="Delete Task" title="Delete"
                    >
                        <i className="bi bi-trash-fill"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;