import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import Swal from 'sweetalert2';

function TaskList({ selectedProject }) {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    // Add new state for the tip visibility
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
            const response = await fetch(`${serverUrl}/api/projects/${projectId}/tasks`);
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskName.trim() || !selectedProject) return;
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/projects/${selectedProject._id}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTaskName,
                    dueDate: newTaskDueDate,
                }),
            });
            const newTask = await response.json();
            setTasks(prevTasks => [...prevTasks, newTask]);
            setNewTaskName('');
            setNewTaskDueDate('');
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleToggleComplete = async (task) => {
        const updatedTask = {...task, completed: !task.completed };
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            if (prevSelectedTasks.includes(taskId)) {
                return prevSelectedTasks.filter(id => id !== taskId);
            } else {
                return [...prevSelectedTasks, taskId];
            }
        });
    };

    const handleDeleteTask = async (taskId) => {
        const originalTasks = tasks;
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));

        const serverUrl = import.meta.env.VITE_SERVER_URL;

        const result = await Swal.fire({
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
        });

        if (result.dismiss === Swal.DismissReason.cancel) {
            setTasks(originalTasks);
            console.log('Task deletion undone.');
        } else {
            try {
                await fetch(`${serverUrl}/api/tasks/${taskId}`, { method: 'DELETE' });
                console.log('Task permanently deleted.');
            } catch (error) {
                console.error("Error deleting task:", error);
                setTasks(originalTasks);
            }
        }
    };

    const handleDeleteSelected = () => {
        showSweetAlert(
            `Are you sure?`,
            `This will permanently delete ${selectedTasks.length} selected task(s)!`,
            `Yes, delete ${selectedTasks.length} task(s)`,
            async () => {
                try {
                    const serverUrl = import.meta.env.VITE_SERVER_URL;
                    const ids = selectedTasks.join(',');
                    await fetch(`${serverUrl}/api/tasks/bulk-delete?ids=${ids}`, {
                        method: 'DELETE',
                    });
                    setTasks(prevTasks => prevTasks.filter(t => !selectedTasks.includes(t._id)));
                    setSelectedTasks([]);
                } catch (error) {
                    console.error("Error deleting selected tasks:", error);
                }
            }
        );
    };

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject._id);
        } else {
            setTasks([]);
        }
    }, [selectedProject]);

    return (
        <div className="col-md-7">
           {selectedProject ? (
                <div className="card bg-white text-dark shadow-lg border-0">
                    <div className="card-header border-0 bg-white text-start">
                        <div className="d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">Tasks for {selectedProject.name}</h2>
                            <div className="d-flex align-items-center mt-2">
                                {showTip && <p className="text-muted text-start text-xs mb-0 me-2">To delete multiple tasks, select the checkboxes</p>}
                                <button onClick={() => setShowTip(!showTip)} className="btn btn-link text-muted p-0 me-2" aria-label="Show tip">
                                    <i className="bi bi-info-circle"></i>
                                </button>
                               
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
        </div>
    );
}

export default TaskList;