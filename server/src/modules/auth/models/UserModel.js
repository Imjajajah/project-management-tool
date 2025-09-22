///Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/models/UserModel.js

import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);