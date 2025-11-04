import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import Swal from 'sweetalert2';
import { getToken } from '../utils/api';

// --- CUSTOM STYLES FIX ---
const customTasklistStyles = `
    .task-input-group {
        display: flex; 
        gap: 0.5rem; 
        align-items: center; 
    }
    .task-input-group .form-control {
        flex-grow: 1; 
    }
    .task-input-group .input-date {
        max-width: 150px; 
        flex-shrink: 0;
    }
    .task-input-group .btn {
        min-width: 45px; 
        flex-shrink: 0;
        padding-left: 0.75rem; 
        padding-right: 0.75rem;
    }

    @media (max-width: 575.98px) {
        .task-input-group {
            flex-direction: column;
            gap: 0.5rem; 
        }
        .task-input-group .form-control,
        .task-input-group .input-date,
        .task-input-group .btn {
            width: 100% !important; 
            margin: 0 !important; 
            max-width: 100%;
        }
        .task-input-group .btn {
             padding-left: 0.75rem; 
             padding-right: 0.75rem;
        }
    }
`;


function TaskList({ selectedProject }) {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [showTip, setShowTip] = useState(false);
    
    // REMOVED: isBulkSelectMode state and handleToggleBulkSelectMode function

    const showSweetAlert = (title, text, confirmButtonText, action) => {
        Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: confirmButtonText,
        }).then((result) => {
            if (result.isConfirmed) {
                action();
            }
        });
    }

    const fetchTasks = async (projectId) => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken(); 
            const response = await fetch(`${serverUrl}/api/tasks/${projectId}`, {
                headers: { 
                    'x-auth-token': token 
                }
            });
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskName.trim() || !selectedProject) return;
        
        // **Client-side due date validation**
        if (newTaskDueDate) {
            const taskDueDate = new Date(newTaskDueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (taskDueDate < today) {
                Swal.fire('Error!', 'Task due date cannot be in the past.', 'error');
                return;
            }

            const currentYear = new Date().getFullYear();
            const taskDueYear = taskDueDate.getFullYear();
            if (taskDueYear > currentYear + 100) {
                Swal.fire('Error!', 'Task due date cannot be more than 100 years in the future.', 'error');
                return;
            }
        }

        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/tasks/${selectedProject._id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    name: newTaskName,
                    dueDate: newTaskDueDate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Swal.fire('Error!', errorData.message || 'Failed to add task.', 'error');
                return;
            }
            
            const newTask = await response.json();
            setTasks(prevTasks => [...prevTasks, newTask]);
            setNewTaskName('');
            setNewTaskDueDate('');

        } catch (error) {
            console.error("Error adding task:", error);
            Swal.fire('Error!', 'An unexpected error occurred. Please try again.', 'error');
        }
    };
    
    // REMOVED: handleToggleComplete is removed as the status dropdown is now the sole controller of completion state.

    const handleToggleSelect = (taskId) => {
        setSelectedTasks(prevSelectedTasks => {
            if (prevSelectedTasks.includes(taskId)) {
                return prevSelectedTasks.filter(id => id !== taskId);
            } else {
                return [...prevSelectedTasks, taskId];
            }
        });
    };

    const handleDeleteTask = (taskId) => {
        const originalTasks = tasks;
        
        // Optimistically update the UI
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
        
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        
        // Show the undo toast
        Swal.fire({
            title: 'Task deleted!',
            text: 'You can undo this action.',
            icon: 'success',
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Undo',
            timer: 5000, 
            timerProgressBar: true
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked 'Undo', so revert the UI
                setTasks(originalTasks);
            } else {
                // The timer expired, proceed with permanent deletion
                try {
                    fetch(`${serverUrl}/api/tasks/${taskId}`, {
                        method: 'DELETE',
                        headers: {
                            'x-auth-token': getToken()
                        },
                    }).then(() => {
                        console.log('Task permanently deleted.');
                    });
                } catch (error) {
                    console.error("Error deleting task:", error);
                    setTasks(originalTasks); 
                }
            }
        });
    };

    const handleDeleteSelected = async () => {
        const confirmationResult = await Swal.fire({
            title: `Are you sure?`,
            text: `This will permanently delete ${selectedTasks.length} selected task(s)!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, delete ${selectedTasks.length} task(s)`,
        });

        if (confirmationResult.isConfirmed) {
            const originalTasks = tasks;
            // Optimistically update the UI
            setTasks(prevTasks => prevTasks.filter(t => !selectedTasks.includes(t._id)));
            
            const serverUrl = import.meta.env.VITE_SERVER_URL;

            // Show the "undo" toast
            const undoResult = await Swal.fire({
                title: 'Tasks deleted!',
                text: `You can undo this action.`,
                icon: 'success',
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: 'Undo',
                timer: 5000,
                timerProgressBar: true
            });

            if (undoResult.dismiss === Swal.DismissReason.cancel) {
                // If the user clicks 'Undo', revert the UI state
                setTasks(originalTasks);
                setSelectedTasks([]);
            } else {
                // Proceed with the permanent deletion via API
                try {
                    const ids = selectedTasks.join(',');
                    await fetch(`${serverUrl}/api/tasks/bulk-delete?ids=${ids}`, {
                        method: 'DELETE',
                        headers: {
                            'x-auth-token': getToken()
                        },
                    });
                    setSelectedTasks([]);
                } catch (error) {
                    console.error("Error deleting selected tasks:", error);
                    setTasks(originalTasks); // Revert the UI state if the API call fails
                    setSelectedTasks([]);
                }
            }
        }
    };

    // FIX: Implemented the logic for handleUpdateStatus with the correct API route
    const handleUpdateStatus = async (taskId, newStatus) => {
        const originalTask = tasks.find(t => t._id === taskId);
        if (!originalTask) return;

        // OPTIMISTIC UI UPDATE: CRITICAL - completion status is now tied to 'done' status
        const updatedTask = { 
            ...originalTask, 
            status: newStatus,
            completed: newStatus === 'done' 
        }; 

        setTasks(prevTasks => prevTasks.map(t => (t._id === taskId ? updatedTask : t)));

        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            
            // CRITICAL FIX: Using the user-provided API route: /update-status/:taskId
            const response = await fetch(`${serverUrl}/api/tasks/update-status/${taskId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ newStatus, completed: newStatus === 'done' }), // Ensure 'completed' is sent
            });
            
            if (!response.ok) {
                // If API fails, revert the state
                setTasks(prevTasks => prevTasks.map(t => (t._id === taskId ? originalTask : t)));
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Failed to update task status.', 'error');
            }

        } catch (error) {
            console.error("Error updating task status:", error);
            // Revert the state on network error
            setTasks(prevTasks => prevTasks.map(t => (t._id === taskId ? originalTask : t)));
            Swal.fire('Error', 'An unexpected error occurred while saving status.', 'error');
        }
    };
    
    const getProjectAccronym = () => {
        if (!selectedProject || !selectedProject.name) return '';

        const selectedProjectName = selectedProject.name.trim();

        const acronym = selectedProjectName
            .split(' ')
            .map(word => word.charAt(0))
            .filter(char => char)
            .join('')
            .toUpperCase();
        
        return acronym;
    };


    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject._id);
        } else {
            setTasks([]);
        }
    }, [selectedProject]);


    return (
        <>
           <style>{customTasklistStyles}</style>
           {selectedProject ? (
                <div className="card bg-white text-dark shadow-lg border-0 min-h-75">
                    
                    <div className="card-header border-0 bg-white text-start py-3">
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                            
                            <div className="d-flex align-items-center mb-2 mb-sm-0 me-3 flex-grow-1 min-w-0">
                                <h3 className="mb-0 fs-6 text-truncate text-secondary fw-normal me-2" title={selectedProject.name}>
                                    Project: <strong className="text-dark fw-bold">{selectedProject.name}</strong>
                                    {/* {getProjectAccronym()} */}
                                </h3>
                                
                                <div className="d-flex align-items-center">
                                    {showTip && <p className="text-muted small mb-0 me-2 d-none d-md-block">Click the task name to view details.</p>}
                                    <button onClick={() => setShowTip(!showTip)} className="btn btn-link text-muted p-0" aria-label="Show tip">
                                        <i className="bi bi-info-circle"></i>
                                    </button>
                                </div>
                            </div>

                            {/* CONDITIONAL ACTION BUTTONS - Simplified: Only Bulk Delete remains */}
                            <div className="d-flex flex-shrink-0">
                                {/* Delete Selected Button (Visible if any task is selected) */}
                                {selectedTasks.length > 0 && (
                                    <button onClick={handleDeleteSelected} className="btn btn-danger btn-sm flex-shrink-0">
                                        <i className="bi bi-trash-fill me-1"></i> Delete ({selectedTasks.length})
                                    </button>
                                )}
                            </div>
                            
                        </div>
                    </div>
                    
                    <div className="card-body pt-3 pb-3">
                        
                        {/* Task Input */}
                        <div className="d-flex mb-3 task-input-group"> 
                            <input
                                type="text"
                                className="form-control bg-white text-dark border-secondary"
                                placeholder="New Task Name"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTask();
                                    }
                                }}
                            />
                            <input
                                type="date"
                                className="form-control bg-white text-dark border-secondary input-date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                            />
                            <button 
                                onClick={handleAddTask} 
                                className="btn btn-success flex-shrink-0"
                            >
                                <i className="bi bi-plus-circle"></i>
                                <span className="d-none d-sm-inline ms-1">Add Task</span>
                                <span className="d-inline d-sm-none ms-1">Add</span>
                            </button>
                        </div>
                        
                        {/* Task List Container */}
                        <div className="mt-4" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <TaskItem
                                        key={task._id}
                                        task={task}
                                        isSelected={selectedTasks.includes(task._id)}
                                        onToggleSelect={handleToggleSelect}
                                        onDelete={handleDeleteTask}
                                        onUpdateStatus={handleUpdateStatus} 
                                    />
                                ))
                            ) : (
                                <div className="text-center p-3">
                                    <i className="bi bi-check2-circle text-success display-4 mb-3"></i>
                                    <p className="lead text-secondary">No tasks yet. Add one to get started!</p>
                                </div>
                            )}
                        </div>
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

export default TaskList;
