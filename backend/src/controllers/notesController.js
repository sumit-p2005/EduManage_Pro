import dbOps from '../config/db.js';

export const getNotes = async (req, res) => {
  const { role, uid } = req.user;
  const { batchId, subject } = req.query;

  try {
    const notes = await dbOps.getCollection('notes');
    let filteredNotes = notes;

    if (role === 'student') {
      // Find student's batch
      const student = await dbOps.getDocument('students', uid);
      if (!student || !student.batchId) {
        return res.json({ success: true, notes: [] });
      }
      filteredNotes = notes.filter(n => n.batchId === student.batchId);
    } else {
      // Admin filters
      if (batchId) {
        filteredNotes = filteredNotes.filter(n => n.batchId === batchId);
      }
    }

    if (subject) {
      filteredNotes = filteredNotes.filter(n => n.subject.toLowerCase() === subject.toLowerCase());
    }

    // Sort by createdAt descending
    filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, notes: filteredNotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNote = async (req, res) => {
  const { title, description, subject, chapter, topic, batchId } = req.body;
  const file = req.file;

  if (!title || !subject || !chapter || !topic || !batchId) {
    return res.status(400).json({ success: false, message: 'Required fields: title, subject, chapter, topic, batchId' });
  }

  if (!file) {
    return res.status(400).json({ success: false, message: 'Please attach a document file (PDF, PPT, or Image)' });
  }

  try {
    const batch = await dbOps.getDocument('batches', batchId);
    if (!batch) {
      return res.status(400).json({ success: false, message: 'Batch not found' });
    }

    // Upload file
    const fileUrl = await dbOps.uploadFile(file, `notes/${Date.now()}_${file.originalname}`);

    const noteData = {
      title,
      description: description || '',
      subject,
      chapter,
      topic,
      batchId,
      batchName: batch.name,
      fileUrl,
      fileName: file.originalname,
      uploadedBy: req.user.email,
      createdAt: new Date().toISOString()
    };

    const newNote = await dbOps.createDocument('notes', noteData);
    res.status(201).json({ success: true, note: newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await dbOps.getDocument('notes', id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.fileUrl) {
      await dbOps.deleteFile(note.fileUrl);
    }

    await dbOps.deleteDocument('notes', id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
