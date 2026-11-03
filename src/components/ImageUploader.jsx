import { Download, FileImage, ImagePlus, SlidersHorizontal, UploadCloud } from 'lucide-react';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ImagePreview from './ImagePreview';
import ResizeControls from './ResizeControls';
import useImageProcessor from '../hooks/useImageProcessor';
import useImageUpload from '../hooks/useImageUpload';
import './ImageUploader.css';

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getReduction(originalSize, compressedSize) {
  if (!originalSize || !compressedSize) return '—';
  const reduction = ((originalSize - compressedSize) / originalSize) * 100;
  return reduction >= 0 ? `${reduction.toFixed(1)}% smaller` : `${Math.abs(reduction).toFixed(1)}% larger`;
}

const ImageUploader = forwardRef(function ImageUploader(_, ref) {
  const inputRef = useRef(null);
  const [quality, setQuality] = useState(80);
  const [resize, setResize] = useState(null);
  const [formatNotice, setFormatNotice] = useState('');
  const { error: uploadError, handleFile, image, isDragging, removeImage, setIsDragging } = useImageUpload();
  const activeResize = useMemo(() => {
    const hasReusableResize = resize && (!image || resize.sourceUrl === image.url || resize.sourceUrl === '');
    if (image && hasReusableResize) {
      return {
        ...resize,
        height: resize.mode === 'original' ? Math.round(resize.width * image.height / image.width) : resize.height,
        originalHeight: image.height,
        originalWidth: image.width,
        sourceUrl: image.url,
      };
    }
    return image
      ? { backgroundColor: '#ffffff', backgroundType: 'white', height: image.height, locked: true, mode: 'fit', originalHeight: image.height, originalWidth: image.width, outputType: image.type, sourceUrl: image.url, width: image.width }
      : { backgroundColor: '#ffffff', backgroundType: 'white', height: 0, locked: true, mode: 'fit', originalHeight: 0, originalWidth: 0, outputType: '', sourceUrl: '', width: 0 };
  }, [image, resize]);
  const { compressedImage, error: processingError, isProcessing } = useImageProcessor(image, quality, activeResize);

  useImperativeHandle(ref, () => ({
    applyPreset(preset) {
      if (preset.kind === 'dimension') {
        const isCustomPreset = preset.categoryId === 'custom-presets';
        setResize((currentResize) => {
          const base = currentResize || activeResize;
          const nextHeight = preset.mode === 'original' && image
            ? Math.round(preset.width * image.height / image.width)
            : preset.height;
          const requestedOutputType = isCustomPreset ? (preset.outputFormat || base.outputType) : base.outputType;
          const requestedBackgroundType = isCustomPreset ? (preset.backgroundType || base.backgroundType) : base.backgroundType;
          const safeBackgroundType = requestedOutputType === 'image/jpeg' && requestedBackgroundType === 'transparent'
            ? 'white'
            : requestedBackgroundType;

          return {
            ...base,
            backgroundColor: isCustomPreset ? (preset.backgroundColor || base.backgroundColor) : base.backgroundColor,
            backgroundType: safeBackgroundType,
            height: nextHeight,
            mode: preset.mode || base.mode,
            outputType: requestedOutputType,
            sourceUrl: image?.url || '',
            width: preset.width,
          };
        });
        if (isCustomPreset && Number.isFinite(preset.quality)) setQuality(preset.quality);
        if (isCustomPreset && preset.outputFormat === 'image/jpeg' && preset.backgroundType === 'transparent') {
          setFormatNotice('JPEG cannot preserve transparency, so the background was changed to White.');
        } else if (isCustomPreset) {
          setFormatNotice('');
        }
        return;
      }

      if (preset.kind === 'quality') {
        if (preset.quality !== null) setQuality(preset.quality);
        setResize((currentResize) => {
          const base = currentResize || activeResize;
          const isTransparentPreset = preset.tags.includes('transparent');
          return {
            ...base,
            backgroundType: isTransparentPreset ? 'transparent' : base.backgroundType,
            outputType: preset.outputFormat,
            sourceUrl: image?.url || '',
          };
        });
      }
    },
  }), [activeResize, image]);
  const openFilePicker = () => inputRef.current?.click();

  const onFileChange = (event) => {
    handleFile(event.target.files?.[0]);
    setFormatNotice('');
    event.target.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const hasCompressionResult = Boolean(compressedImage && !isProcessing);
  const statusText = isProcessing ? 'Compressing…' : hasCompressionResult ? 'Compression ready' : 'Waiting for image';
  const error = uploadError || processingError;

  return (
    <section className="compressor" aria-labelledby="compressor-title">
      <div className="compressor__intro">
        <p className="eyebrow">Image compressor</p>
        <h1 id="compressor-title">Make images smaller, without the compromise.</h1>
        <p className="compressor__description">
          Drop an image to get started. PixelShrink keeps your visuals sharp while reducing file size for faster sharing and loading.
        </p>
      </div>

      <div className="compressor__workspace">
        <div
          className={`upload-card${isDragging ? ' upload-card--dragging' : ''}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false); }}
          onDrop={onDrop}
        >
          <input ref={inputRef} className="upload-card__input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onFileChange} />
          <div className="upload-card__icon" aria-hidden="true"><UploadCloud size={28} strokeWidth={1.8} /></div>
          <h2>{image ? 'Image ready' : 'Upload an image'}</h2>
          <p>Drag and drop your file here, or choose one from your device.</p>
          <button className="button button--primary" type="button" onClick={openFilePicker}>
            <ImagePlus size={18} /> {image ? 'Choose another' : 'Choose image'}
          </button>
          <span className="upload-card__hint">PNG, JPG or WebP · up to 20 MB</span>
          {error && <p className="upload-card__error" role="alert">{error}</p>}
        </div>

        <div className="preview-card">
          <div className="preview-card__header">
            <div>
              <p className="section-label">Preview</p>
              <h2>{image ? 'Original and compressed' : 'Your compressed image'}</h2>
            </div>
            <span className={`preview-card__status${hasCompressionResult ? ' preview-card__status--ready' : ''}`}>
              {statusText}
            </span>
          </div>

          {image ? (
            <ImagePreview image={image} compressedImage={compressedImage} onRemove={removeImage} onChooseAnother={openFilePicker} />
          ) : (
            <div className="preview-placeholder">
              <FileImage size={40} strokeWidth={1.4} aria-hidden="true" />
              <p>Image preview will appear here</p>
              <span>Upload an image to see the result</span>
            </div>
          )}

          <div className="preview-card__footer">
            <div className="file-meta file-meta--group">
              <span>Original · {image ? image.size : '—'}</span>
              <span>Resized · {compressedImage ? `${compressedImage.width} × ${compressedImage.height}px` : '—'}</span>
              <span>Compressed · {compressedImage ? formatFileSize(compressedImage.size) : '—'}</span>
              <strong>{getReduction(image?.originalSize, compressedImage?.size)}</strong>
            </div>
            {hasCompressionResult ? (
              <a className="button button--secondary" href={compressedImage.url} download={compressedImage.name}>
                <Download size={17} /> Download
              </a>
            ) : (
              <button className="button button--secondary" type="button" disabled>
                <Download size={17} /> Download
              </button>
            )}
          </div>
        </div>
      </div>

      {image && (
        <ResizeControls
          dimensions={activeResize}
          formatNotice={formatNotice}
          onChange={(nextDimensions, changeMeta) => {
            let normalizedDimensions = nextDimensions;
            if (changeMeta?.kind === 'background' && nextDimensions.backgroundType === 'transparent' && activeResize.outputType === 'image/jpeg') {
              normalizedDimensions = { ...nextDimensions, outputType: 'image/webp' };
              setFormatNotice('Transparent output is using WebP to preserve alpha transparency.');
            } else if (changeMeta?.kind === 'format' && nextDimensions.outputType === 'image/jpeg' && nextDimensions.backgroundType === 'transparent') {
              normalizedDimensions = { ...nextDimensions, backgroundType: 'white' };
              setFormatNotice('JPEG cannot preserve transparency, so the background was changed to White.');
            } else if (nextDimensions.backgroundType === 'transparent' && nextDimensions.outputType === 'image/jpeg') {
              normalizedDimensions = { ...nextDimensions, outputType: 'image/webp' };
              setFormatNotice('Transparent output is using WebP to preserve alpha transparency.');
            } else {
              setFormatNotice('');
            }
            setResize({ ...normalizedDimensions, sourceUrl: image.url })
          }}
        />
      )}

      <div className="controls-card">
        <div className="controls-card__heading">
          <div className="controls-card__title">
            <span className="controls-card__icon" aria-hidden="true"><SlidersHorizontal size={18} /></span>
            <div><p className="section-label">Customize</p><h2>Compression settings</h2></div>
          </div>
          <span className="quality-value">{quality}%</span>
        </div>
        <div className="quality-control">
          <div className="quality-control__labels"><span>Quality</span><span>Smaller file</span><span>Better quality</span></div>
          <input aria-label="Compression quality" className="quality-control__slider" type="range" min="0" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
          <p className="quality-control__note">PNG keeps its original lossless format; quality affects JPEG and WebP output.</p>
        </div>
      </div>
    </section>
  );
});

export default ImageUploader;
