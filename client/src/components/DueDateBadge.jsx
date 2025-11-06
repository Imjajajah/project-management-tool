import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const getDueDateColor = (dateString) => {
    if (!dateString) return 'muted';
    
    const dueDate = new Date(dateString);
    const today = new Date();

    // 1. Normalize BOTH dates to the start of the day (midnight)
    today.setHours(0, 0, 0, 0); 
    dueDate.setHours(0, 0, 0, 0); // 👈 **ADD THIS LINE**

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 🔴 Overdue check: If diffDays is less than 0, the date has passed.
    if (diffDays < 0) return 'danger'; 
    
    // 🟠 Nearing deadline (today, tomorrow, or the day after)
    if (diffDays <= 3) return 'warning';
    
    // 🟢 Far off
    return 'success';
};

const DueDateBadge = ({ dueDate, isCompleted = false, size = 'md' }) => {
    const formattedDueDate = dueDate ? formatDate(dueDate) : '—';
    const dueDateColor = dueDate ? getDueDateColor(dueDate) : 'muted';

    // 1. Base Classes (Text color + Font weight)
    let textColorClass = `text-${dueDateColor}`;
    let borderColorClass = `border border-1 border-${dueDateColor} rounded-1`;
    let iconClass = 'bi-clock'; // Default icon

    // 2. Adjust styling based on urgency
    if (dueDateColor === 'danger') {
        // Apply special styling for Overdue
        textColorClass = 'text-danger fw-bold';
        iconClass = 'bi-exclamation-octagon-fill'; // 🚨 Overdue Icon
    } else if (dueDateColor === 'warning') {
        // Apply special styling for Nearing Deadline
        textColorClass = 'text-warning fw-bold';
        iconClass = 'bi-hourglass-split'; // ⏳ Nearing Icon
    } else {
        // Far Off / Default
        textColorClass = `text-success`;
        iconClass = 'bi-check-circle-fill'; // ✅ Far Off Icon
    }

    // 3. Apply Completion Override
    let finalClasses;
    let finalIcon = iconClass;
    
    if (isCompleted) {
        // If completed, always use secondary/muted styling
        finalClasses = 'text-secondary border border-1 border-secondary rounded-1';
        finalIcon = 'bi-check2-all'; // Completed Icon
    } else {
        // Use the calculated status classes
        finalClasses = `${textColorClass} ${borderColorClass}`;
        finalIcon = iconClass;
    }

    // 4. Size and Visibility Styling
    const style = {
        whiteSpace: 'nowrap',
        visibility: dueDate ? 'visible' : 'hidden', 
    };

    if (size === 'sm') {
        style.padding = '0px 2px';
        style.fontSize = '0.65rem';
    } else {
        style.padding = '2px 4px';
        style.fontSize = '0.7rem';
    }

    return (
        <p
            className={`mb-0 d-inline-flex align-items-center bg-white ${finalClasses}`}
            style={style}
        >
            <i className={`bi ${finalIcon} me-1`}></i>
            {formattedDueDate}
        </p>
    );
};

export default DueDateBadge;