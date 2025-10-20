import { Draggable } from '@hello-pangea/dnd';

// Utility function to format the due date
const formatDate = (dateString) => {
    // If task.dueDate is null or undefined, return an empty string
    if (!dateString) { return ''; }

    const date = new Date(dateString);

    // Basic validation for date object
    if (isNaN(date)) {
        return 'Invalid Date';
    }

    // Format the date for cleaner display
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};


function TaskCard({ task, index, onDelete }) {
    
    const formattedDueDate = formatDate(task.dueDate);

    return (
        <Draggable 
            draggableId={task._id} 
            index={index}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`kanban-task card mb-2 ${snapshot.isDragging ? 'is-dragging shadow-lg border-primary' : 'shadow-sm'}`}
                >
                    <div className="card-body d-flex justify-content-between align-items-start p-3">
                        
                        {/* Task Name and Due Date */}
                        <div className="flex-grow-1 min-w-0 me-3">
                            <h6 className="card-title mb-1 text-truncate" title={task.name}>{task.name}</h6>
                            
                            {/* NEW: Due Date Display */}
                            {formattedDueDate && (
                                <p 
                                    className={`card-text small mb-0 fw-semibold ${task.completed ? 'text-secondary' : 'text-danger'}`}
                                >
                                    <i className="bi bi-clock-fill me-1"></i> Due: {formattedDueDate}
                                </p>
                            )}
                        </div>
                        
                        {/* Delete Button */}
                        <button 
                            className="btn btn-sm btn-outline-danger border-0 p-0 flex-shrink-0" 
                            onClick={() => onDelete(task._id)}
                            // Stop drag interaction when clicking the button
                            onMouseDown={e => e.stopPropagation()}
                            onTouchStart={e => e.stopPropagation()}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default TaskCard;