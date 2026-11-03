import { useCallback, useEffect, useRef, useState } from 'react';
import { detectImageFileType, validateDecodedImageDimensions } from '../services/imageService';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSION_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function useImageUpload() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const objectUrlRef = useRef(null);
  const requestIdRef = useRef(0);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const handleFile = useCallback(async (file) => {
    setError('');
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError('That image is too large. Please choose a file smaller than 20 MB.');
      return;
    }

    let detectedType;
    try {
      detectedType = await detectImageFileType(file);
    } catch {
      if (requestId === requestIdRef.current) setError('We could not inspect that file. Please choose a JPG, PNG, or WebP image.');
      return;
    }

    if (requestId !== requestIdRef.current) return;
    if (!detectedType || !ACCEPTED_TYPES.includes(detectedType)) {
      setError('That file is not a supported JPG, PNG, or WebP image.');
      return;
    }
    if (file.type && file.type !== detectedType) {
      setError('The file type does not match its image data. Please choose an unmodified image file.');
      return;
    }

    const extension = file.name?.split('.').pop()?.toLowerCase();
    if (extension && EXTENSION_TYPES[extension] && EXTENSION_TYPES[extension] !== detectedType) {
      setError('The file extension does not match its image data. Please rename or choose the original image file.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const previewImage = new window.Image();

    previewImage.onload = () => {
      if (requestId !== requestIdRef.current) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      const dimensionError = validateDecodedImageDimensions(previewImage.naturalWidth, previewImage.naturalHeight);
      if (dimensionError) {
        URL.revokeObjectURL(objectUrl);
        setError(dimensionError);
        return;
      }
      releaseObjectUrl();
      objectUrlRef.current = objectUrl;
      setImage({
        originalSize: file.size,
        name: file.name,
        size: formatFileSize(file.size),
        type: detectedType,
        width: previewImage.naturalWidth,
        height: previewImage.naturalHeight,
        url: objectUrl,
      });
    };

    previewImage.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      if (requestId === requestIdRef.current) {
        setError('We could not read that image. Please choose another file.');
      }
    };
    previewImage.src = objectUrl;
  }, [releaseObjectUrl]);

  const removeImage = useCallback(() => {
    requestIdRef.current += 1;
    releaseObjectUrl();
    setImage(null);
    setError('');
  }, [releaseObjectUrl]);

  useEffect(() => () => releaseObjectUrl(), [releaseObjectUrl]);

  return { error, handleFile, image, isDragging, removeImage, setIsDragging };
}

export default useImageUpload;
