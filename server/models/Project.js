import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: false,
        validate: {
            validator: function (v) {
                if (!v) {
                    return true;
                }
                const currentYear = new Date().getFullYear();
                const dueYear = v.getFullYear();
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Ignore time for comparison

                // Check that the date is not in the past and is within 100 years.
                return v >= today && dueYear <= currentYear + 100;
            },
            message: 'Due date cannot be in the past or more than 100 years in the future.',
        },
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);