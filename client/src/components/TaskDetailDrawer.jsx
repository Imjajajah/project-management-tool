import React, { useState, useEffect } from 'react';
import { TASK_STATUSES } from './TaskItem';

const formatDateLong = (dateString) => {
    if (!dateString) return 'No Due Date';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

function TaskDetailDrawer({ task, onClose, isOpen, onSaveTask }) {
    const [editedTask, setEditedTask] = useState({
        name: '',
        dueDate: '',
        description: '',
        status: 'todo'
    });

    // ✅ Sync every time a new task opens
    useEffect(() => {
        if (task) {
            setEditedTask({
                name: task.name || '',
                description: task.description || '',
                status: task.status || 'todo',
                dueDate: task.dueDate
                    ? new Date(task.dueDate).toISOString().split('T')[0]
                    : ''
            });
        }
    }, [task]);

    if (!task) return null;

    // ✅ Detect modifications
    const isModified =
        editedTask.name !== (task.name || '') ||
        editedTask.description !== (task.description || '') ||
        editedTask.status !== (task.status || 'todo') ||
        (editedTask.dueDate || '') !==
            (task.dueDate
                ? new Date(task.dueDate).toISOString().split('T')[0]
                : '');

    const handleSave = () => {
        if (!isModified) return; // ⛔ Prevent save if nothing changed
        const updatedTask = {
            _id: task._id,
            name: editedTask.name.trim(),
            description: editedTask.description.trim(),
            status: editedTask.status,
            dueDate: editedTask.dueDate || null,
            completed: editedTask.status === 'done',
        };
        onSaveTask?.(updatedTask);
    };

    const currentStatusDisplay =
        TASK_STATUSES.find((s) => s.value === editedTask.status) || TASK_STATUSES[0];

    return (
        <>
            <style>{`
                .task-detail-drawer {
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100vh;
                    width: 100%;
                    max-width: 450px;
                    background-color: #fff;
                    box-shadow: -4px 0 12px rgba(0,0,0,0.15);
                    z-index: 1050;
                    transition: transform 0.3s ease-in-out;
                    transform: translateX(100%);
                    overflow-y: auto;
                }
                .task-detail-drawer.show { transform: translateX(0); }
                .drawer-backdrop {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-color: rgba(0,0,0,0.5);
                    z-index: 1045;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease-in-out, visibility 0.3s;
                }
                .drawer-backdrop.show {
                    opacity: 1;
                    visibility: visible;
                }
            `}</style>

            {/* Backdrop */}
            <div
                className={`drawer-backdrop ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`task-detail-drawer ${isOpen ? 'show' : ''} p-4`}>
                <div className="d-flex justify-content-end mb-2">
                    <button onClick={onClose} className="btn-close"></button>
                </div>

                <div className="mb-4 border-bottom pb-3">
                    <input
                        type="text"
                        className="form-control fw-bold fs-5 border-0"
                        value={editedTask.name}
                        placeholder="[Untitled Task]"
                        onChange={(e) =>
                            setEditedTask({ ...editedTask, name: e.target.value })
                        }
                    />
                </div>

                <div className="d-grid gap-3 text-start">
                    {/* Status */}
                    <div className="d-flex align-items-center mb-3">
                        <span className="text-muted fw-semibold me-3">Status:</span>
                        <select
                            className={`form-select form-select-sm fw-bold text-white ${currentStatusDisplay.bgClass}`}
                            style={{ width: 'auto' }}
                            value={editedTask.status}
                            onChange={(e) =>
                                setEditedTask({
                                    ...editedTask,
                                    status: e.target.value,
                                })
                            }
                        >
                            {TASK_STATUSES.map((s) => (
                                <option
                                    key={s.value}
                                    value={s.value}
                                    className="bg-white text-dark"
                                >
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div className="mb-3">
                        <p className="text-muted small mb-1 fw-semibold">Due Date</p>
                        <input
                            type="date"
                            className="form-control"
                            value={editedTask.dueDate}
                            onChange={(e) =>
                                setEditedTask({
                                    ...editedTask,
                                    dueDate: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                        <p className="text-muted small mb-1 fw-semibold">Description</p>
                        <textarea
                            className="form-control"
                            rows="5"
                            value={editedTask.description}
                            placeholder="Add a detailed description..."
                            onChange={(e) =>
                                setEditedTask({
                                    ...editedTask,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        className="btn btn-primary fw-bold"
                        disabled={!editedTask.name.trim() || !isModified}
                        onClick={handleSave}
                    >
                        <i className="bi bi-save me-2"></i>
                        {isModified ? 'Save Changes' : 'No Changes'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default TaskDetailDrawer;
