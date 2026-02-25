const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, denyUser } = require('../controllers/adminController');
<<<<<<< HEAD
const { protect, authorize } = require('../middlewares/authMiddleware');
=======
const { protect, admin } = require('../middlewares/authMiddleware');
>>>>>>> f5cdb198164109e3d6e9e2752924e5d48967a64a

// כל הנתיבים כאן דורשים הרשאת מנהל (Admin)
// All routes here require Admin privileges

<<<<<<< HEAD
router.get('/pending-users', protect, authorize('admin'), getPendingUsers);

router.put('/approve/:id', protect, authorize('admin'), approveUser);

router.delete('/deny/:id', protect, authorize('admin'), denyUser);
=======
router.get('/pending-users', protect, admin, getPendingUsers);

router.put('/approve/:id', protect, admin, approveUser);

router.delete('/deny/:id', protect, admin, denyUser);
>>>>>>> f5cdb198164109e3d6e9e2752924e5d48967a64a

module.exports = router;