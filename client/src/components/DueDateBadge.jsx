import React from 'react';

// FIX: Ensure an empty string is returned for null/empty dates to prevent runtime errors.
const formatDate = (dateString) => {
    if (!dateString) return ''; // Changed from `return;` to `return '';`
    const date = new Date(dateString);

    if (isNaN(date)){
        return 'Invalid Date';
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// FIX: Ensure a color string (or 'muted') is returned for all cases.
const getDueDateColor = (dateString) => {
    if (!dateString) return 'muted'; // Changed from `return;` to `return 'muted';`
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0){
        return 'danger';
    } else if (diffDays <=3){
        return 'warning';
    } else {
        return 'success';
    }
};

const DueDateBadge = ({ dueDate, isCompleted = false, size = 'md' }) => {
    // We can still return null here, as the component itself won't render if there's no date.
    if (!dueDate) return null; 

    const formattedDueDate = formatDate(dueDate, size);
    const dueDateColor = getDueDateColor(dueDate);

    let textColorClass = `text-${dueDateColor}`;
    if (['danger', 'warning'].includes(dueDateColor)) {
        textColorClass += ' fw-bold';
    }

    const borderColorClass = `border border-1 border-${dueDateColor} rounded-1`;

    const finalClasses = isCompleted
        ? 'text-secondary border border-1 border-secondary rounded-1'
        : `${textColorClass} ${borderColorClass}`;

    const style = {
        whiteSpace: 'nowrap',
    };

    if (size === 'sm'){
        style.padding = '0px 2px';
        style.fontSize = '0.65rem';
    } else {
        style.padding = '2px 4px';
        style.fontSize = '0.7rem';
    }

    return (
        <p className={`mb-0 d-inline-flex align-items-center bg-white ${finalClasses}`} style={style}>
            <i className="bi bi-clock me-1"></i>
            {formattedDueDate}
        </p>
    );
};

export default DueDateBadge;