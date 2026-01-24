import multer from 'multer';
import { utapi } from './uploadthing.js';

// Configure multer to store files in memory for UploadThing upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Upload files to UploadThing
 * @param {Array} files - Array of files from multer (req.files)
 * @returns {Promise<Array>} Array of uploaded file data {url, key, name, size}
 */
export const uploadToUploadThing = async (files) => {
    if (!files || files.length === 0) {
        return [];
    }

    try {
        // Convert multer files to File objects for UploadThing
        const uploadThingFiles = files.map(file => {
            return new File([file.buffer], file.originalname, {
                type: file.mimetype
            });
        });

        // Upload files to UploadThing
        const responses = await utapi.uploadFiles(uploadThingFiles);

        // Process responses and return data
        const uploadedFiles = [];
        for (const response of responses) {
            if (response.data) {
                uploadedFiles.push({
                    url: response.data.ufsUrl,
                    key: response.data.key,
                    name: response.data.name,
                    size: response.data.size
                });
            } else if (response.error) {
                console.error('UploadThing error:', response.error);
                throw new Error(response.error.message || 'Failed to upload file');
            }
        }

        return uploadedFiles;
    } catch (error) {
        console.error('Upload to UploadThing failed:', error);
        throw error;
    }
};

/**
 * Delete file from UploadThing
 * @param {string} fileKey - The file key from UploadThing
 */
export const deleteFile = async (fileKey) => {
    try {
        if (!fileKey) return;
        await utapi.deleteFiles(fileKey);
        console.log('File deleted from UploadThing:', fileKey);
    } catch (error) {
        console.error('Failed to delete file from UploadThing:', error);
    }
};

/**
 * Delete multiple files from UploadThing
 * @param {Array<string>} fileKeys - Array of file keys from UploadThing
 */
export const deleteFiles = async (fileKeys) => {
    try {
        if (!fileKeys || fileKeys.length === 0) return;
        await utapi.deleteFiles(fileKeys);
        console.log('Files deleted from UploadThing:', fileKeys);
    } catch (error) {
        console.error('Failed to delete files from UploadThing:', error);
    }
};

/**
 * Extract file key from UploadThing URL
 * @param {string} url - The full UploadThing URL
 * @returns {string} The file key
 */
export const getFileKeyFromUrl = (url) => {
    const match = url.match(/\/f\/([^/?]+)/);
    return match ? match[1] : url;
};

export default upload;
