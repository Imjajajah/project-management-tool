//Users/jarreyes/Documents/PROGRAMS/project-management-tool/server/src/controllers/authController.js

import User from '../models/UserModel.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};