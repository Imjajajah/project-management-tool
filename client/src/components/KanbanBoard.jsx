import { useEffect, useState } from 'react';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import TaskCard from './TaskCard';

import Swal from 'sweetalert2';

import { getToken } from '../utils/api';





function KanbanBoard({ selectedProject }) {

    const [columns, setColumns] = useState({

        'todo': {title: 'To Do', tasks: [] },

        'in-progress': {title: 'In Progress', tasks: [] },

        'done': { title: 'Done', tasks: []},

    });



    const handleAddTask = async(e) => {

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

                Swal.fire('Error!', errorData.message || 'Failed to add task.', 'error');

                return;

            }



            const newTask = await response.json();

            setColumns(prevColumns => ({

                ...prevColumns,

                'todo': {

                    ...prevColumns['todo'],

                    tasks: [...prevColumns['todo'].tasks, newTask]

                }

            }));

            e.target.value = '';

        } catch (error) {

            console.error("Error adding task:", error);

            Swal.fire('Error!', 'An unexpected error occurred. Please try again.', 'error');

        }

    };



    const fetchTasks = async (projectId) => {

        try {

            const serverUrl = import.meta.env.VITE_SERVER_URL;

            const token = getToken();

            const response = await fetch(`${serverUrl}/api/tasks/${projectId}`, {

                headers: { 'x-auth-token': token }

            });

            const data = await response.json();



            const newColumns = {

                'todo': { title: 'To Do', tasks: data.filter(t => t.status === 'todo') },

                'in-progress': { title: 'In Progress', tasks: data.filter(t => t.status === 'in-progress') },

                'done': { title: 'Done', tasks: data.filter(t => t.status === 'done' ) },

            };

            setColumns(newColumns);

        } catch (error) {

            console.error("Failed to fetch tasks:", error);

        }

    };



    const handleTaskStatusUpdate = async (taskId, newStatus) => {

        const serverUrl = import.meta.env.VITE_SERVER_URL;

        const token = getToken();

        const response = await fetch(`${serverUrl}/api/tasks/update-status/${taskId}`, {

            method: 'PUT',

            headers: {

                'Content-Type': 'application/json',

                'x-auth-token': token

            },

            body: JSON.stringify({ newStatus }),

        });

        

        if (!response.ok) {

            // Throw error to be caught by onDragEnd's try/catch block

            throw new Error('Failed to update task status on server.');

        }

    }



    const onDragEnd = async (result) => {

        const { source, destination, draggableId } = result;



        // Don't do anything if the task is dropped outside a droppable area.

        if (!destination) {

            return;

        }



        // Don't do anything if the task is dropped in the same place.

        if (source.droppableId === destination.droppableId && source.index === destination.index) {

            return;

        }



        // Get the column where the task started and where it ended.

        const startColumn = columns[source.droppableId];

        const endColumn = columns[destination.droppableId];

        

        // --- Optimistic UI Update ---



        // If the task is moved within the same column.

        if (startColumn === endColumn) {

            const newTasks = Array.from(startColumn.tasks);

            const [removed] = newTasks.splice(source.index, 1);

            newTasks.splice(destination.index, 0, removed);



            const newColumn = {

                ...startColumn,

                tasks: newTasks,

            };



            setColumns(prevColumns => ({

                ...prevColumns,

                [source.droppableId]: newColumn,

            }));

            

            // For same-column moves, no server status update is strictly required, 

            // but you might need an API call to update the task order if order is persisted.

        } else {

            // If the task is moved to a different column.

            const newStartTasks = Array.from(startColumn.tasks);

            const [movedTask] = newStartTasks.splice(source.index, 1);



            // Update the task's status property on the local object immediately

            movedTask.status = destination.droppableId;



            const newEndTasks = Array.from(endColumn.tasks);

            newEndTasks.splice(destination.index, 0, movedTask);



            // Apply the local state update

            setColumns(prevColumns => ({

                ...prevColumns,

                [source.droppableId]: {

                    ...startColumn,

                    tasks: newStartTasks,

                },

                [destination.droppableId]: {

                    ...endColumn,

                    tasks: newEndTasks,

                },

            }));



            // --- Server Update with Error Revert ---

            try {

                // Await the API call to update the status on the server.

                await handleTaskStatusUpdate(draggableId, destination.droppableId);

            } catch (error) {

                console.error("Failed to update task status on server:", error);

                

                // Show error and revert the UI state

                Swal.fire('Error', 'Failed to save task status. Reverting change.', 'error');

                

                // Re-fetch tasks to revert the UI back to the server's state

                if (selectedProject?._id) {

                    fetchTasks(selectedProject._id);

                }

            }

        }

    };



    const handleDeleteTask = (taskId) => {

        // Implementation for deleting task goes here

    }



    useEffect(() => {

        if (selectedProject) {

            fetchTasks(selectedProject._id);

        } else {

            setColumns({

                'todo': { title: 'To Do', tasks: [] },

                'in-progress': {title: 'In Progress', tasks: []},

                'done': { title: 'Done', tasks: [] },

            });

        }

    }, [selectedProject]);



    return (

        <>

            {selectedProject ? (

                <div className="card bg-white text-dark shadow-lg border-0 min-h-75">

                    <div className="card-header border-0 bg-white text-start">

                        <h2 className="mb-0">Tasks for {selectedProject.name}</h2>

                        

                    </div>

                    <div className="card-body">

                        <DragDropContext onDragEnd={onDragEnd}>

                            <div className="row flex-nowrap overflow-auto py-3">

                                {Object.entries(columns).map(([columnId, column]) => (

                                    <div key={columnId} className="col-md-4 mb-3 d-flex flex-column">

                                        <div className="kanban-column bg-light p-3 rounded-lg shadow-sm flex-fill">

                                            <h4 className="column-title">{column.title} ({column.tasks.length})</h4>

                                            <Droppable droppableId={columnId}>

                                                {(provided, snapshot) => (

                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={`task-list-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                                                    >

                                                        {column.tasks.map((task, index) => (
                                                            <TaskCard key={task._id} task={task} index={index} onDelete={handleDeleteTask}/>
                                                        ))}
                                                
                                                        {provided.placeholder}

                                                    </div>

                                                )}

                                            </Droppable>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </DragDropContext>

                    </div>

                </div>

            ) : (

                <div className="card bg-white text-dark shadow-lg border-0">

                    <div className="card-header border-0 bg-white text-start">

                        <h2 className="mb-0 text-muted">Select a project to view its tasks.</h2>

                    </div>

                    <div className="card-body">

                        <div className="text-center p-5">

                            <i className="bi bi-arrow-left-circle-fill text-primary display-1 mb-3"></i>

                            <p className="lead text-secondary">Click on a project to see its details and tasks appear here.</p>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}



export default KanbanBoard;



