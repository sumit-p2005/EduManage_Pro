import dbOps from '../config/db.js';

export const getTimetable = async (req, res) => {
  const { role, uid } = req.user;
  const { batchId } = req.query;

  try {
    const timetable = await dbOps.getCollection('timetable');
    let filtered = timetable;

    if (role === 'student') {
      const student = await dbOps.getDocument('students', uid);
      if (!student || !student.batchId) {
        return res.json({ success: true, timetable: [] });
      }
      filtered = timetable.filter(t => t.batchId === student.batchId);
    } else {
      if (batchId) {
        filtered = timetable.filter(t => t.batchId === batchId);
      }
    }

    res.json({ success: true, timetable: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTimetableEntry = async (req, res) => {
  const { batchId, day, classes, isCancelled = false, isHoliday = false, remarks = '' } = req.body;

  if (!batchId || !day || !classes) {
    return res.status(400).json({ success: false, message: 'Required fields: batchId, day, classes' });
  }

  try {
    const batch = await dbOps.getDocument('batches', batchId);
    if (!batch) {
      return res.status(400).json({ success: false, message: 'Batch not found' });
    }

    const timetableData = {
      batchId,
      batchName: batch.name,
      day,
      classes: Array.isArray(classes) ? classes : [classes], // Expected array of { time, subject, room }
      isCancelled: !!isCancelled,
      isHoliday: !!isHoliday,
      remarks: remarks || ''
    };

    const newEntry = await dbOps.createDocument('timetable', timetableData);
    res.status(201).json({ success: true, entry: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTimetableEntry = async (req, res) => {
  const { id } = req.params;
  const { classes, isCancelled, isHoliday, remarks } = req.body;

  try {
    const entry = await dbOps.getDocument('timetable', id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    const updates = {};
    if (classes) updates.classes = Array.isArray(classes) ? classes : [classes];
    if (isCancelled !== undefined) updates.isCancelled = !!isCancelled;
    if (isHoliday !== undefined) updates.isHoliday = !!isHoliday;
    if (remarks !== undefined) updates.remarks = remarks;

    const updated = await dbOps.updateDocument('timetable', id, updates);
    res.json({ success: true, entry: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTimetableEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await dbOps.getDocument('timetable', id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    await dbOps.deleteDocument('timetable', id);
    res.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
