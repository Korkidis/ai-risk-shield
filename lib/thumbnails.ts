import { createClient } from '@/lib/supabase/client';

/**
 * Generates a thumbnail from an image file client-side.
 * Resizes to max width of 400px while maintaining aspect ratio.
 */
export async function generateImageThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            const maxWidth = 400;
            const scale = maxWidth / img.width;
            const width = maxWidth;
            const height = img.height * scale;

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Thumbnail generation failed'));
            }, 'image/jpeg', 0.85); // 85% quality JPEG
        };
        img.onerror = (err) => reject(err);
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Generates a thumbnail from a video file client-side.
 * Seeks to 3.0 seconds (or 50%) and captures a frame.
 */
export async function generateVideoThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            // Seek to 3 seconds or middle if video is shorter
            video.currentTime = Math.min(3.0, video.duration / 2);
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            const maxWidth = 400;
            const scale = maxWidth / video.videoWidth;
            const width = maxWidth;
            const height = video.videoHeight * scale;

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(video, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Video thumbnail generation failed'));
            }, 'image/jpeg', 0.85);
        };

        video.onerror = (err) => reject(err);
    });
}

/**
 * Uploads a thumbnail to Supabase Storage.
 * Path: `thumbnails/{tenant_id}/{asset_id}.jpg`
 */
export async function uploadThumbnail(
    file: File,
    assetId: string,
    tenantId: string
): Promise<string | null> {
    const supabase = createClient();
    try {
        let thumbnailBlob: Blob;

        if (file.type.startsWith('image/')) {
            thumbnailBlob = await generateImageThumbnail(file);
        } else if (file.type.startsWith('video/')) {
            thumbnailBlob = await generateVideoThumbnail(file);
        } else {
            return null; // Unsupported type
        }

        const path = `${tenantId}/${assetId}_thumb.jpg`;
        const { error } = await supabase.storage
            .from('thumbnails') // Ensure this bucket exists
            .upload(path, thumbnailBlob, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) throw error;

        // Get Public URL (assuming public bucket, or use signed URL if private)
        const { data } = supabase.storage.from('thumbnails').getPublicUrl(path);
        return data.publicUrl;

    } catch (error) {
        console.error('Thumbnail upload failed:', error);
        return null;
    }
}
