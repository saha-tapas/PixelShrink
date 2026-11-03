const OUTPUT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_CANVAS_DIMENSION = 8192;
export const MAX_CANVAS_PIXELS = 67108864;
// Keeps one decoded RGBA image near 128 MB before browser and canvas overhead.
export const MAX_DECODED_IMAGE_PIXELS = 32000000;

function getOutputType(sourceType) {
  return OUTPUT_TYPES.has(sourceType) ? sourceType : 'image/jpeg';
}

function getExtension(type) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function getOutputName(fileName, type, resized) {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return `${baseName}${resized ? '-resized' : '-compressed'}.${getExtension(type)}`;
}

function loadImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be loaded for compression.'));
    image.src = sourceUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    const requestedQuality = type === 'image/png' ? undefined : quality / 100;
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The browser could not create a compressed image.'));
    }, type, requestedQuality);
  });
}

function drawFitBackground(context, image, width, height, backgroundType, backgroundColor, outputType) {
  const effectiveType = outputType === 'image/jpeg' && backgroundType === 'transparent'
    ? 'white'
    : backgroundType;

  if (effectiveType === 'transparent') return;
  if (effectiveType === 'blur') {
    const coverScale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const coverWidth = image.naturalWidth * coverScale;
    const coverHeight = image.naturalHeight * coverScale;
    context.save();
    context.filter = 'blur(24px)';
    context.drawImage(image, (width - coverWidth) / 2, (height - coverHeight) / 2, coverWidth, coverHeight);
    context.restore();
    return;
  }

  context.fillStyle = effectiveType === 'custom' ? backgroundColor : effectiveType;
  context.fillRect(0, 0, width, height);
}

export async function compressImage({ fileName, fileType, quality, sourceUrl }) {
  const outputType = getOutputType(fileType);
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas compression is not available in this browser.');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  if (outputType === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);
  const blob = await canvasToBlob(canvas, outputType, quality);

  return {
    name: getOutputName(fileName, outputType, false),
    size: blob.size,
    type: outputType,
    url: URL.createObjectURL(blob),
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

export function validateDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    return 'Width and height must be whole numbers greater than zero.';
  }
  if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
    return `Each dimension must be ${MAX_CANVAS_DIMENSION}px or smaller.`;
  }
  if (width * height > MAX_CANVAS_PIXELS) {
    return 'That canvas is too large to process safely. Please choose smaller dimensions.';
  }
  return '';
}

export function validateDecodedImageDimensions(width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    return 'This image has invalid dimensions and cannot be processed.';
  }
  if (width * height > MAX_DECODED_IMAGE_PIXELS) {
    return 'This image is too large to process safely. Please choose an image with 32 megapixels or fewer.';
  }
  return '';
}

export async function detectImageFileType(file) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isPng = header.length >= 8
    && header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47
    && header[4] === 0x0d && header[5] === 0x0a && header[6] === 0x1a && header[7] === 0x0a;
  const isJpeg = header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isWebp = header.length >= 12
    && header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46
    && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;

  if (isJpeg) return 'image/jpeg';
  if (isPng) return 'image/png';
  if (isWebp) return 'image/webp';
  return null;
}

export async function resizeAndCompressImage({ backgroundColor = '#ffffff', backgroundType = 'white', fileName, fileType, height, mode = 'fit', outputType: requestedOutputType, quality, sourceUrl, width }) {
  const dimensionError = validateDimensions(width, height);
  if (dimensionError) throw new Error(dimensionError);

  const outputType = getOutputType(requestedOutputType || fileType);
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas resizing is not available in this browser.');

  canvas.width = width;
  canvas.height = height;
  if (outputType === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const proportionalMode = mode === 'original' ? 'fit' : mode;
  const scale = proportionalMode === 'fill'
    ? Math.max(width / sourceWidth, height / sourceHeight)
    : Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;
  if (proportionalMode === 'fit') {
    drawFitBackground(context, image, width, height, backgroundType, backgroundColor, outputType);
  }
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  const blob = await canvasToBlob(canvas, outputType, quality);

  return {
    name: getOutputName(fileName, outputType, true),
    size: blob.size,
    type: outputType,
    url: URL.createObjectURL(blob),
    width,
    height,
  };
}
