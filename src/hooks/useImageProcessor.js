import { useEffect, useRef, useState } from 'react';
import { resizeAndCompressImage } from '../services/imageService';

function useImageProcessor(image, quality, resize) {
  const [compressedImage, setCompressedImage] = useState(null);
  const [resultKey, setResultKey] = useState('');
  const [error, setError] = useState('');
  const outputUrlRef = useRef(null);
  const requestIdRef = useRef(0);
  const requestKey = image ? `${image.url}:${quality}:${resize.width}:${resize.height}:${resize.mode}:${resize.backgroundType}:${resize.backgroundColor}:${resize.outputType}` : '';

  useEffect(() => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }

    if (!image) return undefined;

    resizeAndCompressImage({
      backgroundColor: resize.backgroundColor,
      backgroundType: resize.backgroundType,
      fileName: image.name,
      fileType: image.type,
      height: resize.height,
      mode: resize.mode,
      outputType: resize.outputType,
      quality,
      sourceUrl: image.url,
      width: resize.width,
    })
      .then((result) => {
        if (requestId !== requestIdRef.current) {
          URL.revokeObjectURL(result.url);
          return;
        }
        outputUrlRef.current = result.url;
        setCompressedImage(result);
        setResultKey(requestKey);
        setError('');
      })
      .catch((processingError) => {
        if (requestId === requestIdRef.current) {
          setResultKey('');
          setError(processingError.message || 'Compression failed. Please try again.');
        }
      });

    return undefined;
  }, [image, quality, requestKey, resize.backgroundColor, resize.backgroundType, resize.height, resize.mode, resize.outputType, resize.width]);

  useEffect(() => () => {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
  }, []);

  const currentResult = image && resultKey === requestKey ? compressedImage : null;
  const isProcessing = Boolean(image && !currentResult && !error);

  return { compressedImage: currentResult, error, isProcessing };
}

export default useImageProcessor;
