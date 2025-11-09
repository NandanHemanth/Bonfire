import express from 'express';
import { analyzeDataWithGemini } from '../services/gemini-data-analyzer.js';
import { generateAnalysisPDF } from '../services/pdf-generator.js';

const router = express.Router();

// Analyze CSV data with Gemini
router.post('/analyze', async (req, res, next) => {
  try {
    const { data, filename } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    console.log(`Analyzing ${filename} with ${data.length} rows...`);

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.' 
      });
    }

    // Use Gemini to analyze the data
    const analysis = await analyzeDataWithGemini(data, filename);

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: errorMessage 
    });
  }
});

// Generate PDF report
router.post('/generate-pdf', async (req, res, next) => {
  try {
    const analysisResult = req.body;

    console.log('Generating PDF report...');

    // Generate PDF
    const pdfBuffer = await generateAnalysisPDF(analysisResult);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analysis-report.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    next(error);
  }
});

export default router;
