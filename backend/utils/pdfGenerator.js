const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

async function generatePDF(images, pageSize = 'A4', orientation = 'portrait') {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Set page size and orientation
    let width, height;
    if (pageSize === 'A4') {
      width = 595; // 210mm in points
      height = 842; // 297mm in points
    } else { // Letter
      width = 612; // 216mm in points
      height = 792; // 279mm in points
    }

    if (orientation === 'landscape') {
      [width, height] = [height, width];
    }

    // Process each image
    for (const image of images) {
      console.log(`Processing image: ${image.originalname}`);

      // Convert image to PNG with quality
      const buffer = await sharp(image.buffer)
        .png({ quality: 90 })
        .toBuffer();

      // Add new page
      const page = pdfDoc.addPage([width, height]);
      const { width: pageWidth, height: pageHeight } = page.getSize();

      // Calculate image dimensions to fit page
      const imageInfo = await sharp(buffer).metadata();
      let imgWidth = pageWidth;
      let imgHeight = (imgWidth / imageInfo.width) * imageInfo.height;

      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      // Add image to page
      const imageRef = await pdfDoc.embedPng(buffer);
      page.drawImage(imageRef, {
        x,
        y,
        width: imgWidth,
        height: imgHeight
      });
    }

    console.log('PDF document created successfully');
    return pdfDoc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

module.exports = generatePDF;
