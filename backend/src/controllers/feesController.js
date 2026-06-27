import dbOps from '../config/db.js';

export const getAllFees = async (req, res) => {
  try {
    const fees = await dbOps.getCollection('fees');
    // Sort by date descending
    fees.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentFeeHistory = async (req, res) => {
  const { studentId } = req.params;
  try {
    const fees = await dbOps.getCollection('fees');
    const studentFees = fees.filter(f => f.studentId === studentId);
    studentFees.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, fees: studentFees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyFees = async (req, res) => {
  const { uid } = req.user;
  try {
    const student = await dbOps.getDocument('students', uid);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student details not found' });
    }

    const fees = await dbOps.getCollection('fees');
    const myHistory = fees.filter(f => f.studentId === uid);
    myHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      summary: student.feeDetails || {
        total: 0,
        paid: 0,
        remaining: 0,
        dueDate: '',
        status: 'Unassigned'
      },
      history: myHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFeePayment = async (req, res) => {
  const { studentId, amount, type, date = new Date().toISOString().split('T')[0] } = req.body;

  if (!studentId || !amount || !type) {
    return res.status(400).json({ success: false, message: 'Required fields: studentId, amount, type' });
  }

  try {
    const student = await dbOps.getDocument('students', studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const payAmount = parseFloat(amount);
    const newPaid = (student.feeDetails.paid || 0) + payAmount;
    const newRemaining = Math.max(0, (student.feeDetails.total || 0) - newPaid);

    let newStatus = 'Pending';
    if (newRemaining <= 0) newStatus = 'Paid';
    else if (newPaid > 0) newStatus = 'Partially Paid';

    // Update student document
    const updatedFeeDetails = {
      ...student.feeDetails,
      paid: newPaid,
      remaining: newRemaining,
      status: newStatus
    };

    await dbOps.updateDocument('students', studentId, {
      feeDetails: updatedFeeDetails
    });

    // Create fee transaction record
    const newFeeRecord = await dbOps.createDocument('fees', {
      studentId,
      studentName: student.name,
      amount: payAmount,
      type,
      status: 'Paid',
      date
    });

    res.status(201).json({
      success: true,
      fee: newFeeRecord,
      updatedFeeDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFeeDetails = async (req, res) => {
  const { studentId } = req.params;
  const { total, dueDate } = req.body;

  if (total === undefined && !dueDate) {
    return res.status(400).json({ success: false, message: 'Please provide total or dueDate to update' });
  }

  try {
    const student = await dbOps.getDocument('students', studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const feeDetails = student.feeDetails || { total: 0, paid: 0, remaining: 0, status: 'Pending', dueDate: '' };

    if (total !== undefined) {
      feeDetails.total = parseFloat(total);
      feeDetails.remaining = Math.max(0, feeDetails.total - (feeDetails.paid || 0));
      if (feeDetails.remaining <= 0) feeDetails.status = 'Paid';
      else if (feeDetails.paid > 0) feeDetails.status = 'Partially Paid';
      else feeDetails.status = 'Pending';
    }

    if (dueDate) {
      feeDetails.dueDate = dueDate;
    }

    const updatedStudent = await dbOps.updateDocument('students', studentId, { feeDetails });

    res.json({
      success: true,
      feeDetails: updatedStudent.feeDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
