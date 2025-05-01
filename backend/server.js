const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdf = require('html-pdf');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Content-Disposition'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400
}));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum number of files
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test PDF generation
app.post('/api/test-pdf', upload.array('images', 10), async (req, res) => {
  try {
    console.log('Starting PDF generation...');
    
    // Get the uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        details: 'Please upload at least one image file'
      });
    }

    // Combine all images into one PDF
    const html = `
      <html>
        <body style="margin: 0; padding: 0;">
          ${req.files.map((file, index) => `
            <div style="page-break-after: ${index < req.files.length - 1 ? 'always' : 'auto'};">
              <img src="data:image/${file.mimetype.split('/')[1]};base64,${file.buffer.toString('base64')}" 
                   style="width: 100%; height: auto;">
            </div>
          `).join('')}
        </body>
      </html>
    `;
    console.log('Image file received successfully');

    console.log('Creating HTML...');

    // Convert HTML to PDF
    console.log('Converting HTML to PDF...');
    const options = {
      format: 'A4',
      orientation: 'portrait',
      border: '0px'
    };

    pdf.create(html, options).toBuffer((err, pdfBuffer) => {
      if (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ 
          error: 'Failed to generate PDF',
          details: err.message
        });
        return;
      }

      console.log('PDF conversion successful');
      console.log('Sending PDF response...');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=ankit_photo.pdf');
      res.send(pdfBuffer);
      console.log('PDF response sent successfully');
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message,
      stack: error.stack
    });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
