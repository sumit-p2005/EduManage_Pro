import admin from 'firebase-admin';
import dbOps from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Real Firebase Authentication Token Verification
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch user role from database users collection or custom claims
    let role = decodedToken.role;
    if (!role) {
      const userDoc = await dbOps.getDocument('users', decodedToken.uid);
      role = userDoc ? userDoc.role : 'student';
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      phone: decodedToken.phone_number || '',
      role: role,
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ success: false, message: 'Authentication failed: ' + error.message });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
  next();
};

export const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied: Student role required' });
  }
  next();
};

export const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied: Role must be one of [${roles.join(', ')}]` });
    }
    next();
  };
};
