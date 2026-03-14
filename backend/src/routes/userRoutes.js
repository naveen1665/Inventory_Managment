const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, getUsers, updateUser } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id').put(protect, admin, updateUser);

module.exports = router;
