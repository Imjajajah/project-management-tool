import React from 'react';
import DueDateBadge from './DueDateBadge'; // New: Import the reusable date component

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

    // Removed: formatDate, getDueDateColor, formattedDueDate, dueDateColor, dueDateTextClasses, and dueDateFormattingClasses.
    // This logic is now handled entirely within DueDateBadge.jsx

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
        cardClasses += ` border-secondary bg-white`; 
    } else {
        
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
                    
                    {/* 2. Due Date (Now using the reusable DueDateBadge component) */}
                    {/* Width is set here to maintain layout consistency with the original design */}
                    <div className="text-muted d-none d-sm-flex align-items-center justify-content-end me-3 text-nowrap" style={{ width: '75px', fontSize: '0.7rem' }}>
                        <DueDateBadge 
                            dueDate={task.dueDate} 
                            isCompleted={task.completed} 
                        />
                    </div>

                    {/* 3. Status Dropdown (Increased Width to 110px to accommodate "In Progress" fully) */}
                    <div className="flex-shrink-0 me-1" style={{ width: '110px', minWidth: '110px' }}>
                        <select
                            // Added 'rounded-1' to match the due date indicator
                            className={`form-select form-select-sm border-0 fw-bold text-white ${currentStatus.bgClass} text-truncate rounded-1`}
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
