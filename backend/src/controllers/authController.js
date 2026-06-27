import dbOps from '../config/db.js';

export const login = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'In production Firebase mode, authentication must be completed on the client side. Please use the Firebase Client SDK to log in and sync.'
  });
};

export const syncProfile = async (req, res) => {
  // At this point, authenticate middleware has verified the token and populated req.user
  const { uid, email, phone } = req.user;
  let role = req.user.role || 'student';

  try {
    let userRecord = await dbOps.getDocument('users', uid);
    
    // Self-healing: if logging in with phone and user profile doesn't exist yet, search matching phone
    if (!userRecord && phone) {
      const studentsList = await dbOps.getCollection('students');
      const cleanPhone = (p) => p.replace(/\D/g, '').slice(-10);
      const targetPhone = cleanPhone(phone);
      
      const matchedStudent = studentsList.find(s => s.phone && cleanPhone(s.phone) === targetPhone);
      
      if (matchedStudent) {
        role = 'student';
        if (matchedStudent.id !== uid) {
          console.log(`Self-healing student profile: transferring ${matchedStudent.id} -> ${uid} via phone match`);
          
          // Re-create profile under phone-auth UID
          const profileCopy = { ...matchedStudent };
          delete profileCopy.id;
          await dbOps.createDocument('students', profileCopy, uid);
          
          // Remove old profile and mapping
          await dbOps.deleteDocument('students', matchedStudent.id);
          await dbOps.deleteDocument('users', matchedStudent.id);
          
          // Update related collection records with new student ID reference
          const feesList = await dbOps.getCollection('fees');
          const studentFees = feesList.filter(f => f.studentId === matchedStudent.id);
          for (const fee of studentFees) {
            await dbOps.updateDocument('fees', fee.id, { studentId: uid });
          }

          const queriesList = await dbOps.getCollection('queries');
          const studentQueries = queriesList.filter(q => q.studentId === matchedStudent.id);
          for (const q of studentQueries) {
            await dbOps.updateDocument('queries', q.id, { studentId: uid });
          }

          const resultsList = await dbOps.getCollection('results');
          const studentResults = resultsList.filter(r => r.studentId === matchedStudent.id);
          for (const r of studentResults) {
            await dbOps.updateDocument('results', r.id, { studentId: uid });
          }
        }
      }
    }

    if (!userRecord) {
      // Sync from firebase auth claims
      userRecord = await dbOps.createDocument('users', {
        email: email || '',
        phone: phone || '',
        role,
        createdAt: new Date().toISOString()
      }, uid);
    }

    let profileData = {};
    if (role === 'admin') {
      const adminDetails = await dbOps.getDocument('admins', uid);
      if (!adminDetails) {
        profileData = await dbOps.createDocument('admins', {
          name: email ? email.split('@')[0] : 'Admin User',
          email: email || '',
          createdAt: new Date().toISOString()
        }, uid);
      } else {
        profileData = adminDetails;
      }
    } else {
      const studentDetails = await dbOps.getDocument('students', uid);
      if (!studentDetails) {
        profileData = await dbOps.createDocument('students', {
          name: email ? email.split('@')[0] : (phone ? `Student_${phone.slice(-4)}` : 'Student User'),
          email: email || '',
          phone: phone || '',
          createdAt: new Date().toISOString()
        }, uid);
      } else {
        profileData = studentDetails;
      }
    }

    res.json({
      success: true,
      user: {
        uid,
        email: email || '',
        phone: phone || '',
        role,
        name: profileData.name || 'User',
        photo: profileData.photo || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req, res) => {
  const { uid, role } = req.user;

  try {
    let profileData = null;
    if (role === 'admin') {
      profileData = await dbOps.getDocument('admins', uid);
    } else {
      profileData = await dbOps.getDocument('students', uid);
    }

    if (!profileData) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({
      success: true,
      profile: {
        ...profileData,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Password reset is handled client-side using the Firebase SDK.'
  });
};

export const updateProfilePicture = async (req, res) => {
  const { uid, role } = req.user;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'Please upload a photo file' });
  }

  try {
    let oldPhoto = '';
    if (role === 'admin') {
      const adminDetails = await dbOps.getDocument('admins', uid);
      if (adminDetails && adminDetails.photo) {
        oldPhoto = adminDetails.photo;
      }
    } else {
      const studentDetails = await dbOps.getDocument('students', uid);
      if (studentDetails && studentDetails.photo) {
        oldPhoto = studentDetails.photo;
      }
    }

    if (oldPhoto && !oldPhoto.includes('unsplash.com')) {
      await dbOps.deleteFile(oldPhoto);
    }

    const fileExtension = file.originalname.split('.').pop();
    const destinationPath = `profile_pictures/${uid}_${Date.now()}.${fileExtension}`;
    const photoUrl = await dbOps.uploadFile(file, destinationPath);

    if (role === 'admin') {
      await dbOps.updateDocument('admins', uid, { photo: photoUrl });
    } else {
      await dbOps.updateDocument('students', uid, { photo: photoUrl });
    }
    
    await dbOps.updateDocument('users', uid, { photo: photoUrl });

    res.json({ success: true, message: 'Profile picture updated successfully', photo: photoUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

