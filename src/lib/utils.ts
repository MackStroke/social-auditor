import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Automatically compress images larger than 5MB on the client side
 * using HTML5 Canvas before they are processed or sent to the API.
 */
export async function optimizeImage(file: File): Promise<File> {
    const FIVE_MB = 5 * 1024 * 1024;

    // If it's under 5MB or not an image, just return the original file
    if (file.size <= FIVE_MB || !file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Max dimensions to ensure it compresses well
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1920;

                let width = img.width;
                let height = img.height;

                // Scale down if necessary
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file); // Fail gracefully back to original
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Compress heavily using JPEG at 0.75 quality since it was over 5MB
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Reconstruct the File object
                            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            // Extra safety check: if compression somehow made it bigger, return original
                            resolve(optimizedFile.size < file.size ? optimizedFile : file);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    0.75
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}
