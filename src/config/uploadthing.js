import { createUploadthing } from 'uploadthing/express';
import { UTApi } from 'uploadthing/server';

const f = createUploadthing();

// Create UTApi instance for file operations
export const utapi = new UTApi();

// Define file routes
export const uploadRouter = {
    // Product images uploader
    productImages: f({
        image: {
            maxFileSize: '5MB',
            maxFileCount: 5
        }
    })
        .middleware(async ({ req }) => {
            // Add authentication check if needed
            // For now, we'll handle auth in the route itself
            return {};
        })
        .onUploadComplete(async ({ file, metadata }) => {
            return {
                url: file.ufsUrl,
                key: file.key,
                name: file.name,
                size: file.size
            };
        })
};
