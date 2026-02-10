const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Creates a reusable multer upload middleware with sharp image optimization
 * @param {string} folderName - Subfolder name within uploads directory
 * @param {Object} options - Configuration options
 * @returns {Object} - Multer middleware with single, array, and fields methods
 */
function createUploader(folderName, options = {}) {
    const {
        maxFileSize = 10 * 1024 * 1024, // 10MB default
        imageWidth = 800, // Default resize width
        allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        allowedDocTypes = ['application/pdf', 'image/jpeg', 'image/png'],
        isDocument = false // Set to true for documents (no resize)
    } = options;

    const uploadDir = path.join(__dirname, '../uploads', folderName);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Use memory storage to process with sharp before saving
    const storage = multer.memoryStorage();

    // File filter based on type
    const fileFilter = (req, file, cb) => {
        const allowedTypes = isDocument ? allowedDocTypes : allowedImageTypes;

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const error = new Error('Invalid file type');
            error.code = 'INVALID_FILE_TYPE';
            cb(error, false);
        }
    };

    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: maxFileSize }
    });

    /**
     * Process and save an image/document file
     * @param {Object} file - Multer file object
     * @returns {Promise<Object>} - Processed file info
     */
    async function processFile(file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Check if it's an image that should be optimized
        const isImage = allowedImageTypes.includes(file.mimetype) && !isDocument;

        if (isImage && file.mimetype !== 'image/gif') {
            // Process with sharp - resize and compress
            await sharp(file.buffer)
                .resize(imageWidth, null, {
                    withoutEnlargement: true, // Don't upscale small images
                    fit: 'inside'
                })
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toFile(filepath.replace(ext, '.jpg'));

            return {
                url: `/uploads/${folderName}/${filename.replace(ext, '.jpg')}`,
                filename: filename.replace(ext, '.jpg'),
                originalname: file.originalname,
                mimetype: 'image/jpeg',
                size: fs.statSync(filepath.replace(ext, '.jpg')).size
            };
        } else {
            // Save document or GIF as-is
            fs.writeFileSync(filepath, file.buffer);

            return {
                url: `/uploads/${folderName}/${filename}`,
                filename: filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            };
        }
    }

    /**
     * Middleware wrapper that processes files after multer upload
     */
    function wrapMiddleware(multerMiddleware) {
        return (req, res, next) => {
            multerMiddleware(req, res, async (err) => {
                if (err) {
                    return next(err);
                }

                try {
                    // Process single file
                    if (req.file) {
                        req.file = await processFile(req.file);
                    }

                    // Process multiple files
                    if (req.files) {
                        if (Array.isArray(req.files)) {
                            req.files = await Promise.all(
                                req.files.map(file => processFile(file))
                            );
                        } else {
                            // Handle fields (object with arrays)
                            for (const fieldName of Object.keys(req.files)) {
                                req.files[fieldName] = await Promise.all(
                                    req.files[fieldName].map(file => processFile(file))
                                );
                            }
                        }
                    }

                    next();
                } catch (processError) {
                    next(processError);
                }
            });
        };
    }

    return {
        single: (fieldName) => wrapMiddleware(upload.single(fieldName)),
        array: (fieldName, maxCount) => wrapMiddleware(upload.array(fieldName, maxCount)),
        fields: (fields) => wrapMiddleware(upload.fields(fields)),
        none: () => upload.none()
    };
}

// Pre-configured uploaders for common use cases
const uploaders = {
    properties: createUploader('properties', { imageWidth: 1200 }),
    avatars: createUploader('avatars', { imageWidth: 400 }),
    documents: createUploader('documents', { isDocument: true }),
    general: createUploader('general')
};

module.exports = {
    createUploader,
    uploaders
};
