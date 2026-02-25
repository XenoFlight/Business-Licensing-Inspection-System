const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, denyUser } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// כל הנתיבים כאן דורשים הרשאת מנהל (Admin)
// All routes here require Admin privileges

router.get('/pending-users', protect, admin, getPendingUsers);

router.put('/approve/:id', protect, admin, approveUser);

router.delete('/deny/:id', protect, admin, denyUser);

module.exports = router;