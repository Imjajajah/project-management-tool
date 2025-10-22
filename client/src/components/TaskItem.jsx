import React from 'react';

const TASK_STATUSES = [
    { value: 'todo', label: 'To Do', className: 'text-primary' },
    { value: 'in-progress', label: 'In Progress', className:"text-warning"},
    { value: 'done', label: 'Done', className:'text-success'},
];

// Updated Props: Added isBulkSelectMode
const TaskItem = ({ 
    task, 
    onToggleComplete, 
    onDelete, 
    isSelected, 
    onToggleSelect, 
    onUpdateStatus, 
    isBulkSelectMode 
}) => {
    
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
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formattedDueDate = formatDate(task.dueDate);
    const displayTaskName = truncateString(task.name, 50);

    const currentStatus = TASK_STATUSES.find(s => s.value === task.status) || TASK_STATUSES[0];

    const handleStatusChange = (e) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        if (onUpdateStatus) {
            onUpdateStatus(task._id, newStatus);
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(task._id);
    }
    
    // COMPLETION TOGGLE HANDLER: Only called by the first checkbox
    const handleCompletionToggle = (e) => {
        e.stopPropagation(); 
        onToggleComplete(task);
    };
    
    // CARD BODY CLICK HANDLER: Only handles bulk selection
    const handleCardClick = () => {
        if (isBulkSelectMode) {
            onToggleSelect(task._id);
        }
    };
    
    // Determine the class name based on state
    let cardClasses = `card mb-1 p-1 text-dark border-secondary shadow-sm`;
    if (task.completed) {
        cardClasses = `card mb-1 p-1 text-dark border-0 shadow-sm bg-light`;
    }
    // HIGHLIGHT: If in bulk mode AND selected
    if (isSelected && isBulkSelectMode) {
         cardClasses = `card mb-1 p-1 text-dark border-primary border-3 shadow-lg bg-info-subtle`;
    }

    // Determine cursor style
    const cursorStyle = isBulkSelectMode ? 'pointer' : 'default';

    return (
        <div
            className={cardClasses}
            // ASSIGN CARD CLICK: Only for selection when in bulk mode
            onClick={handleCardClick} 
            style={{ cursor: cursorStyle }} 
        >
            
            <div className="d-flex align-items-center justify-content-between text-start">
                
                <div 
                    className="d-flex align-items-center flex-grow-1 me-2 min-w-0"
                    style={{ minHeight: '32px' }} 
                >
                    
                    {/* COMPLETION CHECKBOX (Always visible, handles toggleComplete) */}
                    <input
                        className="form-check-input me-3 mt-0 flex-shrink-0"
                        type="checkbox"
                        checked={task.completed} 
                        onChange={handleCompletionToggle} 
                        // IMPORTANT: Stop propagation so checkbox click doesn't trigger card selection in bulk mode
                        onClick={(e) => e.stopPropagation()} 
                        id={`task-complete-${task._id}`}
                        title="Mark Complete/Incomplete"
                    />

                    {/* The task name itself */}
                    <label
                        // FIX: Removed htmlFor to prevent the label/text click from toggling the checkbox.
                        className={`form-check-label text-truncate w-100 ${task.completed ? 'text-decoration-line-through text-secondary' : 'text-dark'}`}
                        // Changed cursor to default when not in bulk mode, to visually confirm it's not clickable for completion.
                        style={{ cursor: 'default' }} 
                        title={task.name}
                    >
                        {displayTaskName}
                    </label>
                    
                </div>
                
                <div 
                    className="d-flex align-items-center flex-shrink-0 ms-2"
                    style={{ minHeight: '32px' }} 
                >
                    
                    {/* Status Dropdown */}
                    <select
                        className={`form-select form-select-sm border-0 fw-bold me-3 bg-light text-dark ${currentStatus.className} text-truncate`}
                        value={task.status || 'todo'} 
                        onChange={handleStatusChange}
                        onClick={(e) => e.stopPropagation()} 
                        style={{ maxWidth: '120px', cursor: 'pointer' }}
                        title={`Current Status: ${currentStatus.label}`}
                    >
                        {TASK_STATUSES.map(status => (
                            <option 
                                key={status.value} 
                                value={status.value} 
                            >
                                {status.label}
                            </option>
                        ))}
                    </select>

                    {/* Due Date */}
                    <p className="text-muted small mb-0 me-3 d-none d-sm-block text-nowrap">
                        {formattedDueDate ? `Due: ${formattedDueDate}` : <>&nbsp;</>}
                    </p>
                    
                    {/* Delete Button (Icon Only - Hidden in Bulk Mode for clarity) */}
                    {!isBulkSelectMode && (
                        <button
                            onClick={handleDeleteClick}
                            className="btn btn-sm btn-outline-danger border-0 p-1 flex-shrink-0"
                            aria-label="Delete Task"
                            title="Delete Task (Single)"
                        >
                            <i className="bi bi-trash-fill fs-6"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskItem;