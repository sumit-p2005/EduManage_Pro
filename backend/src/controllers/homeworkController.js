import dbOps from '../config/db.js';

export const getHomework = async (req, res) => {
  const { role, uid } = req.user;
  const { batchId } = req.query;

  try {
    const homework = await dbOps.getCollection('homework');
    let filteredHomework = homework;

    if (role === 'student') {
      const student = await dbOps.getDocument('students', uid);
      if (!student || !student.batchId) {
        return res.json({ success: true, homework: [] });
      }
      filteredHomework = homework.filter(h => h.batchId === student.batchId);
    } else {
      if (batchId) {
        filteredHomework = filteredHomework.filter(h => h.batchId === batchId);
      }
    }

    // Sort by createdAt descending
    filteredHomework.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, homework: filteredHomework });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHomework = async (req, res) => {
  const { title, description, subject, dueDate, batchId } = req.body;
  const file = req.file;

  if (!title || !subject || !dueDate || !batchId) {
    return res.status(400).json({ success: false, message: 'Required fields: title, subject, dueDate, batchId' });
  }

  try {
    const batch = await dbOps.getDocument('batches', batchId);
    if (!batch) {
      return res.status(400).json({ success: false, message: 'Batch not found' });
    }

    let attachmentUrl = '';
    let attachmentName = '';

    if (file) {
      attachmentUrl = await dbOps.uploadFile(file, `homework/${Date.now()}_${file.originalname}`);
      attachmentName = file.originalname;
    }

    const homeworkData = {
      title,
      description: description || '',
      subject,
      dueDate,
      batchId,
      batchName: batch.name,
      attachmentUrl,
      attachmentName,
      uploadedBy: req.user.email,
      createdAt: new Date().toISOString()
    };

    const newHomework = await dbOps.createDocument('homework', homeworkData);
    res.status(201).json({ success: true, homework: newHomework });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHomework = async (req, res) => {
  const { id } = req.params;
  try {
    const hw = await dbOps.getDocument('homework', id);
    if (!hw) {
      return res.status(404).json({ success: false, message: 'Homework not found' });
    }

    if (hw.attachmentUrl) {
      await dbOps.deleteFile(hw.attachmentUrl);
    }

    await dbOps.deleteDocument('homework', id);
    res.json({ success: true, message: 'Homework deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
