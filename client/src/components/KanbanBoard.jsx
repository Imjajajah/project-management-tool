import { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import Swal from 'sweetalert2';
import { getToken } from '../utils/api';

const columnStyles = {
    'todo': {
        backgroundColor: '#f8f9fa', 
        borderColor: '#0d6efd',
        titleColor: '#6c757d',
    },
    'in-progress': {
        backgroundColor: '#f8f9fa',
        borderColor: '#0d6efd',
        titleColor: '#6c757d',
    },
    'done': {
        backgroundColor: '#f8f9fa',
        borderColor: '#0d6efd',
        titleColor: '#6c757d',
    },
};


function KanbanBoard({ selectedProject }) {
    const [columns, setColumns] = useState({
        'todo': { title: 'To Do', tasks: [] },
        'in-progress': { title: 'In Progress', tasks: [] },
        'done': { title: 'Done', tasks: [] },
    });

    const handleAddTask = async (e) => {
        const newTaskName = e.target.value.trim();
        if (e.key !== 'Enter' || !newTaskName || !selectedProject) return;

        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/tasks/${selectedProject._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({
                    name: newTaskName,
                    status: 'todo',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Failed to add task.', 'error');
                return;
            }

            const newTask = await response.json();

            setColumns((prevColumns) => ({
                ...prevColumns,
                'todo': {
                    ...prevColumns['todo'],
                    tasks: [...prevColumns['todo'].tasks, newTask],
                },
            }));
            e.target.value = '';
        } catch (error) {
            console.error('Error adding task:', error);
            Swal.fire('Error!', 'An error occurred while adding the task.', 'error');
        }
    };

    const fetchTasks = async (projectId) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/tasks/${projectId}`, {
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            const newColumns = {
                'todo': { title: 'To Do', tasks: data.filter((t) => t.status === 'todo') },
                'in-progress': { title: 'In Progress', tasks: data.filter((t) => t.status === 'in-progress') },
                'done': { title: 'Done', tasks: data.filter((t) => t.status === 'done') },
            };

            setColumns(newColumns);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        const token = getToken();
        const response = await fetch(`${serverUrl}/api/tasks/update-status/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({ newStatus }),
        });

        if (!response.ok) {
            throw new Error('Failed to update task status on server.');
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const startColumn = columns[source.droppableId];
        const endColumn = columns[destination.droppableId];

        if (startColumn === endColumn) {
            const newTasks = Array.from(startColumn.tasks);
            const [removed] = newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, removed);

            setColumns((prevColumns) => ({
                ...prevColumns,
                [source.droppableId]: { ...startColumn, tasks: newTasks },
            }));
        } else {
            const newStartTasks = Array.from(startColumn.tasks);
            const [movedTask] = newStartTasks.splice(source.index, 1);
            movedTask.status = destination.droppableId;

            const newEndTasks = Array.from(endColumn.tasks);
            newEndTasks.splice(destination.index, 0, movedTask);

            setColumns((prevColumns) => ({
                ...prevColumns,
                [source.droppableId]: { ...startColumn, tasks: newStartTasks },
                [destination.droppableId]: { ...endColumn, tasks: newEndTasks },
            }));

            try {
                await handleTaskStatusUpdate(draggableId, destination.droppableId);
            } catch (error) {
                console.error('Failed to update task status on server:', error);
                Swal.fire('Error', 'Failed to save task status. Reverting change.', 'error');
                if (selectedProject) fetchTasks(selectedProject._id);
            }
        }
    };

    const handleDeleteTask = async (taskId) => {};

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject._id);
        } else {
            setColumns({
                'todo': { title: 'To Do', tasks: [] },
                'in-progress': { title: 'In Progress', tasks: [] },
                'done': { title: 'Done', tasks: [] },
            });
        }
    }, [selectedProject]);

    return (
        <>
            {selectedProject ? (
                <div className="text-dark">
                    <div className="p-0">
                        <div className="kanban-board-container kanban-height">
                            <DragDropContext onDragEnd={onDragEnd}>
                                {/* Change d-flex to d-md-flex and add custom mobile class (kanban-columns-mobile) */}
                                <div className="kanban-columns d-md-flex flex-nowrap overflow-auto gap-3 pb-3 text-start kanban-columns-mobile">
                                    {Object.entries(columns).map(([columnId, column]) => {
                                        const styles = columnStyles[columnId] || {};
                                        return (
                                            <div
                                                key={columnId}
                                                className="kanban-column flex-shrink-0 p-3 rounded-3 border border-2 shadow-sm"
                                                style={{
                                                    backgroundColor: styles.backgroundColor,
                                                    borderColor: styles.borderColor,
                                                    minWidth: '300px',
                                                    minHeight: '75vh',
                                                    overflowY: 'auto',
                                                }}
                                            >
                                                <h5
                                                    className="fw-bold border-bottom pb-2 mb-3 text-capitalize"
                                                    style={{ color: styles.titleColor }}
                                                >
                                                    {column.title} <span className="text-muted">({column.tasks.length})</span>
                                                </h5>

                                                <Droppable droppableId={columnId}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`task-list ${snapshot.isDraggingOver ? 'bg-light border rounded-2 p-2' : ''}`}
                                                            style={{ minHeight: '60px', transition: 'background-color 0.2s' }}
                                                        >
                                                            {column.tasks.map((task, index) => (
                                                                <TaskCard key={task._id} task={task} index={index} onDelete={handleDeleteTask} />
                                                            ))}
                                                            {provided.placeholder}

                                                            {columnId === 'todo' && (
                                                                <div className="mt-3">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Add a new task..."
                                                                        className="form-control form-control-sm border-primary"
                                                                        onKeyDown={handleAddTask}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DragDropContext>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card bg-white text-dark shadow-sm border-0 rounded-3">
                    <div className="card-body text-center p-5">
                        <i className="bi bi-arrow-left-circle text-primary display-4 mb-3"></i>
                        <p className="lead text-secondary mb-0">Select a project to view its tasks.</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default KanbanBoard;
