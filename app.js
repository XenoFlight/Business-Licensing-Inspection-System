const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const licensingRoutes = require('./routes/licensingRoutes');
const businessRoutes = require('./routes/businessRoutes');
const defectRoutes = require('./routes/defectRoutes');

// אתחול האפליקציה
// Initialize App
const app = express();

// הגדרת Trust Proxy עבור Railway (ו-Load Balancers אחרים)
app.set('trust proxy', 1);

// הגדרות אבטחה ולוגים
// Security and Logging configurations
app.use(helmet()); // הגנה על כותרות HTTP
app.use(cors()); // אפשור Cross-Origin Resource Sharing
app.use(morgan('dev')); // הדפסת לוגים של בקשות לקונסול

// ניתוח גוף הבקשה
// Body Parsing
app.use(express.json()); // עבור JSON
app.use(express.urlencoded({ extended: true })); // עבור Form Data

// נתיב בדיקה (Health Check)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'מערכת רישוי עסקים - השרת פעיל',
    englishMessage: 'Business Licensing System - Server is Active',
    timestamp: new Date()
  });
});

// נתיבי API
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/licensing-items', licensingRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/defects', defectRoutes);

// טיפול בשגיאות 404 (נתיב לא נמצא)
// 404 Error Handling
app.use((req, res, next) => {
  res.status(404).json({
    error: 'הנתיב המבוקש לא נמצא',
    englishError: 'Not Found'
  });
});

module.exports = app;