import dbOps from '../config/db.js';

export const getGallery = async (req, res) => {
  const { category } = req.query;
  try {
    const gallery = await dbOps.getCollection('gallery');
    let filtered = gallery;

    if (category) {
      filtered = gallery.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, gallery: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGalleryItem = async (req, res) => {
  const { title, category, date = new Date().toISOString().split('T')[0] } = req.body;
  const file = req.file;

  if (!title || !category) {
    return res.status(400).json({ success: false, message: 'Title and category are required' });
  }

  if (!file) {
    return res.status(400).json({ success: false, message: 'An image file is required' });
  }

  try {
    const imageUrl = await dbOps.uploadFile(file, `gallery/${Date.now()}_${file.originalname}`);

    const galleryData = {
      title,
      category,
      imageUrl,
      date,
      createdAt: new Date().toISOString()
    };

    const newItem = await dbOps.createDocument('gallery', galleryData);
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await dbOps.getDocument('gallery', id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    if (item.imageUrl) {
      await dbOps.deleteFile(item.imageUrl);
    }

    await dbOps.deleteDocument('gallery', id);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toppers display section
export const getToppers = async (req, res) => {
  try {
    const toppers = await dbOps.getCollection('toppers');
    res.json({ success: true, toppers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTopper = async (req, res) => {
  const { name, marks, rank, quote } = req.body;
  const file = req.file;

  if (!name || !marks || !rank || !quote) {
    return res.status(400).json({ success: false, message: 'Required fields: name, marks, rank, quote' });
  }

  try {
    let photo = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    if (file) {
      photo = await dbOps.uploadFile(file, `toppers/${Date.now()}_${file.originalname}`);
    }

    const topperData = { name, marks, rank, quote, photo };
    const newTopper = await dbOps.createDocument('toppers', topperData);
    res.status(201).json({ success: true, topper: newTopper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTopper = async (req, res) => {
  const { id } = req.params;
  try {
    const topper = await dbOps.getDocument('toppers', id);
    if (!topper) {
      return res.status(404).json({ success: false, message: 'Topper not found' });
    }

    if (topper.photo && !topper.photo.includes('unsplash.com')) {
      await dbOps.deleteFile(topper.photo);
    }

    await dbOps.deleteDocument('toppers', id);
    res.json({ success: true, message: 'Topper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
