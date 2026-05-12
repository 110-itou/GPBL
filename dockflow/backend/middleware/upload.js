const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for different file types
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dockflow/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => `delivery_${Date.now()}_${file.originalname}`
  }
});

const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dockflow/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `delivery_${Date.now()}_${file.originalname}`
  }
});

// Create upload middleware
const uploadImages = multer({ storage: imageStorage });
const uploadPDFs = multer({ storage: pdfStorage });

// Combined upload handler
const uploadFiles = (req, res, next) => {
  const files = req.files || {};
  const images = files.images || [];
  const pdfs = files.pdfs || [];
  
  // Process uploaded files
  const uploadedFiles = [];
  
  // Process images
  if (Array.isArray(images)) {
    images.forEach(file => {
      uploadedFiles.push({
        file_type: 'photo',
        file_url: file.path,
        file_name: file.originalname,
        public_id: file.filename
      });
    });
  }
  
  // Process PDFs
  if (Array.isArray(pdfs)) {
    pdfs.forEach(file => {
      uploadedFiles.push({
        file_type: 'pdf',
        file_url: file.path,
        file_name: file.originalname,
        public_id: file.filename
      });
    });
  }
  
  req.uploadedFiles = uploadedFiles;
  next();
};

// Fallback for when Cloudinary is not configured
const uploadLocal = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadFilesFallback = (req, res, next) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // When Cloudinary is not configured, store files in memory
    // and let the frontend handle the error
    req.uploadedFiles = [];
    return next();
  }
  
  uploadFiles(req, res, next);
};

module.exports = {
  cloudinary,
  uploadImages,
  uploadPDFs,
  uploadFiles,
  uploadFilesFallback
};
