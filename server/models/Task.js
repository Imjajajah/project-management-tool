const mongoose = require('mongoose');
const Schema = mongoose.Schema

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: false
    },
    completed: {
        type: Boolean,
        default: false,
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
}, {timestamps: true });

module.exports = mongoose.model('Task', taskSchema);