// /Users/jarreyes/Documents/PROGRAMS/project-management-tool/client/src/components/TaskCard.jsx

import { Draggable } from '@hello-pangea/dnd';
import DueDateBadge from './DueDateBadge';

function TaskCard({ task, index, onDelete, onClick, onDoubleClick }) {
    return (
        <Draggable
            draggableId={String(task._id)}
            index={index}
        >
            {(provided, snapshot) => {
                // click handler that ignores clicks while dragging
                const handleClick = (e) => {
                    if (snapshot.isDragging) return;
                    if (typeof onClick === 'function') onClick(task, e);
                };

                const handleDoubleClick = (e) => {
                    if (snapshot.isDragging) return;
                    if (typeof onDoubleClick === 'function') onDoubleClick(task, e);
                };

                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`kanban-task card mb-1 cursor-grab ${snapshot.isDragging ? 'is-dragging shadow-lg border-primary' : 'shadow-sm'}`}
                        onClick={handleClick}
                        onDoubleClick={handleDoubleClick}
                        // ensure touch events don't accidentally propagate from children
                        onTouchStart={(e) => { /* allow drag/tap normally */ }}
                    >
                        <div className="card-body d-flex justify-content-between align-items-start p-1">
                            {/* Task Name and Due Date */}
                            <div className="flex-grow-1 min-w-0 me-3 text-start">
                                <p
                                    className="card-title mb-1 fw-semibold text-truncate"
                                    title={task.name}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {task.name}
                                </p>

                                <DueDateBadge
                                    dueDate={task.dueDate}
                                    isCompleted={task.completed}
                                    size="sm"
                                />
                            </div>

                            {/* Delete Button */}
                            <button
                                className="btn btn-sm btn-outline-danger border-0 p-0 flex-shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (typeof onDelete === 'function') onDelete(task._id);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                aria-label="Delete task"
                                title="Delete task"
                            >
                                <i className="bi bi-x-lg" style={{ fontSize: '0.8rem' }}></i>
                            </button>
                        </div>
                    </div>
                );
            }}
        </Draggable>
    );
}

export default TaskCard;
