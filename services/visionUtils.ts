
/**
 * Compresses an image to ensure it's within Gemini's limits and reduces latency.
 * Resizes to max width/height of 1024px and uses jpeg compression.
 */
export const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // 0.7 quality for good balance of size and Gemini readability
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
    });
};
