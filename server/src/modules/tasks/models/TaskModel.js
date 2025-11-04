///Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/models/TaskModel.js

import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: '',
    },
    dueDate: {
        type: Date,
        required: false
    },
    completed: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {timestamps: true });

export default mongoose.model('Task', taskSchema);