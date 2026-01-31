const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check if it's a product file upload
    if (req.query.type === 'product_file') {
        // Allow all file types for product files
        cb(null, true);
    } else {
        // Default: Images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB global limit, logic handled/checked mostly by filter/logic but multer checks max first. 
        // We set max to 15MB to accomodate products. 
        // For standard images, we can enforce smaller limit if needed, but 15MB hard limit is safe.
    }
});

// POST /api/upload - Single file upload
// usage: /api/upload?type=product_file (for 15MB limit & all types)
// usage: /api/upload (for 5MB limit & images only - enforced by strict middleware if we wanted, but currently shared)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the URL to access the file
        // Assumes the server serves the 'uploads' folder at /uploads
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
});

module.exports = router;
