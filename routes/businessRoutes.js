const express = require('express');
const router = express.Router();
const {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness
} = require('../controllers/businessController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// הגדרת נתיבים לעסקים
// Business Routes

router.route('/')
  .get(protect, getAllBusinesses) // צפייה ברשימת עסקים (למשתמשים רשומים)
  .post(protect, authorize('manager', 'inspector', 'admin'), createBusiness); // יצירת עסק

router.route('/:id')
  .get(protect, getBusinessById) // צפייה בפרטי עסק
  .put(protect, authorize('manager', 'admin'), updateBusiness) // עדכון פרטי עסק
  .delete(protect, authorize('admin'), deleteBusiness); // מחיקת עסק (אדמין בלבד)

module.exports = router;