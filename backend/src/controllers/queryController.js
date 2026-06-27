import dbOps from '../config/db.js';

export const getQueries = async (req, res) => {
  const { role, uid } = req.user;

  try {
    const queries = await dbOps.getCollection('queries');
    let filtered = queries;

    if (role === 'student') {
      filtered = queries.filter(q => q.studentId === uid);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, queries: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuery = async (req, res) => {
  const { type, queryText } = req.body;
  const { uid, email } = req.user;

  if (!type || !queryText) {
    return res.status(400).json({ success: false, message: 'Type and queryText are required' });
  }

  try {
    // Find student name
    const student = await dbOps.getDocument('students', uid);
    const studentName = student ? student.name : email.split('@')[0];

    const queryData = {
      studentId: uid,
      studentName,
      type,
      queryText,
      replyText: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      repliedAt: '',
      createdAt: new Date().toISOString()
    };

    const newQuery = await dbOps.createDocument('queries', queryData);
    res.status(201).json({ success: true, query: newQuery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToQuery = async (req, res) => {
  const { id } = req.params;
  const { replyText } = req.body;

  if (!replyText) {
    return res.status(400).json({ success: false, message: 'Reply text is required' });
  }

  try {
    const query = await dbOps.getDocument('queries', id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const updates = {
      replyText,
      status: 'Resolved',
      repliedAt: new Date().toISOString()
    };

    const updatedQuery = await dbOps.updateDocument('queries', id, updates);
    res.json({ success: true, query: updatedQuery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuery = async (req, res) => {
  const { id } = req.params;
  try {
    const query = await dbOps.getDocument('queries', id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    await dbOps.deleteDocument('queries', id);
    res.json({ success: true, message: 'Query deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
