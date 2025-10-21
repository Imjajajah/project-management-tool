import React from 'react';

const AddTaskModal = () => {
    return (
        <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ backgroundColor: show ? 'rgba(0, 0, 0, 0.5)' : '' }}>
        </div>
    );
}

export default AddTaskModal;