/**
 * Client-side image downscaling to prevent Vercel 4.5MB serverless payload limit errors.
 * Preserves EXIF orientation and downscales large smartphone photos to max 2048px JPEG at 0.85 quality.
 */
export async function downscaleImage(
  file: File,
  maxDimension = 2048,
  quality = 0.85
): Promise<File | Blob> {
  // If file is already small (under 1.5MB), avoid canvas overhead
  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    let targetWidth = width;
    let targetHeight = height;

    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        targetWidth = maxDimension;
        targetHeight = Math.round((height * maxDimension) / width);
      } else {
        targetHeight = maxDimension;
        targetWidth = Math.round((width * maxDimension) / height);
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          } else {
            resolve(file); // Fall back to original file if compression didn't help
          }
        },
        "image/jpeg",
        quality
      );
    });
  } catch {
    // If browser doesn't support createImageBitmap or canvas fails, fall back to raw file
    return file;
  }
}
