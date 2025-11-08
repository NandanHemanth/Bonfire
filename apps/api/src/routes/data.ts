import express from 'express';
import multer from 'multer';
import { analyzeDataset } from '../services/data-analyzer.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload and analyze CSV/Excel data
router.post('/analyze', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileType = fileName.endsWith('.csv') ? 'csv' : 'excel';

    const analysis = await analyzeDataset(fileBuffer, fileType);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

export default router;
