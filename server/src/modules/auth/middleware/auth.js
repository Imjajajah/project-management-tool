///Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

const auth = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default auth;