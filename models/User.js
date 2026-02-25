const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

// מודל משתמש (מפקח / מנהל)
// User Model (Inspector / Manager)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'שם מלא של המשתמש' // Full name
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'כתובת אימייל (משמשת להתחברות)' // Email (used for login)
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'סיסמה מוצפנת' // Hashed password
  },
  role: {
    type: DataTypes.ENUM('inspector', 'manager', 'admin'),
    defaultValue: 'inspector',
    allowNull: false,
    comment: 'תפקיד: מפקח, מנהל, או אדמין' // Role: Inspector, Manager, Admin
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'מספר טלפון ליצירת קשר' // Contact phone
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'האם המשתמש פעיל במערכת' // Is active
  }
}, {
  tableName: 'users',
  timestamps: true // מוסיף אוטומטית createdAt ו-updatedAt
});

// הצפנת סיסמה לפני שמירה במסד הנתונים (Hook)
// Encrypt password before saving to DB
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// הצפנת סיסמה בעת עדכון (אם שונתה)
// Encrypt password on update (if changed)
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// מתודה להשוואת סיסמאות (עבור התחברות)
// Method to compare passwords (for login)
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;