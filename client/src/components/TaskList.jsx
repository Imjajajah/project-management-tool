import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import Swal from 'sweetalert2';
import { getToken } from '../utils/api';

function TaskList({ selectedProject }) {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [showTip, setShowTip] = useState(false);

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
            const token = getToken(); // Retrieve the token here
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
        
        // **Client-side due date validation to provide immediate feedback**
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

            // **FIX 2: Check for a successful response before proceeding**
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
            // A network error or unparseable JSON will be caught here
            console.error("Error adding task:", error);
            Swal.fire('Error!', 'An unexpected error occurred. Please try again.', 'error');
        }
    };

    const handleToggleComplete = async (task) => {
        const updatedTask = {...task, completed: !task.completed };
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const token = getToken();
            const response = await fetch(`${serverUrl}/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(updatedTask),
            });
            const result = await response.json();
            setTasks(prevTasks => prevTasks.map(t => (t._id === result._id ? result : t)));
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleToggleSelect = (taskId) => {
        setSelectedTasks(prevSelectedTasks => {
            let newSelectedTasks;
            if (prevSelectedTasks.includes(taskId)) {
                newSelectedTasks = prevSelectedTasks.filter(id => id !== taskId);
            } else {
                newSelectedTasks = [...prevSelectedTasks, taskId];
            }
            // Hide the tip if any tasks are selected
            if (newSelectedTasks.length > 0) {
                setShowTip(false);
            }
            return newSelectedTasks;
        });
    };

    const handleDeleteTask = (taskId) => {
        const originalTasks = tasks;
        const taskToDelete = tasks.find(t => t._id === taskId);
        
        // Optimistically update the UI by removing the task
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
        
        const serverUrl = import.meta.env.VITE_SERVER_URL;
        
        // Show the undo toast and wait for the result
        Swal.fire({
            title: 'Task deleted!',
            text: 'You can undo this action.',
            icon: 'success',
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Undo',
            timer: 5000, // Wait 5 seconds before permanent deletion
            timerProgressBar: true
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                // User clicked 'Undo', so revert the UI
                setTasks(originalTasks);
            } else {
                // The timer expired or the toast was dismissed, proceed with permanent deletion
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
                    // If the permanent deletion fails, revert the UI state
                    setTasks(originalTasks); 
                }
            }
        });
    };

    const handleDeleteSelected = async () => {
        // Step 1: Show the initial confirmation using Swal.fire directly
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
            // Step 2: Optimistically update the UI by filtering out the selected tasks
            setTasks(prevTasks => prevTasks.filter(t => !selectedTasks.includes(t._id)));
            
            const serverUrl = import.meta.env.VITE_SERVER_URL;

            // Step 3: Show the "undo" toast
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
                // Step 4a: If the user clicks 'Undo', revert the UI state
                setTasks(originalTasks);
                setSelectedTasks([]);
                console.log('Bulk task deletion undone.');
            } else {
                // Step 4b: If the toast is dismissed, proceed with the permanent deletion via API
                try {
                    const ids = selectedTasks.join(',');
                    await fetch(`${serverUrl}/api/tasks/bulk-delete?ids=${ids}`, {
                        method: 'DELETE',
                        headers: {
                            'x-auth-token': getToken()
                        },
                    });
                    setSelectedTasks([]);
                    console.log('Tasks permanently deleted.');
                } catch (error) {
                    console.error("Error deleting selected tasks:", error);
                    setTasks(originalTasks); // Revert the UI state if the API call fails
                    setSelectedTasks([]);
                }
            }
        }
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
           {selectedProject ? (
                <div className="card bg-white text-dark shadow-lg border-0 min-h-75">
                    <div className="card-header border-0 bg-white text-start">
                        <div className="d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">Tasks for {selectedProject.name}</h2>
                            <div className="d-flex align-items-center mt-2">
                                {selectedTasks.length === 0 && (
                                    <>
                                        {showTip && <p className="text-muted text-start text-xs mb-0 me-2">To delete multiple tasks, select the checkboxes</p>}
                                        <button onClick={() => setShowTip(!showTip)} className="btn btn-link text-muted p-0 me-2" aria-label="Show tip">
                                            <i className="bi bi-info-circle"></i>
                                        </button>
                                        
                                    </>
                                )}
                            </div>
                            {selectedTasks.length > 0 && (
                                <button onClick={handleDeleteSelected} className="btn btn-danger">
                                    <i className="bi bi-trash-fill me-2"></i> Delete ({selectedTasks.length})
                                </button>
                            )}
                            
                        </div>
                       
                    </div>
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control bg-white text-dark border-secondary w-60"
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
                                className="form-control bg-white text-dark border-secondary w-20"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                            />
                            <button onClick={handleAddTask} className="btn btn-success w-20">
                                <i className="bi bi-plus-circle me-2"></i> Add Task
                            </button>
                        </div>
                        <div className="mt-4">
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <TaskItem
                                        key={task._id}
                                        task={task}
                                        isSelected={selectedTasks.includes(task._id)}
                                        onToggleSelect={handleToggleSelect}
                                        onToggleComplete={handleToggleComplete}
                                        onDelete={handleDeleteTask}
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