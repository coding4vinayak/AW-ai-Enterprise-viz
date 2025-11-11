import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Define allowed file types and size limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Define file extension mapping to MIME types
const FILE_TYPE_EXTENSIONS: Record<string, string[]> = {
  'text/csv': ['.csv'],
  'application/csv': ['.csv'],
  'text/plain': ['.csv', '.txt'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
};

// Configure file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store in a temporary secure location
    cb(null, path.join(__dirname, '../temp_uploads'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to ensure only allowed file types are uploaded
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

// Create multer instance with security settings
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 50MB file size limit
    files: 1 // Only allow one file per upload
  },
  fileFilter: fileFilter
});

// Create an alternative memory storage option for smaller files
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // 50MB for memory storage
    files: 1
  },
  fileFilter: fileFilter
});

// Type guard to check if file upload is safe
export const isSafeFile = (file: Express.Multer.File): boolean => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ALLOWED_FILE_TYPES.flatMap(mimeType => FILE_TYPE_EXTENSIONS[mimeType] || []);
  if (!allowedExts.includes(ext)) {
    return false;
  }

  // Check MIME type
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return false;
  }

  return true;
};