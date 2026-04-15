const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const { authenticate, isAdmin } = require('../middleware/auth');

// ── Multer — memory storage so we can pipe to Cloudinary ─────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only jpeg, jpg, png and webp images are allowed'));
  },
});

// ── POST /api/v1/upload/image  (admin only) ───────────────────────────────────
router.post('/image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // ── Try Cloudinary first ────────────────────────────────────────────────
    const cloudName   = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET; // unsigned preset

    if (cloudName && uploadPreset) {
      // Use Cloudinary unsigned upload API — no SDK needed, just fetch
      const FormData = require('form-data');
      const fetch    = require('node-fetch').default || require('node-fetch');

      const form = new FormData();
      form.append('file',           req.file.buffer, {
        filename:    req.file.originalname,
        contentType: req.file.mimetype,
      });
      form.append('upload_preset',  uploadPreset);
      form.append('folder',         'saras-kitchen/menu');

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: form }
      );
      const data = await cloudRes.json();

      if (data.secure_url) {
        return res.json({
          success:  true,
          imageUrl: data.secure_url,
          publicId: data.public_id,
          provider: 'cloudinary',
        });
      }
    }

    // ── Fallback: base64 data URL (works without Cloudinary credentials) ───
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    return res.json({
      success:  true,
      imageUrl: dataUrl,
      provider: 'base64',
      note:     'Stored as base64. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in .env for persistent hosting.',
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

module.exports = router;