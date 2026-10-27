import sharp from "sharp";

export interface NormalizedImageResult {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Pre-processes an uploaded notebook image for vision model extraction:
 * 1. Auto-rotates using EXIF orientation tag.
 * 2. Downscales if exceeding max dimension (default 2048px) to reduce token count.
 * 3. Enhances contrast and converts to high-quality JPEG.
 */
export async function normalizeNotebookImage(
  inputBuffer: Buffer,
  maxDimension = 2048
): Promise<NormalizedImageResult> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const currentWidth = metadata.width ?? 2048;
  const currentHeight = metadata.height ?? 2048;

  let resizeOptions = {};
  if (currentWidth > maxDimension || currentHeight > maxDimension) {
    if (currentWidth >= currentHeight) {
      resizeOptions = { width: maxDimension, withoutEnlargement: true };
    } else {
      resizeOptions = { height: maxDimension, withoutEnlargement: true };
    }
  }

  const processedBuffer = await image
    .rotate() // auto-orient based on EXIF
    .resize(resizeOptions)
    .normalize() // stretch luminance to boost handwriting contrast
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const finalMetadata = await sharp(processedBuffer).metadata();

  return {
    buffer: processedBuffer,
    mimeType: "image/jpeg",
    width: finalMetadata.width ?? currentWidth,
    height: finalMetadata.height ?? currentHeight,
  };
}
