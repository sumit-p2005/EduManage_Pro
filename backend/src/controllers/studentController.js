import dbOps from '../config/db.js';

export const getStudents = async (req, res) => {
  try {
    const students = await dbOps.getCollection('students');
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await dbOps.getDocument('students', id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudent = async (req, res) => {
  const {
    name,
    email,
    password = 'student123', // Default password
    phone,
    parentName,
    parentPhone,
    address,
    admissionDate,
    batchId,
    feeTotal,
    feePaid = 0,
    feeDueDate,
    photo = ''
  } = req.body;

  if (!name || !email || !phone || !batchId || feeTotal === undefined) {
    return res.status(400).json({ success: false, message: 'Required fields: name, email, phone, batchId, feeTotal' });
  }

  try {
    // Check if user already exists
    const users = await dbOps.getCollection('users');
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    // Resolve batch name
    const batch = await dbOps.getDocument('batches', batchId);
    if (!batch) {
      return res.status(400).json({ success: false, message: 'Batch not found' });
    }

    // 1. Create auth user (Firebase SDK or Mock ID)
    const uid = await dbOps.createUser(email, password, 'student');

    // 2. Save in users collection
    await dbOps.createDocument('users', {
      email,
      role: 'student',
      name
    }, uid);

    // 3. Calculate remaining fees
    const remaining = feeTotal - feePaid;
    let feeStatus = 'Pending';
    if (remaining <= 0) feeStatus = 'Paid';
    else if (feePaid > 0) feeStatus = 'Partially Paid';

    // 4. Save in students collection
    const studentData = {
      name,
      email,
      phone,
      parentName,
      parentPhone,
      address,
      admissionDate: admissionDate || new Date().toISOString().split('T')[0],
      batchId,
      batchName: batch.name,
      photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // placeholder
      feeDetails: {
        total: parseFloat(feeTotal),
        paid: parseFloat(feePaid),
        remaining: parseFloat(remaining),
        dueDate: feeDueDate || new Date().toISOString().split('T')[0],
        status: feeStatus
      }
    };

    const newStudent = await dbOps.createDocument('students', studentData, uid);

    // Increment studentsCount in batch
    await dbOps.updateDocument('batches', batchId, {
      studentsCount: (batch.studentsCount || 0) + 1
    });

    // Record fee history if initial fee paid
    if (feePaid > 0) {
      await dbOps.createDocument('fees', {
        studentId: uid,
        studentName: name,
        amount: parseFloat(feePaid),
        type: 'Admission Fee',
        status: 'Paid',
        date: new Date().toISOString().split('T')[0]
      });
    }

    res.status(201).json({ success: true, student: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    parentName,
    parentPhone,
    address,
    batchId,
    photo
  } = req.body;

  try {
    const student = await dbOps.getDocument('students', id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (parentName) updates.parentName = parentName;
    if (parentPhone) updates.parentPhone = parentPhone;
    if (address) updates.address = address;
    if (photo) updates.photo = photo;

    if (batchId && batchId !== student.batchId) {
      // De-increment old batch count
      const oldBatch = await dbOps.getDocument('batches', student.batchId);
      if (oldBatch) {
        await dbOps.updateDocument('batches', student.batchId, {
          studentsCount: Math.max(0, (oldBatch.studentsCount || 1) - 1)
        });
      }

      // Increment new batch count
      const newBatch = await dbOps.getDocument('batches', batchId);
      if (newBatch) {
        await dbOps.updateDocument('batches', batchId, {
          studentsCount: (newBatch.studentsCount || 0) + 1
        });
        updates.batchId = batchId;
        updates.batchName = newBatch.name;
      }
    }

    const updatedStudent = await dbOps.updateDocument('students', id, updates);

    // Sync name in users collection
    if (name) {
      await dbOps.updateDocument('users', id, { name });
    }

    res.json({ success: true, student: updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await dbOps.getDocument('students', id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Decrement batch studentsCount
    if (student.batchId) {
      const batch = await dbOps.getDocument('batches', student.batchId);
      if (batch) {
        await dbOps.updateDocument('batches', student.batchId, {
          studentsCount: Math.max(0, (batch.studentsCount || 1) - 1)
        });
      }
    }

    // Delete auth record and database entries
    if (student.photo && !student.photo.includes('unsplash.com')) {
      await dbOps.deleteFile(student.photo);
    }

    await dbOps.deleteUser(id);
    await dbOps.deleteDocument('users', id);
    await dbOps.deleteDocument('students', id);

    // Delete fee entries for this student
    const fees = await dbOps.getCollection('fees');
    const studentFees = fees.filter(f => f.studentId === id);
    for (const fee of studentFees) {
      await dbOps.deleteDocument('fees', fee.id);
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
