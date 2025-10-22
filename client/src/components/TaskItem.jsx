import React from 'react';

const TASK_STATUSES = [
    { value: 'todo', label: 'To Do', className: 'text-primary', bgClass: 'bg-primary' },
    { value: 'in-progress', label: 'In Progress', className:"text-warning", bgClass: 'bg-warning'},
    { value: 'done', label: 'Done', className:'text-success', bgClass: 'bg-success'},
];

// Removed: onToggleComplete
const TaskItem = ({ 
    task, 
    onDelete, 
    isSelected, 
    onToggleSelect, 
    onUpdateStatus
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
    
    // Function to determine due date styling based on proximity, returns only the color string
    const getDueDateColor = (dateString) => {
        if (!dateString) return 'muted'; 
        
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to midnight for comparison

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            // Overdue (Red)
            return 'danger';
        } else if (diffDays <= 3) {
            // Approaching (Yellow/Warning)
            return 'warning';
        } else {
            // Future (Success/Green)
            return 'success'; 
        }
    };


    const formattedDueDate = formatDate(task.dueDate);
    const displayTaskName = truncateString(task.name, 50);
    
    // Determine the color string (danger, warning, success, or muted)
    const dueDateColor = getDueDateColor(task.dueDate);
    
    // Classes for text color and font weight (fw-bold for urgent status)
    const dueDateTextClasses = `text-${dueDateColor} ${['danger', 'warning'].includes(dueDateColor) ? 'fw-bold' : ''}`;

    // Classes for border-only look (removed rounded-pill)
    const dueDateFormattingClasses = `border border-1 border-${dueDateColor}`;
    
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
    
    // Checkbox now handles selection (onToggleSelect)
    const handleSelectionToggle = (e) => {
        // e.stopPropagation() is already handled by the onClick on the checkbox input,
        // but it's good practice to ensure.
        e.stopPropagation(); 
        onToggleSelect(task._id);
    };
    
    // Determine the class name based on state
    let cardClasses = `card mb-1 p-1 text-dark shadow-sm`;

    // 1. APPLY HIGHLIGHT IF SELECTED (via Checkbox)
    if (isSelected) {
         // Apply primary border and info background for highlight
         cardClasses = `card mb-1 p-1 text-dark border-primary border-3 shadow-lg bg-info-subtle`;
    }
    // 2. Otherwise, if completed (Status: Done), apply standard completed styling
    else if (task.completed) {
        // FIX: Ensure border is visible and use a subtle background for completion status
        cardClasses += ` border-secondary bg-light`; 
    } else {
        // Default style: secondary border, white background
        cardClasses += ` border-secondary bg-white`;
    }
    
    // The cursor is always default since the card body itself has no selection or action handler
    const cursorStyle = 'default';

    return (
        <div
            className={cardClasses}
            // CRITICAL: Removed onClick={handleCardClick} to reserve card click for future sidebar/detail view
            style={{ cursor: cursorStyle }} 
        >
            
            {/* FIXED LAYOUT: Use Flexbox to ensure consistent horizontal alignment */}
            <div className="d-flex align-items-center text-start w-100" style={{ minHeight: '32px' }}>
                
                {/* 1. Task Name + Checkbox (Grow to fill remaining space) */}
                <div className="d-flex align-items-center me-3 min-w-0 flex-grow-1">
                    
                    {/* SELECTION CHECKBOX (Handles onToggleSelect) */}
                    <input
                        className="form-check-input me-3 mt-0 flex-shrink-0"
                        type="checkbox"
                        checked={isSelected} // Checkbox reflects selection state
                        onChange={handleSelectionToggle} // Toggles selection
                        // This stops the input click from propagating to the parent div
                        onClick={(e) => e.stopPropagation()} 
                        id={`task-select-${task._id}`}
                        title="Select Task for Bulk Action"
                    />
                    
                    {/* The task name itself - Line-through based on task.completed (which syncs to status) */}
                    <label
                        // FIX: Removed htmlFor to decouple the label click from the checkbox input.
                        className={`form-check-label text-truncate w-100 ${task.completed ? 'text-decoration-line-through text-secondary' : 'text-dark'}`}
                        // FIX: Reset cursor to default, since clicking this text should do nothing for selection.
                        style={{ cursor: 'default' }} 
                        title={task.name}
                    >
                        {displayTaskName}
                    </label>
                </div>
                
                {/* CONTROL GROUP (pushed to the right using ms-auto) */}
                <div className="d-flex align-items-center flex-shrink-0 ms-auto">
                    


                    {/* 3. Status Dropdown (Increased Width to 110px to accommodate "In Progress" fully) */}
                    <div className="flex-shrink-0 me-0" style={{ width: '110px', minWidth: '110px' }}>
                        <select
                            // Status dropdown still uses bgClass for background and text-white for contrast
                            className={`form-select form-select-sm border-0 fw-bold text-white ${currentStatus.bgClass} text-truncate`}
                            value={task.status || 'todo'} 
                            onChange={handleStatusChange}
                            onClick={(e) => e.stopPropagation()} 
                            // Custom style to keep it small in height
                            style={{ cursor: 'pointer', height: '24px', padding: '0 0.4rem', lineHeight: '1' }}
                            title={`Current Status: ${currentStatus.label}`}
                        >
                            {TASK_STATUSES.map(status => (
                                <option 
                                    key={status.value} 
                                    value={status.value} 
                                    // Options still use background for visibility when open
                                    className={`${status.bgClass} text-white`} 
                                >
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
          
                    <div className="text-muted d-none d-sm-flex align-items-center justify-content-end me-1 text-nowrap" style={{ width: '75px', fontSize: '0.7rem' }}>
                        {formattedDueDate && (
                            <p 
                                // Applied square border styles
                                className={`mb-0 d-flex align-items-center px-1 ${dueDateTextClasses} ${dueDateFormattingClasses}`}
                                // Reduced padding on the p tag to keep it compact
                                style={{ padding: '2px 4px' }}
                            >
                                <i className="bi bi-clock me-1"></i> 
                                {formattedDueDate}
                            </p>
                        )}
                    </div>

                    {/* 4. Delete Button (Fixed Small Width) */}
                    <div className="flex-shrink-0" style={{ width: '40px', maxWidth: '40px' }}>
                        <button
                            onClick={handleDeleteClick}
                            className="btn btn-sm btn-outline-danger border-0 p-1 w-100"
                            aria-label="Delete Task"
                            title="Delete Task"
                        >
                            <i className="bi bi-trash-fill fs-6"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;