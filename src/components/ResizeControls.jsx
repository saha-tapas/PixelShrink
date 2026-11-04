import { FolderOpen, Lock, LockKeyholeOpen, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { MAX_CANVAS_DIMENSION } from '../services/imageService';
import PresetLibrary from './PresetLibrary';
import './ResizeControls.css';

const PRESETS = [
  ['Instagram Square', 1080, 1080],
  ['Instagram Story', 1080, 1920],
  ['Facebook Post', 1200, 630],
  ['HD Landscape', 1920, 1080],
];

const BACKGROUNDS = [
  ['white', 'White'],
  ['black', 'Black'],
  ['transparent', 'Transparent'],
  ['custom', 'Custom Color'],
  ['blur', 'Blur Background'],
];

const OUTPUT_FORMATS = [
  ['image/webp', 'WebP'],
  ['image/png', 'PNG'],
  ['image/jpeg', 'JPEG'],
];

function ResizeControls({ dimensions, formatNotice, onApplyPreset, onChange, onPresetDeleted, selectedPresetId }) {
  const [isPresetLibraryOpen, setIsPresetLibraryOpen] = useState(false);
  const setMode = (mode) => {
    const next = { ...dimensions, mode, locked: mode === 'original' ? true : dimensions.locked };
    if (mode === 'original' && dimensions.originalWidth && dimensions.originalHeight) {
      next.height = Math.round(next.width * dimensions.originalHeight / dimensions.originalWidth);
    }
    onChange(next);
  };

  const updateDimension = (key, value) => {
    const parsedValue = value === '' ? '' : Number(value);
    const next = { ...dimensions, [key]: parsedValue };

    if ((dimensions.locked || dimensions.mode === 'original') && parsedValue !== '' && dimensions.width && dimensions.height) {
      const ratio = dimensions.width / dimensions.height;
      next[key === 'width' ? 'height' : 'width'] = key === 'width'
        ? Math.round(parsedValue / ratio)
        : Math.round(parsedValue * ratio);
    }

    onChange(next);
  };

  const applyPreset = (width, height) => {
    if (dimensions.mode === 'original' && dimensions.originalWidth && dimensions.originalHeight) {
      onChange({ ...dimensions, width, height: Math.round(width * dimensions.originalHeight / dimensions.originalWidth) });
      return;
    }
    onChange({ ...dimensions, width, height });
  };

  return (
    <>
      <div className="resize-controls">
      <div className="resize-controls__heading">
        <div className="resize-controls__title">
          <span className="controls-card__icon" aria-hidden="true"><Maximize2 size={18} /></span>
          <div><p className="section-label">Resize</p><h2>Image dimensions</h2></div>
          <button className="resize-controls__presets-button" type="button" onClick={() => setIsPresetLibraryOpen(true)}><FolderOpen size={15} /> Presets</button>
        </div>
        <span className="resize-controls__original">Original: {dimensions.originalWidth} × {dimensions.originalHeight}px</span>
      </div>

      <div className="resize-controls__inputs">
        <label>
          Width
          <input type="number" min="1" max={MAX_CANVAS_DIMENSION} value={dimensions.width} onChange={(event) => updateDimension('width', event.target.value)} />
          <span>px</span>
        </label>
        <button className="resize-controls__lock" type="button" disabled={dimensions.mode === 'original'} aria-label={dimensions.mode === 'original' || dimensions.locked ? 'Aspect ratio locked' : 'Lock aspect ratio'} onClick={() => onChange({ ...dimensions, locked: !dimensions.locked })}>
          {dimensions.locked ? <Lock size={16} /> : <LockKeyholeOpen size={16} />}
        </button>
        <label>
          Height
          <input type="number" min="1" max={MAX_CANVAS_DIMENSION} value={dimensions.height} onChange={(event) => updateDimension('height', event.target.value)} />
          <span>px</span>
        </label>
      </div>

      <div className="resize-controls__mode">
        <span>Resize mode</span>
        <div className="resize-controls__mode-options" role="group" aria-label="Resize mode">
          <button className={dimensions.mode === 'fit' ? 'is-active' : ''} type="button" onClick={() => setMode('fit')}>
            <strong>Fit</strong><small>Show full image with padding</small>
          </button>
          <button className={dimensions.mode === 'fill' ? 'is-active' : ''} type="button" onClick={() => setMode('fill')}>
            <strong>Fill / Crop</strong><small>Fill frame and crop center</small>
          </button>
          <button className={dimensions.mode === 'original' ? 'is-active' : ''} type="button" onClick={() => setMode('original')}>
            <strong>Original Ratio</strong><small>Exact proportions, no padding</small>
          </button>
        </div>
      </div>

      {dimensions.mode === 'fit' && (
        <div className="resize-controls__background">
          <span>Fit background</span>
          <div className="resize-controls__background-options" role="group" aria-label="Fit background">
            {BACKGROUNDS.map(([value, label]) => (
              <button key={value} className={dimensions.backgroundType === value ? 'is-active' : ''} type="button" onClick={() => onChange({ ...dimensions, backgroundType: value }, { kind: 'background' })}>
                {label}
              </button>
            ))}
          </div>
          {dimensions.backgroundType === 'custom' && (
            <label className="resize-controls__color">
              Custom color
              <input type="color" value={dimensions.backgroundColor} onChange={(event) => onChange({ ...dimensions, backgroundColor: event.target.value })} />
              <span>{dimensions.backgroundColor}</span>
            </label>
          )}
          {dimensions.outputType === 'image/jpeg' && dimensions.backgroundType === 'transparent' && (
            <p className="resize-controls__note">JPEG cannot preserve transparency, so this output will use a white background.</p>
          )}
        </div>
      )}

      <div className="resize-controls__format">
        <span>Output format</span>
        <div className="resize-controls__format-options" role="group" aria-label="Output format">
          {OUTPUT_FORMATS.map(([value, label]) => (
            <button key={value} className={dimensions.outputType === value ? 'is-active' : ''} type="button" onClick={() => onChange({ ...dimensions, outputType: value }, { kind: 'format' })}>
              {label}
            </button>
          ))}
        </div>
        {formatNotice && <p className="resize-controls__note">{formatNotice}</p>}
      </div>

      <div className="resize-controls__presets">
        <span>Presets</span>
        <div>
          {PRESETS.map(([label, width, height]) => (
            <button key={label} type="button" onClick={() => applyPreset(width, height)}>
              {label}<small>{width} × {height}</small>
            </button>
          ))}
        </div>
      </div>
      </div>
      <PresetLibrary
        isOpen={isPresetLibraryOpen}
        onApplyPreset={(preset) => { onApplyPreset?.(preset); setIsPresetLibraryOpen(false); }}
        onClose={() => setIsPresetLibraryOpen(false)}
        onPresetDeleted={onPresetDeleted}
        selectedPresetId={selectedPresetId}
      />
    </>
  );
}

export default ResizeControls;
