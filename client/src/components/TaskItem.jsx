import React from 'react';

const TaskItem = ({ task, onToggleComplete, onDelete, isSelected, onToggleSelect }) => {
    
    // String Limiter Utility Function
    const truncateString = (str, num) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + '...';
    };

    const formatDate = (dateString) => {
        if (!dateString) {return ''};

        const date = new Date(dateString);

        if (isNaN(date)){
            return 'Invalid Date';
        }

        // Changed format to be shorter/more appropriate for a task list
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            // Removed year: 'numeric' for brevity, use full date if needed
        });
    };

    const formattedDueDate = formatDate(task.dueDate);

    // Truncate task name for display, allowing 50 characters before adding '...'
    const displayTaskName = truncateString(task.name, 50);

    return (
        <div
            className={`card mb-1 p-2 text-dark border-secondary ${task.completed ? 'bg-light border-0 shadow-sm' : 'shadow-sm'}`}
            // Note: The main onClick now handles both completion and selection
            onClick={() => onToggleComplete(task)}
            style={{ cursor: 'pointer' }}>
            
            <div className="d-flex align-items-start justify-content-between text-start">
                
                {/* Task Name & Checkbox: Prioritize this area */}
                <div 
                    className="d-flex align-items-center flex-grow-1 me-2 min-w-0"
                    // ADDED: Added a min-height style here to ensure the row height is consistent
                    style={{ minHeight: '32px' }} 
                >
                    <input
                        className="form-check-input me-3 mt-0 flex-shrink-0"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(task._id)}
                        onClick={(e) => e.stopPropagation()} // Prevents the parent div's onClick from firing
                        id={`task-select-${task._id}`}
                    />
                    {/* The task name itself */}
                    <label
                        htmlFor={`task-complete-${task._id}`}
                        className={`form-check-label text-truncate w-100 ${task.completed ? 'text-decoration-line-through text-secondary' : 'text-dark'}`}
                        style={{ cursor: 'pointer' }}
                        title={task.name} // Show full name on hover
                    >
                        {displayTaskName}
                    </label>
                    
                    <input
                        className="form-check-input me-3 mt-0 d-none"
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        id={`task-complete-${task._id}`}
                    />
                </div>
                
                <div 
                    className="d-flex align-items-center flex-shrink-0 ms-2"
                   
                    style={{ minHeight: '32px' }} 
                >
                    
                    {/* Due Date: Hidden on extra-small (xs) screens */}
                    <p className="text-muted small mb-0 me-3 d-none d-sm-block">
                        {formattedDueDate ? `Due: ${formattedDueDate}` : <>&nbsp;</>}
                    </p>
                    
                    {/* Delete Button: Icon only on small screens */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task._id);
                        }}
                        className="btn btn-sm btn-outline-danger border-0 flex-shrink-0"
                        aria-label="Delete Task"
                        title="Delete Task"
                    >
                        <i className="bi bi-trash-fill"></i>
                        <span className="d-none d-sm-inline ms-1">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;