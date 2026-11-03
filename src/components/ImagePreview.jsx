import { FileImage, RefreshCw, Trash2 } from 'lucide-react';
import './ImagePreview.css';

function ImagePreview({ compressedImage, image, onChooseAnother, onRemove }) {
  return (
    <div className="image-preview">
      <div className="image-preview__comparison">
        <div className="image-preview__side">
          <span className="image-preview__label">Original</span>
          <div className="image-preview__frame">
            {image ? <img src={image.url} alt={`Original ${image.name}`} /> : <FileImage size={40} aria-hidden="true" />}
          </div>
        </div>
        <div className="image-preview__side">
          <span className="image-preview__label">Resized &amp; compressed</span>
          <div className="image-preview__frame">
            {compressedImage ? (
              <img src={compressedImage.url} alt={`Compressed ${image.name}`} />
            ) : (
              <span className="image-preview__processing">Preparing preview…</span>
            )}
          </div>
        </div>
      </div>

      <div className="image-preview__details">
        <div className="image-preview__file">
          <strong title={image.name}>{image.name}</strong>
          <span>{image.width} × {image.height}px original · {compressedImage ? `${compressedImage.width} × ${compressedImage.height}px output` : 'output pending'}</span>
        </div>
        <div className="image-preview__actions">
          <button className="button button--secondary" type="button" onClick={onChooseAnother}>
            <RefreshCw size={16} /> Replace
          </button>
          <button className="button button--danger" type="button" onClick={onRemove}>
            <Trash2 size={16} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePreview;
