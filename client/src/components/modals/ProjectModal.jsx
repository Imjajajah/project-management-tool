import React from 'react';

const ProjectModal = ({ show, onHide, title, children }) => {
    return (
        <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" role="dialog" style={{ backgroundColor: show ? 'rgba(0, 0, 0, 0.5)' : '' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5> 
                        <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
                    </div>
                    <div className="modal-body mx-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;