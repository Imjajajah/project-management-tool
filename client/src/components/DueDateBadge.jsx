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
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'danger';
    if (diffDays <= 3) return 'warning';
    return 'success';
};

const DueDateBadge = ({ dueDate, isCompleted = false, size = 'md' }) => {
    // ✅ Always render the badge (even if hidden)
    const formattedDueDate = dueDate ? formatDate(dueDate) : '—'; // placeholder
    const dueDateColor = dueDate ? getDueDateColor(dueDate) : 'muted';

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
            <i className="bi bi-clock me-1"></i>
            {formattedDueDate}
        </p>
    );
};

export default DueDateBadge;
