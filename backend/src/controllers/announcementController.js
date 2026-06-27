import dbOps from '../config/db.js';

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await dbOps.getCollection('announcements');
    // Sort pinned first, then by date descending
    announcements.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  const { title, content, pinned = false } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  try {
    const announcementData = {
      title,
      content,
      pinned: !!pinned,
      date: new Date().toISOString().split('T')[0],
      author: req.user.name || req.user.email,
      createdAt: new Date().toISOString()
    };

    const newAnn = await dbOps.createDocument('announcements', announcementData);
    res.status(201).json({ success: true, announcement: newAnn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, pinned } = req.body;

  try {
    const announcement = await dbOps.getDocument('announcements', id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (pinned !== undefined) updates.pinned = !!pinned;

    const updatedAnn = await dbOps.updateDocument('announcements', id, updates);
    res.json({ success: true, announcement: updatedAnn });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await dbOps.getDocument('announcements', id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await dbOps.deleteDocument('announcements', id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
