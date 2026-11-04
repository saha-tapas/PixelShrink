import { useEffect, useRef, useState } from 'react';
import { resizeAndCompressImage } from '../services/imageService';

function useImageProcessor(image, quality, resize) {
  const [compressedImage, setCompressedImage] = useState(null);
  const [resultKey, setResultKey] = useState('');
  const [error, setError] = useState('');
  const outputUrlRef = useRef(null);
  const requestIdRef = useRef(0);
  const lastRequestKeyRef = useRef('');
  const settledRequestIdRef = useRef(0);
  const cancellationTimerRef = useRef(null);
  const requestKey = image ? `${image.url}:${quality}:${resize.width}:${resize.height}:${resize.mode}:${resize.backgroundType}:${resize.backgroundColor}:${resize.outputType}` : '';

  useEffect(() => {
    console.debug('Image processing effect setup:', { requestKey });

    if (cancellationTimerRef.current) {
      clearTimeout(cancellationTimerRef.current);
      cancellationTimerRef.current = null;
    }

    if (!image) {
      lastRequestKeyRef.current = '';
      console.debug('Image processing request skipped:', { reason: 'no image', requestKey });
    } else if (lastRequestKeyRef.current === requestKey) {
      console.debug('Image processing request skipped:', { reason: 'Strict Mode replay reused active request', requestKey });
      return undefined;
    } else {
      if (requestIdRef.current !== settledRequestIdRef.current && lastRequestKeyRef.current) {
        requestIdRef.current += 1;
        console.debug('Image processing request cancelled:', { reason: 'superseded by a new request key', requestKey });
      }
      lastRequestKeyRef.current = requestKey;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    settledRequestIdRef.current = 0;
    console.debug('Image processing request started:', { requestId, requestKey });
    queueMicrotask(() => {
      if (requestId === requestIdRef.current) setError('');
    });

    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }

    if (!image) return undefined;

    resizeAndCompressImage({
      backgroundColor: resize.backgroundColor,
      backgroundType: resize.backgroundType,
      fileName: image.name,
      originalFile: image.file,
      fileType: image.type,
      height: resize.height,
      mode: resize.mode,
      originalHeight: image.height,
      originalWidth: image.width,
      outputType: resize.outputType,
      quality,
      requestId,
      sourceUrl: image.url,
      width: resize.width,
    })
      .then((result) => {
        if (requestId !== requestIdRef.current) {
          URL.revokeObjectURL(result.url);
          return;
        }
        outputUrlRef.current = result.url;
        settledRequestIdRef.current = requestId;
        setCompressedImage(result);
        setResultKey(requestKey);
        setError('');
        if (result.type === 'image/png') console.debug('PNG React result committed:', { requestId, requestKey, finalSize: result.size });
        console.debug('Image processing request completed:', { requestId, requestKey });
      })
      .catch((processingError) => {
        if (requestId === requestIdRef.current) {
          settledRequestIdRef.current = requestId;
          setResultKey('');
          setError(processingError.message || 'Compression failed. Please try again.');
          console.debug('Image processing request failed:', { requestId, requestKey, error: processingError });
        }
      });

    return () => {
      if (requestId === requestIdRef.current) {
        cancellationTimerRef.current = setTimeout(() => {
          cancellationTimerRef.current = null;
          if (requestId === requestIdRef.current && settledRequestIdRef.current !== requestId) {
            requestIdRef.current += 1;
            if (lastRequestKeyRef.current === requestKey) lastRequestKeyRef.current = '';
            console.debug('Image processing request cancelled:', { reason: 'effect cleanup without replay', requestId, requestKey });
          }
        }, 0);
      }
      console.debug('Image processing effect cleanup:', { requestId, requestKey });
    };
  }, [image, quality, requestKey, resize.backgroundColor, resize.backgroundType, resize.height, resize.mode, resize.outputType, resize.width]);

  useEffect(() => () => {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
  }, []);

  const currentResult = image && resultKey === requestKey ? compressedImage : null;
  const isProcessing = Boolean(image && !currentResult && !error);

  return { compressedImage: currentResult, error, isProcessing };
}

export default useImageProcessor;
