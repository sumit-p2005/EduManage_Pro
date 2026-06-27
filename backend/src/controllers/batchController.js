import dbOps from '../config/db.js';

export const getBatches = async (req, res) => {
  try {
    const batches = await dbOps.getCollection('batches');
    res.json({ success: true, batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBatchById = async (req, res) => {
  const { id } = req.params;
  try {
    const batch = await dbOps.getDocument('batches', id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    res.json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBatch = async (req, res) => {
  const { name, teacher, subjects, timings, status = 'Active' } = req.body;

  if (!name || !teacher || !timings) {
    return res.status(400).json({ success: false, message: 'Required fields: name, teacher, timings' });
  }

  try {
    const batchData = {
      name,
      teacher,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      timings,
      status,
      studentsCount: 0
    };

    const newBatch = await dbOps.createDocument('batches', batchData);
    res.status(201).json({ success: true, batch: newBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { name, teacher, subjects, timings, status } = req.body;

  try {
    const batch = await dbOps.getDocument('batches', id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (teacher) updates.teacher = teacher;
    if (subjects) updates.subjects = Array.isArray(subjects) ? subjects : [subjects];
    if (timings) updates.timings = timings;
    if (status) updates.status = status;

    const updatedBatch = await dbOps.updateDocument('batches', id, updates);

    // If batch name changed, sync in students collection too
    if (name) {
      const students = await dbOps.getCollection('students');
      const batchStudents = students.filter(s => s.batchId === id);
      for (const student of batchStudents) {
        await dbOps.updateDocument('students', student.id, { batchName: name });
      }
    }

    res.json({ success: true, batch: updatedBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  const { id } = req.params;
  try {
    const batch = await dbOps.getDocument('batches', id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Unassign batch from students belonging to this batch
    const students = await dbOps.getCollection('students');
    const batchStudents = students.filter(s => s.batchId === id);
    for (const student of batchStudents) {
      await dbOps.updateDocument('students', student.id, {
        batchId: '',
        batchName: 'Unassigned'
      });
    }

    await dbOps.deleteDocument('batches', id);
    res.json({ success: true, message: 'Batch deleted successfully and students unassigned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
