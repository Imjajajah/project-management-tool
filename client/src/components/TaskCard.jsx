// /Users/jarreyes/Documents/PROGRAMS/project-management-tool/client/src/components/TaskCard.jsx

import { Draggable } from '@hello-pangea/dnd';
import DueDateBadge from './DueDateBadge'; 

function TaskCard({ task, index, onDelete }) {
    
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
                    // Added a hover effect to better indicate drag-ability
                    className={`kanban-task card mb-2 cursor-grab ${snapshot.isDragging ? 'is-dragging shadow-lg border-primary' : 'shadow-sm'}`}
                >
                    {/* Reduced card-body padding from p-3 to p-2 for a more compact Kanban card */}
                    <div className="card-body d-flex justify-content-between align-items-start p-2">
                        
                        {/* Task Name and Due Date */}
                        <div className="flex-grow-1 min-w-0 me-3 text-start">
                            {/* Reduced font size for the title in Kanban view */}
                            <p className="card-title mb-1 fw-semibold text-truncate" title={task.name} style={{fontSize: '0.8rem'}}>{task.name}</p>
                            
                            {/* Passed size="sm" to make the badge compact for the Kanban card */}
                            <DueDateBadge 
                                dueDate={task.dueDate} 
                                isCompleted={task.completed} 
                                size="sm" 
                            />
                        </div>
                        
                        {/* Delete Button */}
                        <button 
                            className="btn btn-sm btn-outline-danger border-0 p-0 flex-shrink-0" 
                            onClick={() => onDelete(task._id)}
                            onMouseDown={e => e.stopPropagation()}
                            onTouchStart={e => e.stopPropagation()}
                        >
                            <i className="bi bi-x-lg" style={{ fontSize: '0.8rem' }}></i>
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default TaskCard;
