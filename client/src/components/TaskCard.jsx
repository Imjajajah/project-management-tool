import { Draggable } from '@hello-pangea/dnd';

function TaskCard({ task, index }) {
    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`kanban-task card mb-2 ${snapshot.isDragging ? 'is-dragging' : ''}`}
                >
                    <div className="card-body">
                        <h6 className="card-title">{task.name}</h6>
                        <p className="card-text text-muted">Status: {task.status}</p>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default TaskCard;