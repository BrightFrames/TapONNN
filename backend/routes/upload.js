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
        // Allow Images and Videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit to support video covers
    }
});

// POST /api/upload - Single file upload
// usage: /api/upload?type=product_file (for 15MB limit & all types)
// usage: /api/upload (for 5MB limit & images only - enforced by strict middleware if we wanted, but currently shared)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let finalFilename = req.file.filename;
        let finalPath = req.file.path;
        let finalSize = req.file.size;

        // Image Compression Logic (using Sharp)
        // Only compress if it is an image and NOT a product file (unless we want to optimize product images too? Yes likely)
        // But let's check mime type.
        if (req.file.mimetype.startsWith('image/')) {
            try {
                const sharp = require('sharp');
                const fs = require('fs');

                // Construct optimized filename
                const optimizedFilename = `opt-${req.file.filename.split('.')[0]}.jpeg`; // Force JPEG/WebP for consistency? Let's use JPEG for broad compatibility
                const optimizedPath = path.join(uploadDir, optimizedFilename);

                // Process image: Resize max width/height 1920, Convert to JPEG, Quality 80
                await sharp(req.file.path)
                    .resize(1920, 1920, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .toFormat('jpeg', { quality: 80, mozjpeg: true })
                    .toFile(optimizedPath);

                // Success! Delete original large file
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkErr) {
                    console.error("Failed to delete original file:", unlinkErr);
                }

                // Update references
                finalFilename = optimizedFilename;
                finalPath = optimizedPath;
                finalSize = fs.statSync(optimizedPath).size;

            } catch (sharpError) {
                console.error("Image compression failed, keeping original:", sharpError);
                // Fallback to original file
            }
        }

        // Return the relative path to access the file
        // Storing relative paths allows the frontend to prepend the correct domain (localhost or production)
        const fileUrl = `/uploads/${finalFilename}`;

        res.json({
            success: true,
            url: fileUrl,
            filename: finalFilename,
            originalName: req.file.originalname,
            size: finalSize
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
});

module.exports = router;
