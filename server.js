require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');
require('./models'); // טעינת המודלים והקשרים (Load models and associations)

const PORT = process.env.PORT || 8080;

// Endpoint to serve the API key to the frontend
app.get('/api/config/google-maps', (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// פונקציה להפעלת השרת
// Function to start the server
const startServer = async () => {
  try {
    // 1. התחברות למסד הנתונים
    // Connect to Database
    await connectDB();

    // 2. סנכרון המודלים מול מסד הנתונים (יצירת טבלאות אם לא קיימות)
    // Sync models with DB (create tables if not exist)
    // alter: true מעדכן את הטבלאות לפי המודלים מבלי למחוק מידע קיים
    await sequelize.sync({ alter: true });
    console.log('✅ הטבלאות סונכרנו מול מסד הנתונים.');
    console.log('✅ Database tables synced successfully.');

    // 3. האזנה לבקשות
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 השרת רץ על פורט ${PORT}`);
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ שגיאה בהפעלת השרת:', error);
    console.error('❌ Error starting server:', error);
  }
};

startServer();